import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUrlset, getBaseUrl } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = await getBaseUrl();
  const rows = await prisma.blogAuthor.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const urls = rows.map((a) => ({
    loc: `${baseUrl}/blog/author/${a.slug}`,
    lastmod: a.updatedAt?.toISOString(),
  }));

  const xml = buildUrlset(urls);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
