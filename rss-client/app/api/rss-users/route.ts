import { NextResponse } from "next/server";
import { apiFetch } from "../../../lib/api";

export async function GET() {
  try {
    const response = await apiFetch("/api/rss-users");
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "The Content Distribution API is unavailable" } },
      { status: 503 },
    );
  }
}
