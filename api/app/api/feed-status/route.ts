import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, ok, options } from "@/lib/http";
import { getFeedStatuses } from "@/services/metrics";

export async function GET() {
  try {
    await initialiseDatabase();
    const data = await getFeedStatuses();
    return ok(data, 200, { count: data.length });
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
