import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, ok } from "@/lib/http";
import { RssUser } from "@/models";

export async function GET() {
  try {
    await initialiseDatabase();
    return ok(await RssUser.findAll({ order: [["name", "ASC"]] }));
  } catch (error) {
    return errorResponse(error);
  }
}
