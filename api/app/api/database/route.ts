import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, ok, options } from "@/lib/http";

const tables = [
  { id: "users", label: "Users", description: "Publishing users and their roles." },
  { id: "posts", label: "Posts", description: "Posts created in the Distribution Hub." },
  { id: "topics", label: "Topics", description: "Fixed CSIT publishing channels." },
  { id: "post-topics", label: "PostTopics", description: "The many-to-many post and channel relationships." },
  { id: "request-counters", label: "RequestCounters", description: "Successful RSS request counters." },
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
