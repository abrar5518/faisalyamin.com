import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeRedirectSource } from "@/lib/redirects";

export async function GET(req: NextRequest) {
  try {
    const originalUri = req.headers.get("x-original-uri") || "";
    const source = normalizeRedirectSource(originalUri);

    if (!source || source === "/") {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const redirect = await prisma.redirectRule.findFirst({
      where: { source, isActive: true },
      select: { destination: true, permanent: true },
    });

    if (!redirect?.destination) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    return new NextResponse(null, {
      status: redirect.permanent ? 308 : 307,
      headers: { Location: redirect.destination },
    });
  } catch (err) {
    console.error("GET /api/redirects/http error:", err);
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}
