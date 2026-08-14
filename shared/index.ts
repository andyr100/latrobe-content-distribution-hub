export type ApiSuccess<T, TMeta extends Record<string, unknown> = Record<string, unknown>> = {
  success: true;
  data: T;
  meta?: TMeta;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
};

export type ApiEnvelope<T, TMeta extends Record<string, unknown> = Record<string, unknown>> =
  | ApiSuccess<T, TMeta>
  | ApiFailure;

export type UserDto = {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Lecturer";
};

export type RssUserDto = {
  id: string;
  name: string;
  email: string;
  role: "Student";
};

export type InsightFiltersDto = {
  range: MetricRangeDto;
  feedId?: string;
  authorId?: string;
  rssUserId?: string;
  clientId?: string;
  status?: "success" | "failure";
  source?: string;
};

export type InsightLogDto = RecentRequestDto & {
  rssUserId: string | null;
  rssUserName: string | null;
};

export type InsightLogMeta = {
  total: number;
  page: number;
  pageSize: 20 | 100 | 500 | 1000;
  totalPages: number;
};

export type FeedDto = {
  id: string;
  code: string;
  title: string;
  description: string;
  slug: string;
  posts?: Array<{ id: number }>;
};

export type PostDto = {
  id: number;
  title: string;
  body: string;
  authorId: string;
  publishedAt: string;
  imageUrl: string | null;
  externalLink: string | null;
  author?: UserDto;
  feeds?: FeedDto[];
};

export type PostInputDto = {
  title: string;
  body: string;
  authorId: string;
  feedIds: string[];
  publishedAt?: string;
  imageUrl?: string | null;
  externalLink?: string | null;
};

export type PostListMeta = {
  count: number;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DashboardStatsDto = {
  totalPosts: number;
  totalFeeds: number;
  successfulRssRequests: number;
  latestPost: { id: number; title: string; publishedAt: string } | null;
  postsPerFeed: Array<{ id: string; code: string; title: string; postCount: number }>;
};

export type MetricRangeDto = "1h" | "24h" | "7d" | "30d" | "all";

export type RequestsByFeedDto = {
  feedId: string | null;
  code: string;
  title: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
};

export type RequestsByClientDto = {
  clientId: string;
  source: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  lastRequestedAt: string;
};

export type RequestActivityDto = {
  bucket: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
};

export type FeedStatusDto = {
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

export type AlertDto = {
  id: number;
  feedId: string | null;
  type: string;
  severity: "INFO" | "WARNING" | "ERROR";
  message: string;
  resolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  feed?: Pick<FeedDto, "id" | "code" | "title"> | null;
};

export type RecentRequestDto = {
  id: number;
  clientId: string;
  feedId: string | null;
  feedCode: string;
  endpoint: string;
  statusCode: number;
  success: boolean | number;
  durationMs: number;
  source: string | null;
  requestedAt: string;
};

export type MetricSummaryDto = {
  totalRequests: number;
  uniqueClients: number;
  totalFeeds: number;
  healthyFeeds: number;
  emptyFeeds: number;
  warningFeeds: number;
  errorFeeds: number;
  unknownFeeds: number;
  failedRequests: number;
  successfulRequests: number;
  successRate: number;
  averageLatencyMs: number;
  unresolvedAlerts: number;
  mostRequestedFeed: RequestsByFeedDto | null;
  range: MetricRangeDto;
  generatedAt: string;
};

export type HealthDto = {
  status: "ok";
  database: "connected";
  timestamp: string;
  uptimeSeconds: number;
  version: string;
  feedCount: number;
};
