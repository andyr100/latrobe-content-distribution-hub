import { errorResponse, ok, options } from "@/lib/http";
import { initialiseDatabase } from "@/lib/sequelize";
import { getInsightFilterOptions } from "@/services/insights";

export async function GET() {
  try {
    await initialiseDatabase();
    return ok(await getInsightFilterOptions());
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
