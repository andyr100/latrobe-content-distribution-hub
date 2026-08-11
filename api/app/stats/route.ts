import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, ok, options } from "@/lib/http";
import { Feed, Post, RequestCounter } from "@/models";

export async function GET() {
  try {
    await initialiseDatabase();
    const [totalPosts, feeds, latestPost, counter] = await Promise.all([
      Post.count(),
      Feed.findAll({
        attributes: ["id", "code", "title"],
        include: [
          {
            model: Post,
            as: "posts",
            attributes: ["id"],
            through: { attributes: [] },
          },
        ],
        order: [["title", "ASC"]],
      }),
      Post.findOne({
        attributes: ["id", "title", "publishedAt"],
        order: [["publishedAt", "DESC"]],
      }),
      RequestCounter.findOne({ where: { key: "rss-client-requests" } }),
    ]);
    const feedStats = feeds.map((feed) => {
      const plain = feed.get({ plain: true }) as unknown as {
        id: string;
        code: string;
        title: string;
        posts?: Array<{ id: number }>;
      };
      return {
        id: plain.id,
        code: plain.code,
        title: plain.title,
        postCount: plain.posts?.length ?? 0,
      };
    });
    return ok({
      totalPosts,
      totalFeeds: feedStats.length,
      successfulRssRequests: counter?.count ?? 0,
      latestPost,
      postsPerFeed: feedStats,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
