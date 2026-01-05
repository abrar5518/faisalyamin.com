import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Image from "next/image";
import { withImageParams } from "@/lib/image";
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

function formatPKR(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

// ---- Pagination helpers ----
function clampInt(value: any, fallback: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function buildPageHref(slug: string, page: number) {
  return `/categories/${slug}?page=${page}`;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const rawPage = Number(sp?.page ?? 1);
  const page = Number.isFinite(rawPage) && rawPage > 1 ? Math.floor(rawPage) : 1;
  const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      name: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      image: true,
    },
  });

  if (!category) {
    return {
      title: "Category not found",
      description: "This category could not be found.",
      alternates: { canonical: `${baseUrl}/categories/${slug}` },
    };
  }

  const qs = new URLSearchParams();
  if (page > 1) qs.set("page", String(page));
  const canonical = qs.toString()
    ? `${baseUrl}/categories/${slug}?${qs.toString()}`
    : `${baseUrl}/categories/${slug}`;
  const baseUrlResolved = baseUrl.replace(/\/$/, "");
  const ogImage = category.image
    ? category.image.startsWith("http")
      ? category.image
      : `${baseUrlResolved}${category.image.startsWith("/") ? "" : "/"}${category.image}`
    : undefined;
  return {
    title: category.metaTitle || category.name,
    description: category.metaDescription || `Explore ${category.name} products and curated picks.`,
    keywords: category.metaKeywords || undefined,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: category.metaTitle || category.name,
      description: category.metaDescription || `Explore ${category.name} products and curated picks.`,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: category.metaTitle || category.name,
      description: category.metaDescription || `Explore ${category.name} products and curated picks.`,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string; sort?: string }>;
};

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : undefined;

  const [category, siteSettings, contact] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        description: true,
        descriptionHtml: true,
        image: true,
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
          orderBy: { name: "asc" },
        },
      },
    }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
    prisma.contact.findFirst({ orderBy: { id: "asc" } }),
  ]);

  if (!category) {
    notFound();
  }

  const pageSize = 12;
  const total = await prisma.product.count({ where: { category: { slug } } });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = clampInt(sp?.page, 1, 1, totalPages);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const products = await prisma.product.findMany({
    where: { category: { slug }, isActive: true },
    orderBy: { createdAt: "desc" },
    skip: start,
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

  const title = category.name || "Category";
  const subtitle = category.description || "Explore curated products";
  const heroImage = category.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30";
  const richHtml =
    category.descriptionHtml ||
    `
      <h2>${title}</h2>
      <p>
        This category page content is coming from a rich editor (CMS). You can add long-form SEO content here:
        brand history, buying guides, authenticity tips, shipping and warranty details, and FAQs.
      </p>
      <h3>Buying tips</h3>
      <ul>
        <li>Always check box & papers and serial authenticity</li>
        <li>Prefer insured shipping for high value items</li>
        <li>Ask for real photos and condition report</li>
      </ul>
      <p>
        Add internal links to <a href="/shop">Shop All Products</a> and <a href="/deals">View Deals</a>
        to improve SEO and navigation.
      </p>
    `;
  const baseUrlResolved = (siteSettings?.siteUrl || process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const contactWhatsapp = contact?.whatsapp || "";
  const whatsappDigits = contactWhatsapp.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : "/contact";
  const pageUrl = `${baseUrlResolved}/categories/${slug}`;
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
          { name: title, item: pageUrl },
        ])}
      />
      <Schema
        data={collectionPageSchema({
          name: title,
          description: subtitle,
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
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">Home</Link>
            <span className="text-neutral-300">/</span>
            <Link className="hover:text-neutral-900" href="/categories">Categories</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">{title}</span>
          </div>
        </Container>
      </div>

      {/* Category Header */}
      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="grid gap-8 py-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                Curated collection
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                {subtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {[
                  "Authenticated items",
                  "Insured shipping",
                  "Secure checkout",
                  "7-day returns",
                ].map((x) => (
                  <span
                    key={x}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
                <Image
                  src={withImageParams(heroImage, "auto=format&fit=crop&w=1600&q=85")}
                  alt={title}
                  width={1600}
                  height={1000}
                  className="h-[220px] w-full object-cover sm:h-[260px]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Products + Controls */}
      <section className="bg-white py-10">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Showing{" "}
                <span className="text-neutral-600">
                  {start + 1}–{Math.min(end, total)}
                </span>{" "}
                of{" "}
                <span className="text-neutral-600">{total}</span> products
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Page {page} of {totalPages}
              </p>
            </div>

            {/* Controls (UI only for now) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                <input
                  className="w-56 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                  placeholder="Search in this category…"
                  type="search"
                />
              </div>

              <select
                className="h-10 rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                defaultValue="featured"
                aria-label="Sort products"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="new">New Arrivals</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageProducts.map((p) => (
              <ProductCard key={p.id} p={p} variant="compact" />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-6 sm:flex-row">
            <div className="text-xs text-neutral-500">
              Tip: Use filters (brand, price, condition) to improve conversions.
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={buildPageHref(slug, Math.max(1, page - 1))}
                aria-disabled={page === 1}
                className={[
                  "rounded-xl border px-4 py-2 text-sm",
                  page === 1
                    ? "pointer-events-none border-neutral-200 text-neutral-400"
                    : "border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                ‹ Prev
              </Link>

              {/* Page numbers (compact) */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                  const n = i + 1;
                  const active = n === page;
                  return (
                    <Link
                      key={n}
                      href={buildPageHref(slug, n)}
                      className={[
                        "h-10 w-10 rounded-xl border text-sm flex items-center justify-center",
                        active
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 hover:bg-neutral-50",
                      ].join(" ")}
                    >
                      {n}
                    </Link>
                  );
                })}
                {totalPages > 7 ? (
                  <span className="px-2 text-sm text-neutral-400">…</span>
                ) : null}
              </div>

              <Link
                href={buildPageHref(slug, Math.min(totalPages, page + 1))}
                aria-disabled={page === totalPages}
                className={[
                  "rounded-xl border px-4 py-2 text-sm",
                  page === totalPages
                    ? "pointer-events-none border-neutral-200 text-neutral-400"
                    : "border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                Next ›
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Subcategories Section */}
      {category.subcategories && category.subcategories.length > 0 && (
        <section className="border-t border-neutral-200 bg-white py-12">
          <Container>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                Subcategories
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                Explore {title} Collections
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Browse specific subcategories to find exactly what you're looking for
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${slug}/${sub.slug}`}
                  className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white transition group-hover:border-neutral-900 group-hover:bg-neutral-900">
                    <span className="text-sm text-neutral-400 transition group-hover:text-white">
                      →
                    </span>
                  </div>

                  <div className="pr-12">
                    <h3 className="text-base font-semibold text-neutral-900">
                      {sub.name}
                    </h3>
                    {sub.description && (
                      <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
                        {sub.description}
                      </p>
                    )}
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-neutral-900">
                      <span>View collection</span>
                      <span className="text-neutral-400 transition group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick stats or CTA */}
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Can't find what you're looking for?
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    Browse all products in {title} or contact our team for personalized recommendations.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/categories/${slug}`}
                    className="whitespace-nowrap rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
                  >
                    View All
                  </Link>
                  <Link
                    href="/contact"
                    className="whitespace-nowrap rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    Get Help
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Rich Editor Content (SEO + content marketing) */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-14">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <div
                  className="rt-content"
                  dangerouslySetInnerHTML={{ __html: richHtml }}
                />
              </div>
            </div>

            <aside className="lg:col-span-4 lg:self-start">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 lg:sticky lg:top-24">
                <p className="text-sm font-semibold">Need help choosing?</p>
                <p className="mt-2 text-sm text-neutral-600">
                  Share your budget + preferred brand, we'll recommend the best options in this category.
                </p>

                <div className="mt-5 grid gap-2">
                  <Link
                    href={whatsappHref}
                    className="rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    WhatsApp Support
                  </Link>
                  <Link
                    href="/account/orders"
                    className="rounded-2xl border border-neutral-200 px-5 py-3 text-center text-sm font-medium hover:bg-neutral-50"
                  >
                    Track Order
                  </Link>
                </div>
                <p className="mt-4 text-xs text-neutral-500">
                  For more info, visit{" "}
                  <Link className="font-medium text-neutral-800 hover:underline" href="/contact">
                    Contact
                  </Link>
                  ,{" "}
                  <Link className="font-medium text-neutral-800 hover:underline" href="/faq">
                    FAQs
                  </Link>
                  , or{" "}
                  <Link className="font-medium text-neutral-800 hover:underline" href="/returns">
                    Returns
                  </Link>
                  .
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {[
                    { t: "Authenticity", d: "Verified before dispatch" },
                    { t: "Shipping", d: "Insured worldwide delivery" },
                    { t: "Returns", d: "7-day return policy" },
                    { t: "Payments", d: "Secure gateways + checks" },
                  ].map((x) => (
                    <div key={x.t} className="rounded-2xl bg-neutral-50 p-4">
                      <p className="text-xs font-semibold">{x.t}</p>
                      <p className="mt-1 text-xs text-neutral-600">{x.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </div>
  );
}
