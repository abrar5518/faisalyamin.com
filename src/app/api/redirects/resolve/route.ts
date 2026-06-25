import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeRedirectSource } from "@/lib/redirects";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const source = normalizeRedirectSource(searchParams.get("source") || "");

    if (!source || source === "/") {
      return NextResponse.json({ ok: true, data: null });
    }

    const redirect = await prisma.redirectRule.findFirst({
      where: { source, isActive: true },
      select: { destination: true, permanent: true },
    });

    return NextResponse.json({ ok: true, data: redirect });
  } catch (err) {
    console.error("GET /api/redirects/resolve error:", err);
    return NextResponse.json({ ok: true, data: null });
  }
}
