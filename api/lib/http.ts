import { NextResponse } from "next/server";
import type { ApiFailure, ApiSuccess } from "@latrobe/api-contract";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Client-Id, X-Client-Source, X-Rss-User-Id",
};

export function ok<T>(data: T, status = 200, meta?: Record<string, unknown>) {
  return NextResponse.json<ApiSuccess<T>>(
    { success: true, data, ...(meta ? { meta } : {}) },
    { status, headers: corsHeaders },
  );
}

export function failure(
  status: number,
  code: string,
  message: string,
  details: Record<string, unknown> = {},
) {
  return NextResponse.json<ApiFailure>(
    { success: false, error: { code, message, details } },
    { status, headers: corsHeaders },
  );
}

export function options() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export function xml(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function parseId(value: string): number | null {
  return /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null;
}

export function errorResponse(error: unknown) {
  console.error("API request failed", error);
  return failure(500, "INTERNAL_ERROR", "The server could not complete the request");
}
