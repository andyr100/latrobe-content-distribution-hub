import { errorResponse, failure, ok, options } from "@/lib/http";
import { parseInsightFilters } from "@/lib/insight-filters";
import { initialiseDatabase } from "@/lib/sequelize";
import { getInsightOverview } from "@/services/insights";

export async function GET(request: Request) {
  try {
    await initialiseDatabase();
    return ok(await getInsightOverview(parseInsightFilters(request)));
  } catch (error) {
    return error instanceof RangeError
      ? failure(400, "VALIDATION_ERROR", error.message)
      : errorResponse(error);
  }
}

export const OPTIONS = options;
