import { Feed, User } from "@/models";

export function requiredString(value: unknown, name: string, max?: number) {
  if (typeof value !== "string" || !value.trim()) return `${name} is required`;
  if (max && value.trim().length > max) return `${name} must be ${max} characters or fewer`;
  return null;
}

export function optionalUrl(value: unknown, name: string) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return `${name} must be a URL`;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? null : `${name} must use http or https`;
  } catch {
    return `${name} must be a valid URL`;
  }
}

export function optionalDate(value: unknown, name: string) {
  if (value === undefined) return null;
  return typeof value === "string" && !Number.isNaN(Date.parse(value))
    ? null
    : `${name} is invalid`;
}

export async function validateAuthorAndFeeds(authorId: unknown, feedIds: unknown) {
  if (typeof authorId !== "string") return { message: "A valid authorId is required" };
  const author = await User.findByPk(authorId);
  if (!author) return { message: "Author was not found" };
  if (
    !Array.isArray(feedIds) ||
    feedIds.length === 0 ||
    feedIds.some((id) => typeof id !== "string")
  ) {
    return { message: "At least one valid feedId is required" };
  }
  const uniqueIds = [...new Set(feedIds as string[])];
  const feeds = await Feed.findAll({ where: { id: uniqueIds } });
  if (feeds.length !== uniqueIds.length) return { message: "One or more feeds were not found" };
  return { author, feeds, feedIds: uniqueIds };
}

export function validatePostFields(body: Record<string, unknown>, partial = false) {
  const errors: string[] = [];
  if (!partial || body.title !== undefined) {
    const error = requiredString(body.title, "Title", 100);
    if (error) errors.push(error);
  }
  if (!partial || body.body !== undefined) {
    const error = requiredString(body.body, "Body", 5000);
    if (error) errors.push(error);
  }
  for (const [key, label] of [
    ["imageUrl", "Image URL"],
    ["externalLink", "External link"],
  ] as const) {
    if (body[key] !== undefined) {
      const error = optionalUrl(body[key], label);
      if (error) errors.push(error);
    }
  }
  const dateError = optionalDate(body.publishedAt, "Published date");
  if (dateError) errors.push(dateError);
  return errors;
}
