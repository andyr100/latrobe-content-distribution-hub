import { NextResponse } from "next/server";
import { apiFetch } from "../../../../lib/api";

type Context = { params: Promise<{ channelCode: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const code = encodeURIComponent((await context.params).channelCode);
    const response = await apiFetch(`/rss/${code}`);
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
