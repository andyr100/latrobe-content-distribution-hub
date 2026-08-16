import type {
  AlertDto,
  ApiEnvelope,
  FeedDto,
  FeedStatusDto,
  HealthDto,
  MetricRangeDto,
  MetricSummaryDto,
  PostDto,
  RecentRequestDto,
  RequestActivityDto,
  InsightFiltersDto,
  InsightLogDto,
  InsightLogMeta,
  RequestsByClientDto,
  RequestsByFeedDto,
  RssClientTypeDto,
} from "@latrobe/api-contract";
import type { Channel, DashboardStats, InternalPost, MockUser } from "@/types";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    throw new Error(
      "error" in payload ? payload.error.message : `Request failed (${response.status})`,
    );
  }
  return payload.data;
}

export function mapFeed(feed: FeedDto): Channel {
  return {
    id: feed.id,
    code: feed.code,
    title: feed.title,
    description: feed.description,
    slug: feed.slug,
    postCount: feed.posts?.length ?? 0,
  };
}

export function mapPost(post: PostDto): InternalPost {
  return {
    id: String(post.id),
    title: post.title,
    body: post.body,
    authorId: post.authorId,
    authorName: post.author?.name ?? post.authorId,
    publishedAt: post.publishedAt,
    feedIds: post.feeds?.map((feed) => feed.id) ?? [],
    status: "Published",
    imageUrl: post.imageUrl,
    externalLink: post.externalLink,
  };
}

export async function getUsers() {
  return apiRequest<MockUser[]>("/api/users");
}

export async function getChannels() {
  return (await apiRequest<FeedDto[]>("/api/feeds")).map(mapFeed);
}

export async function getPosts() {
  return (await apiRequest<PostDto[]>("/api/posts?pageSize=100")).map(mapPost);
}

export async function getStats() {
  return apiRequest<DashboardStats>("/stats");
}

type PostInput = Omit<InternalPost, "id" | "authorName" | "publishedAt" | "status"> & {
  publishedAt?: string;
};

export async function createPost(input: PostInput) {
  return mapPost(
    await apiRequest<PostDto>("/api/posts", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}

export async function updatePost(id: string, input: Partial<PostInput>) {
  return mapPost(
    await apiRequest<PostDto>(`/api/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  );
}

export async function removePost(id: string) {
  await apiRequest<{ id: number }>(`/api/posts/${id}`, { method: "DELETE" });
}

function metricQuery(range: MetricRangeDto, extras: Record<string, string> = {}) {
  return new URLSearchParams({ range, ...extras }).toString();
}

export async function getHealth() {
  return apiRequest<HealthDto>("/health");
}

export async function getMetricSummary(range: MetricRangeDto) {
  return apiRequest<MetricSummaryDto>(`/api/metrics/summary?${metricQuery(range)}`);
}

export async function getRequestsByFeed(range: MetricRangeDto, limit = 20) {
  return apiRequest<RequestsByFeedDto[]>(
    `/api/metrics/requests-by-feed?${metricQuery(range, { limit: String(limit) })}`,
  );
}

export async function getRequestsByClient(range: MetricRangeDto, limit = 20) {
  return apiRequest<RequestsByClientDto[]>(
    `/api/metrics/requests-by-client?${metricQuery(range, { limit: String(limit) })}`,
  );
}

export async function getRequestActivity(range: MetricRangeDto) {
  return apiRequest<RequestActivityDto[]>(`/api/metrics/requests-over-time?${metricQuery(range)}`);
}

export async function getRecentRequests(range: MetricRangeDto, limit = 20) {
  return apiRequest<RecentRequestDto[]>(
    `/api/metrics/recent?${metricQuery(range, { limit: String(limit) })}`,
  );
}

export async function getFeedStatuses() {
  return apiRequest<FeedStatusDto[]>("/api/feed-status");
}

export async function getAlerts(resolved: "true" | "false" | "all" = "false") {
  return apiRequest<AlertDto[]>(`/api/alerts?resolved=${resolved}`);
}

export async function setAlertResolved(id: number, resolved: boolean) {
  return apiRequest<AlertDto>(`/api/alerts/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ resolved }),
  });
}

export async function getOperationsSnapshot(range: MetricRangeDto, limit = 8) {
  const [health, summary, byFeed, byClient, activity, statuses, alerts, recent] = await Promise.all(
    [
      getHealth(),
      getMetricSummary(range),
      getRequestsByFeed(range, limit),
      getRequestsByClient(range, limit),
      getRequestActivity(range),
      getFeedStatuses(),
      getAlerts("false"),
      getRecentRequests(range, limit),
    ],
  );
  return { health, summary, byFeed, byClient, activity, statuses, alerts, recent };
}

export type OperationsSnapshot = Awaited<ReturnType<typeof getOperationsSnapshot>>;

export type HubOverview = {
  range: MetricRangeDto;
  generatedAt: string;
  timezone: string;
  serviceStatus: "online" | "degraded" | "offline";
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatencyMs: number;
    activeClients: number;
    activeRssUsers: number;
    successRate: number | null;
    errorRate: number | null;
    requestsPerRssUser: number | null;
    p95LatencyMs: number;
    publishingAuthors: number;
    publishedPosts: number;
    healthyFeeds: number;
    warningFeeds: number;
    errorFeeds: number;
    totalFeeds: number;
    unresolvedAlerts: number;
  };
  requestActivity: Array<{
    bucket: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatencyMs: number;
  }>;
  postActivity: Array<{ bucket: string; totalPosts: number; activeAuthors: number }>;
  feedDemand: Array<{ code: string; title: string; value: number }>;
  clientActivity: Array<{ bucket: string; activeClients: number }>;
  rssUserActivity: Array<{ bucket: string; activeRssUsers: number }>;
  clientDistribution: Array<{ label: RssClientTypeDto; value: number }>;
  failedByFeed: Array<{ label: string; value: number }>;
  rssUserDemand: Array<{ label: string; value: number }>;
  postChannels: Array<{ label: string; value: number }>;
  topAuthors: Array<{ label: string; value: number }>;
  publishingUsers: Array<{ bucket: string; totalUsers: number }>;
  healthTimeline: Array<{ bucket: string; status: string; value: number }>;
  statuses: FeedStatusDto[];
};

export type HubFilterOptions = {
  authors: Array<{ id: string; name: string; role: string }>;
  rssUsers: Array<{ id: string; name: string; role: string }>;
  feeds: Array<{ id: string; code: string; title: string }>;
  clientTypes: RssClientTypeDto[];
  ranges: MetricRangeDto[];
};

function insightQuery(filters: InsightFiltersDto & { page?: number; pageSize?: number }) {
  const values = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => [key, String(value)]);
  return new URLSearchParams(values).toString();
}

export function getHubFilterOptions() {
  return apiRequest<HubFilterOptions>("/api/insights/filter-options");
}
export function getHubOverview(filters: InsightFiltersDto) {
  return apiRequest<HubOverview>(`/api/insights/overview?${insightQuery(filters)}`);
}
export function refreshHubFeedHealth() {
  return apiRequest<FeedStatusDto[]>("/api/insights/health-refresh", { method: "POST" });
}
export function getHubRequestLogs(
  filters: InsightFiltersDto,
  page: number,
  pageSize: 20 | 100 | 500 | 1000,
) {
  return apiRequest<InsightLogDto[]>(
    `/api/insights/request-logs?${insightQuery({ ...filters, page, pageSize })}`,
  ).then((data) => data);
}
export async function getHubRequestLogPage(
  filters: InsightFiltersDto,
  page: number,
  pageSize: 20 | 100 | 500 | 1000,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/insights/request-logs?${insightQuery({ ...filters, page, pageSize })}`,
  );
  const payload = (await response.json()) as ApiEnvelope<InsightLogDto[], InsightLogMeta>;
  if (!response.ok || !payload.success)
    throw new Error("error" in payload ? payload.error.message : "Unable to load request logs");
  return { rows: payload.data, meta: payload.meta! };
}
