import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUrlset, getBaseUrl } from "@/lib/sitemap";

export async function GET() {
  const baseUrl = await getBaseUrl();
  const rows = await prisma.subcategory.findMany({
    select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const urls = rows.map((s) => ({
    loc: `${baseUrl}/categories/${s.category?.slug ?? "category"}/${s.slug}`,
    lastmod: s.updatedAt?.toISOString(),
  }));

  const xml = buildUrlset(urls);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
