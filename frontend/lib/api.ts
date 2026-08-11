import type { ApiEnvelope, FeedDto, PostDto } from "@latrobe/api-contract";
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
