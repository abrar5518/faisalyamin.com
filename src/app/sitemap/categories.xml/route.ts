import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUrlset, getBaseUrl } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = await getBaseUrl();
  const rows = await prisma.category.findMany({
    select: { slug: true, name: true, description: true, image: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const urls = rows.map((c) => ({
    loc: `${baseUrl}/categories/${c.slug}`,
    lastmod: c.updatedAt?.toISOString(),
    images: c.image
      ? [{
          loc: c.image.startsWith("http") ? c.image : `${baseUrl}${c.image.startsWith("/") ? "" : "/"}${c.image}`,
          title: c.name,
          caption: c.description || undefined,
        }]
      : undefined,
  }));

  const xml = buildUrlset(urls);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
