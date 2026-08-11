import { initialiseDatabase, sequelize } from "@/lib/sequelize";
import { errorResponse, failure, ok, options, readJson } from "@/lib/http";
import { validateAuthorAndFeeds, validatePostFields } from "@/lib/validation";
import { Post } from "@/models";
import { findPost, listPosts, replacePostFeeds } from "@/services/posts";

export async function GET(request: Request) {
  try {
    await initialiseDatabase();
    const result = await listPosts(new URL(request.url).searchParams);
    return ok(result.rows, 200, {
      count: result.rows.length,
      total: result.count,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.count / result.pageSize),
    });
  } catch (error) {
    if (error instanceof RangeError) return failure(400, "VALIDATION_ERROR", error.message);
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await initialiseDatabase();
    const body = await readJson(request);
    if (!body) return failure(400, "VALIDATION_ERROR", "Request body must be valid JSON");
    const errors = validatePostFields(body);
    if (errors.length) return failure(400, "VALIDATION_ERROR", errors[0], { errors });
    const feedIds = body.feedIds ?? body.topicIds;
    const relations = await validateAuthorAndFeeds(body.authorId, feedIds);
    if (relations.message || !relations.feedIds)
      return failure(400, "VALIDATION_ERROR", relations.message ?? "Invalid relationships");
    const created = await sequelize.transaction(async (transaction) => {
      const post = await Post.create(
        {
          title: (body.title as string).trim(),
          body: (body.body as string).trim(),
          authorId: body.authorId,
          imageUrl: body.imageUrl || null,
          externalLink: body.externalLink || null,
          publishedAt: body.publishedAt ? new Date(body.publishedAt as string) : new Date(),
        },
        { transaction },
      );
      await replacePostFeeds(post.id, relations.feedIds, transaction);
      return findPost(post.id, transaction);
    });
    return ok(created, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
