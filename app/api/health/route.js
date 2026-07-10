import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ ok: true, service: "NutriClock API", time: new Date().toISOString() });
}
