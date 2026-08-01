import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUrlset, getBaseUrl } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = await getBaseUrl();
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      name: true,
      shortDesc: true,
      updatedAt: true,
      images: {
        where: { mediaType: "image" },
        orderBy: { sortOrder: "asc" },
        take: 10,
        select: { url: true, alt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const urls = rows.map((p) => ({
    loc: `${baseUrl}/product/${p.slug}`,
    lastmod: p.updatedAt?.toISOString(),
    images: p.images.map((image) => ({
      loc: image.url.startsWith("http")
        ? image.url
        : `${baseUrl}${image.url.startsWith("/") ? "" : "/"}${image.url}`,
      title: image.alt || p.name,
      caption: p.shortDesc || undefined,
    })),
  }));

  const xml = buildUrlset(urls);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
