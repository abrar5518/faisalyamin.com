import { prisma } from "@/lib/prisma";
import ShopClient, { ShopProduct } from "./ShopClient";
import type { Metadata } from "next";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/components/seo/schemas";

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse premium watches and accessories with secure checkout and fast delivery.",
  alternates: { canonical: `${baseUrl}/shop` },
  openGraph: {
    type: "website",
    title: "Shop",
    description: "Browse premium watches and accessories with secure checkout and fast delivery.",
    url: `${baseUrl}/shop`,
    images: ["/images/shopping.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop",
    description: "Browse premium watches and accessories with secure checkout and fast delivery.",
    images: ["/images/shopping.jpg"],
  },
};

function formatPKR(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function mapProduct(p: any): ShopProduct {
  const img = p.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30";
  const brand = p.name ? String(p.name).split(" ")[0] : "LuxStore";
  return {
    id: p.slug,
    name: p.name ?? "Untitled product",
    price: formatPKR(Number(p.price ?? 0)),
    compareAt: p.compareAt != null ? formatPKR(Number(p.compareAt)) : undefined,
    badge: p.badge ?? undefined,
    rating: typeof p.rating === "number" ? p.rating : 0,
    reviews: typeof p.reviewsCount === "number" ? p.reviewsCount : 0,
    image: img,
    category: p.category?.name ?? "Luxury Watches",
    brand,
    condition: p.isSale ? "Pre-Owned" : "New",
    inStock: true,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "",
  };
}

export default async function ShopPage() {
  const pageSize = 18;

  const [rows, total, siteSettings] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      include: { images: true, category: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);

  const initialProducts = rows.map(mapProduct);
  const baseUrlResolved = (siteSettings?.siteUrl || baseUrl).replace(/\/$/, "");
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
          name: "Shop",
          description: "Browse premium watches and accessories with secure checkout and fast delivery.",
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
      />
    </>
  );
}
