import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, ok, options } from "@/lib/http";
import { Feed, Post } from "@/models";

export async function GET() {
  try {
    await initialiseDatabase();
    const feeds = await Feed.findAll({
      include: [
        {
          model: Post,
          as: "posts",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
      order: [["title", "ASC"]],
    });
    return ok(feeds, 200, { count: feeds.length });
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
