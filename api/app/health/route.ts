import { initialiseDatabase, sequelize } from "@/lib/sequelize";
import { failure, ok, options } from "@/lib/http";

export async function GET() {
  try {
    await initialiseDatabase();
    await sequelize.authenticate();
    return ok({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
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
