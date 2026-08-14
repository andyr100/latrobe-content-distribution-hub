import { options } from "@/lib/http";
import { GET as getChannelRss } from "@/app/rss/[channelCode]/route";
type Context = { params: Promise<{ topicCode: string }> };
export async function GET(request: Request, context: Context) {
  const { topicCode } = await context.params;
  return getChannelRss(request, { params: Promise.resolve({ channelCode: topicCode }) });
}
export const OPTIONS = options;
