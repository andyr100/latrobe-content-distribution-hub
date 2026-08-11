import { initialiseDatabase, sequelize } from "@/lib/sequelize";
import { errorResponse, failure, ok, options } from "@/lib/http";
import { Feed, Post, PostFeed, RequestCounter, User } from "@/models";
import { QueryTypes, type Model, type ModelStatic } from "sequelize";

const tableModels = {
  users: User,
  posts: Post,
  feeds: Feed,
  "post-feeds": PostFeed,
  "request-counters": RequestCounter,
} as const;

type Context = { params: Promise<{ tableName: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    await initialiseDatabase();
    const tableName = (await context.params).tableName as keyof typeof tableModels;
    if ((tableName as string) === "schema-migrations") {
      const rows = await sequelize.query<Record<string, unknown>>(
        "SELECT name, appliedAt FROM SchemaMigrations ORDER BY appliedAt DESC",
        { type: QueryTypes.SELECT },
      );
      return ok({ tableName, columns: ["name", "appliedAt"], rows, count: rows.length });
    }
    const model = tableModels[tableName] as ModelStatic<Model> | undefined;
    if (!model) return failure(404, "NOT_FOUND", "The requested database table is not available");
    const orderColumn = tableName === "request-counters" ? "updatedAt" : "createdAt";
    const rows = await model.findAll({
      raw: true,
      order: [[orderColumn, "DESC"]],
    });
    const columns = rows.length ? Object.keys(rows[0]) : Object.keys(model.getAttributes());
    return ok({ tableName, columns, rows, count: rows.length });
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
