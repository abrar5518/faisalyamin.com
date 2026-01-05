import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.storeSettings.findFirst({ orderBy: { id: "asc" } });
    return NextResponse.json({ ok: true, data: settings });
  } catch (err) {
    console.error("GET /api/store-settings error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch store settings" }, { status: 500 });
  }
}
