import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUrlset, getBaseUrl } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = await getBaseUrl();
  const rows = await prisma.subcategory.findMany({
    select: {
      slug: true,
      name: true,
      description: true,
      image: true,
      updatedAt: true,
      category: { select: { slug: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const urls = rows.map((s) => ({
    loc: `${baseUrl}/categories/${s.category?.slug ?? "category"}/${s.slug}`,
    lastmod: s.updatedAt?.toISOString(),
    images: s.image
      ? [{
          loc: s.image.startsWith("http") ? s.image : `${baseUrl}${s.image.startsWith("/") ? "" : "/"}${s.image}`,
          title: s.name,
          caption: s.description || undefined,
        }]
      : undefined,
  }));

  const xml = buildUrlset(urls);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
