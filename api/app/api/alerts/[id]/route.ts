import { initialiseDatabase } from "@/lib/sequelize";
import { errorResponse, failure, ok, options, parseId, readJson } from "@/lib/http";
import { Alert } from "@/models";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    await initialiseDatabase();
    const id = parseId((await context.params).id);
    if (!id) return failure(400, "VALIDATION_ERROR", "Alert ID is malformed");
    const body = await readJson(request);
    if (!body || typeof body.resolved !== "boolean") {
      return failure(400, "VALIDATION_ERROR", "resolved must be a boolean");
    }
    const alert = await Alert.findByPk(id);
    if (!alert) return failure(404, "NOT_FOUND", "Alert was not found");
    await alert.update({
      resolved: body.resolved,
      resolvedAt: body.resolved ? new Date() : null,
    });
    return ok(alert);
  } catch (error) {
    return errorResponse(error);
  }
}

export const OPTIONS = options;
