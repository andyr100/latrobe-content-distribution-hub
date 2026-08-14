import { Op, type Transaction } from "sequelize";
import { sequelize } from "@/lib/sequelize";
import {
  Alert,
  FeedStatusEvent,
  RequestCounter,
  RequestLog,
  RssUser,
  type AlertSeverity,
  type FeedStatus,
} from "@/models";

const MAX_CLIENT_ID = 100;

export function requestIdentity(request: Request) {
  const rawClientId = request.headers.get("x-client-id")?.trim();
  const clientId = rawClientId
    ? rawClientId.replace(/[^a-zA-Z0-9._:-]/g, "-").slice(0, MAX_CLIENT_ID)
    : "anonymous";
  return {
    clientId: clientId || "anonymous",
    source: request.headers.get("x-client-source")?.trim().slice(0, 50) || "direct",
    userAgent: request.headers.get("user-agent")?.trim().slice(0, 500) || null,
    requestedRssUserId: request.headers.get("x-rss-user-id")?.trim().slice(0, 100) || null,
  };
}

type Observation = ReturnType<typeof requestIdentity> & {
  feedId: string | null;
  endpoint: string;
  statusCode: number;
  durationMs: number;
  itemCount?: number;
  message?: string | null;
  requestedAt?: Date;
};

function statusFor(observation: Observation): FeedStatus {
  if (observation.statusCode >= 500) return "ERROR";
  if (observation.statusCode >= 400) return "WARNING";
  if ((observation.itemCount ?? 0) === 0) return "EMPTY";
  return "HEALTHY";
}

function alertDetails(status: FeedStatus, observation: Observation) {
  if (status === "HEALTHY") return null;
  if (status === "EMPTY") {
    return {
      type: "EMPTY_FEED",
      severity: "WARNING" as AlertSeverity,
      message: observation.message ?? "The RSS feed returned no published items.",
    };
  }
  if (status === "WARNING") {
    return {
      type: observation.statusCode === 404 ? "RSS_NOT_FOUND" : "RSS_WARNING",
      severity: "WARNING" as AlertSeverity,
      message: observation.message ?? `RSS request returned HTTP ${observation.statusCode}.`,
    };
  }
  return {
    type: "RSS_ERROR",
    severity: "ERROR" as AlertSeverity,
    message: observation.message ?? `RSS request returned HTTP ${observation.statusCode}.`,
  };
}

async function incrementCompatibilityCounter(transaction: Transaction) {
  const [counter] = await RequestCounter.findOrCreate({
    where: { key: "rss-client-requests" },
    defaults: { key: "rss-client-requests", count: 0 },
    transaction,
  });
  await counter.increment("count", { by: 1, transaction });
}

export async function recordRssObservation(observation: Observation) {
  const success = observation.statusCode >= 200 && observation.statusCode < 400;
  const requestedAt = observation.requestedAt ?? new Date();
  const status = statusFor(observation);
  const rssUserId = observation.requestedRssUserId
    ? ((await RssUser.findByPk(observation.requestedRssUserId))?.id ?? null)
    : null;
  await sequelize.transaction(async (transaction) => {
    await RequestLog.create(
      {
        clientId: observation.clientId,
        rssUserId,
        feedId: observation.feedId,
        endpoint: observation.endpoint,
        method: "GET",
        statusCode: observation.statusCode,
        success,
        durationMs: Math.max(0, Math.round(observation.durationMs)),
        requestedAt,
        userAgent: observation.userAgent,
        source: observation.source,
      },
      { transaction },
    );
    if (success) await incrementCompatibilityCounter(transaction);

    if (observation.feedId) {
      await FeedStatusEvent.create(
        {
          feedId: observation.feedId,
          status,
          itemCount: observation.itemCount ?? 0,
          httpStatus: observation.statusCode,
          latencyMs: Math.max(0, Math.round(observation.durationMs)),
          message: observation.message ?? null,
          checkedAt: requestedAt,
        },
        { transaction },
      );
    }

    const alert = alertDetails(status, observation);
    if (alert) {
      const recentDuplicate = await Alert.findOne({
        where: {
          feedId: observation.feedId,
          type: alert.type,
          resolved: false,
          createdAt: { [Op.gte]: new Date(requestedAt.getTime() - 5 * 60_000) },
        },
        transaction,
      });
      if (!recentDuplicate) {
        await Alert.create(
          {
            feedId: observation.feedId,
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            resolved: false,
            resolvedAt: null,
          },
          { transaction },
        );
      }
    }
  });
}

export async function recordRssObservationSafely(observation: Observation) {
  try {
    await recordRssObservation(observation);
  } catch (error) {
    console.error("RSS observation could not be persisted", error);
  }
}
