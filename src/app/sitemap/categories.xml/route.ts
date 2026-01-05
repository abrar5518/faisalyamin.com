import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUrlset, getBaseUrl } from "@/lib/sitemap";

export async function GET() {
  const baseUrl = await getBaseUrl();
  const rows = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const urls = rows.map((c) => ({
    loc: `${baseUrl}/categories/${c.slug}`,
    lastmod: c.updatedAt?.toISOString(),
  }));

  const xml = buildUrlset(urls);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
