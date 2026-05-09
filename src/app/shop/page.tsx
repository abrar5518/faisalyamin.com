import { prisma } from "@/lib/prisma";
import ShopClient, { ShopProduct } from "./ShopClient";
import type { Metadata } from "next";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/components/seo/schemas";
import { normalizeSiteUrl } from "@/lib/siteUrl";

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
    title: page?.metaTitle || page?.title || "Buy Water Bottles Online in Pakistan | Sahoolat",
    description:
      page?.metaDescription ||
      "Browse water bottles in Pakistan with secure checkout, PKR 250 standard shipping, and 7-day returns.",
    keywords: page?.metaKeywords || undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      title: page?.metaTitle || page?.title || "Shop",
      description:
        page?.metaDescription ||
        "Browse water bottles in Pakistan with secure checkout, PKR 250 standard shipping, and 7-day returns.",
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: page?.metaTitle || page?.title || "Shop",
      description:
        page?.metaDescription ||
        "Browse water bottles in Pakistan with secure checkout, PKR 250 standard shipping, and 7-day returns.",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function formatPKR(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function mapProduct(p: any): ShopProduct {
  const img = p.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30";
  return {
    id: p.slug,
    name: p.name ?? "Untitled product",
    price: formatPKR(Number(p.price ?? 0)),
    compareAt: p.compareAt != null ? formatPKR(Number(p.compareAt)) : undefined,
    badge: p.badge ?? undefined,
    rating: typeof p.rating === "number" ? p.rating : 0,
    reviews: typeof p.reviewsCount === "number" ? p.reviewsCount : 0,
    image: img,
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
            "Browse water bottles in Pakistan with secure checkout, PKR 250 standard shipping, and 7-day returns.",
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
          `
            <h2>Shop the full collection</h2>
            <p>
              Use the filters above to narrow down your search by brand, price, and condition.
              Update this section from the backend with your own buying guide, FAQs, or warranty details.
            </p>
            <ul>
              <li>Verified products with detailed inspection notes</li>
              <li>Secure checkout and insured shipping</li>
              <li>Friendly support for pre and post-purchase questions</li>
            </ul>
          `
        }
        title={pageRow?.title || "Shop"}
        shortDescription={
          pageRow?.shortDescription ||
          "Browse premium pieces. Use filters to find the perfect match."
        }
        featureImage={pageRow?.featureImage || undefined}
        featureImageAlt={pageRow?.featureImageAlt || undefined}
      />
    </>
  );
}
