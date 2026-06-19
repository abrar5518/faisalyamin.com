// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { withImageParams } from "@/lib/image";
import CategoryCard, { Category } from "@/components/CategoryCard";
import ProductCard, { Product } from "@/components/ProductCard";
import SaleCarousel from "@/components/home/SaleCarousel";
import HomeReviewsSlider from "@/components/home/HomeReviewsSlider";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, itemListSchema, organizationSchema, websiteSchema } from "@/components/seo/schemas";
import CategoryCarousel from "@/components/home/CategoryCarousel";
import { normalizeSiteUrl } from "@/lib/siteUrl";
import FaqSection from "@/components/FaqSection";

type Testimonial = {
  name: string;
  title: string;
  quote: string;
  avatar: string;
  rating: number;
};

const baseUrl = normalizeSiteUrl();
const SHOW_HOME_REVIEWS = true;

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "home" } }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);
  const title = page?.metaTitle || "Home";
  const description =
    page?.metaDescription ||
    "Shop quality products in Pakistan with secure checkout, clear support, and reliable delivery.";
  const baseUrlResolved = normalizeSiteUrl(settings?.siteUrl);
  const ogImage = page?.heroImage
    ? page.heroImage.startsWith("http")
      ? page.heroImage
      : baseUrlResolved
        ? `${baseUrlResolved}${page.heroImage.startsWith("/") ? "" : "/"}${page.heroImage}`
        : undefined
    : undefined;
  const canonical = baseUrlResolved ? `${baseUrlResolved}/` : undefined;

  return {
    title,
    description,
    keywords: page?.metaKeywords || undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  catWatches: "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
  catAccessories: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990",
  catJewelry: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb",
  catNew: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
  catBest: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
  catPreowned: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",

  p1: "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
  p2: "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
  p3: "https://images.unsplash.com/photo-1519741497674-611481863552",
  p4: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
  p5: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
  p6: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",

  a1: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe",
  a2: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  a3: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
};

const featuredProductsFallback: Product[] = [
  { id: "1", name: "Featured Everyday Product", price: "PKR 2,450", compareAt: "PKR 2,950", badge: "Hot", rating: 4.8, reviews: 214, image: IMAGES.p1 },
  { id: "2", name: "Customer Favorite Item", price: "PKR 850", badge: "Popular", rating: 4.9, reviews: 98, image: IMAGES.p2 },
  { id: "3", name: "New Arrival Product", price: "PKR 1,650", badge: "New", rating: 5.0, reviews: 41, image: IMAGES.p3 },
  { id: "4", name: "Practical Daily Essential", price: "PKR 1,150", rating: 4.7, reviews: 392, image: IMAGES.p4 },
  { id: "5", name: "Affordable Best Seller", price: "PKR 650", rating: 4.6, reviews: 167, image: IMAGES.p5 },
  { id: "6", name: "Premium Value Product", price: "PKR 1,950", rating: 4.8, reviews: 120, image: IMAGES.p6 },
];

const saleProductsFallback: Product[] = [
  {
    id: "s1",
    name: "Weekend Deal Bundle",
    subtitle: "Limited-time bundle offer",
    price: "PKR 49,900",
    compareAt: "PKR 56,000",
    badge: "-10%",
    rating: 4.8,
    reviews: 214,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
    href: "/deals",
  },
  {
    id: "s2",
    name: "Customer Favorite Special Price",
    subtitle: "Limited-time offer",
    price: "PKR 179,000",
    compareAt: "PKR 189,000",
    badge: "-5%",
    rating: 4.9,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
    href: "/deals",
  },
  {
    id: "s3",
    name: "Premium Product Offer",
    subtitle: "Popular choice included",
    price: "PKR 339,000",
    compareAt: "PKR 355,000",
    badge: "Deal",
    rating: 5.0,
    reviews: 41,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552",
    href: "/deals",
  },
  {
    id: "s4",
    name: "Holiday Sale Product",
    subtitle: "Fast shipping across Pakistan",
    price: "PKR 21,900",
    compareAt: "PKR 23,900",
    badge: "-8%",
    rating: 4.7,
    reviews: 392,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
    href: "/deals",
  },
  {
    id: "s5",
    name: "Best Seller Promo",
    subtitle: "Top rated - Best seller",
    price: "PKR 26,900",
    compareAt: "PKR 29,500",
    badge: "-9%",
    rating: 4.6,
    reviews: 167,
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    href: "/deals",
  },
  {
    id: "s6",
    name: "Limited Stock Offer",
    subtitle: "Durable and reusable",
    price: "PKR 38,900",
    compareAt: "PKR 41,800",
    badge: "-7%",
    rating: 4.8,
    reviews: 120,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    href: "/deals",
  },
  {
    id: "s7",
    name: "Large Capacity Product - Sale Edition",
    subtitle: "Limited stock - Popular choice",
    price: "PKR 52,900",
    compareAt: "PKR 58,500",
    badge: "-10%",
    rating: 4.9,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
    href: "/deals",
  },
  {
    id: "s8",
    name: "Travel Ready Deal Product",
    subtitle: "For daily use, travel and gifting",
    price: "PKR 21,500",
    compareAt: "PKR 24,000",
    badge: "-12%",
    rating: 4.7,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
    href: "/deals",
  },
];

const testimonialsFallback: Testimonial[] = [
  {
    name: "Ayesha K.",
    title: "Lahore",
    quote: "Product quality achi nikli, packaging clean thi aur delivery bhi time par mil gayi.",
    avatar: IMAGES.a1,
    rating: 4.6,
  },
  {
    name: "Hamza R.",
    title: "Karachi",
    quote: "Daily office use ke liye order ki thi. Size practical hai aur water ka taste fresh rehta hai.",
    avatar: IMAGES.a3,
    rating: 4.4,
  },
  {
    name: "Mariam S.",
    title: "Islamabad",
    quote: "Product pictures jaisa hi mila. Packaging clean thi aur checkout process simple tha.",
    avatar: IMAGES.a2,
    rating: 4.5,
  },
];

function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-340 px-4 sm:px-6 lg:px-12">{children}</div>;
}


function formatPrice(value: unknown) {
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(num)) return `PKR ${num.toLocaleString("en-PK")}`;
  return "PKR 0";
}

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(num)));
}

function clampFloat(value: unknown, fallback: number, min: number, max: number) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

function normalizeRating(value: unknown, fallback = 5) {
  return Number(clampFloat(value, fallback, 1, 5).toFixed(1));
}

function pickProductImages(images: Array<{ url?: string; alt?: string | null; sortOrder?: number; mediaType?: string | null }> = []) {
  const sorted = [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return sorted.filter((image) => (image.mediaType ?? "image") === "image");
}
function toProduct(p: any, fallbackImage: string): Product {
  const productImages = pickProductImages(p.images || []);
  const img = productImages[0]?.url || fallbackImage;
  const slug = p.slug ?? String(p.id ?? "");
  return {
    id: slug,
    name: p.name ?? "Untitled product",
    price: formatPrice(p.price),
    compareAt: p.compareAt != null ? formatPrice(p.compareAt) : undefined,
    badge: p.badge ?? undefined,
    rating: typeof p.rating === "number" ? p.rating : 0,
    reviews: typeof p.reviewsCount === "number" ? p.reviewsCount : 0,
    image: img,
    imageAlt: productImages[0]?.alt || p.name,
    hoverImage: productImages[1]?.url,
    hoverImageAlt: productImages[1]?.alt || p.name,
    href: `/product/${slug}`,
    subtitle: p.shortDesc ?? undefined,
  };
}

export default async function HomePage() {
  const [categoryRows, featuredRows, saleRows, pageRow, siteSettings, contact] = await Promise.all([
    prisma.category.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { name: true, slug: true, description: true, image: true, imageAlt: true },
    }),
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      orderBy: { createdAt: "desc" },
      include: { images: true },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [{ isSale: true }, { compareAt: { not: null } }],
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { images: true },
    }),
    prisma.page.findUnique({
      where: { slug: "home" },
      include: {
        homeBenefits: { orderBy: { sortOrder: "asc" } },
        homeFaqItems: { orderBy: { sortOrder: "asc" } },
        homeTestimonials: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
    prisma.contact.findFirst({ orderBy: { id: "asc" } }),
  ]);

  const categoryList: Category[] =
    categoryRows.length > 0
      ? categoryRows.map((c) => ({
        name: c.name ?? "Category",
        description: c.description ?? "",
        href: `/categories/${c.slug ?? ""}`,
        image: c.image || IMAGES.catWatches,
        imageAlt: c.imageAlt || c.name || "Category",
      }))
      : [];

  const featuredList: Product[] =
    featuredRows.length > 0
      ? featuredRows.map((p) => toProduct(p, IMAGES.p1))
      : featuredProductsFallback;

  const saleList: Product[] =
    saleRows.length > 0
      ? saleRows.map((p) => toProduct(p, IMAGES.p2))
      : saleProductsFallback;
  const hero = {
    badge: pageRow?.heroBadge || "Pakistan-based online shopping store",
    title: pageRow?.heroTitle || "Premium products, curated for people who care about details.",
    subtitle:
      pageRow?.heroSubtitle ||
      "Shop best-selling products with secure checkout, clear shipping, and helpful support across Pakistan.",
    primaryLabel: pageRow?.heroPrimaryLabel || "Shop Now",
    primaryHref: pageRow?.heroPrimaryHref || "/shop",
    secondaryLabel: pageRow?.heroSecondaryLabel || "Browse Categories",
    secondaryHref: pageRow?.heroSecondaryHref || "/categories",
    image: pageRow?.heroImage || IMAGES.hero,
    cardTitle: pageRow?.heroCardTitle || "Featured Drop",
    cardSubtitle: pageRow?.heroCardSubtitle || "Limited availability - Premium selection",
    cardPrimaryLabel: pageRow?.heroCardPrimaryLabel || "Shop All",
    cardPrimaryHref: pageRow?.heroCardPrimaryHref || "/shop",
    cardSecondaryLabel: pageRow?.heroCardSecondaryLabel || "View Deals",
    cardSecondaryHref: pageRow?.heroCardSecondaryHref || "/deals",
    highlights: [
      {
        k: pageRow?.heroHighlight1Title || "Quality",
        v: pageRow?.heroHighlight1Desc || "Checked products",
      },
      {
        k: pageRow?.heroHighlight2Title || "Fast",
        v: pageRow?.heroHighlight2Desc || "Pakistan shipping",
      },
      {
        k: pageRow?.heroHighlight3Title || "Secure",
        v: pageRow?.heroHighlight3Desc || "Protected payments",
      },
    ],
  };
  const homeIntro = {
    title: pageRow?.homeIntroTitle || "Introducing our featured products",
    body:
      pageRow?.homeIntroBody ||
      "Discover quality products selected for everyday needs. Use this section to explain your brand, product benefits, and buying guide from the admin panel.",
  };
  const homeBenefits = {
    title: pageRow?.homeBenefitsTitle || "Benefits you can feel every day",
    intro:
      pageRow?.homeBenefitsIntro ||
      "Built for people who care about quality, comfort, and the planet. These benefits keep you hydrated without compromise.",
    items:
      pageRow?.homeBenefits && pageRow.homeBenefits.length
        ? pageRow.homeBenefits.map((item) => ({
          title: item.title ?? "Benefit",
          desc: item.desc ?? "",
        }))
        : [
          {
            title: "Durable stainless steel build",
            desc:
              "Rugged, rust-resistant bodies that handle gym bags, travel days, and daily commutes with ease.",
          },
          {
            title: "Insulation that lasts",
            desc:
              "Vacuum insulation keeps water cold for hours and helps hot drinks stay warm on long days.",
          },
          {
            title: "Eco-friendly by design",
            desc:
              "Reusable, BPA-free materials reduce single-use plastic and fit a sustainable lifestyle.",
          },
        ],
  };
  const homeFaqItems =
    pageRow?.homeFaqItems && pageRow.homeFaqItems.length
      ? pageRow.homeFaqItems.map((item) => ({
        q: item.question ?? "Question",
        a: item.answer ?? "",
      }))
      : [
        {
          q: "Are these products checked before dispatch?",
          a: "Yes. Products can be checked before dispatch based on your store policy.",
        },
        {
          q: "How long does delivery take?",
          a: "Delivery time depends on your courier setup and can be managed from store settings.",
        },
        {
          q: "Can customers get support before ordering?",
          a: "Yes. You can manage WhatsApp, phone, and email support details from the admin panel.",
        },
      ];
  const homeFaq = {
    title: pageRow?.homeFaqTitle || "FAQs about our products",
    intro: pageRow?.homeFaqIntro || "Quick answers to help customers choose with confidence.",
    items: homeFaqItems,
  };
  const saleLimit = clampInt(pageRow?.homeSaleLimit, 8, 1, 50);
  const saleVisibleCount = clampFloat(pageRow?.homeSaleVisibleCount, 4.5, 1, 6);
  const saleAutoMs = clampInt(pageRow?.homeSaleAutoMs, 4500, 1000, 20000);
  const saleItems = saleList.slice(0, saleLimit);
  const testimonialsFromCms: Testimonial[] =
    pageRow?.homeTestimonials
      ?.map((item) => ({
        name: item.name?.trim() || "",
        title: item.title?.trim() || "",
        quote: item.quote?.trim() || "",
        avatar: item.avatarUrl || IMAGES.a1,
        rating: normalizeRating(item.rating),
      }))
      .filter((item) => item.name && item.quote) ?? [];
  const testimonialsList: Testimonial[] =
    testimonialsFromCms.length > 0 ? testimonialsFromCms : testimonialsFallback;
  const baseUrlResolved = normalizeSiteUrl(siteSettings?.siteUrl || baseUrl);
  const brandName = siteSettings?.siteName?.trim() || "Sahoolat";
  const logoUrl = siteSettings?.logoUrl || siteSettings?.siteIconUrl || "/favicon.ico";
  const orgAddress = contact
    ? {
      streetAddress: [contact.addressLine1, contact.addressLine2].filter(Boolean).join(", ") || undefined,
      addressLocality: contact.city || undefined,
      addressRegion: contact.state || undefined,
      postalCode: contact.postalCode || undefined,
      addressCountry: contact.country || "PK",
    }
    : { addressCountry: "PK" };
  const productListSource = [...featuredList, ...saleList];
  const seenProductUrls = new Set<string>();
  const productListItems = baseUrlResolved
    ? productListSource
      .map((p) => {
        const href = p.href || `/product/${p.id}`;
        const url = absoluteUrl(href, baseUrlResolved);
        return { name: p.name, url, image: p.image };
      })
      .filter((item) => {
        if (!item.url || seenProductUrls.has(item.url)) return false;
        seenProductUrls.add(item.url);
        return true;
      })
    : [];
  const orgReviews = testimonialsList.map((t) => ({
    name: `Review from ${t.name}`,
    author: t.name,
    ratingValue: normalizeRating(t.rating),
    reviewBody: t.quote,
  }));
  const orgReviewCount = orgReviews.length;
  const orgAverageRating =
    orgReviewCount > 0
      ? Number(
          (
            orgReviews.reduce((total, review) => total + review.ratingValue, 0) /
            orgReviewCount
          ).toFixed(1),
        )
      : 0;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Schema
        data={organizationSchema({
          name: brandName,
          url: baseUrlResolved,
          logo: absoluteUrl(logoUrl, baseUrlResolved),
          phone: contact?.phone || undefined,
          email: contact?.email || undefined,
          address: orgAddress,
          aggregateRating: SHOW_HOME_REVIEWS && orgReviewCount
            ? { ratingValue: orgAverageRating, reviewCount: orgReviewCount }
            : undefined,
          reviews: SHOW_HOME_REVIEWS && orgReviewCount ? orgReviews : undefined,
        })}
      />
      <Schema
        data={websiteSchema({
          url: baseUrlResolved,
          siteName: brandName,
          searchUrlTemplate: `${baseUrlResolved}/search?q={search_term_string}`,
        })}
      />
      {baseUrlResolved && productListItems.length > 0 ? (
        <Schema data={itemListSchema({ url: `${baseUrlResolved}/`, items: productListItems })} />
      ) : null}
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f5f5f5,transparent_45%),radial-gradient(circle_at_80%_30%,#eaeaea,transparent_45%)]" />
        <Container>
          <div className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                {hero.badge}
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {hero.title}
              </h1>

              <p className="mt-4 text-neutral-600 sm:text-lg">
                {hero.subtitle}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href={hero.primaryHref} className="btn-primary px-5 py-3 text-sm">
                  {hero.primaryLabel}
                </Link>
                <Link href={hero.secondaryHref} className="btn-secondary px-5 py-3 text-sm">
                  {hero.secondaryLabel}
                </Link>
              </div>

              <div className="mt-10 hidden sm:grid gap-3 sm:grid-cols-3 sm:gap-4 ">
                {hero.highlights.map((x) => (
                  <div key={x.k} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold">{x.k}</p>
                    <p className="mt-1 text-xs text-neutral-600">{x.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
                <Image
                  src={withImageParams(hero.image, "auto=format&fit=crop&w=1400&q=80")}
                  alt="Featured products"
                  width={1400}
                  height={900}
                  className="h-64 w-full object-cover sm:h-80 lg:h-[440px]"
                  loading="lazy"
                />
              </div>

              <div className="relative mt-4 w-full max-w-lg rounded-2xl border border-white/30 bg-white/90 p-4 backdrop-blur sm:absolute sm:bottom-6 sm:left-6 sm:mt-0 sm:w-auto sm:max-w-none">
                <p className="text-sm font-semibold">{hero.cardTitle}</p>
                <p className="mt-1 text-xs text-neutral-600">
                  {hero.cardSubtitle}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Link href={hero.cardPrimaryHref} className="btn-primary text-xs px-3 py-2">
                    {hero.cardPrimaryLabel}
                  </Link>
                  <Link
                    href={hero.cardSecondaryHref}
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs hover:bg-neutral-50"
                  >
                    {hero.cardSecondaryLabel}
                  </Link>
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-neutral-100 blur-2xl" />
              <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-neutral-200 blur-2xl" />
            </div>
          </div>
        </Container>
      </section>

      {/* ? Sale & Deals (moved right after Hero) */}
      <section className="border-t border-neutral-200 bg-white py-14">
        <Container>
          <SaleCarousel items={saleItems} visibleCount={saleVisibleCount} autoMs={saleAutoMs} />
        </Container>
      </section>

      {/* ? Categories (now after Sale) */}
      <section className="border-t border-neutral-200 bg-white py-14">
        <Container>
          <CategoryCarousel
            items={categoryList}
            // title="Shop by category"
            // subtitle="Browse curated collections made for premium tastes. test"
            // viewAllHref="/categories"
            // viewAllLabel="View all Test"
          />

        </Container>
      </section>

      {/* ? Featured Products (now after Categories) */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-14">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Featured Products</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Shop popular products selected for this store. Update this section from the admin panel.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {["All", "Popular", "New Arrivals", "Best Value"].map((t) => (
                <button
                  key={t}
                  className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredList.map((p) => (
              <ProductCard key={p.id} p={p} variant="sale" />
            ))}
          </div>
        </Container>
      </section>

      {/* Social proof strip */}
      <section className="border-t border-neutral-200 bg-white py-10">
        <Container>
          <div className="grid gap-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:grid-cols-3">
            {[
              { t: "Quality Checked", d: "Products are checked before shipping." },
              { t: "Secure Payments", d: "Multiple gateways with fraud protection." },
              { t: "Priority Support", d: "Fast WhatsApp + email support." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl bg-white p-5">
                <p className="text-sm font-semibold">{x.t}</p>
                <p className="mt-2 text-sm text-neutral-600">{x.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials: set SHOW_HOME_REVIEWS to true to restore the full reviews section. */}
      {SHOW_HOME_REVIEWS ? (
      <section className="border-t border-neutral-200 bg-white py-14">
        <Container>
          {/* Section shell (adds premium separation without changing page layout) */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-medium text-neutral-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                  Trusted by buyers
                </p>

                <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Customers reviews and stories
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Real feedback from customers who bought from Sahoolat.pk
                </p>
              </div>

              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
              >
                Read more
                <span className="text-neutral-400">→</span>
              </Link>
            </div>

            <HomeReviewsSlider items={testimonialsList} />
          </section>
        </Container>

      </section>
      ) : (
        <section className="border-t border-neutral-200 bg-white py-14">
          <Container>
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Reviews
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                Customer reviews coming soon
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
                We are preparing verified customer feedback for Sahoolat.pk shoppers.
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* Introducing products */}
      <section className="border-t border-neutral-200 bg-white py-14">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-4">
              <p className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-medium text-neutral-700">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                Introducing products
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                {homeIntro.title}
              </h2>
            </div>
            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
                <p className="text-sm leading-relaxed text-neutral-600 sm:text-base">
                  {homeIntro.body}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-14">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{homeBenefits.title}</h2>
              <p className="mt-2 text-sm text-neutral-600">{homeBenefits.intro}</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homeBenefits.items.map((item) => (
              <div key={item.title} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQs */}
      <section className="border-t border-neutral-200 bg-white py-14">
        <Container>
          <FaqSection
            items={homeFaq.items}
            title={homeFaq.title}
            intro={homeFaq.intro}
            linkHref="/faq"
            linkLabel="View all FAQs"
            includeSchema
            variant="default"
          />
        </Container>
      </section>
    </div>
  );
}
