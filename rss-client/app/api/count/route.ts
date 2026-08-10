import { NextResponse } from "next/server";
import { apiFetch } from "../../../lib/api";
export async function GET() { try { const response = await apiFetch("/count"); return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } }); } catch { return NextResponse.json({ requestCount: null }, { status: 503 }); } }
