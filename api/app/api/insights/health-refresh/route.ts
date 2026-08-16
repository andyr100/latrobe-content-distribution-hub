import { errorResponse, ok, options } from "@/lib/http";
import { initialiseDatabase } from "@/lib/sequelize";
import { runFeedHealthSweep } from "@/services/feed-health";

export async function POST() {
  try {
    await initialiseDatabase();
    return ok(await runFeedHealthSweep());
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
