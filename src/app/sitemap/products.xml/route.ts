import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUrlset, getBaseUrl } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = await getBaseUrl();
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const urls = rows.map((p) => ({
    loc: `${baseUrl}/product/${p.slug}`,
    lastmod: p.updatedAt?.toISOString(),
  }));

  const xml = buildUrlset(urls);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
