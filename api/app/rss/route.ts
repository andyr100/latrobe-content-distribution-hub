import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, options, xml } from "@/lib/http";
import { incrementRssCount, loadCombinedFeed, renderRss } from "@/services/rss";
export async function GET() {
  try {
    await initialiseDatabase();
    const feed = await loadCombinedFeed();
    await incrementRssCount();
    return xml(renderRss(feed));
  } catch (error) {
    return errorResponse(error);
  }
}
export const OPTIONS = options;
