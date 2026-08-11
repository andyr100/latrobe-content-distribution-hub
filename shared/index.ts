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
