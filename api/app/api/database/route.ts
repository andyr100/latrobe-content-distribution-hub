import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, ok, options } from "@/lib/http";

const tables = [
  {
    id: "users",
    label: "Users",
    description: "Publishing users and their roles.",
  },
  {
    id: "posts",
    label: "Posts",
    description: "Posts created in the Distribution Hub.",
  },
  {
    id: "feeds",
    label: "Feeds",
    description: "Fixed RSS feeds presented as channels in the frontend.",
  },
  {
    id: "post-feeds",
    label: "PostFeeds",
    description: "The many-to-many post and RSS feed relationships.",
  },
  {
    id: "request-counters",
    label: "RequestCounters",
    description: "Successful RSS request counters.",
  },
  {
    id: "schema-migrations",
    label: "SchemaMigrations",
    description: "Versioned database changes already applied to this SQLite file.",
  },
];

export async function GET() {
  try {
    await initialiseDatabase();
    return ok(tables);
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
