import { initialiseDatabase, sequelize } from "@/lib/sequelize";
import { failure, ok, options } from "@/lib/http";
import { Feed } from "@/models";

export async function GET() {
  try {
    await initialiseDatabase();
    await sequelize.authenticate();
    const feedCount = await Feed.count();
    return ok({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      version: "3.0.0",
      feedCount,
    });
  } catch (error) {
    console.error("Health check failed", error);
    return failure(503, "SERVICE_UNAVAILABLE", "The database is disconnected", {
      status: "unavailable",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
}

export const OPTIONS = options;
