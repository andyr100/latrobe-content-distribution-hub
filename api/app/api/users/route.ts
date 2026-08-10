import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, ok, options } from "@/lib/http";
import { User } from "@/models";

export async function GET() {
  try {
    await initialiseDatabase();
    const users = await User.findAll({ attributes: ["id", "name", "email", "role"], order: [["name", "ASC"]] });
    return ok(users, 200, { count: users.length });
  } catch (error) { return errorResponse(error); }
}
export const OPTIONS = options;
