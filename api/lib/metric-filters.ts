import { metricRanges, type MetricFilters, type MetricRange } from "@/services/metrics";

export function parseMetricFilters(request: Request): MetricFilters {
  const search = new URL(request.url).searchParams;
  const requestedRange = search.get("range") ?? "24h";
  if (!metricRanges.includes(requestedRange as MetricRange)) {
    throw new RangeError(`Range must be one of: ${metricRanges.join(", ")}`);
  }
  const feedId = search.get("feedId")?.trim();
  const clientType = search.get("clientType")?.trim();
  if (feedId && feedId.length > 100) throw new RangeError("feedId is too long");
  if (
    clientType &&
    !["browser", "mobile_app", "rss_reader", "jmeter", "direct"].includes(clientType)
  )
    throw new RangeError("clientType is invalid");
  return {
    range: requestedRange as MetricRange,
    ...(feedId ? { feedId } : {}),
    ...(clientType ? { clientType } : {}),
  };
}

export function parseLimit(request: Request, fallback = 20) {
  const value = Number(new URL(request.url).searchParams.get("limit") ?? fallback);
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new RangeError("Limit must be an integer between 1 and 100");
  }
  return value;
}
