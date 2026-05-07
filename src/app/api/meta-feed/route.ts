import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canonicalUrl, normalizeCanonicalUrl } from "@/lib/siteUrl";

const SITE_URL = canonicalUrl();
const BRAND = "Sahoolat";
const GOOGLE_PRODUCT_CATEGORY = "Home & Garden > Kitchen & Dining > Kitchen Tools";

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return normalizeCanonicalUrl(trimmed);
  }

  return `${SITE_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
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

    const feed = products
      .map((product) => {
        const image = product.images[0]?.url?.trim();
        const price = Number(product.price);

        if (!image || !Number.isFinite(price) || price <= 0) {
          return null;
        }

        return {
          id: String(product.id),
          title: product.name,
          description:
            product.shortDesc?.trim() ||
            stripHtml(product.descriptionHtml) ||
            product.name,
          availability: "in stock",
          condition: "new",
          price: `${price.toFixed(2)} PKR`,
          link: `${SITE_URL}/product/${product.slug}`,
          image_link: absoluteUrl(image),
          brand: BRAND,
          google_product_category: GOOGLE_PRODUCT_CATEGORY,
        };
      })
      .filter((product): product is NonNullable<typeof product> => product !== null);

    return NextResponse.json(feed, {
      headers: {
        "Cache-Control": "public, max-age=900, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/meta-feed error:", error);
    return NextResponse.json(
      { error: "Failed to generate Meta product feed" },
      { status: 500 }
    );
  }
}
