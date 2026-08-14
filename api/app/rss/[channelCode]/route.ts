import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, failure, options, xml } from "@/lib/http";
import { Feed } from "@/models";
import { requestIdentity, recordRssObservationSafely } from "@/services/operations";
import { loadChannelFeed, renderRss } from "@/services/rss";
type Context = { params: Promise<{ channelCode: string }> };
export async function GET(request: Request, context: Context) {
  const startedAt = performance.now();
  let feedId: string | null = null;
  let endpoint = "/rss/:channelCode";
  try {
    await initialiseDatabase();
    const code = decodeURIComponent((await context.params).channelCode).toUpperCase();
    endpoint = `/rss/${code}`;
    feedId = (await Feed.findOne({ where: { code }, attributes: ["id"] }))?.id ?? null;
    const feed = await loadChannelFeed(code);
    if (!feed) {
      await recordRssObservationSafely({
        ...requestIdentity(request),
        feedId,
        endpoint,
        statusCode: 404,
        durationMs: performance.now() - startedAt,
        message: `Channel ${code} was not found.`,
      });
      return failure(404, "NOT_FOUND", "Channel was not found");
    }
    await recordRssObservationSafely({
      ...requestIdentity(request),
      feedId,
      endpoint,
      statusCode: 200,
      durationMs: performance.now() - startedAt,
      itemCount: feed.posts.length,
      message: feed.posts.length ? null : "The RSS feed has no published items.",
    });
    return xml(renderRss(feed));
  } catch (error) {
    await recordRssObservationSafely({
      ...requestIdentity(request),
      feedId,
      endpoint,
      statusCode: 500,
      durationMs: performance.now() - startedAt,
      message: "The channel RSS feed could not be generated.",
    });
    return errorResponse(error);
  }
}
export const OPTIONS = options;
