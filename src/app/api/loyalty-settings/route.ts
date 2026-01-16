import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeSettings } from "@/lib/loyalty";

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.loyaltySettings.findFirst({ orderBy: { id: "asc" } });
    return NextResponse.json({ ok: true, data: settings ? normalizeSettings(settings) : null });
  } catch (err) {
    console.error("GET /api/loyalty-settings error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load loyalty settings" }, { status: 500 });
  }
}
