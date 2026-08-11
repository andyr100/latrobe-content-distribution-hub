export const apiBaseUrl = (process.env.API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
export async function apiFetch(path: string) {
  return fetch(`${apiBaseUrl}${path}`, { cache: "no-store" });
}
