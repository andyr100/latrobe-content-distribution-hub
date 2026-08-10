import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, failure, ok, options } from "@/lib/http";
import { Post, PostTopic, RequestCounter, Topic, User } from "@/models";
import type { Model, ModelStatic } from "sequelize";

const tableModels = {
  users: User,
  posts: Post,
  topics: Topic,
  "post-topics": PostTopic,
  "request-counters": RequestCounter,
} as const;

type Context = { params: Promise<{ tableName: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    await initialiseDatabase();
    const tableName = (await context.params).tableName as keyof typeof tableModels;
    const model = tableModels[tableName] as ModelStatic<Model> | undefined;
    if (!model) return failure(404, "NOT_FOUND", "The requested database table is not available");
    const orderColumn = tableName === "request-counters" ? "updatedAt" : "createdAt";
    const rows = await model.findAll({ raw: true, order: [[orderColumn, "DESC"]] });
    const columns = rows.length ? Object.keys(rows[0]) : Object.keys(model.getAttributes());
    return ok({ tableName, columns, rows, count: rows.length });
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
