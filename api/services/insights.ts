import { QueryTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";
import { Feed, RssUser, User } from "@/models";
import { getFeedStatuses, metricRanges, type MetricRange } from "./metrics";

export type InsightFilters = {
  range: MetricRange;
  feedId?: string;
  authorId?: string;
  rssUserId?: string;
  clientId?: string;
  status?: "success" | "failure";
  source?: string;
};

function sinceFor(range: MetricRange) {
  if (range === "all") return null;
  return new Date(
    Date.now() -
      { "1h": 3_600_000, "24h": 86_400_000, "7d": 604_800_000, "30d": 2_592_000_000 }[range],
  );
}

function requestWhere(filters: InsightFilters, alias = "r") {
  const clauses: string[] = [];
  const replacements: Record<string, string | Date | number> = {};
  const since = sinceFor(filters.range);
  if (since) {
    clauses.push(`${alias}.requestedAt >= :since`);
    replacements.since = since;
  }
  if (filters.feedId) {
    clauses.push(`${alias}.feedId = :feedId`);
    replacements.feedId = filters.feedId;
  }
  if (filters.rssUserId) {
    clauses.push(`${alias}.rssUserId = :rssUserId`);
    replacements.rssUserId = filters.rssUserId;
  }
  if (filters.clientId) {
    clauses.push(`${alias}.clientId = :clientId`);
    replacements.clientId = filters.clientId;
  }
  if (filters.status) clauses.push(`${alias}.success = ${filters.status === "success" ? 1 : 0}`);
  if (filters.source) {
    clauses.push(`${alias}.source = :source`);
    replacements.source = filters.source;
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", replacements };
}

function postWhere(filters: InsightFilters, alias = "p") {
  const clauses: string[] = [];
  const replacements: Record<string, string | Date> = {};
  const since = sinceFor(filters.range);
  if (since) {
    clauses.push(`${alias}.publishedAt >= :postSince`);
    replacements.postSince = since;
  }
  if (filters.authorId) {
    clauses.push(`${alias}.authorId = :authorId`);
    replacements.authorId = filters.authorId;
  }
  if (filters.feedId) {
    clauses.push(
      `EXISTS (SELECT 1 FROM PostFeeds pf WHERE pf.postId = ${alias}.id AND pf.feedId = :postFeedId)`,
    );
    replacements.postFeedId = filters.feedId;
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", replacements };
}

export function bucketExpression(range: MetricRange, field: string) {
  if (range === "1h") return `strftime('%Y-%m-%dT%H:%M:00Z', ${field})`;
  if (range === "24h") return `strftime('%Y-%m-%dT%H:00:00Z', ${field})`;
  if (range === "7d" || range === "30d") return `strftime('%Y-%m-%dT00:00:00Z', ${field})`;
  return `strftime('%Y-%m-%dT00:00:00Z', ${field})`;
}

function percentile(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)];
}

export async function getInsightOverview(filters: InsightFilters) {
  const requests = requestWhere(filters);
  const posts = postWhere(filters);
  const healthSince = sinceFor(filters.range);
  const healthWhere = [
    healthSince ? "s.checkedAt >= :healthSince" : "",
    filters.feedId ? "s.feedId = :healthFeedId" : "",
  ].filter(Boolean);
  const healthReplacements = {
    ...(healthSince ? { healthSince } : {}),
    ...(filters.feedId ? { healthFeedId: filters.feedId } : {}),
  };
  const requestBucket = bucketExpression(filters.range, "r.requestedAt");
  const postBucket = bucketExpression(filters.range, "p.publishedAt");
  const [
    summaryRows,
    durationRows,
    requestActivity,
    postActivity,
    feedDemand,
    clientActivity,
    rssUserActivity,
    sourceDistribution,
    failedByFeed,
    rssUserDemand,
    postChannels,
    topAuthors,
    publishingUserRows,
    healthTimeline,
    statuses,
  ] = await Promise.all([
    sequelize.query<{
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      averageLatencyMs: number;
      activeClients: number;
      activeRssUsers: number;
    }>(
      `SELECT COUNT(*) totalRequests, SUM(CASE WHEN r.success = 1 THEN 1 ELSE 0 END) successfulRequests, SUM(CASE WHEN r.success = 0 THEN 1 ELSE 0 END) failedRequests, ROUND(AVG(r.durationMs), 1) averageLatencyMs, COUNT(DISTINCT r.clientId) activeClients, COUNT(DISTINCT r.rssUserId) activeRssUsers FROM RequestLogs r ${requests.where}`,
      { replacements: requests.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query<{ durationMs: number }>(
      `SELECT r.durationMs FROM RequestLogs r ${requests.where}`,
      { replacements: requests.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT ${requestBucket} bucket, COUNT(*) totalRequests, SUM(CASE WHEN r.success = 1 THEN 1 ELSE 0 END) successfulRequests, SUM(CASE WHEN r.success = 0 THEN 1 ELSE 0 END) failedRequests, ROUND(AVG(r.durationMs), 1) averageLatencyMs FROM RequestLogs r ${requests.where} GROUP BY bucket ORDER BY bucket`,
      { replacements: requests.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT ${postBucket} bucket, COUNT(*) totalPosts, COUNT(DISTINCT p.authorId) activeAuthors FROM Posts p ${posts.where} GROUP BY bucket ORDER BY bucket`,
      { replacements: posts.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT COALESCE(f.code, 'COMBINED') code, COALESCE(f.title, 'Combined RSS') title, COUNT(*) value FROM RequestLogs r LEFT JOIN Feeds f ON f.id = r.feedId ${requests.where} GROUP BY r.feedId, f.code, f.title ORDER BY value DESC`,
      { replacements: requests.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT ${requestBucket} bucket, COUNT(DISTINCT r.clientId) activeClients FROM RequestLogs r ${requests.where} GROUP BY bucket ORDER BY bucket`,
      { replacements: requests.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT ${requestBucket} bucket, COUNT(DISTINCT r.rssUserId) activeRssUsers FROM RequestLogs r ${requests.where} GROUP BY bucket ORDER BY bucket`,
      { replacements: requests.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT COALESCE(r.source, 'direct') label, COUNT(*) value FROM RequestLogs r ${requests.where} GROUP BY r.source ORDER BY value DESC`,
      { replacements: requests.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT COALESCE(f.code, 'COMBINED') label, COUNT(*) value FROM RequestLogs r LEFT JOIN Feeds f ON f.id = r.feedId ${requests.where ? `${requests.where} AND r.success = 0` : "WHERE r.success = 0"} GROUP BY r.feedId, f.code ORDER BY value DESC`,
      { replacements: requests.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT COALESCE(ru.name, 'Direct / unknown') label, COUNT(*) value FROM RequestLogs r LEFT JOIN RssUsers ru ON ru.id = r.rssUserId ${requests.where} GROUP BY r.rssUserId, ru.name ORDER BY value DESC`,
      { replacements: requests.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT f.code label, COUNT(*) value FROM Posts p JOIN PostFeeds pf ON pf.postId = p.id JOIN Feeds f ON f.id = pf.feedId ${posts.where} GROUP BY f.id, f.code ORDER BY value DESC`,
      { replacements: posts.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT u.name label, COUNT(p.id) value FROM Posts p JOIN Users u ON u.id = p.authorId ${posts.where} GROUP BY u.id, u.name ORDER BY value DESC`,
      { replacements: posts.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query<{ bucket: string; totalUsers: number }>(
      `SELECT ${bucketExpression(filters.range, "u.createdAt")} bucket, COUNT(*) totalUsers FROM Users u GROUP BY bucket ORDER BY bucket`,
      { type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT ${bucketExpression(filters.range, "s.checkedAt")} bucket, s.status, COUNT(*) value FROM FeedStatusEvents s ${healthWhere.length ? `WHERE ${healthWhere.join(" AND ")}` : ""} GROUP BY bucket, s.status ORDER BY bucket`,
      {
        replacements: healthReplacements,
        type: QueryTypes.SELECT,
      },
    ),
    getFeedStatuses(),
  ]);
  const summary = summaryRows[0] ?? {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatencyMs: 0,
    activeClients: 0,
    activeRssUsers: 0,
  };
  const healthCounts = statuses.reduce<Record<string, number>>(
    (acc, item) => ({ ...acc, [item.status]: (acc[item.status] ?? 0) + 1 }),
    {},
  );
  const [publishedPosts, publishingAuthorCount, unresolvedAlerts] = await Promise.all([
    sequelize.query<{ count: number }>(`SELECT COUNT(*) count FROM Posts p ${posts.where}`, {
      replacements: posts.replacements,
      type: QueryTypes.SELECT,
    }),
    sequelize.query<{ count: number }>(
      `SELECT COUNT(DISTINCT p.authorId) count FROM Posts p ${posts.where}`,
      { replacements: posts.replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query<{ count: number }>("SELECT COUNT(*) count FROM Alerts WHERE resolved = 0", {
      type: QueryTypes.SELECT,
    }),
  ]);
  return {
    range: filters.range,
    generatedAt: new Date().toISOString(),
    summary: {
      ...summary,
      successRate: summary.totalRequests
        ? Math.round((summary.successfulRequests / summary.totalRequests) * 1000) / 10
        : 100,
      p95LatencyMs: percentile(durationRows.map((row) => Number(row.durationMs))),
      publishingAuthors: Number(publishingAuthorCount[0]?.count ?? 0),
      publishedPosts: Number(publishedPosts[0]?.count ?? 0),
      healthyFeeds: healthCounts.HEALTHY ?? 0,
      totalFeeds: statuses.length,
      unresolvedAlerts: Number(unresolvedAlerts[0]?.count ?? 0),
    },
    requestActivity,
    postActivity,
    feedDemand,
    clientActivity,
    rssUserActivity,
    sourceDistribution,
    failedByFeed,
    rssUserDemand,
    postChannels,
    topAuthors,
    publishingUsers: publishingUserRows.reduce<Array<{ bucket: string; totalUsers: number }>>(
      (all, row) => [
        ...all,
        {
          bucket: String(row.bucket),
          totalUsers: (all.at(-1)?.totalUsers ?? 0) + Number(row.totalUsers),
        },
      ],
      [],
    ),
    healthTimeline,
    statuses,
  };
}

export async function getInsightFilterOptions() {
  const [authors, rssUsers, feeds, sources] = await Promise.all([
    User.findAll({ attributes: ["id", "name", "role"], order: [["name", "ASC"]] }),
    RssUser.findAll({ attributes: ["id", "name", "role"], order: [["name", "ASC"]] }),
    Feed.findAll({ attributes: ["id", "code", "title"], order: [["title", "ASC"]] }),
    sequelize.query<{ source: string }>(
      "SELECT DISTINCT COALESCE(source, 'direct') source FROM RequestLogs ORDER BY source",
      { type: QueryTypes.SELECT },
    ),
  ]);
  return {
    authors,
    rssUsers,
    feeds,
    sources: sources.map((row) => row.source),
    ranges: metricRanges,
  };
}

export async function getInsightRequestLogs(
  filters: InsightFilters,
  page: number,
  pageSize: number,
) {
  const filter = requestWhere(filters);
  const [totalRows, rows] = await Promise.all([
    sequelize.query<{ total: number }>(`SELECT COUNT(*) total FROM RequestLogs r ${filter.where}`, {
      replacements: filter.replacements,
      type: QueryTypes.SELECT,
    }),
    sequelize.query(
      `SELECT r.id, r.clientId, r.rssUserId, ru.name rssUserName, r.feedId, COALESCE(f.code, 'COMBINED') feedCode, r.endpoint, r.statusCode, r.success, r.durationMs, r.source, r.requestedAt FROM RequestLogs r LEFT JOIN Feeds f ON f.id = r.feedId LEFT JOIN RssUsers ru ON ru.id = r.rssUserId ${filter.where} ORDER BY r.requestedAt DESC, r.id DESC LIMIT :limit OFFSET :offset`,
      {
        replacements: { ...filter.replacements, limit: pageSize, offset: (page - 1) * pageSize },
        type: QueryTypes.SELECT,
      },
    ),
  ]);
  const total = Number(totalRows[0]?.total ?? 0);
  return {
    rows,
    meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}
