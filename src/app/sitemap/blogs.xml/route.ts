import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUrlset, getBaseUrl } from "@/lib/sitemap";

export async function GET() {
  const baseUrl = await getBaseUrl();
  const rows = await prisma.blog.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
  });

  const urls = rows.map((b) => ({
    loc: `${baseUrl}/blog/${b.slug}`,
    lastmod: (b.publishedAt ?? b.updatedAt)?.toISOString(),
  }));

  const xml = buildUrlset(urls);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
