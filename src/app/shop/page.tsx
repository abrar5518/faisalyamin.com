import { prisma } from "@/lib/prisma";
import ShopClient, { ShopProduct } from "./ShopClient";
import type { Metadata } from "next";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/components/seo/schemas";
import { normalizeSiteUrl } from "@/lib/siteUrl";
import { parseCatalogSettings } from "@/lib/catalogSettings";

const baseUrl = normalizeSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "shop" } }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);

  const baseUrlResolved = normalizeSiteUrl(settings?.siteUrl || baseUrl);
  const canonical = baseUrlResolved ? `${baseUrlResolved}/shop` : undefined;
  const ogImage = page?.featureImage
    ? page.featureImage.startsWith("http")
      ? page.featureImage
      : baseUrlResolved
        ? `${baseUrlResolved}${page.featureImage.startsWith("/") ? "" : "/"}${page.featureImage}`
        : undefined
    : undefined;

  return {
    title: page?.metaTitle || page?.title || "Shop Online in Pakistan",
    description:
      page?.metaDescription ||
      "Browse products with secure checkout, clear support, and reliable delivery.",
    keywords: page?.metaKeywords || undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      title: page?.metaTitle || page?.title || "Shop",
      description:
        page?.metaDescription ||
        "Browse products with secure checkout, clear support, and reliable delivery.",
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: page?.metaTitle || page?.title || "Shop",
      description:
        page?.metaDescription ||
        "Browse products with secure checkout, clear support, and reliable delivery.",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function formatPKR(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function mapProduct(p: any): ShopProduct {
  const imageItems = [...(p.images ?? [])]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .filter((img) => (img.mediaType ?? "image") === "image");
  const img = imageItems[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30";
  return {
    id: p.slug,
    name: p.name ?? "Untitled product",
    price: formatPKR(Number(p.price ?? 0)),
    compareAt: p.compareAt != null ? formatPKR(Number(p.compareAt)) : undefined,
    badge: p.badge ?? undefined,
    rating: typeof p.rating === "number" ? p.rating : 0,
    reviews: typeof p.reviewsCount === "number" ? p.reviewsCount : 0,
    image: img,
    imageAlt: imageItems[0]?.alt || p.name,
    hoverImage: imageItems[1]?.url,
    hoverImageAlt: imageItems[1]?.alt || p.name,
    shortDesc: p.shortDesc ?? undefined,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "",
  };
}

export default async function ShopPage() {
  const pageSize = 30;

  const [rows, total, siteSettings, pageRow, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      include: { images: true, category: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
    prisma.page.findUnique({ where: { slug: "shop" } }),
    prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        name: true,
        slug: true,
        subcategories: {
          select: { name: true, slug: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ]);

  const initialProducts = rows.map(mapProduct);
  const catalogSettings = parseCatalogSettings(siteSettings?.catalogSettings);
  const baseUrlResolved = normalizeSiteUrl(siteSettings?.siteUrl || baseUrl);
  const pageUrl = `${baseUrlResolved}/shop`;
  const itemList = initialProducts.slice(0, 20).map((p) => ({
    name: p.name,
    url: absoluteUrl(`/product/${p.id}`, baseUrlResolved),
    image: p.image ? absoluteUrl(p.image, baseUrlResolved) : undefined,
  }));

  return (
    <>
      <Schema
        data={breadcrumbSchema([
          { name: "Home", item: baseUrlResolved },
          { name: "Shop", item: pageUrl },
        ])}
      />
      <Schema
        data={collectionPageSchema({
          name: pageRow?.title || "Shop",
          description:
            pageRow?.metaDescription ||
            "Browse products with secure checkout, clear support, and reliable delivery.",
          url: pageUrl,
        })}
      />
      <Schema
        data={itemListSchema({
          url: pageUrl,
          items: itemList,
        })}
      />
      <ShopClient
        initialProducts={initialProducts}
        initialTotal={total}
        pageSize={pageSize}
        categories={categories.map((c) => ({
          name: c.name ?? "Category",
          slug: c.slug ?? "",
          subcategories: (c.subcategories || []).map((s) => ({
            name: s.name ?? "Subcategory",
            slug: s.slug ?? "",
          })),
        }))}
        richHtml={
          pageRow?.contentHtml ||
          catalogSettings.shopFallbackRichHtml
        }
        title={pageRow?.title || catalogSettings.shopFallbackTitle}
        shortDescription={
          pageRow?.shortDescription ||
          catalogSettings.shopFallbackSubtitle
        }
        featureImage={pageRow?.featureImage || undefined}
        featureImageAlt={pageRow?.featureImageAlt || undefined}
      />
    </>
  );
}
