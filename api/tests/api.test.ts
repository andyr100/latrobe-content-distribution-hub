import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const databasePath = resolve(process.cwd(), "tests", ".assessment-test.sqlite");
process.env.DATABASE_STORAGE = databasePath;
process.env.FRONTEND_BASE_URL = "http://localhost:3000";
process.env.APP_BASE_URL = "http://localhost:4000";

type JsonEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, number>;
  error?: { message: string };
};

let postsRoute: typeof import("../app/api/posts/route");
let postRoute: typeof import("../app/api/posts/[id]/route");
let rssRoute: typeof import("../app/rss/route");
let channelRssRoute: typeof import("../app/rss/[channelCode]/route");
let healthRoute: typeof import("../app/health/route");
let countRoute: typeof import("../app/count/route");
let statsRoute: typeof import("../app/stats/route");
let metricSummaryRoute: typeof import("../app/api/metrics/summary/route");
let requestsByFeedRoute: typeof import("../app/api/metrics/requests-by-feed/route");
let requestsByClientRoute: typeof import("../app/api/metrics/requests-by-client/route");
let requestsOverTimeRoute: typeof import("../app/api/metrics/requests-over-time/route");
let feedStatusRoute: typeof import("../app/api/feed-status/route");
let alertsRoute: typeof import("../app/api/alerts/route");
let insightOverviewRoute: typeof import("../app/api/insights/overview/route");
let insightLogsRoute: typeof import("../app/api/insights/request-logs/route");
let insightHealthRoute: typeof import("../app/api/insights/health-refresh/route");
let database: typeof import("../lib/sequelize");
let models: typeof import("../models");
let postService: typeof import("../services/posts");
let createdId = 0;

async function json<T>(response: Response) {
  return (await response.json()) as JsonEnvelope<T>;
}

before(async () => {
  await rm(databasePath, { force: true });
  postsRoute = await import("../app/api/posts/route");
  postRoute = await import("../app/api/posts/[id]/route");
  rssRoute = await import("../app/rss/route");
  channelRssRoute = await import("../app/rss/[channelCode]/route");
  healthRoute = await import("../app/health/route");
  countRoute = await import("../app/count/route");
  statsRoute = await import("../app/stats/route");
  metricSummaryRoute = await import("../app/api/metrics/summary/route");
  requestsByFeedRoute = await import("../app/api/metrics/requests-by-feed/route");
  requestsByClientRoute = await import("../app/api/metrics/requests-by-client/route");
  requestsOverTimeRoute = await import("../app/api/metrics/requests-over-time/route");
  feedStatusRoute = await import("../app/api/feed-status/route");
  alertsRoute = await import("../app/api/alerts/route");
  insightOverviewRoute = await import("../app/api/insights/overview/route");
  insightLogsRoute = await import("../app/api/insights/request-logs/route");
  insightHealthRoute = await import("../app/api/insights/health-refresh/route");
  database = await import("../lib/sequelize");
  models = await import("../models");
  postService = await import("../services/posts");
  await database.initialiseDatabase();
});

after(async () => {
  await database.sequelize.close();
  await rm(databasePath, { force: true });
});

test("fresh migration creates and seeds the explicit feed schema", async () => {
  assert.equal(await models.User.count(), 4);
  assert.equal(await models.RssUser.count(), 6);
  assert.equal(await models.Feed.count(), 8);
  assert.equal(await models.Post.count(), 16);
  const tables = new Set(
    (await database.sequelize.getQueryInterface().showAllTables()).map(String),
  );
  assert(tables.has("Feeds"));
  assert(tables.has("PostFeeds"));
  assert(tables.has("RequestLogs"));
  assert(tables.has("FeedStatusEvents"));
  assert(tables.has("Alerts"));
  assert(tables.has("RssUsers"));
  const requestColumns = await database.sequelize.getQueryInterface().describeTable("RequestLogs");
  assert("clientType" in requestColumns);
  assert(!tables.has("Topics"));
  assert(!tables.has("PostTopics"));
  const columns = await database.sequelize.getQueryInterface().describeTable("Posts");
  assert(!("classification" in columns));
  const indexes = (await database.sequelize.getQueryInterface().showIndex("PostFeeds")) as Array<{
    unique: boolean;
    fields: Array<{ attribute: string }>;
  }>;
  assert(
    !indexes.some(
      (index) =>
        index.unique && index.fields.length === 1 && index.fields[0]?.attribute === "feedId",
    ),
  );
});

test("post CRUD, relationships, filtering and pagination are predictable", async () => {
  const createResponse = await postsRoute.POST(
    new Request("http://test/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Testing <RSS> & APIs",
        body: "A test post stored through the same route as the frontend.",
        authorId: "administrator",
        feedIds: ["internships", "ai-coding"],
        publishedAt: "2026-08-10T01:00:00.000Z",
        imageUrl: "https://example.com/image.png",
        externalLink: "https://example.com/details",
      }),
    }),
  );
  assert.equal(createResponse.status, 201);
  const created = await json<{ id: number; feeds: Array<{ id: string }> }>(createResponse);
  createdId = created.data.id;
  assert.deepEqual(created.data.feeds.map((feed) => feed.id).sort(), ["ai-coding", "internships"]);

  const listResponse = await postsRoute.GET(
    new Request("http://test/api/posts?page=1&pageSize=5&feedId=internships&search=Testing"),
  );
  const listed = await json<Array<{ id: number }>>(listResponse);
  assert.equal(listResponse.status, 200);
  assert.equal(listed.meta?.pageSize, 5);
  assert(listed.data.some((post) => post.id === createdId));

  const getResponse = await postRoute.GET(new Request("http://test"), {
    params: Promise.resolve({ id: String(createdId) }),
  });
  assert.equal(getResponse.status, 200);

  const patchResponse = await postRoute.PATCH(
    new Request("http://test", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Updated <RSS> & test",
        feedIds: ["hackathons"],
        publishedAt: "2026-08-10T02:00:00.000Z",
      }),
    }),
    { params: Promise.resolve({ id: String(createdId) }) },
  );
  assert.equal(patchResponse.status, 200);
  const updated = await json<{ title: string; publishedAt: string; feeds: Array<{ id: string }> }>(
    patchResponse,
  );
  assert.equal(updated.data.title, "Updated <RSS> & test");
  assert.deepEqual(
    updated.data.feeds.map((feed) => feed.id),
    ["hackathons"],
  );
  assert.equal(new Date(updated.data.publishedAt).toISOString(), "2026-08-10T02:00:00.000Z");
});

test("invalid authors and channels return validation errors without partial writes", async () => {
  const beforeCount = await models.Post.count();
  const invalidAuthor = await postsRoute.POST(
    new Request("http://test/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Invalid author",
        body: "This must not be stored.",
        authorId: "missing",
        feedIds: ["internships"],
      }),
    }),
  );
  assert.equal(invalidAuthor.status, 400);

  const invalidFeed = await postsRoute.POST(
    new Request("http://test/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Invalid feed",
        body: "This must roll back.",
        authorId: "administrator",
        feedIds: ["missing"],
      }),
    }),
  );
  assert.equal(invalidFeed.status, 400);
  assert.equal(await models.Post.count(), beforeCount);

  const invalidPage = await postsRoute.GET(new Request("http://test/api/posts?page=zero"));
  assert.equal(invalidPage.status, 400);
});

test("a relationship failure rolls back a post created inside a transaction", async () => {
  const beforeCount = await models.Post.count();
  await assert.rejects(
    database.sequelize.transaction(async (transaction) => {
      const post = await models.Post.create(
        {
          title: "Rollback proof",
          body: "This post must disappear when its feed relationship fails.",
          authorId: "administrator",
          publishedAt: new Date(),
        },
        { transaction },
      );
      await postService.replacePostFeeds(post.id, ["missing-feed"], transaction);
    }),
  );
  assert.equal(await models.Post.count(), beforeCount);
  assert.equal(await models.Post.count({ where: { title: "Rollback proof" } }), 0);
});

test("RSS output is valid, escaped, limited, channel-scoped and counted", async () => {
  const before = await models.RequestCounter.findOne({ where: { key: "rss-client-requests" } });
  const combined = await rssRoute.GET(
    new Request("http://test/rss", {
      headers: { "X-Client-Id": "api-test-client", "X-Client-Source": "browser" },
    }),
  );
  const combinedXml = await combined.text();
  assert.equal(combined.status, 200);
  assert.match(combined.headers.get("content-type") ?? "", /application\/rss\+xml/);
  assert.equal((combinedXml.match(/<item>/g) ?? []).length, 5);
  const guids = [...combinedXml.matchAll(/<guid[^>]*>(.*?)<\/guid>/g)].map((match) => match[1]);
  assert.equal(new Set(guids).size, 5);
  assert(!combinedXml.includes("<title>Testing <RSS> & APIs</title>"));

  const channel = await channelRssRoute.GET(
    new Request("http://test", { headers: { "X-Rss-User-Id": "ava-nguyen" } }),
    {
      params: Promise.resolve({ channelCode: "HACKATHONS" }),
    },
  );
  const channelXml = await channel.text();
  assert.equal(channel.status, 200);
  assert.match(channelXml, /Updated &lt;RSS&gt; &amp; test/);
  assert.match(channelXml, new RegExp(`<link>http://localhost:3000/posts/${createdId}</link>`));
  assert.match(channelXml, /<author>administrator@latrobe\.example \(Administrator\)<\/author>/);
  assert.match(channelXml, /<pubDate>.*<\/pubDate>/);
  assert.match(channelXml, /<media:content url="https:\/\/example\.com\/image\.png"/);

  const missing = await channelRssRoute.GET(new Request("http://test"), {
    params: Promise.resolve({ channelCode: "NOT-A-CHANNEL" }),
  });
  assert.equal(missing.status, 404);
  const after = await models.RequestCounter.findOne({ where: { key: "rss-client-requests" } });
  assert.equal(after!.count, before!.count + 2);
  assert.equal(
    (await models.RequestLog.findOne({ where: { rssUserId: "ava-nguyen" } }))?.rssUserId,
    "ava-nguyen",
  );
  assert.equal(
    (await models.RequestLog.findOne({ where: { clientId: "api-test-client" } }))?.clientType,
    "browser",
  );
});

test("operational endpoints share the documented response contract", async () => {
  const health = await json<{ status: string; database: string }>(await healthRoute.GET());
  assert.equal(health.success, true);
  assert.equal(health.data.database, "connected");

  const count = await json<{ requestCount: number }>(await countRoute.GET());
  assert.equal(count.success, true);
  assert(count.data.requestCount >= 2);

  const stats = await json<{
    totalPosts: number;
    totalFeeds: number;
    successfulRssRequests: number;
    postsPerFeed: unknown[];
  }>(await statsRoute.GET());
  assert.equal(stats.data.totalFeeds, 8);
  assert.equal(stats.data.totalPosts, 17);
  assert.equal(stats.data.successfulRssRequests, count.data.requestCount);
  assert.equal(stats.data.postsPerFeed.length, 8);
});

test("Assessment 3 metrics aggregate persisted RSS operations", async () => {
  const summaryResponse = await metricSummaryRoute.GET(
    new Request("http://test/api/metrics/summary?range=all"),
  );
  const summary = await json<{
    totalRequests: number;
    uniqueClients: number;
    totalFeeds: number;
    healthyFeeds: number;
  }>(summaryResponse);
  assert.equal(summaryResponse.status, 200);
  assert.equal(summary.data.totalRequests, 3);
  assert.equal(summary.data.uniqueClients, 2);
  assert.equal(summary.data.totalFeeds, 8);
  assert.equal(summary.data.healthyFeeds, 1);

  const byFeed = await json<Array<{ code: string; totalRequests: number }>>(
    await requestsByFeedRoute.GET(
      new Request("http://test/api/metrics/requests-by-feed?range=all"),
    ),
  );
  assert(byFeed.data.some((row) => row.code === "HACKATHONS" && row.totalRequests === 1));

  const byClient = await json<Array<{ clientType: string; totalRequests: number }>>(
    await requestsByClientRoute.GET(
      new Request("http://test/api/metrics/requests-by-client?range=all"),
    ),
  );
  assert(byClient.data.some((row) => row.clientType === "browser"));

  const activity = await json<Array<{ totalRequests: number }>>(
    await requestsOverTimeRoute.GET(
      new Request("http://test/api/metrics/requests-over-time?range=all"),
    ),
  );
  assert(activity.data.reduce((total, row) => total + row.totalRequests, 0) === 3);

  const statuses = await json<Array<{ status: string }>>(await feedStatusRoute.GET());
  assert.equal(statuses.data.length, 8);
  assert(statuses.data.some((row) => row.status === "HEALTHY"));

  const alerts = await json<unknown[]>(
    await alertsRoute.GET(new Request("http://test/api/alerts?resolved=all")),
  );
  assert.equal(alerts.success, true);

  const invalid = await metricSummaryRoute.GET(
    new Request("http://test/api/metrics/summary?range=forever"),
  );
  assert.equal(invalid.status, 400);
});

test("Hub Intelligence aggregates filters and paginates request evidence", async () => {
  const overview = await json<{
    summary: { totalRequests: number; p95LatencyMs: number };
    requestActivity: Array<{ totalRequests: number }>;
    failedByFeed: Array<{ label: string; value: number }>;
    rssUserDemand: Array<{ label: string; value: number }>;
  }>(
    await insightOverviewRoute.GET(
      new Request("http://test/api/insights/overview?range=all&rssUserId=ava-nguyen"),
    ),
  );
  assert.equal(overview.success, true);
  assert(overview.data.summary.totalRequests >= 1);
  assert(overview.data.summary.p95LatencyMs >= 0);
  assert(overview.data.requestActivity.length >= 1);
  assert(
    overview.data.requestActivity.reduce((sum, item) => sum + Number(item.totalRequests), 0) >= 1,
  );
  assert(overview.data.rssUserDemand.some((item) => item.label === "Ava Nguyen"));
  assert(Array.isArray(overview.data.failedByFeed));
  const logsResponse = await insightLogsRoute.GET(
    new Request(
      "http://test/api/insights/request-logs?range=all&page=1&pageSize=20&rssUserId=ava-nguyen",
    ),
  );
  const logs = await json<Array<{ rssUserId: string | null }>>(logsResponse);
  assert.equal(logsResponse.status, 200);
  assert(logs.data.every((row) => row.rssUserId === "ava-nguyen"));
  assert.equal(logs.meta?.pageSize, 20);
  const invalid = await insightLogsRoute.GET(
    new Request("http://test/api/insights/request-logs?range=all&pageSize=50"),
  );
  assert.equal(invalid.status, 400);
});

test("Hub Intelligence health refresh performs and persists a real check for every feed", async () => {
  const beforeRequests = await models.RequestLog.count();
  const response = await insightHealthRoute.POST();
  const result = await json<Array<{ status: string; message: string | null }>>(response);
  assert.equal(response.status, 200);
  assert.equal(result.data.length, 8);
  assert(result.data.every((row) => row.status !== "UNKNOWN" && Boolean(row.message)));
  assert.equal(await models.RequestLog.count(), beforeRequests);
});

test("delete removes the post and its join rows", async () => {
  const response = await postRoute.DELETE(new Request("http://test"), {
    params: Promise.resolve({ id: String(createdId) }),
  });
  assert.equal(response.status, 200);
  assert.equal(await models.Post.count({ where: { id: createdId } }), 0);
  assert.equal(await models.PostFeed.count({ where: { postId: createdId } }), 0);
  const missing = await postRoute.GET(new Request("http://test"), {
    params: Promise.resolve({ id: String(createdId) }),
  });
  assert.equal(missing.status, 404);
});
