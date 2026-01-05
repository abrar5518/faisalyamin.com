// src/app/categories/[slug]/[sub]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import ProductCard, { Product } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import Schema from "@/components/seo/Schema";
import {
  absoluteUrl,
  breadcrumbSchema,
  collectionPageSchema,
  itemListSchema,
} from "@/components/seo/schemas";

function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

function safeLabel(s?: string) {
  return (s ?? "").replaceAll("-", " ").trim();
}

function formatPKR(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function Pagination({
  page,
  totalPages,
  baseHref,
}: {
  page: number;
  totalPages: number;
  baseHref: string;
}) {
  return (
    <div className="mt-10 flex items-center justify-between gap-3 rounded-3xl border border-neutral-200 bg-white px-6 py-4">
      <p className="text-xs text-neutral-500">
        Page <span className="font-medium text-neutral-900">{page}</span> of{" "}
        <span className="font-medium text-neutral-900">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <Link
          aria-disabled={page <= 1}
          className={[
            "rounded-2xl border px-4 py-2 text-sm font-medium",
            page <= 1
              ? "pointer-events-none border-neutral-200 bg-neutral-100 text-neutral-400"
              : "border-neutral-200 bg-white hover:bg-neutral-50",
          ].join(" ")}
          href={`${baseHref}?page=${Math.max(1, page - 1)}`}
        >
          Prev
        </Link>
        <Link
          aria-disabled={page >= totalPages}
          className={[
            "rounded-2xl border px-4 py-2 text-sm font-medium",
            page >= totalPages
              ? "pointer-events-none border-neutral-200 bg-neutral-100 text-neutral-400"
              : "border-neutral-200 bg-white hover:bg-neutral-50",
          ].join(" ")}
          href={`${baseHref}?page=${Math.min(totalPages, page + 1)}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { slug, sub } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const rawPage = Number(sp?.page ?? 1);
  const page = Number.isFinite(rawPage) && rawPage > 1 ? Math.floor(rawPage) : 1;
  const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

  const subcategory = await prisma.subcategory.findFirst({
    where: { slug: sub, category: { slug } },
    select: {
      name: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      image: true,
    },
  });

  if (!subcategory) {
    return {
      title: "Subcategory not found",
      description: "This subcategory could not be found.",
      alternates: { canonical: `${baseUrl}/categories/${slug}/${sub}` },
    };
  }

  const qs = new URLSearchParams();
  if (page > 1) qs.set("page", String(page));
  const canonical = qs.toString()
    ? `${baseUrl}/categories/${slug}/${sub}?${qs.toString()}`
    : `${baseUrl}/categories/${slug}/${sub}`;
  const baseUrlResolved = baseUrl.replace(/\/$/, "");
  const ogImage = subcategory.image
    ? subcategory.image.startsWith("http")
      ? subcategory.image
      : `${baseUrlResolved}${subcategory.image.startsWith("/") ? "" : "/"}${subcategory.image}`
    : undefined;
  return {
    title: subcategory.metaTitle || subcategory.name,
    description: subcategory.metaDescription || `Explore ${subcategory.name} products and curated picks.`,
    keywords: subcategory.metaKeywords || undefined,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: subcategory.metaTitle || subcategory.name,
      description: subcategory.metaDescription || `Explore ${subcategory.name} products and curated picks.`,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: subcategory.metaTitle || subcategory.name,
      description: subcategory.metaDescription || `Explore ${subcategory.name} products and curated picks.`,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

type PageProps = {
  params: Promise<{ slug: string; sub: string }>;
  searchParams?: Promise<{ page?: string }>;
};

export default async function SubcategoryPage({ params, searchParams }: PageProps) {
  const { slug, sub } = await params;
  const sp = searchParams ? await searchParams : undefined;

  const [subcategory, siteSettings] = await Promise.all([
    prisma.subcategory.findFirst({
      where: { slug: sub, category: { slug } },
      select: {
        name: true,
        slug: true,
        description: true,
        descriptionHtml: true,
        image: true,
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);

  if (!subcategory) {
    notFound();
  }

  const pageSize = 9;
  const total = await prisma.product.count({
    where: { subcategory: { slug: sub }, isActive: true },
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = clampInt(sp?.page, 1, 1, totalPages);
  const skip = (page - 1) * pageSize;

  const products = await prisma.product.findMany({
    where: { subcategory: { slug: sub }, isActive: true },
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
    include: { images: true },
  });

  const pageProducts: Product[] = products.map((p) => {
    const sortedImages = [...p.images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const img = sortedImages[0]?.url;
    const imgAlt = sortedImages[0]?.alt || p.name;
    return {
      id: p.slug,
      name: p.name,
      price: formatPKR(Number(p.price ?? 0)),
      compareAt: p.compareAt ? formatPKR(Number(p.compareAt)) : undefined,
      badge: p.badge ?? undefined,
      rating: p.rating ?? 0,
      reviews: p.reviewsCount ?? 0,
      image: img || "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      imageAlt: imgAlt,
      href: `/product/${p.slug}`,
    };
  });

  const title = subcategory.name || `${safeLabel(sub)} | ${safeLabel(slug)}`;
  const intro =
    subcategory.description || "Explore products with secure checkout and fast delivery.";

  const richHtml =
    subcategory.descriptionHtml ||
    `
      <h2>Buying Guide</h2>
      <p>We help you buy with confidence: authenticity checks, clear condition notes, and support for delivery within Pakistan.</p>
      <h3>Delivery & Returns</h3>
      <ul>
        <li>Insured shipping available</li>
        <li>Easy returns policy (where applicable)</li>
        <li>Support via WhatsApp + email</li>
      </ul>
    `;
  const baseUrlResolved = (siteSettings?.siteUrl || process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const pageUrl = `${baseUrlResolved}/categories/${slug}/${sub}`;
  const categoryLabel = subcategory.category?.name || safeLabel(slug) || "Category";
  const productItems = pageProducts.slice(0, 20).map((p) => ({
    name: p.name,
    url: absoluteUrl(p.href ?? "", baseUrlResolved),
    image: p.image ? absoluteUrl(p.image, baseUrlResolved) : undefined,
  }));

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Schema
        data={breadcrumbSchema([
          { name: "Home", item: baseUrlResolved },
          { name: "Categories", item: `${baseUrlResolved}/categories` },
          { name: categoryLabel, item: `${baseUrlResolved}/categories/${slug}` },
          { name: title, item: pageUrl },
        ])}
      />
      <Schema
        data={collectionPageSchema({
          name: title,
          description: intro,
          url: pageUrl,
        })}
      />
      <Schema
        data={itemListSchema({
          url: pageUrl,
          items: productItems,
        })}
      />
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center text-xs text-neutral-600">
            <Link href="/" className="hover:text-neutral-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/categories/${slug}`} className="hover:text-neutral-900">
              {subcategory.category?.name || safeLabel(slug) || "Category"}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-900">{safeLabel(sub) || "Subcategory"}</span>
          </div>
        </Container>
      </div>

      <main className="py-10">
        <Container>
          {/* Header */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
                <p className="mt-2 text-sm text-neutral-600">{intro}</p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/categories/${slug}`}
                  className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
                >
                  Back to {subcategory.category?.name || safeLabel(slug) || "Category"}
                </Link>
                <Link
                  href="/deals"
                  className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  View deals
                </Link>
              </div>
            </div>
          </div>

          {/* Products */}
          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <p className="text-sm font-semibold">Products</p>
              <p className="text-xs text-neutral-500">
                Showing {pageProducts.length} of {total}
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageProducts.map((p) => (
                <ProductCard key={p.id} p={p} variant="compact" />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              baseHref={`/categories/${slug}/${sub}`}
            />
          </section>

          {/* Rich content */}
          <section className="mt-12 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
            <div
              className="rt-content"
              dangerouslySetInnerHTML={{ __html: richHtml }}
            />
          </section>

          {/* Related */}
          <section className="mt-10">
            <p className="text-sm font-semibold">Explore more</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
                href={`/categories/${slug}/pre-owned`}
              >
                Pre-Owned
              </Link>
              <Link
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
                href="/categories"
              >
                Browse Categories
              </Link>
              <Link
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
                href="/deals"
              >
                View Deals
              </Link>
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
