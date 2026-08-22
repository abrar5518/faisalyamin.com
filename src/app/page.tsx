// src/app/page.tsx
import Link from "next/link";
import CategoryCard, { Category } from "@/components/CategoryCard";
import type { Product } from "@/components/ProductCard";
import HomeReviewsSlider from "@/components/home/HomeReviewsSlider";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Schema from "@/components/seo/Schema";
import { absoluteUrl, itemListSchema, organizationSchema, websiteSchema } from "@/components/seo/schemas";
import MaisonCategoryCollection from "@/components/home/MaisonCategoryCollection";
import { normalizeSiteUrl } from "@/lib/siteUrl";
import FaqSection from "@/components/FaqSection";
import { parseHomeSections } from "@/lib/homeContent";
import HomeHeroSlider, { type HomeHeroSlideData } from "@/components/home/HomeHeroSlider";
import { toProductCardData } from "@/lib/productCardData";
import HomeProductShowcase from "@/components/home/HomeProductShowcase";

type Testimonial = {
  name: string;
  title: string;
  quote: string;
  avatar: string;
  rating: number;
};

const baseUrl = normalizeSiteUrl();
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

  p1: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3",
  p2: "https://images.unsplash.com/photo-1551028719-00167b16eac5",
  p3: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b",
  p4: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea",
  p5: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
  p6: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",

  a1: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe",
  a2: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  a3: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
};

const featuredProductsFallback: Product[] = [
  { id: "reference-coat", name: "Structure Wool Coat", price: "PKR 22,900", badge: "New season", rating: 4.9, reviews: 128, image: IMAGES.p1, href: "/shop", subtitle: "Relaxed fit", hasOptions: true, colorSwatches: [{ label: "Sand", colorCode: "#d4c3ae" }, { label: "Forest", colorCode: "#29443b" }, { label: "Black", colorCode: "#171717" }] },
  { id: "reference-jacket", name: "Leather Studio Jacket", price: "PKR 28,900", badge: "Bestseller", rating: 4.8, reviews: 94, image: IMAGES.p2, href: "/shop", subtitle: "Limited edition", hasOptions: true, colorSwatches: [{ label: "Tan", colorCode: "#9c7251" }, { label: "Black", colorCode: "#171717" }] },
  { id: "reference-dress", name: "Sculpted Midi Dress", price: "PKR 14,900", badge: "Online exclusive", rating: 4.7, reviews: 61, image: IMAGES.p3, href: "/shop", subtitle: "3 colours", hasOptions: true, colorSwatches: [{ label: "Stone", colorCode: "#c8b8a5" }, { label: "Rose", colorCode: "#b57a78" }, { label: "Ink", colorCode: "#30343b" }] },
  { id: "reference-overshirt", name: "Utility Overshirt", price: "PKR 11,900", badge: "Trending", rating: 4.9, reviews: 77, image: IMAGES.p4, href: "/shop", subtitle: "4 colours", hasOptions: true, colorSwatches: [{ label: "Olive", colorCode: "#70745b" }, { label: "Navy", colorCode: "#293747" }] },
  { id: "reference-evening-set", name: "Fluid Evening Set", price: "PKR 17,900", badge: "Online exclusive", rating: 4.8, reviews: 52, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f", href: "/shop", subtitle: "New collection", hasOptions: true },
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
  return <div className="w-full px-[2.75vw] max-[700px]:px-[14px]">{children}</div>;
}


function clampFloat(value: unknown, fallback: number, min: number, max: number) {
  if (value === null || value === undefined || value === "") return fallback;
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

function normalizeRating(value: unknown, fallback = 5) {
  return Number(clampFloat(value, fallback, 1, 5).toFixed(1));
}

export default async function HomePage() {
  const [categoryRows, featuredRows, saleRows, pageRow, siteSettings, contact] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, name: true, slug: true, description: true, image: true, imageAlt: true, isFeatured: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 24,
      include: { images: true, category: { select: { name: true } } },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [{ isSale: true }, { compareAt: { not: null } }],
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { images: true, category: { select: { name: true } } },
    }),
    prisma.page.findUnique({
      where: { slug: "home" },
      include: {
        homeBenefits: { orderBy: { sortOrder: "asc" } },
        homeFaqItems: { orderBy: { sortOrder: "asc" } },
        homeTestimonials: { orderBy: { sortOrder: "asc" } },
        homeHeroSlides: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
    prisma.contact.findFirst({ orderBy: { id: "asc" } }),
  ]);

  const homeSections = parseHomeSections(pageRow?.sectionsJson);
  const categoryCandidates = homeSections.categorySource === "manual"
    ? homeSections.categoryIds.map((id) => categoryRows.find((category) => category.id === id)).filter((category): category is NonNullable<typeof category> => Boolean(category))
    : categoryRows.filter((category) => category.isFeatured);
  const categoryList: Category[] = categoryCandidates.length
      ? categoryCandidates.slice(0, 3).map((c) => ({
        name: c.name ?? "Category",
        description: c.description ?? "",
        href: `/categories/${c.slug ?? ""}`,
        image: c.image || IMAGES.catWatches,
        imageAlt: c.imageAlt || c.name || "Category",
      }))
      : [
        { name: "Women", description: "The latest edit for her", href: "/categories", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3", imageAlt: "Women's fashion collection" },
        { name: "Men", description: "Modern menswear", href: "/categories", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22", imageAlt: "Men's fashion collection" },
        { name: "Kids", description: "Everyday style for kids", href: "/categories", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9", imageAlt: "Kids fashion collection" },
      ];

  const featuredCandidates = homeSections.featuredSource === "manual"
    ? homeSections.featuredProductIds
      .map((id) => featuredRows.find((product) => product.id === id))
      .filter((product): product is NonNullable<typeof product> => Boolean(product))
    : homeSections.featuredSource === "sale"
      ? featuredRows.filter((product) => product.isSale || product.compareAt != null)
      : homeSections.featuredSource === "new"
        ? featuredRows
        : featuredRows.filter((product) => product.isFeatured);
  const featuredList: Product[] = featuredCandidates.length
    ? featuredCandidates.slice(0, 5).map((product) => toProductCardData(product, IMAGES.p1))
    : featuredProductsFallback.slice(0, 5);
  const showcaseItems = featuredList.map((product) => ({
    id: String(product.id),
    name: product.name,
    price: product.price,
    label: product.badge || product.subtitle || "Curated selection",
    image: product.image,
    href: product.href || `/product/${product.id}`,
  }));
  const saleList: Product[] =
    saleRows.length > 0
      ? saleRows.map((p) => toProductCardData(p, IMAGES.p2))
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
  const heroSlides: HomeHeroSlideData[] = pageRow?.homeHeroSlides?.length
    ? pageRow.homeHeroSlides
      .filter((slide) => slide.isEnabled)
      .map((slide) => ({
        id: slide.id,
        eyebrow: slide.eyebrow,
        title: slide.title,
        description: slide.description,
        primaryLabel: slide.primaryLabel,
        primaryHref: slide.primaryHref,
        secondaryLabel: slide.secondaryLabel,
        secondaryHref: slide.secondaryHref,
        desktopImage: slide.desktopImage,
        mobileImage: slide.mobileImage,
        imageAlt: slide.imageAlt,
        backgroundColor: slide.backgroundColor,
        accentColor: slide.accentColor,
        badgeText: slide.badgeText,
      }))
    : [{
      title: hero.title,
      eyebrow: hero.badge,
      description: hero.subtitle,
      primaryLabel: hero.primaryLabel,
      primaryHref: hero.primaryHref,
      secondaryLabel: hero.secondaryLabel,
      secondaryHref: hero.secondaryHref,
      desktopImage: hero.image,
      imageAlt: pageRow?.heroImageAlt || "Featured collection",
      backgroundColor: "#f5efe6",
      accentColor: "#b36f49",
      badgeText: "New Drop",
    }];
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
  const brandName = siteSettings?.siteName?.trim() || "Faisal Yamin";
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
          aggregateRating: homeSections.reviewsEnabled && orgReviewCount
            ? { ratingValue: orgAverageRating, reviewCount: orgReviewCount }
            : undefined,
          reviews: homeSections.reviewsEnabled && orgReviewCount ? orgReviews : undefined,
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
      {homeSections.heroSliderEnabled ? (
        <HomeHeroSlider
          slides={heroSlides}
          autoPlay={homeSections.heroSliderAutoPlay}
          intervalMs={homeSections.heroSliderIntervalMs}
          showArrows={homeSections.heroSliderShowArrows}
          showDots={homeSections.heroSliderShowDots}
        />
      ) : null}

      {/* Maison Aster category collection */}
      <section className="ma-category-section">
        <Container>
          <div className="ma-section-heading">
            <div><h2>{homeSections.categoryTitle}</h2><p>{homeSections.categorySubtitle}</p></div>
            <Link href={homeSections.categoryViewAllHref}>{homeSections.categoryViewAllLabel}</Link>
          </div>
          <MaisonCategoryCollection items={categoryList} />
        </Container>
      </section>

      {homeSections.showcaseEnabled ? (
        <HomeProductShowcase items={showcaseItems} eyebrow={homeSections.showcaseEyebrow} title={homeSections.showcaseTitle} subtitle={homeSections.showcaseSubtitle} />
      ) : null}

      {homeSections.editorialEnabled ? (
        <section className="editorial-pro">
          <div className="photo" role="img" aria-label={homeSections.editorialImageAlt} style={{ backgroundImage: `url("${homeSections.editorialImage.replace(/"/g, "%22")}")` }} />
          <div className="copy">
            <span className="eyebrow">{homeSections.editorialEyebrow}</span>
            <h2>{homeSections.editorialTitle}</h2>
            <p>{homeSections.editorialBody}</p>
            <Link className="btn" href={homeSections.editorialButtonHref}>{homeSections.editorialButtonLabel}</Link>
          </div>
        </section>
      ) : null}

      {/* Social proof strip */}
      {homeSections.socialProofEnabled ? (
        <section className="border-t border-neutral-200 bg-white py-10">
          <Container>
            <div className="grid gap-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:grid-cols-3">
              {homeSections.socialProofItems.map((x) => (
                <div key={x.title} className="rounded-2xl bg-white p-5">
                  <p className="text-sm font-semibold">{x.title}</p>
                  <p className="mt-2 text-sm text-neutral-600">{x.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Testimonials: set SHOW_HOME_REVIEWS to true to restore the full reviews section. */}
      {homeSections.reviewsEnabled ? (
      <section className="border-t border-neutral-200 bg-white py-14">
        <Container>
          {/* Section shell (adds premium separation without changing page layout) */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                  {homeSections.reviewsBadge}
                </p>

                <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {homeSections.reviewsTitle}
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  {homeSections.reviewsSubtitle}
                </p>
              </div>

              <Link
                href={homeSections.reviewsLinkHref}
                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
              >
                {homeSections.reviewsLinkLabel}
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
                We are preparing verified customer feedback for FaisalYamin.com shoppers.
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
              <p className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                {homeSections.introBadge}
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
                <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-neutral-900">{item.title}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600">{item.desc}</p>
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
            linkHref={homeSections.faqLinkHref}
            linkLabel={homeSections.faqLinkLabel}
            includeSchema
            variant="default"
          />
        </Container>
      </section>
    </div>
  );
}
