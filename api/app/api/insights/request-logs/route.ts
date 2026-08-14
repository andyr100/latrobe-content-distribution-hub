import { errorResponse, failure, ok, options } from "@/lib/http";
import { parseInsightFilters, parsePagination } from "@/lib/insight-filters";
import { initialiseDatabase } from "@/lib/sequelize";
import { getInsightRequestLogs } from "@/services/insights";

export async function GET(request: Request) {
  try {
    await initialiseDatabase();
    const { page, pageSize } = parsePagination(request);
    const result = await getInsightRequestLogs(parseInsightFilters(request), page, pageSize);
    return ok(result.rows, 200, result.meta);
  } catch (error) {
    return error instanceof RangeError
      ? failure(400, "VALIDATION_ERROR", error.message)
      : errorResponse(error);
  }
}

export const OPTIONS = options;
