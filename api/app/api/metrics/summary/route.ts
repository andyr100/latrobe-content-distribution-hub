import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, failure, ok, options } from "@/lib/http";
import { parseMetricFilters } from "@/lib/metric-filters";
import { getMetricSummary } from "@/services/metrics";

export async function GET(request: Request) {
  try {
    await initialiseDatabase();
    return ok(await getMetricSummary(parseMetricFilters(request)));
  } catch (error) {
    if (error instanceof RangeError) return failure(400, "VALIDATION_ERROR", error.message);
    return errorResponse(error);
  }
}

export const OPTIONS = options;
