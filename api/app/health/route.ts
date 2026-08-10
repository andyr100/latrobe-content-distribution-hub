import { NextResponse } from "next/server";
import { initialiseDatabase, sequelize } from "@/lib/sequelize";

export async function GET() {
  try {
    await initialiseDatabase();
    await sequelize.authenticate();
    return NextResponse.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json({ status: "unavailable", database: "disconnected", timestamp: new Date().toISOString() }, { status: 503 });
  }
}
