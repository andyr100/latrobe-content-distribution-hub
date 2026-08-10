import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, ok, options } from "@/lib/http";
import { Post, Topic } from "@/models";
export async function GET() { try { await initialiseDatabase(); const topics = await Topic.findAll({ include: [{ model: Post, as: "posts", attributes: ["id"], through: { attributes: [] } }], order: [["name", "ASC"]] }); return ok(topics, 200, { count: topics.length }); } catch (error) { return errorResponse(error); } }
export const OPTIONS = options;
