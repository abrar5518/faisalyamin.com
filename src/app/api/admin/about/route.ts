import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import {
  AboutContent,
  aboutContentFromDb,
  applyAboutDefaults,
  parseAboutContent,
} from "@/lib/aboutContent";

const AboutContentSchema = z.object({
  breadcrumbLabel: z.string().optional(),
  heroExtras: z
    .object({
      chips: z.array(z.string()).optional(),
      noteHtml: z.string().optional(),
      infoCards: z
        .array(z.object({ title: z.string().optional(), bodyHtml: z.string().optional() }))
        .optional(),
    })
    .optional(),
  stats: z.array(z.object({ label: z.string().optional(), value: z.string().optional() })).optional(),
  story: z
    .object({
      title: z.string().optional(),
      intro: z.string().optional(),
      primaryLabel: z.string().optional(),
      primaryHref: z.string().optional(),
      secondaryLabel: z.string().optional(),
      secondaryHref: z.string().optional(),
      bodyHtml: z.string().optional(),
    })
    .optional(),
  values: z
    .object({
      title: z.string().optional(),
      intro: z.string().optional(),
      assistTitle: z.string().optional(),
      assistDesc: z.string().optional(),
      assistCtaLabel: z.string().optional(),
      assistCtaHref: z.string().optional(),
      items: z
        .array(z.object({ title: z.string().optional(), desc: z.string().optional() }))
        .optional(),
    })
    .optional(),
  verification: z
    .object({
      title: z.string().optional(),
      intro: z.string().optional(),
      supportLabel: z.string().optional(),
      supportHref: z.string().optional(),
      steps: z
        .array(
          z.object({
            n: z.string().optional(),
            title: z.string().optional(),
            desc: z.string().optional(),
          })
        )
        .optional(),
      moreHtml: z.string().optional(),
    })
    .optional(),
  support: z
    .object({
      title: z.string().optional(),
      intro: z.string().optional(),
      linkLabel: z.string().optional(),
      linkHref: z.string().optional(),
      links: z
        .array(
          z.object({
            href: z.string().optional(),
            title: z.string().optional(),
            desc: z.string().optional(),
          })
        )
        .optional(),
      cards: z
        .array(z.object({ title: z.string().optional(), bodyHtml: z.string().optional() }))
        .optional(),
    })
    .optional(),
  faq: z
    .object({
      title: z.string().optional(),
      intro: z.string().optional(),
      linkLabel: z.string().optional(),
      linkHref: z.string().optional(),
      items: z
        .array(z.object({ q: z.string().optional(), a: z.string().optional() }))
        .optional(),
      footerHtml: z.string().optional(),
    })
    .optional(),
  finalCta: z
    .object({
      title: z.string().optional(),
      desc: z.string().optional(),
      primaryLabel: z.string().optional(),
      primaryHref: z.string().optional(),
      secondaryLabel: z.string().optional(),
      secondaryHref: z.string().optional(),
      footerLinks: z
        .array(z.object({ label: z.string().optional(), href: z.string().optional() }))
        .optional(),
    })
    .optional(),
});

function withDefaults(raw: unknown): AboutContent {
  const parsed = AboutContentSchema.parse(raw);
  return applyAboutDefaults(parsed as Partial<AboutContent>);
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "about-us";
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) {
      return NextResponse.json({ ok: false, error: "Page not found" }, { status: 404 });
    }

    const about = await prisma.aboutPage.findUnique({
      where: { pageId: page.id },
      include: {
        stats: { orderBy: { sortOrder: "asc" } },
        heroChips: { orderBy: { sortOrder: "asc" } },
        heroInfoCards: { orderBy: { sortOrder: "asc" } },
        valuesItems: { orderBy: { sortOrder: "asc" } },
        verificationSteps: { orderBy: { sortOrder: "asc" } },
        supportLinks: { orderBy: { sortOrder: "asc" } },
        supportCards: { orderBy: { sortOrder: "asc" } },
        faqItems: { orderBy: { sortOrder: "asc" } },
        finalCtaLinks: { orderBy: { sortOrder: "asc" } },
      },
    });

    const data = about ? aboutContentFromDb(about) : parseAboutContent(page.contentHtml);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("GET /api/admin/about error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch About data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "about-us";
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) {
      return NextResponse.json({ ok: false, error: "Page not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = withDefaults(body);

    await prisma.$transaction(async (tx) => {
      const about = await tx.aboutPage.upsert({
        where: { pageId: page.id },
        create: {
          pageId: page.id,
          breadcrumbLabel: data.breadcrumbLabel,
          heroNoteHtml: data.heroExtras.noteHtml,
          storyTitle: data.story.title,
          storyIntro: data.story.intro,
          storyPrimaryLabel: data.story.primaryLabel,
          storyPrimaryHref: data.story.primaryHref,
          storySecondaryLabel: data.story.secondaryLabel,
          storySecondaryHref: data.story.secondaryHref,
          storyBodyHtml: data.story.bodyHtml,
          valuesTitle: data.values.title,
          valuesIntro: data.values.intro,
          valuesAssistTitle: data.values.assistTitle,
          valuesAssistDesc: data.values.assistDesc,
          valuesAssistCtaLabel: data.values.assistCtaLabel,
          valuesAssistCtaHref: data.values.assistCtaHref,
          verificationTitle: data.verification.title,
          verificationIntro: data.verification.intro,
          verificationSupportLabel: data.verification.supportLabel,
          verificationSupportHref: data.verification.supportHref,
          verificationMoreHtml: data.verification.moreHtml,
          supportTitle: data.support.title,
          supportIntro: data.support.intro,
          supportLinkLabel: data.support.linkLabel,
          supportLinkHref: data.support.linkHref,
          faqTitle: data.faq.title,
          faqIntro: data.faq.intro,
          faqLinkLabel: data.faq.linkLabel,
          faqLinkHref: data.faq.linkHref,
          faqFooterHtml: data.faq.footerHtml,
          finalCtaTitle: data.finalCta.title,
          finalCtaDesc: data.finalCta.desc,
          finalCtaPrimaryLabel: data.finalCta.primaryLabel,
          finalCtaPrimaryHref: data.finalCta.primaryHref,
          finalCtaSecondaryLabel: data.finalCta.secondaryLabel,
          finalCtaSecondaryHref: data.finalCta.secondaryHref,
        },
        update: {
          breadcrumbLabel: data.breadcrumbLabel,
          heroNoteHtml: data.heroExtras.noteHtml,
          storyTitle: data.story.title,
          storyIntro: data.story.intro,
          storyPrimaryLabel: data.story.primaryLabel,
          storyPrimaryHref: data.story.primaryHref,
          storySecondaryLabel: data.story.secondaryLabel,
          storySecondaryHref: data.story.secondaryHref,
          storyBodyHtml: data.story.bodyHtml,
          valuesTitle: data.values.title,
          valuesIntro: data.values.intro,
          valuesAssistTitle: data.values.assistTitle,
          valuesAssistDesc: data.values.assistDesc,
          valuesAssistCtaLabel: data.values.assistCtaLabel,
          valuesAssistCtaHref: data.values.assistCtaHref,
          verificationTitle: data.verification.title,
          verificationIntro: data.verification.intro,
          verificationSupportLabel: data.verification.supportLabel,
          verificationSupportHref: data.verification.supportHref,
          verificationMoreHtml: data.verification.moreHtml,
          supportTitle: data.support.title,
          supportIntro: data.support.intro,
          supportLinkLabel: data.support.linkLabel,
          supportLinkHref: data.support.linkHref,
          faqTitle: data.faq.title,
          faqIntro: data.faq.intro,
          faqLinkLabel: data.faq.linkLabel,
          faqLinkHref: data.faq.linkHref,
          faqFooterHtml: data.faq.footerHtml,
          finalCtaTitle: data.finalCta.title,
          finalCtaDesc: data.finalCta.desc,
          finalCtaPrimaryLabel: data.finalCta.primaryLabel,
          finalCtaPrimaryHref: data.finalCta.primaryHref,
          finalCtaSecondaryLabel: data.finalCta.secondaryLabel,
          finalCtaSecondaryHref: data.finalCta.secondaryHref,
        },
      });

      await tx.aboutHeroChip.deleteMany({ where: { aboutPageId: about.id } });
      if (data.heroExtras.chips.length) {
        await tx.aboutHeroChip.createMany({
          data: data.heroExtras.chips.map((label, idx) => ({
            aboutPageId: about.id,
            label,
            sortOrder: idx,
          })),
        });
      }

      await tx.aboutHeroInfoCard.deleteMany({ where: { aboutPageId: about.id } });
      if (data.heroExtras.infoCards.length) {
        await tx.aboutHeroInfoCard.createMany({
          data: data.heroExtras.infoCards.map((card, idx) => ({
            aboutPageId: about.id,
            title: card.title,
            bodyHtml: card.bodyHtml,
            sortOrder: idx,
          })),
        });
      }

      await tx.aboutStat.deleteMany({ where: { aboutPageId: about.id } });
      if (data.stats.length) {
        await tx.aboutStat.createMany({
          data: data.stats.map((stat, idx) => ({
            aboutPageId: about.id,
            label: stat.label,
            value: stat.value,
            sortOrder: idx,
          })),
        });
      }

      await tx.aboutValueItem.deleteMany({ where: { aboutPageId: about.id } });
      if (data.values.items.length) {
        await tx.aboutValueItem.createMany({
          data: data.values.items.map((item, idx) => ({
            aboutPageId: about.id,
            title: item.title,
            desc: item.desc,
            sortOrder: idx,
          })),
        });
      }

      await tx.aboutVerificationStep.deleteMany({ where: { aboutPageId: about.id } });
      if (data.verification.steps.length) {
        await tx.aboutVerificationStep.createMany({
          data: data.verification.steps.map((step, idx) => ({
            aboutPageId: about.id,
            stepLabel: step.n,
            title: step.title,
            desc: step.desc,
            sortOrder: idx,
          })),
        });
      }

      await tx.aboutSupportLink.deleteMany({ where: { aboutPageId: about.id } });
      if (data.support.links.length) {
        await tx.aboutSupportLink.createMany({
          data: data.support.links.map((link, idx) => ({
            aboutPageId: about.id,
            href: link.href,
            title: link.title,
            desc: link.desc,
            sortOrder: idx,
          })),
        });
      }

      await tx.aboutSupportCard.deleteMany({ where: { aboutPageId: about.id } });
      if (data.support.cards.length) {
        await tx.aboutSupportCard.createMany({
          data: data.support.cards.map((card, idx) => ({
            aboutPageId: about.id,
            title: card.title,
            bodyHtml: card.bodyHtml,
            sortOrder: idx,
          })),
        });
      }

      await tx.aboutFaqItem.deleteMany({ where: { aboutPageId: about.id } });
      if (data.faq.items.length) {
        await tx.aboutFaqItem.createMany({
          data: data.faq.items.map((item, idx) => ({
            aboutPageId: about.id,
            question: item.q,
            answer: item.a,
            sortOrder: idx,
          })),
        });
      }

      await tx.aboutFooterLink.deleteMany({ where: { aboutPageId: about.id } });
      if (data.finalCta.footerLinks.length) {
        await tx.aboutFooterLink.createMany({
          data: data.finalCta.footerLinks.map((link, idx) => ({
            aboutPageId: about.id,
            label: link.label,
            href: link.href,
            sortOrder: idx,
          })),
        });
      }
    });

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    console.error("PUT /api/admin/about error:", err);
    return NextResponse.json({ ok: false, error: "Failed to save About data" }, { status: 500 });
  }
}
