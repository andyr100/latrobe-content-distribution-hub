import { initialiseDatabase, sequelize } from "@/lib/sequelize";
import { errorResponse, failure, ok, options, parseId, readJson } from "@/lib/http";
import { validateAuthorAndFeeds, validatePostFields } from "@/lib/validation";
import { Post, PostFeed } from "@/models";
import { findPost, replacePostFeeds } from "@/services/posts";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    await initialiseDatabase();
    const id = parseId((await context.params).id);
    if (!id) return failure(400, "VALIDATION_ERROR", "Post ID is malformed");
    const post = await findPost(id);
    return post ? ok(post) : failure(404, "NOT_FOUND", "Post was not found");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    await initialiseDatabase();
    const id = parseId((await context.params).id);
    if (!id) return failure(400, "VALIDATION_ERROR", "Post ID is malformed");
    const body = await readJson(request);
    if (!body) return failure(400, "VALIDATION_ERROR", "Request body must be valid JSON");
    const errors = validatePostFields(body, true);
    if (errors.length) return failure(400, "VALIDATION_ERROR", errors[0], { errors });
    const existing = await Post.findByPk(id);
    if (!existing) return failure(404, "NOT_FOUND", "Post was not found");

    const authorId = body.authorId ?? existing.authorId;
    let feedIds: string[] | undefined;
    const requestedFeedIds = body.feedIds ?? body.topicIds;
    if (body.authorId !== undefined || requestedFeedIds !== undefined) {
      const currentLinks = await PostFeed.findAll({ where: { postId: id } });
      const requestedFeeds = requestedFeedIds ?? currentLinks.map((link) => link.feedId);
      const relations = await validateAuthorAndFeeds(authorId, requestedFeeds);
      if (relations.message || !relations.feedIds)
        return failure(400, "VALIDATION_ERROR", relations.message ?? "Invalid relationships");
      feedIds = relations.feedIds;
    }

    const updated = await sequelize.transaction(async (transaction) => {
      await existing.update(
        {
          ...(body.title !== undefined ? { title: (body.title as string).trim() } : {}),
          ...(body.body !== undefined ? { body: (body.body as string).trim() } : {}),
          ...(body.authorId !== undefined ? { authorId } : {}),
          ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl || null } : {}),
          ...(body.externalLink !== undefined ? { externalLink: body.externalLink || null } : {}),
          ...(body.publishedAt !== undefined
            ? { publishedAt: new Date(body.publishedAt as string) }
            : {}),
        },
        { transaction },
      );
      if (feedIds) await replacePostFeeds(id, feedIds, transaction);
      return findPost(id, transaction);
    });
    return ok(updated);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    await initialiseDatabase();
    const id = parseId((await context.params).id);
    if (!id) return failure(400, "VALIDATION_ERROR", "Post ID is malformed");
    const deleted = await sequelize.transaction(async (transaction) => {
      const post = await Post.findByPk(id, { transaction });
      if (!post) return false;
      await post.destroy({ transaction });
      return true;
    });
    return deleted ? ok({ id }) : failure(404, "NOT_FOUND", "Post was not found");
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
