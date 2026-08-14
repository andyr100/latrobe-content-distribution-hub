import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, failure, ok, options } from "@/lib/http";
import { parseMetricFilters } from "@/lib/metric-filters";
import { getRequestsOverTime } from "@/services/metrics";

export async function GET(request: Request) {
  try {
    await initialiseDatabase();
    const data = await getRequestsOverTime(parseMetricFilters(request));
    return ok(data, 200, { count: data.length });
  } catch (error) {
    if (error instanceof RangeError) return failure(400, "VALIDATION_ERROR", error.message);
    return errorResponse(error);
  }
}

export const OPTIONS = options;
