import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, ok, options } from "@/lib/http";
import { RequestCounter } from "@/models";

export async function GET() {
  try {
    await initialiseDatabase();
    const counter = await RequestCounter.findOne({
      where: { key: "rss-client-requests" },
    });
    return ok({ requestCount: counter?.count ?? 0 });
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
