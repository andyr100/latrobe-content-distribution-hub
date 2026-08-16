import { QueryTypes, type WhereOptions } from "sequelize";
import { sequelize } from "@/lib/sequelize";
import { Alert, Feed } from "@/models";

export const metricRanges = ["1h", "24h", "7d", "30d", "all"] as const;
export type MetricRange = (typeof metricRanges)[number];

export type MetricFilters = {
  range: MetricRange;
  feedId?: string;
  clientType?: string;
};

function sinceFor(range: MetricRange) {
  if (range === "all") return null;
  const milliseconds = {
    "1h": 3_600_000,
    "24h": 86_400_000,
    "7d": 604_800_000,
    "30d": 2_592_000_000,
  }[range];
  return new Date(Date.now() - milliseconds);
}

function requestFilter(filters: MetricFilters, alias = "r") {
  const clauses: string[] = [];
  const replacements: Record<string, string | Date> = {};
  const since = sinceFor(filters.range);
  if (since) {
    clauses.push(`${alias}.requestedAt >= :since`);
    replacements.since = since;
  }
  if (filters.feedId) {
    clauses.push(`${alias}.feedId = :feedId`);
    replacements.feedId = filters.feedId;
  }
  if (filters.clientType) {
    clauses.push(`${alias}.clientType = :clientType`);
    replacements.clientType = filters.clientType;
  }
  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    and: clauses.length ? `AND ${clauses.join(" AND ")}` : "",
    replacements,
  };
}

type SummaryRow = {
  totalRequests: number;
  uniqueClients: number;
  failedRequests: number;
  averageLatencyMs: number | null;
  successfulRequests: number;
};

export async function getMetricSummary(filters: MetricFilters) {
  const filter = requestFilter(filters);
  const [row] = await sequelize.query<SummaryRow>(
    `SELECT
      COUNT(*) AS totalRequests,
      COUNT(DISTINCT clientType) AS uniqueClients,
      SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) AS failedRequests,
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) AS successfulRequests,
      ROUND(AVG(durationMs), 1) AS averageLatencyMs
     FROM RequestLogs r ${filter.where}`,
    { replacements: filter.replacements, type: QueryTypes.SELECT },
  );
  const [totalFeeds, statuses, unresolvedAlerts, mostRequestedFeed] = await Promise.all([
    Feed.count(),
    getFeedStatuses(),
    Alert.count({ where: { resolved: false } }),
    getRequestsByFeed(filters, 1),
  ]);
  const statusCounts = statuses.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
    return counts;
  }, {});
  return {
    totalRequests: Number(row?.totalRequests ?? 0),
    uniqueClients: Number(row?.uniqueClients ?? 0),
    totalFeeds,
    healthyFeeds: statusCounts.HEALTHY ?? 0,
    emptyFeeds: statusCounts.EMPTY ?? 0,
    warningFeeds: statusCounts.WARNING ?? 0,
    errorFeeds: statusCounts.ERROR ?? 0,
    unknownFeeds: statusCounts.UNKNOWN ?? 0,
    failedRequests: Number(row?.failedRequests ?? 0),
    successfulRequests: Number(row?.successfulRequests ?? 0),
    successRate:
      Number(row?.totalRequests ?? 0) > 0
        ? Math.round((Number(row?.successfulRequests ?? 0) / Number(row.totalRequests)) * 1000) / 10
        : 100,
    averageLatencyMs: Number(row?.averageLatencyMs ?? 0),
    unresolvedAlerts,
    mostRequestedFeed: mostRequestedFeed[0] ?? null,
    range: filters.range,
    generatedAt: new Date().toISOString(),
  };
}

export type RequestsByFeedRow = {
  feedId: string | null;
  code: string;
  title: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
};

export async function getRequestsByFeed(filters: MetricFilters, limit = 20) {
  const filter = requestFilter(filters, "r");
  return sequelize.query<RequestsByFeedRow>(
    `SELECT r.feedId,
      COALESCE(f.code, 'COMBINED') AS code,
      COALESCE(f.title, 'Combined / unknown RSS') AS title,
      COUNT(*) AS totalRequests,
      SUM(CASE WHEN r.success = 1 THEN 1 ELSE 0 END) AS successfulRequests,
      SUM(CASE WHEN r.success = 0 THEN 1 ELSE 0 END) AS failedRequests,
      ROUND(AVG(r.durationMs), 1) AS averageLatencyMs
     FROM RequestLogs r
     LEFT JOIN Feeds f ON f.id = r.feedId
     ${filter.where}
     GROUP BY r.feedId, f.code, f.title
     ORDER BY totalRequests DESC, title ASC
     LIMIT :limit`,
    {
      replacements: { ...filter.replacements, limit: Math.min(Math.max(limit, 1), 100) },
      type: QueryTypes.SELECT,
    },
  );
}

export type RequestsByClientRow = {
  clientType: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  lastRequestedAt: string;
};

export async function getRequestsByClient(filters: MetricFilters, limit = 20) {
  const filter = requestFilter(filters, "r");
  return sequelize.query<RequestsByClientRow>(
    `SELECT r.clientType,
      COUNT(*) AS totalRequests,
      SUM(CASE WHEN r.success = 1 THEN 1 ELSE 0 END) AS successfulRequests,
      SUM(CASE WHEN r.success = 0 THEN 1 ELSE 0 END) AS failedRequests,
      ROUND(AVG(r.durationMs), 1) AS averageLatencyMs,
      MAX(r.requestedAt) AS lastRequestedAt
     FROM RequestLogs r
     ${filter.where}
     GROUP BY r.clientType
     ORDER BY totalRequests DESC, r.clientType ASC
     LIMIT :limit`,
    {
      replacements: { ...filter.replacements, limit: Math.min(Math.max(limit, 1), 100) },
      type: QueryTypes.SELECT,
    },
  );
}

export type RequestActivityRow = {
  bucket: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
};

export async function getRequestsOverTime(filters: MetricFilters) {
  const filter = requestFilter(filters, "r");
  const bucket = filters.range === "1h" ? "%Y-%m-%dT%H:%M:00Z" : "%Y-%m-%dT%H:00:00Z";
  const expression =
    filters.range === "7d" || filters.range === "30d" || filters.range === "all"
      ? "strftime('%Y-%m-%dT00:00:00Z', r.requestedAt)"
      : `strftime('${bucket}', r.requestedAt)`;
  return sequelize.query<RequestActivityRow>(
    `SELECT ${expression} AS bucket,
      COUNT(*) AS totalRequests,
      SUM(CASE WHEN r.success = 1 THEN 1 ELSE 0 END) AS successfulRequests,
      SUM(CASE WHEN r.success = 0 THEN 1 ELSE 0 END) AS failedRequests,
      ROUND(AVG(r.durationMs), 1) AS averageLatencyMs
     FROM RequestLogs r
     ${filter.where}
     GROUP BY bucket
     ORDER BY bucket ASC
     LIMIT 720`,
    { replacements: filter.replacements, type: QueryTypes.SELECT },
  );
}

export type FeedStatusRow = {
  feedId: string;
  code: string;
  title: string;
  status: "HEALTHY" | "EMPTY" | "WARNING" | "ERROR" | "UNKNOWN";
  itemCount: number | null;
  httpStatus: number | null;
  latencyMs: number | null;
  message: string | null;
  checkedAt: string | null;
};

export async function getFeedStatuses() {
  return sequelize.query<FeedStatusRow>(
    `SELECT f.id AS feedId, f.code, f.title,
      COALESCE(s.status, 'UNKNOWN') AS status,
      s.itemCount, s.httpStatus, s.latencyMs, s.message, s.checkedAt
     FROM Feeds f
     LEFT JOIN FeedStatusEvents s ON s.id = (
       SELECT latest.id FROM FeedStatusEvents latest
       WHERE latest.feedId = f.id
       ORDER BY latest.checkedAt DESC, latest.id DESC LIMIT 1
     )
     ORDER BY f.title ASC`,
    { type: QueryTypes.SELECT },
  );
}

export async function getAlerts(options: { resolved?: boolean; limit?: number } = {}) {
  const where: WhereOptions = options.resolved === undefined ? {} : { resolved: options.resolved };
  return Alert.findAll({
    where,
    include: [{ model: Feed, as: "feed", attributes: ["id", "code", "title"] }],
    order: [["createdAt", "DESC"]],
    limit: Math.min(Math.max(options.limit ?? 50, 1), 100),
  });
}

export async function getRecentRequests(filters: MetricFilters, limit = 20) {
  const filter = requestFilter(filters, "r");
  return sequelize.query(
    `SELECT r.id, r.clientId, r.clientType, r.feedId, COALESCE(f.code, 'COMBINED') AS feedCode,
      r.endpoint, r.statusCode, r.success, r.durationMs, r.requestedAt
     FROM RequestLogs r
     LEFT JOIN Feeds f ON f.id = r.feedId
     ${filter.where}
     ORDER BY r.requestedAt DESC, r.id DESC
     LIMIT :limit`,
    {
      replacements: { ...filter.replacements, limit: Math.min(Math.max(limit, 1), 100) },
      type: QueryTypes.SELECT,
    },
  );
}
