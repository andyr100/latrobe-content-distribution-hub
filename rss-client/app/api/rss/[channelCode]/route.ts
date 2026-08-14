import { NextResponse } from "next/server";
import { apiFetch } from "../../../../lib/api";

type Context = { params: Promise<{ channelCode: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const code = encodeURIComponent((await context.params).channelCode);
    const response = await apiFetch(`/rss/${code}`, {
      headers: {
        "X-Client-Id": request.headers.get("x-client-id") ?? "rss-client-anonymous",
        "X-Client-Source": "rss-client",
        "X-Rss-User-Id": request.headers.get("x-rss-user-id") ?? "",
        "User-Agent": request.headers.get("user-agent") ?? "La Trobe RSS Client",
      },
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ?? "application/rss+xml; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "The RSS Server is unavailable" } },
      { status: 503 },
    );
  }
}
