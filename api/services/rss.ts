import { Post, RequestCounter, Topic, User } from "@/models";
import { sequelize } from "@/lib/sequelize";

type RssPost = { id: number; title: string; body: string; publishedAt: Date; imageUrl?: string | null; author?: { name?: string; email?: string } };
type Feed = { title: string; description: string; code?: string; posts: RssPost[] };

function escapeXml(value: string) { return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] as string); }
function asRssPost(post: Post) { const plain = post.get({ plain: true }) as unknown as RssPost; return plain; }

export async function loadCombinedFeed(): Promise<Feed> {
  const posts = await Post.findAll({ include: [{ model: User, as: "author", attributes: ["name", "email"] }], order: [["publishedAt", "DESC"]], limit: 5 });
  return { title: "Current CSIT updates", description: "The five newest published CSIT updates.", posts: posts.map(asRssPost) };
}

export async function loadChannelFeed(code: string): Promise<Feed | null> {
  const topic = await Topic.findOne({ where: { code }, include: [{ model: Post, as: "posts", through: { attributes: [] }, include: [{ model: User, as: "author", attributes: ["name", "email"] }] }], order: [[{ model: Post, as: "posts" }, "publishedAt", "DESC"]] });
  if (!topic) return null;
  const plain = topic.get({ plain: true }) as unknown as { name: string; description: string; code: string; posts?: RssPost[] };
  return { title: plain.name, description: plain.description, code: plain.code, posts: plain.posts ?? [] };
}

export function renderRss(feed: Feed) {
  const apiBase = (process.env.APP_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
  const frontendBase = (process.env.FRONTEND_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const path = feed.code ? `/rss/${encodeURIComponent(feed.code)}` : "/rss";
  const feedLink = `${apiBase}${path}`;
  const items = feed.posts.map((post) => {
    const itemLink = `${frontendBase}/posts/${post.id}`;
    const image = post.imageUrl ? `<media:content url="${escapeXml(post.imageUrl)}" medium="image" />` : "";
    const author = post.author?.email ? `<author>${escapeXml(post.author.email)} (${escapeXml(post.author.name ?? "")})</author>` : "";
    return `<item><guid isPermaLink="true">${escapeXml(itemLink)}</guid><title>${escapeXml(post.title)}</title><description>${escapeXml(post.body)}</description><link>${escapeXml(itemLink)}</link><pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>${author}${image}</item>`;
  }).join("");
  const serverTitle = process.env.RSS_SERVER_TITLE ?? "La Trobe Content Distribution Hub";
  const title = feed.code ? `${serverTitle}: ${feed.code} — ${feed.title}` : `${serverTitle}: ${feed.title}`;
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>${escapeXml(title)}</title><link>${escapeXml(feedLink)}</link><description>${escapeXml(feed.description)}</description><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;
}

export async function incrementRssCount() { await sequelize.transaction(async (transaction) => { const [counter] = await RequestCounter.findOrCreate({ where: { key: "rss-client-requests" }, defaults: { key: "rss-client-requests", count: 0 }, transaction }); await counter.increment("count", { by: 1, transaction }); }); }
