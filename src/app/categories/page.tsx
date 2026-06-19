import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import CategoryCard, { Category } from "@/components/CategoryCard";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, breadcrumbSchema, itemListSchema } from "@/components/seo/schemas";
import { parseCatalogSettings } from "@/lib/catalogSettings";
import { prisma } from "@/lib/prisma";
import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "categories" } }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);
  const baseUrlResolved = normalizeSiteUrl(settings?.siteUrl || baseUrl);
  const canonical = baseUrlResolved ? `${baseUrlResolved}/categories` : undefined;
  const image = page?.featureImage || page?.heroImage || undefined;
  const ogImage =
    image && baseUrlResolved && !image.startsWith("http")
      ? `${baseUrlResolved}${image.startsWith("/") ? "" : "/"}${image}`
      : image;

  return {
    title: page?.metaTitle || page?.title || "Categories",
    description:
      page?.metaDescription ||
      page?.shortDescription ||
      "Browse product categories and collections.",
    keywords: page?.metaKeywords || undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      title: page?.metaTitle || page?.title || "Categories",
      description:
        page?.metaDescription ||
        page?.shortDescription ||
        "Browse product categories and collections.",
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: page?.metaTitle || page?.title || "Categories",
      description:
        page?.metaDescription ||
        page?.shortDescription ||
        "Browse product categories and collections.",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

const fallbackImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

const categoriesFallback: Category[] = [
  {
    name: "Featured Products",
    description: "Popular picks and customer favorites",
    href: "/shop",
    image: fallbackImage,
    imageAlt: "Featured products",
  },
  {
    name: "New Arrivals",
    description: "Recently added products",
    href: "/shop",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    imageAlt: "New arrivals",
  },
  {
    name: "Deals & Offers",
    description: "Current discounts and offers",
    href: "/deals",
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db",
    imageAlt: "Deals and offers",
  },
];

export default async function CategoriesPage() {
  const [rows, siteSettings, contact, pageRow] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      select: { name: true, slug: true, description: true, image: true, imageAlt: true },
    }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
    prisma.contact.findFirst({ orderBy: { id: "asc" } }),
    prisma.page.findUnique({ where: { slug: "categories" } }),
  ]);

  const catalogSettings = parseCatalogSettings(siteSettings?.catalogSettings);
  const categories: Category[] =
    rows.length > 0
      ? rows.map((c) => ({
          name: c.name ?? "Category",
          description: c.description ?? "",
          href: `/categories/${c.slug ?? ""}`,
          image: c.image || fallbackImage,
          imageAlt: c.imageAlt || c.name || "Category",
        }))
      : categoriesFallback;
  const baseUrlResolved = normalizeSiteUrl(siteSettings?.siteUrl || baseUrl);
  const contactWhatsapp = contact?.whatsapp || "";
  const whatsappDigits = contactWhatsapp.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : "/contact";
  const categoryItems = categories.slice(0, 20).map((c) => ({
    name: c.name,
    url: absoluteUrl(c.href, baseUrlResolved),
    image: c.image ? absoluteUrl(c.image, baseUrlResolved) : undefined,
  }));
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Schema
        data={breadcrumbSchema([
          { name: "Home", item: baseUrlResolved },
          { name: pageRow?.title || "Categories", item: `${baseUrlResolved}/categories` },
        ])}
      />
      <Schema
        data={itemListSchema({
          url: `${baseUrlResolved}/categories`,
          items: categoryItems,
        })}
      />

      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">
              Home
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">{pageRow?.title || "Categories"}</span>
          </div>
        </Container>
      </div>

      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="grid gap-6 py-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                {catalogSettings.categoryEyebrow}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {pageRow?.heroTitle || pageRow?.title || "Explore collections"}
              </h1>

              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                {pageRow?.heroSubtitle ||
                  pageRow?.shortDescription ||
                  "Browse product categories and collections."}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {catalogSettings.categoryTrustBadges.map((x) => (
                  <span
                    key={x}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold">Quick search</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Find products faster inside collections.
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-neutral-900" />
                  <input
                    type="search"
                    placeholder={catalogSettings.categorySearchPlaceholder}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/shop"
                    className="flex-1 rounded-2xl bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    Shop All
                  </Link>
                  <Link
                    href="/deals"
                    className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3 text-center text-sm font-medium hover:bg-neutral-50"
                  >
                    Deals
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {pageRow?.contentHtml ? (
        <section className="bg-white py-12">
          <Container>
            <div
              className="rt-content rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8"
              dangerouslySetInnerHTML={{ __html: pageRow.contentHtml }}
            />
          </Container>
        </section>
      ) : null}

      <section className="bg-white py-12">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <CategoryCard key={c.name} c={c} variant="premium" />
            ))}
          </div>

          <div className="mt-10 border-t border-neutral-200 pt-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">All collections</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Quick access to every category.
                </p>
              </div>
              <Link href="/shop" className="text-sm font-medium hover:underline">
                View all products
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <CategoryCard key={`${c.name}-compact`} c={c} variant="compact" />
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 py-12">
        <Container>
          <div className="grid gap-6 rounded-3xl border border-neutral-200 bg-white p-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <p className="text-sm font-semibold">{catalogSettings.categoryHelpTitle}</p>
              <p className="mt-2 text-sm text-neutral-600">
                {catalogSettings.categoryHelpBody}
              </p>
            </div>
            <div className="flex gap-2 lg:col-span-4">
              <Link
                href={whatsappHref}
                className="flex-1 rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
              >
                {catalogSettings.categoryHelpPrimaryLabel}
              </Link>
              <Link
                href="/shop"
                className="flex-1 rounded-2xl border border-neutral-200 px-5 py-3 text-center text-sm font-medium hover:bg-neutral-50"
              >
                Browse All
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
