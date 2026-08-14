import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, failure, ok, options } from "@/lib/http";
import { parseLimit, parseMetricFilters } from "@/lib/metric-filters";
import { getRequestsByClient } from "@/services/metrics";

export async function GET(request: Request) {
  try {
    await initialiseDatabase();
    const data = await getRequestsByClient(parseMetricFilters(request), parseLimit(request));
    return ok(data, 200, { count: data.length });
  } catch (error) {
    if (error instanceof RangeError) return failure(400, "VALIDATION_ERROR", error.message);
    return errorResponse(error);
  }
}

export const OPTIONS = options;
