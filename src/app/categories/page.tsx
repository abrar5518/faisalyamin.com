// src/app/categories/page.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import CategoryCard, { Category } from "@/components/CategoryCard";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, breadcrumbSchema, itemListSchema } from "@/components/seo/schemas";
import { normalizeSiteUrl } from "@/lib/siteUrl";
 

const baseUrl = normalizeSiteUrl();

export const metadata: Metadata = {
  title: "Water Bottle Categories – Shop All Types Online | Sahoolat",
  description: "Explore all water bottle categories including gym, kids, stainless steel and more. Find the best bottles online in Pakistan.",
  keywords: "water bottle categories Pakistan, gym bottles, kids bottles, buy bottles online",
  alternates: { canonical: `${baseUrl}/categories` },
  openGraph: {
    type: "website",
    title: "Water Bottle Categories – Shop All Types Online | Sahoolat",
    description: "Explore all water bottle categories including gym, kids, stainless steel and more. Find the best bottles online in Pakistan.",
    url: `${baseUrl}/categories`,
    images: ["/images/shopping.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Water Bottle Categories – Shop All Types Online | Sahoolat",
    description: "Explore all water bottle categories including gym, kids, stainless steel and more. Find the best bottles online in Pakistan.",
    images: ["/images/shopping.jpg"],
  },
};

function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-340 px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

const IMAGES = {
  bottles: "https://images.unsplash.com/photo-1523362628745-0c100150b504",
  kids: "https://images.unsplash.com/photo-1564419320461-6870880221ad",
  stainless: "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
  gym: "https://images.unsplash.com/photo-1517963628607-235ccdd5476c",
  deals: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d",
};

const categoriesFallback: Category[] = [
  {
    name: "Water Bottles",
    description: "Everyday bottles for school, office and travel",
    href: "/categories/water-bottles",
    image: IMAGES.bottles,
  },
  {
    name: "Kids Bottles",
    description: "Easy-carry bottles for school and daily use",
    href: "/categories/kids-bottles",
    image: IMAGES.kids,
  },
  {
    name: "Stainless Steel Bottles",
    description: "Durable insulated bottles and tumblers",
    href: "/categories/stainless-steel-bottles",
    image: IMAGES.stainless,
  },
  {
    name: "Shop All Bottles",
    description: "Browse the full water bottle catalog",
    href: "/shop",
    image: IMAGES.gym,
  },
  {
    name: "Deals & Offers",
    description: "Affordable bottle deals and offers",
    href: "/deals",
    image: IMAGES.deals,
  }
 
];

export default async function CategoriesPage() {
  const [rows, siteSettings, contact] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      select: { name: true, slug: true, description: true, image: true, imageAlt: true },
    }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
    prisma.contact.findFirst({ orderBy: { id: "asc" } }),
  ]);

  const categories: Category[] =
    rows.length > 0
      ? rows.map((c) => ({
          name: c.name ?? "Category",
          description: c.description ?? "",
          href: `/categories/${c.slug ?? ""}`,
          image: c.image || IMAGES.bottles,
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
          { name: "Categories", item: `${baseUrlResolved}/categories` },
        ])}
      />
      <Schema
        data={itemListSchema({
          url: `${baseUrlResolved}/categories`,
          items: categoryItems,
        })}
      />
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">Home</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">Categories</span>
          </div>
        </Container>
      </div>

      {/* Header */}
      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="grid gap-6 py-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                Shop by category
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Explore collections
              </h1>

              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                Explore water bottle categories for school, office, gym, kids and everyday hydration.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {["Quality checked", "Secure checkout", "Pakistan shipping", "7-day returns"].map((x) => (
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
                    placeholder="Search water bottles, kids bottles, school bottles..."
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

      {/* Categories Grid */}
      <section className="bg-white py-12">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <CategoryCard key={c.name} c={c} variant="premium" />
            ))}
          </div>

          {/* Secondary compact list (optional but looks pro) */}
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

      {/* Footer CTA strip */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-12">
        <Container>
          <div className="grid gap-6 rounded-3xl border border-neutral-200 bg-white p-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <p className="text-sm font-semibold">Need help choosing the right collection?</p>
              <p className="mt-2 text-sm text-neutral-600">
                Tell us your budget, bottle size and usage. We&apos;ll shortlist the best options for you.
              </p>
            </div>
            <div className="lg:col-span-4 flex gap-2">
              <Link
                href={whatsappHref}
                className="flex-1 rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
              >
                WhatsApp Support
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
