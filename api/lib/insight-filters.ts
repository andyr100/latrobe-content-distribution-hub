import { metricRanges, type MetricRange } from "@/services/metrics";
import type { InsightFilters } from "@/services/insights";

function optional(search: URLSearchParams, name: string) {
  const value = search.get(name)?.trim();
  if (value && value.length > 100) throw new RangeError(`${name} is too long`);
  return value || undefined;
}

export function parseInsightFilters(request: Request): InsightFilters {
  const search = new URL(request.url).searchParams;
  const range = search.get("range") ?? "7d";
  if (!metricRanges.includes(range as MetricRange)) throw new RangeError("Invalid reporting range");
  const status = search.get("status") || undefined;
  if (status && status !== "success" && status !== "failure")
    throw new RangeError("status must be success or failure");
  const clientType = optional(search, "clientType");
  if (
    clientType &&
    !["browser", "mobile_app", "rss_reader", "jmeter", "direct"].includes(clientType)
  )
    throw new RangeError("clientType is invalid");
  return {
    range: range as MetricRange,
    ...(optional(search, "feedId") ? { feedId: optional(search, "feedId") } : {}),
    ...(optional(search, "authorId") ? { authorId: optional(search, "authorId") } : {}),
    ...(optional(search, "rssUserId") ? { rssUserId: optional(search, "rssUserId") } : {}),
    ...(clientType ? { clientType } : {}),
    ...(status ? { status: status as "success" | "failure" } : {}),
  };
}

export function parsePagination(request: Request) {
  const search = new URL(request.url).searchParams;
  const page = Number(search.get("page") ?? 1);
  const pageSize = Number(search.get("pageSize") ?? 20);
  if (!Number.isInteger(page) || page < 1) throw new RangeError("page must be a positive integer");
  if (![20, 100, 500, 1000].includes(pageSize))
    throw new RangeError("pageSize must be 20, 100, 500 or 1000");
  return { page, pageSize };
}
