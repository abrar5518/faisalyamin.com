import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";

const CreatePageSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  contentHtml: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  shortDescription: z.string().optional(),
  featureImage: z.string().optional(),
  featureImageAlt: z.string().optional(),
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
  homeBenefitsItems: z
    .array(
      z.object({
        title: z.string().min(1),
        desc: z.string().min(1),
      })
    )
    .optional(),
  homeFaqTitle: z.string().optional(),
  homeFaqIntro: z.string().optional(),
  homeFaqItems: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      })
    )
    .optional(),
  homeSaleLimit: z.number().int().min(1).max(50).optional(),
  homeSaleVisibleCount: z.number().min(1).max(6).optional(),
  homeSaleAutoMs: z.number().int().min(1000).max(20000).optional(),
  homeTestimonials: z
    .array(
      z.object({
        name: z.string().min(1),
        title: z.string().optional(),
        quote: z.string().optional(),
        avatarUrl: z.string().optional(),
        rating: z.number().min(0).max(5).optional(),
      })
    )
    .optional(),
});

const UpdatePageSchema = z.object({
  title: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  contentHtml: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  shortDescription: z.string().optional(),
  featureImage: z.string().optional(),
  featureImageAlt: z.string().optional(),
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
  homeBenefitsItems: z
    .array(
      z.object({
        title: z.string().min(1),
        desc: z.string().min(1),
      })
    )
    .optional(),
  homeFaqTitle: z.string().optional(),
  homeFaqIntro: z.string().optional(),
  homeFaqItems: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      })
    )
    .optional(),
  homeSaleLimit: z.number().int().min(1).max(50).optional(),
  homeSaleVisibleCount: z.number().min(1).max(6).optional(),
  homeSaleAutoMs: z.number().int().min(1000).max(20000).optional(),
  homeTestimonials: z
    .array(
      z.object({
        name: z.string().min(1),
        title: z.string().optional(),
        quote: z.string().optional(),
        avatarUrl: z.string().optional(),
        rating: z.number().min(0).max(5).optional(),
      })
    )
    .optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const item = await prisma.page.findUnique({
        where: { slug },
        include: {
          homeBenefits: { orderBy: { sortOrder: "asc" } },
          homeFaqItems: { orderBy: { sortOrder: "asc" } },
          homeTestimonials: { orderBy: { sortOrder: "asc" } },
        },
      });
      if (!item) {
        return NextResponse.json({ ok: false, error: "Page not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, data: item });
    }

    const items = await prisma.page.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, data: items });
  } catch (err) {
    console.error("GET /api/admin/pages error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const data = CreatePageSchema.parse(body);

    const created = await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        contentHtml: data.contentHtml,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        shortDescription: data.shortDescription,
        featureImage: data.featureImage,
        featureImageAlt: data.featureImageAlt,
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
        homeBenefits: data.homeBenefitsItems?.length
          ? {
              create: data.homeBenefitsItems.map((item, idx) => ({
                title: item.title,
                desc: item.desc,
                sortOrder: idx,
              })),
            }
          : undefined,
        homeFaqTitle: data.homeFaqTitle,
        homeFaqIntro: data.homeFaqIntro,
        homeSaleLimit: data.homeSaleLimit,
        homeSaleVisibleCount: data.homeSaleVisibleCount,
        homeSaleAutoMs: data.homeSaleAutoMs,
        homeFaqItems: data.homeFaqItems?.length
          ? {
              create: data.homeFaqItems.map((item, idx) => ({
                question: item.question,
                answer: item.answer,
                sortOrder: idx,
              })),
            }
          : undefined,
        homeTestimonials: data.homeTestimonials?.length
          ? {
              create: data.homeTestimonials.map((item, idx) => ({
                name: item.name,
                title: item.title,
                quote: item.quote,
                avatarUrl: item.avatarUrl,
                rating: item.rating ?? 5,
                sortOrder: idx,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Page slug already exists" }, { status: 409 });
    }

    console.error("POST /api/admin/pages error:", err);
    return NextResponse.json({ ok: false, error: "Failed to create page" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ ok: false, error: "slug is required" }, { status: 400 });
    }

    const body = await req.json();
    const data = UpdatePageSchema.parse(body);

    const existing = await prisma.page.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Page not found" }, { status: 404 });
    }

    const updated = await prisma.page.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        slug: data.slug,
        contentHtml: data.contentHtml,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        shortDescription: data.shortDescription,
        featureImage: data.featureImage,
        featureImageAlt: data.featureImageAlt,
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
        homeBenefits: data.homeBenefitsItems
          ? {
              deleteMany: {},
              create: data.homeBenefitsItems.map((item, idx) => ({
                title: item.title,
                desc: item.desc,
                sortOrder: idx,
              })),
            }
          : undefined,
        homeFaqTitle: data.homeFaqTitle,
        homeFaqIntro: data.homeFaqIntro,
        homeSaleLimit: data.homeSaleLimit,
        homeSaleVisibleCount: data.homeSaleVisibleCount,
        homeSaleAutoMs: data.homeSaleAutoMs,
        homeFaqItems: data.homeFaqItems
          ? {
              deleteMany: {},
              create: data.homeFaqItems.map((item, idx) => ({
                question: item.question,
                answer: item.answer,
                sortOrder: idx,
              })),
            }
          : undefined,
        homeTestimonials: data.homeTestimonials
          ? {
              deleteMany: {},
              create: data.homeTestimonials.map((item, idx) => ({
                name: item.name,
                title: item.title,
                quote: item.quote,
                avatarUrl: item.avatarUrl,
                rating: item.rating ?? 5,
                sortOrder: idx,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }

    if (err?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Page slug already exists" }, { status: 409 });
    }

    console.error("PUT /api/admin/pages error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ ok: false, error: "slug is required" }, { status: 400 });
    }

    const existing = await prisma.page.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Page not found" }, { status: 404 });
    }

    await prisma.page.delete({ where: { id: existing.id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/pages error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete page" }, { status: 500 });
  }
}
