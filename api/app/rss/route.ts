import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, options, xml } from "@/lib/http";
import { requestIdentity, recordRssObservationSafely } from "@/services/operations";
import { loadCombinedFeed, renderRss } from "@/services/rss";
export async function GET(request: Request) {
  const startedAt = performance.now();
  try {
    await initialiseDatabase();
    const feed = await loadCombinedFeed();
    await recordRssObservationSafely({
      ...requestIdentity(request),
      feedId: null,
      endpoint: "/rss",
      statusCode: 200,
      durationMs: performance.now() - startedAt,
      itemCount: feed.posts.length,
    });
    return xml(renderRss(feed));
  } catch (error) {
    await recordRssObservationSafely({
      ...requestIdentity(request),
      feedId: null,
      endpoint: "/rss",
      statusCode: 500,
      durationMs: performance.now() - startedAt,
      message: "The combined RSS feed could not be generated.",
    });
    return errorResponse(error);
  }
}
export const OPTIONS = options;
