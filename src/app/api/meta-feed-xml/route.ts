import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://sahoolat.pk";
const BRAND = "Sahoolat";

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `${SITE_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

function escapeXml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        price: { gt: 0 },
        images: {
          some: {
            url: { not: "" },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        shortDesc: true,
        descriptionHtml: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { url: true },
        },
      },
    });

    const items = products
      .map((product) => {
        const image = product.images[0]?.url?.trim();
        const price = Number(product.price);

        if (!image || !Number.isFinite(price) || price <= 0) {
          return null;
        }

        const description =
          product.shortDesc?.trim() ||
          stripHtml(product.descriptionHtml) ||
          product.name;

        return [
          "    <item>",
          `      <g:id>${escapeXml(product.id)}</g:id>`,
          `      <g:title>${escapeXml(product.name)}</g:title>`,
          `      <g:description>${escapeXml(description)}</g:description>`,
          "      <g:availability>in stock</g:availability>",
          "      <g:condition>new</g:condition>",
          `      <g:price>${escapeXml(`${Math.round(price)} PKR`)}</g:price>`,
          `      <g:link>${escapeXml(`${SITE_URL}/product/${product.slug}`)}</g:link>`,
          `      <g:image_link>${escapeXml(absoluteUrl(image))}</g:image_link>`,
          `      <g:brand>${escapeXml(BRAND)}</g:brand>`,
          "    </item>",
        ].join("\n");
      })
      .filter((item): item is string => item !== null)
      .join("\n");

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
      "  <channel>",
      "    <title>Sahoolat Product Feed</title>",
      `    <link>${SITE_URL}</link>`,
      items,
      "  </channel>",
      "</rss>",
    ]
      .filter(Boolean)
      .join("\n");

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=900, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/meta-feed-xml error:", error);

    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate Meta XML product feed</error>',
      {
        status: 500,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
}
