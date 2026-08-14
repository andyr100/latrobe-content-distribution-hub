export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.OTEL_ENABLED !== "true") return;
  const { registerOTel } = await import("@vercel/otel");
  registerOTel(process.env.OTEL_SERVICE_NAME ?? "latrobe-content-api");
}
