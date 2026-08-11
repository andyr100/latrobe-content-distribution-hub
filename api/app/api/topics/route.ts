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
    const topics = feeds.map((feed) => {
      const value = feed.get({ plain: true }) as Record<string, unknown>;
      return { ...value, name: value.title };
    });
    return ok(topics, 200, { count: topics.length, deprecated: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
