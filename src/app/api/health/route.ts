import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ liveConfigured: Boolean(process.env.CALLE_API_KEY) });
}
