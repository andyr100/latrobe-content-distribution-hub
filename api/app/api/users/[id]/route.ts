import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, failure, ok, options } from "@/lib/http";
import { User } from "@/models";

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    await initialiseDatabase();
    const user = await User.findByPk((await context.params).id, { attributes: ["id", "name", "email", "role"] });
    return user ? ok(user) : failure(404, "NOT_FOUND", "User was not found");
  } catch (error) { return errorResponse(error); }
}
export const OPTIONS = options;
