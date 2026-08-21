import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { DEFAULT_HOME_SECTIONS, parseHomeSections } from "@/lib/homeContent";

const HOME_SLUG = "home";

const BenefitSchema = z.object({
  title: z.string().min(1),
  desc: z.string().min(1),
});

const FaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const TestimonialSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  quote: z.string().optional(),
  avatarUrl: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
});

const SocialProofSchema = z.object({
  title: z.string().min(1),
  desc: z.string().min(1),
});

const HeroSlideSchema = z.object({
  id: z.number().int().positive().optional(),
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  primaryLabel: z.string().optional(),
  primaryHref: z.string().optional(),
  secondaryLabel: z.string().optional(),
  secondaryHref: z.string().optional(),
  desktopImage: z.string().min(1),
  mobileImage: z.string().optional(),
  imageAlt: z.string().optional(),
  backgroundColor: z.string().optional(),
  accentColor: z.string().optional(),
  badgeText: z.string().optional(),
  isEnabled: z.boolean().optional(),
});

const HomeSchema = z.object({
  title: z.string().min(2),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  shortDescription: z.string().optional(),
  heroBadge: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroPrimaryLabel: z.string().optional(),
  heroPrimaryHref: z.string().optional(),
  heroSecondaryLabel: z.string().optional(),
  heroSecondaryHref: z.string().optional(),
  heroImage: z.string().optional(),
  heroImageAlt: z.string().optional(),
  heroCardTitle: z.string().optional(),
  heroCardSubtitle: z.string().optional(),
  heroCardPrimaryLabel: z.string().optional(),
  heroCardPrimaryHref: z.string().optional(),
  heroCardSecondaryLabel: z.string().optional(),
  heroCardSecondaryHref: z.string().optional(),
  heroHighlight1Title: z.string().optional(),
  heroHighlight1Desc: z.string().optional(),
  heroHighlight2Title: z.string().optional(),
  heroHighlight2Desc: z.string().optional(),
  heroHighlight3Title: z.string().optional(),
  heroHighlight3Desc: z.string().optional(),
  homeIntroTitle: z.string().optional(),
  homeIntroBody: z.string().optional(),
  homeBenefitsTitle: z.string().optional(),
  homeBenefitsIntro: z.string().optional(),
  homeBenefitsItems: z.array(BenefitSchema).optional(),
  homeFaqTitle: z.string().optional(),
  homeFaqIntro: z.string().optional(),
  homeFaqItems: z.array(FaqSchema).optional(),
  homeSaleLimit: z.number().int().min(1).max(50).optional(),
  homeSaleVisibleCount: z.number().min(1).max(6).optional(),
  homeSaleAutoMs: z.number().int().min(1000).max(20000).optional(),
  homeTestimonials: z.array(TestimonialSchema).optional(),
  heroSlides: z.array(HeroSlideSchema).optional(),
  sections: z
    .object({
      heroSliderEnabled: z.boolean(),
      heroSliderAutoPlay: z.boolean(),
      heroSliderIntervalMs: z.number().int().min(2000).max(20000),
      heroSliderShowArrows: z.boolean(),
      heroSliderShowDots: z.boolean(),
      saleTitle: z.string().min(1),
      saleSubtitle: z.string().min(1),
      saleViewAllLabel: z.string().min(1),
      saleViewAllHref: z.string().min(1),
      categoryTitle: z.string().min(1),
      categorySubtitle: z.string().min(1),
      categoryViewAllLabel: z.string().min(1),
      categoryViewAllHref: z.string().min(1),
      featuredTitle: z.string().min(1),
      featuredSubtitle: z.string().min(1),
      featuredTabs: z.array(z.string().min(1)),
      featuredSource: z.enum(["featured", "sale", "new", "manual"]),
      featuredLimit: z.number().int().min(1).max(24),
      featuredViewAllLabel: z.string().min(1),
      featuredViewAllHref: z.string().min(1),
      featuredProductIds: z.array(z.number().int().positive()),
      socialProofEnabled: z.boolean(),
      socialProofItems: z.array(SocialProofSchema),
      reviewsEnabled: z.boolean(),
      reviewsBadge: z.string().min(1),
      reviewsTitle: z.string().min(1),
      reviewsSubtitle: z.string().min(1),
      reviewsLinkLabel: z.string().min(1),
      reviewsLinkHref: z.string().min(1),
      introBadge: z.string().min(1),
      faqLinkLabel: z.string().min(1),
      faqLinkHref: z.string().min(1),
    })
    .optional(),
});

const DEFAULT_HOME = {
  title: "Home",
  metaTitle: "Home",
  metaDescription: "Quality products, clear prices, secure checkout, and reliable delivery.",
  metaKeywords: "home, ecommerce, online shopping",
  shortDescription: "Shop best-selling products with secure checkout and reliable delivery.",
  heroBadge: "Trusted by customers",
  heroTitle: "Premium products, curated for people who care about details.",
  heroSubtitle: "Shop best-selling products with secure checkout, clear support, and reliable delivery.",
  heroPrimaryLabel: "Shop Now",
  heroPrimaryHref: "/shop",
  heroSecondaryLabel: "Browse Categories",
  heroSecondaryHref: "/categories",
  heroImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  heroImageAlt: "Featured products",
  heroCardTitle: "Featured products",
  heroCardSubtitle: "Explore popular picks from this store.",
  heroCardPrimaryLabel: "Shop All",
  heroCardPrimaryHref: "/shop",
  heroCardSecondaryLabel: "View Deals",
  heroCardSecondaryHref: "/deals",
  heroHighlight1Title: "Quality",
  heroHighlight1Desc: "Checked products",
  heroHighlight2Title: "Fast",
  heroHighlight2Desc: "Reliable dispatch",
  heroHighlight3Title: "Secure",
  heroHighlight3Desc: "Protected checkout",
  homeIntroTitle: "Introducing our featured products",
  homeIntroBody: "Discover quality products selected for everyday needs.",
  homeBenefitsTitle: "Benefits you can feel every day",
  homeBenefitsIntro: "Useful benefits customers should know before ordering.",
  homeFaqTitle: "FAQs about our products",
  homeFaqIntro: "Quick answers to help customers choose with confidence.",
  homeSaleLimit: 8,
  homeSaleVisibleCount: 4.5,
  homeSaleAutoMs: 4500,
};

function relationData<T>(items: T[] | undefined, mapItem: (item: T, idx: number) => Record<string, unknown>) {
  return items ? { deleteMany: {}, create: items.map(mapItem) } : undefined;
}

function serialize(page: any) {
  return {
    ...DEFAULT_HOME,
    ...page,
    sections: parseHomeSections(page?.sectionsJson),
    homeBenefitsItems: page?.homeBenefits ?? [],
    homeFaqItems: page?.homeFaqItems ?? [],
    homeTestimonials: page?.homeTestimonials ?? [],
    heroSlides: page?.homeHeroSlides ?? [],
  };
}

function nullToUndefined(value: unknown): unknown {
  if (value === null) return undefined;
  if (Array.isArray(value)) return value.map(nullToUndefined);
  if (typeof value === "object" && value) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, nullToUndefined(item)]),
    );
  }
  return value;
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  try {
    let page = await prisma.page.findUnique({
      where: { slug: HOME_SLUG },
      include: {
        homeBenefits: { orderBy: { sortOrder: "asc" } },
        homeFaqItems: { orderBy: { sortOrder: "asc" } },
        homeTestimonials: { orderBy: { sortOrder: "asc" } },
        homeHeroSlides: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!page) {
      page = await prisma.page.create({
        data: {
          ...DEFAULT_HOME,
          slug: HOME_SLUG,
          sectionsJson: JSON.stringify(DEFAULT_HOME_SECTIONS),
        },
        include: {
          homeBenefits: { orderBy: { sortOrder: "asc" } },
          homeFaqItems: { orderBy: { sortOrder: "asc" } },
          homeTestimonials: { orderBy: { sortOrder: "asc" } },
          homeHeroSlides: { orderBy: { sortOrder: "asc" } },
        },
      });
    }

    return NextResponse.json({ ok: true, data: serialize(page) });
  } catch (err) {
    console.error("GET /api/admin/home error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load home settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  try {
    const data = HomeSchema.parse(nullToUndefined(await req.json()));
    const existing = await prisma.page.findUnique({ where: { slug: HOME_SLUG }, select: { id: true } });
    const writeData: any = {
      title: data.title,
      contentHtml: "",
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
      shortDescription: data.shortDescription,
      heroBadge: data.heroBadge,
      heroTitle: data.heroTitle,
      heroSubtitle: data.heroSubtitle,
      heroPrimaryLabel: data.heroPrimaryLabel,
      heroPrimaryHref: data.heroPrimaryHref,
      heroSecondaryLabel: data.heroSecondaryLabel,
      heroSecondaryHref: data.heroSecondaryHref,
      heroImage: data.heroImage,
      heroImageAlt: data.heroImageAlt,
      heroCardTitle: data.heroCardTitle,
      heroCardSubtitle: data.heroCardSubtitle,
      heroCardPrimaryLabel: data.heroCardPrimaryLabel,
      heroCardPrimaryHref: data.heroCardPrimaryHref,
      heroCardSecondaryLabel: data.heroCardSecondaryLabel,
      heroCardSecondaryHref: data.heroCardSecondaryHref,
      heroHighlight1Title: data.heroHighlight1Title,
      heroHighlight1Desc: data.heroHighlight1Desc,
      heroHighlight2Title: data.heroHighlight2Title,
      heroHighlight2Desc: data.heroHighlight2Desc,
      heroHighlight3Title: data.heroHighlight3Title,
      heroHighlight3Desc: data.heroHighlight3Desc,
      homeIntroTitle: data.homeIntroTitle,
      homeIntroBody: data.homeIntroBody,
      homeBenefitsTitle: data.homeBenefitsTitle,
      homeBenefitsIntro: data.homeBenefitsIntro,
      homeFaqTitle: data.homeFaqTitle,
      homeFaqIntro: data.homeFaqIntro,
      homeSaleLimit: data.homeSaleLimit,
      homeSaleVisibleCount: data.homeSaleVisibleCount,
      homeSaleAutoMs: data.homeSaleAutoMs,
      sectionsJson: JSON.stringify(data.sections ?? DEFAULT_HOME_SECTIONS),
      homeBenefits: relationData(data.homeBenefitsItems, (item, idx) => ({
        title: item.title,
        desc: item.desc,
        sortOrder: idx,
      })),
      homeFaqItems: relationData(data.homeFaqItems, (item, idx) => ({
        question: item.question,
        answer: item.answer,
        sortOrder: idx,
      })),
      homeTestimonials: relationData(data.homeTestimonials, (item, idx) => ({
        name: item.name,
        title: item.title,
        quote: item.quote,
        avatarUrl: item.avatarUrl,
        rating: item.rating ?? 5,
        sortOrder: idx,
      })),
      homeHeroSlides: relationData(data.heroSlides, (item, idx) => ({
        eyebrow: item.eyebrow,
        title: item.title,
        description: item.description,
        primaryLabel: item.primaryLabel,
        primaryHref: item.primaryHref,
        secondaryLabel: item.secondaryLabel,
        secondaryHref: item.secondaryHref,
        desktopImage: item.desktopImage,
        mobileImage: item.mobileImage,
        imageAlt: item.imageAlt,
        backgroundColor: item.backgroundColor || "#f5efe6",
        accentColor: item.accentColor || "#b36f49",
        badgeText: item.badgeText,
        isEnabled: item.isEnabled ?? true,
        sortOrder: idx,
      })),
    };

    const page = existing
      ? await prisma.page.update({
          where: { id: existing.id },
          data: writeData,
          include: {
            homeBenefits: { orderBy: { sortOrder: "asc" } },
            homeFaqItems: { orderBy: { sortOrder: "asc" } },
            homeTestimonials: { orderBy: { sortOrder: "asc" } },
            homeHeroSlides: { orderBy: { sortOrder: "asc" } },
          },
        })
      : await prisma.page.create({
          data: { ...writeData, slug: HOME_SLUG },
          include: {
            homeBenefits: { orderBy: { sortOrder: "asc" } },
            homeFaqItems: { orderBy: { sortOrder: "asc" } },
            homeTestimonials: { orderBy: { sortOrder: "asc" } },
            homeHeroSlides: { orderBy: { sortOrder: "asc" } },
          },
        });

    return NextResponse.json({ ok: true, data: serialize(page) });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    console.error("PUT /api/admin/home error:", err);
    return NextResponse.json({ ok: false, error: "Failed to save home settings" }, { status: 500 });
  }
}
