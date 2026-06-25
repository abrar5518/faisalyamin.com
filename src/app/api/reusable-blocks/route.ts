import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapReusableBlock } from "@/lib/reusableBlocks";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get("placement")?.trim();
    const slug = searchParams.get("slug")?.trim();

    const blocks = await prisma.reusableBlock.findMany({
      where: {
        isEnabled: true,
        ...(slug ? { slug } : {}),
        ...(placement ? { placement } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: slug ? 1 : 12,
    });

    return NextResponse.json({ ok: true, data: blocks.map(mapReusableBlock) });
  } catch (error) {
    console.error("GET /api/reusable-blocks error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch reusable blocks" }, { status: 500 });
  }
}
