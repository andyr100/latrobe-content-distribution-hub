import { NextResponse } from "next/server";
import { initialiseDatabase } from "@/lib/sequelize";
import { RequestCounter } from "@/models";
import { options } from "@/lib/http";

const headers = { "Access-Control-Allow-Origin": "*" };

export async function GET() {
  try {
    await initialiseDatabase();
    const counter = await RequestCounter.findOne({ where: { key: "rss-client-requests" } });
    return NextResponse.json({ requestCount: counter?.count ?? 0 }, { headers });
  } catch (error) {
    console.error("Count request failed", error);
    return NextResponse.json({ requestCount: 0, error: "Counter is unavailable" }, { status: 503, headers });
  }
}

export const OPTIONS = options;
