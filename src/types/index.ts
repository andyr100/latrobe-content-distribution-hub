export type UserRole = "Administrator" | "Lecturer";
export type MockUser = { id: string; name: string; role: UserRole };
export type Classification =
  | "University News" | "Subject News" | "Assessment Information"
  | "Examination Information" | "Timetable Changes" | "Assignment Updates"
  | "Industry News" | "Career Opportunities" | "Student Services"
  | "General Announcement";
export type Channel = { id: string; code: string; subjectName: string; semester: string; active: boolean; postCount: number };
export type InternalPost = { id: string; title: string; body: string; classification: Classification; authorId: string; authorName: string; publishedAt: string; channelIds: string[]; status: "Published" };
export type ExternalArticle = { id: string; feedId: string; title: string; summary: string; classification: Classification; publishedAt: string };
export type PublishRequest = { sourceType: "internal" | "external"; title: string; body: string; classification: Classification; author: MockUser; channelIds: string[]; externalArticleId?: string };
