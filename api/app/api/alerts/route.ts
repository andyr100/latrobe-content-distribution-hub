import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, failure, ok, options } from "@/lib/http";
import { parseLimit } from "@/lib/metric-filters";
import { getAlerts } from "@/services/metrics";

export async function GET(request: Request) {
  try {
    await initialiseDatabase();
    const value = new URL(request.url).searchParams.get("resolved") ?? "false";
    if (!["true", "false", "all"].includes(value)) {
      return failure(400, "VALIDATION_ERROR", "resolved must be true, false or all");
    }
    const data = await getAlerts({
      ...(value === "all" ? {} : { resolved: value === "true" }),
      limit: parseLimit(request, 50),
    });
    return ok(data, 200, { count: data.length });
  } catch (error) {
    if (error instanceof RangeError) return failure(400, "VALIDATION_ERROR", error.message);
    return errorResponse(error);
  }
}

export const OPTIONS = options;
