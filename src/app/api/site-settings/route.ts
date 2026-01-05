import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
    return NextResponse.json({ ok: true, data: settings });
  } catch (err) {
    console.error("GET /api/site-settings error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch site settings" }, { status: 500 });
  }
}
