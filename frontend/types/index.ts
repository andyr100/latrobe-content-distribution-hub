export type UserRole = "Administrator" | "Lecturer";
export type MockUser = { id: string; name: string; email?: string; role: UserRole };
export type Classification = "Community News" | "Event" | "Career Opportunity" | "Learning Resource" | "Industry Update" | "Tooling Update";
export type Topic = { id: string; code: string; name: string; description: string; postCount: number };
export type InternalPost = { id: string; title: string; body: string; classification: Classification; authorId: string; authorName: string; publishedAt: string; topicIds: string[]; status: "Published"; imageUrl?: string | null; externalLink?: string | null };
export type PublishRequest = { title: string; body: string; author: MockUser; topicIds: string[]; imageUrl?: string | null; externalLink?: string | null };
