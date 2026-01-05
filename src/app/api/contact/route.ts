import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contact = await prisma.contact.findFirst({ orderBy: { id: "asc" } });
    return NextResponse.json({ ok: true, data: contact });
  } catch (err) {
    console.error("GET /api/contact error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch contact" }, { status: 500 });
  }
}
