export type UserRole = "Administrator" | "Lecturer";

export type MockUser = {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
};

export type Channel = {
  id: string;
  code: string;
  title: string;
  description: string;
  slug: string;
  postCount: number;
};

export type DashboardStats = {
  totalPosts: number;
  totalFeeds: number;
  successfulRssRequests: number;
  latestPost: { id: number; title: string; publishedAt: string } | null;
  postsPerFeed: Array<{ id: string; code: string; title: string; postCount: number }>;
};

export type InternalPost = {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  publishedAt: string;
  feedIds: string[];
  status: "Published";
  imageUrl?: string | null;
  externalLink?: string | null;
};

export type PublishRequest = {
  title: string;
  body: string;
  author: MockUser;
  feedIds: string[];
  imageUrl?: string | null;
  externalLink?: string | null;
};
