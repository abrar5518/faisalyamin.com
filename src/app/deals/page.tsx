import Link from "next/link";
import Image from "next/image";
import { withImageParams } from "@/lib/image";
import { prisma } from "@/lib/prisma";
import ProductCard, { Product } from "@/components/ProductCard";
import type { Metadata } from "next";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/components/seo/schemas";

const baseUrl = process.env.SITE_URL ?? "";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "deals" } }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);
  const baseUrlResolved = (settings?.siteUrl || baseUrl).replace(/\/$/, "");
  const ogImage = page?.featureImage
    ? page.featureImage.startsWith("http")
      ? page.featureImage
      : baseUrlResolved
        ? `${baseUrlResolved}${page.featureImage.startsWith("/") ? "" : "/"}${page.featureImage}`
        : undefined
    : undefined;
  const canonical = baseUrlResolved ? `${baseUrlResolved}/deals` : undefined;
  return {
    title: page?.metaTitle || "Deals",
    description:
      page?.metaDescription ||
      "Limited-time offers on verified pieces. Shop premium deals while stock lasts.",
    keywords: page?.metaKeywords || undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      title: page?.metaTitle || "Deals",
      description:
        page?.metaDescription ||
        "Limited-time offers on verified pieces. Shop premium deals while stock lasts.",
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: page?.metaTitle || "Deals",
      description:
        page?.metaDescription ||
        "Limited-time offers on verified pieces. Shop premium deals while stock lasts.",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

function formatPKR(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function buildProducts(rows: any[]): Product[] {
  return rows.map((p) => {
    const img = [...(p.images ?? [])]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0]?.url;
    return {
      id: p.slug,
      name: p.name,
      price: formatPKR(Number(p.price ?? 0)),
      compareAt: p.compareAt ? formatPKR(Number(p.compareAt)) : undefined,
      badge: p.badge ?? undefined,
      rating: p.rating ?? 0,
      reviews: p.reviewsCount ?? 0,
      image: img || "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      href: `/product/${p.slug}`,
    };
  });
}

export default async function DealsPage() {
  const [rows, pageRow, siteSettings] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [{ isSale: true }, { compareAt: { not: null } }],
      },
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { images: true },
    }),
    prisma.page.findUnique({ where: { slug: "deals" } }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);

  const products = buildProducts(rows);
  const baseUrlResolved = (siteSettings?.siteUrl || baseUrl).replace(/\/$/, "");
  const pageUrl = baseUrlResolved ? `${baseUrlResolved}/deals` : "";
  const productItems = baseUrlResolved
    ? products
        .map((p) => ({
          name: p.name,
          url: absoluteUrl(p.href || `/product/${p.id}`, baseUrlResolved),
          image: p.image,
        }))
        .filter((item) => item.url)
    : [];
  const breadcrumbItems = baseUrlResolved
    ? [
        { name: "Home", item: baseUrlResolved },
        { name: "Deals", item: pageUrl },
      ]
    : [];
  const richHtml =
    pageRow?.contentHtml ||
    `
      <h2>Limited-time deals</h2>
      <p>
        This page highlights sale items only. Update this content from the backend
        to explain your promotion rules, shipping policy, and why these deals are special.
      </p>
      <h3>How to use deals</h3>
      <ul>
        <li>Offers are limited to available stock</li>
        <li>Insured shipping on all items</li>
        <li>Returns follow the standard policy</li>
      </ul>
    `;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {breadcrumbItems.length ? <Schema data={breadcrumbSchema(breadcrumbItems)} /> : null}
      {pageUrl ? (
        <Schema
          data={collectionPageSchema({
            name: pageRow?.title || "Deals",
            description: pageRow?.shortDescription || pageRow?.metaDescription || undefined,
            url: pageUrl,
          })}
        />
      ) : null}
      {pageUrl && productItems.length ? (
        <Schema data={itemListSchema({ url: pageUrl, items: productItems })} />
      ) : null}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">Home</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">Deals</span>
          </div>
        </Container>
      </div>

      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="grid gap-6 py-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {pageRow?.title || "Deals"}
              </h1>
              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                {pageRow?.shortDescription ||
                  "Verified items at special prices. Grab the best offers while stock lasts."}
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                <Image
                  src={withImageParams(
                    pageRow?.featureImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
                    "auto=format&fit=crop&w=1200&q=80"
                  )}
                  alt={pageRow?.title || "Deals"}
                  width={1200}
                  height={900}
                  className="h-64 w-full object-cover sm:h-72"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} variant="sale" />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 py-14">
        <Container>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <div
              className="rt-content"
              dangerouslySetInnerHTML={{ __html: richHtml }}
            />
          </div>
        </Container>
      </section>
    </div>
  );
}
