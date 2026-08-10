import type { InternalPost, MockUser, Topic } from "@/types";
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
type ApiEnvelope<T> = { success: true; data: T; meta?: { count?: number } } | { success: false; error: { message: string } };
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> { const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } }); const payload = await response.json() as ApiEnvelope<T>; if (!response.ok || !payload.success) throw new Error("error" in payload ? payload.error.message : `Request failed (${response.status})`); return payload.data; }
type ApiTopic = { id: string; code: string; name: string; description: string; posts?: Array<{ id: number }> };
type ApiPost = { id: number; title: string; body: string; classification: InternalPost["classification"]; authorId: string; publishedAt: string; imageUrl?: string | null; externalLink?: string | null; author?: MockUser; topics?: ApiTopic[] };
export function mapTopic(topic: ApiTopic): Topic { return { id: topic.id, code: topic.code, name: topic.name, description: topic.description, postCount: topic.posts?.length ?? 0 }; }
export function mapPost(post: ApiPost): InternalPost { return { id: String(post.id), title: post.title, body: post.body, classification: post.classification, authorId: post.authorId, authorName: post.author?.name ?? post.authorId, publishedAt: post.publishedAt, topicIds: post.topics?.map((topic) => topic.id) ?? [], status: "Published", imageUrl: post.imageUrl, externalLink: post.externalLink }; }
export async function getUsers() { return apiRequest<MockUser[]>("/api/users"); }
export async function getTopics() { return (await apiRequest<ApiTopic[]>("/api/topics")).map(mapTopic); }
export async function getPosts() { return (await apiRequest<ApiPost[]>("/api/posts")).map(mapPost); }
export async function createPost(input: Omit<InternalPost, "id" | "authorName" | "publishedAt" | "status">) { return mapPost(await apiRequest<ApiPost>("/api/posts", { method: "POST", body: JSON.stringify(input) })); }
export async function updatePost(id: string, input: Partial<Omit<InternalPost, "id" | "authorName" | "publishedAt" | "status">>) { return mapPost(await apiRequest<ApiPost>(`/api/posts/${id}`, { method: "PATCH", body: JSON.stringify(input) })); }
export async function removePost(id: string) { await apiRequest<{ id: number }>(`/api/posts/${id}`, { method: "DELETE" }); }
