import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, failure, options, xml } from "@/lib/http";
import { incrementRssCount, loadChannelFeed, renderRss } from "@/services/rss";
type Context = { params: Promise<{ channelCode: string }> };
export async function GET(_request: Request, context: Context) { try { await initialiseDatabase(); const code = decodeURIComponent((await context.params).channelCode).toUpperCase(); const feed = await loadChannelFeed(code); if (!feed) return failure(404, "NOT_FOUND", "Channel was not found"); await incrementRssCount(); return xml(renderRss(feed)); } catch (error) { return errorResponse(error); } }
export const OPTIONS = options;
