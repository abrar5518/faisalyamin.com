// src/app/categories/page.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import CategoryCard, { Category } from "@/components/CategoryCard";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, breadcrumbSchema, itemListSchema } from "@/components/seo/schemas";
 

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse curated collections and premium categories for luxury watches and accessories.",
  alternates: { canonical: `${baseUrl}/categories` },
  openGraph: {
    type: "website",
    title: "Categories",
    description: "Browse curated collections and premium categories for luxury watches and accessories.",
    url: `${baseUrl}/categories`,
    images: ["/images/shopping.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Categories",
    description: "Browse curated collections and premium categories for luxury watches and accessories.",
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
  watches: "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
  accessories: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990",
  jewelry: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb",
  new: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
  best: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
  preowned: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
};

const categoriesFallback: Category[] = [
  {
    name: "Luxury Watches",
    description: "Rolex, AP, Patek & premium icons",
    href: "/categories/watches",
    image: IMAGES.watches,
  },
  {
    name: "Accessories",
    description: "Straps, cases, winders and essentials",
    href: "/categories/accessories",
    image: IMAGES.accessories,
  },
  {
    name: "Jewelry",
    description: "Timeless pieces with premium finish",
    href: "/categories/jewelry",
    image: IMAGES.jewelry,
  },
  {
    name: "Shop All Products",
    description: "Browse the full catalog",
    href: "/shop",
    image: IMAGES.new,
  },
  {
    name: "Deals & Offers",
    description: "Limited-time price drops",
    href: "/deals",
    image: IMAGES.best,
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
          image: c.image || IMAGES.watches,
          imageAlt: c.imageAlt || c.name || "Category",
        }))
      : categoriesFallback;
  const baseUrlResolved = (siteSettings?.siteUrl || baseUrl).replace(/\/$/, "");
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
                Curated categories for premium tastes. Choose a collection to browse verified pieces.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {["Authenticated", "Secure checkout", "Insured shipping", "7-day returns"].map((x) => (
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
                    placeholder="Search watches, brands..."
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
                Tell us your budget and preferred brand. We&apos;ll shortlist the best options for you.
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
