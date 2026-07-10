import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "NutriClock API",
    version: "4.0.0",
    time: new Date().toISOString()
  });
}
