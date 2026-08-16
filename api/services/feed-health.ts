import { Feed } from "@/models";
import { getFeedStatuses } from "@/services/metrics";
import { recordFeedHealthObservation } from "@/services/operations";
import { loadChannelFeed, renderRss } from "@/services/rss";

export async function runFeedHealthSweep() {
  const feeds = await Feed.findAll({ attributes: ["id", "code"], order: [["title", "ASC"]] });
  for (const configured of feeds) {
    const startedAt = performance.now();
    try {
      const feed = await loadChannelFeed(configured.code);
      if (!feed) throw new Error("Configured RSS feed could not be loaded.");
      const document = renderRss(feed);
      if (!document.startsWith("<?xml") || !document.includes("<rss"))
        throw new Error("Generated feed is not valid RSS XML.");
      await recordFeedHealthObservation({
        feedId: configured.id,
        statusCode: 200,
        durationMs: performance.now() - startedAt,
        itemCount: feed.posts.length,
      });
    } catch (error) {
      await recordFeedHealthObservation({
        feedId: configured.id,
        statusCode: 500,
        durationMs: performance.now() - startedAt,
        itemCount: 0,
        message: error instanceof Error ? error.message : "RSS feed health check failed.",
      });
    }
  }
  return getFeedStatuses();
}
