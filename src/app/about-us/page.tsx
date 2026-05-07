import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Schema from "@/components/seo/Schema";
import { breadcrumbSchema } from "@/components/seo/schemas";
import FaqSection from "@/components/FaqSection";
import { aboutContentFromDb, defaultAboutHero, parseAboutContent } from "@/lib/aboutContent";
import { normalizeSiteUrl } from "@/lib/siteUrl";

const baseUrl = normalizeSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "about-us" } }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);

  const baseUrlResolved = normalizeSiteUrl(settings?.siteUrl || baseUrl);
  const heroImage = page?.heroImage || defaultAboutHero.image;
  const ogImage = heroImage
    ? heroImage.startsWith("http")
      ? heroImage
      : baseUrlResolved
        ? `${baseUrlResolved}${heroImage.startsWith("/") ? "" : "/"}${heroImage}`
        : undefined
    : undefined;
  const canonical = baseUrlResolved ? `${baseUrlResolved}/about-us` : undefined;

  return {
    title: page?.metaTitle || "About",
    description:
      page?.metaDescription ||
      "Learn about LuxStore, our quality checks, and the premium shopping experience we build for Pakistan.",
    keywords: page?.metaKeywords || undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      title: page?.metaTitle || "About",
      description:
        page?.metaDescription ||
        "Learn about LuxStore, our quality checks, and the premium shopping experience we build for Pakistan.",
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: page?.metaTitle || "About",
      description:
        page?.metaDescription ||
        "Learn about LuxStore, our quality checks, and the premium shopping experience we build for Pakistan.",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
        {value}
      </p>
    </div>
  );
}

function ValueCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-900 text-xs font-semibold text-white">
          LX
        </span>
        <div>
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-semibold text-white">
          {n}
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function SupportLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">{desc}</p>
        </div>
        <span className="inline-flex items-center rounded-2xl bg-neutral-100 px-3 py-2 text-xs text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white">
          Open
        </span>
      </div>
    </Link>
  );
}

function InlineHtml({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function BlockHtml({ html, className }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default async function AboutPage() {
  const [pageRow, siteSettings] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "about-us" } }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);
  const aboutRow = pageRow
    ? await prisma.aboutPage.findUnique({
        where: { pageId: pageRow.id },
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
      })
    : null;
  const content = aboutRow
    ? aboutContentFromDb(aboutRow)
    : parseAboutContent(pageRow?.contentHtml);
  const hero = {
    badge: pageRow?.heroBadge || defaultAboutHero.badge,
    title: pageRow?.heroTitle || defaultAboutHero.title,
    subtitle: pageRow?.heroSubtitle || defaultAboutHero.subtitle,
    primaryLabel: pageRow?.heroPrimaryLabel || defaultAboutHero.primaryLabel,
    primaryHref: pageRow?.heroPrimaryHref || defaultAboutHero.primaryHref,
    secondaryLabel: pageRow?.heroSecondaryLabel || defaultAboutHero.secondaryLabel,
    secondaryHref: pageRow?.heroSecondaryHref || defaultAboutHero.secondaryHref,
    image: pageRow?.heroImage || defaultAboutHero.image,
    imageAlt: pageRow?.heroImageAlt || defaultAboutHero.imageAlt,
  };
  const baseUrlResolved = normalizeSiteUrl(siteSettings?.siteUrl || baseUrl);
  const breadcrumbItems = baseUrlResolved
    ? [
        { name: "Home", item: baseUrlResolved },
        { name: content.breadcrumbLabel, item: `${baseUrlResolved}/about-us` },
      ]
    : [];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {breadcrumbItems.length ? <Schema data={breadcrumbSchema(breadcrumbItems)} /> : null}
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link className="hover:text-neutral-900" href="/">
              Home
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">{content.breadcrumbLabel}</span>
          </div>
        </Container>
      </div>

      {/* Hero */}
      <section className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="grid gap-10 py-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                {hero.badge}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {hero.title}
              </h1>

              <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
                {hero.subtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {content.heroExtras.chips.map((x) => (
                  <span
                    key={x}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700"
                  >
                    {x}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={hero.primaryHref}
                  className="rounded-2xl bg-neutral-900 px-6 py-4 text-center text-sm font-medium text-white hover:bg-neutral-800"
                >
                  {hero.primaryLabel}
                </Link>
                <Link
                  href={hero.secondaryHref}
                  className="rounded-2xl border border-neutral-200 px-6 py-4 text-center text-sm font-medium hover:bg-neutral-50"
                >
                  {hero.secondaryLabel}
                </Link>
              </div>

              <p className="mt-4 text-xs text-neutral-500">
                <InlineHtml html={content.heroExtras.noteHtml} />
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
                <img
                  src={hero.image}
                  alt={hero.imageAlt}
                  className="h-[260px] w-full object-cover sm:h-[320px]"
                  loading="lazy"
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {content.heroExtras.infoCards.map((card) => (
                  <div key={card.title} className="rounded-3xl border border-neutral-200 bg-white p-5">
                    <p className="text-xs font-semibold">{card.title}</p>
                    <BlockHtml
                      html={card.bodyHtml}
                      className="mt-2 text-sm leading-relaxed text-neutral-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="bg-white py-12">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.stats.map((stat) => (
              <Stat key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </Container>
      </section>

      {/* Story (SEO long-form) */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-14">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-semibold tracking-tight">{content.story.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {content.story.intro}
              </p>
              <div className="mt-6 grid gap-2">
                <Link
                  href={content.story.primaryHref}
                  className="rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
                >
                  {content.story.primaryLabel}
                </Link>
                <Link
                  href={content.story.secondaryHref}
                  className="rounded-2xl border border-neutral-200 px-5 py-3 text-center text-sm font-medium hover:bg-neutral-50"
                >
                  {content.story.secondaryLabel}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <BlockHtml html={content.story.bodyHtml} className="rt-content" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="border-t border-neutral-200 bg-white py-14">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-semibold tracking-tight">{content.values.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {content.values.intro}
              </p>

              <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
                <p className="text-sm font-semibold">{content.values.assistTitle}</p>
                <p className="mt-2 text-sm text-neutral-600">
                  {content.values.assistDesc}
                </p>
                <Link
                  href={content.values.assistCtaHref}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  {content.values.assistCtaLabel}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {content.values.items.map((v) => (
                  <ValueCard key={v.title} title={v.title} desc={v.desc} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Verification process */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-14">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{content.verification.title}</h2>
              <p className="mt-2 text-sm text-neutral-600">
                {content.verification.intro}
              </p>
            </div>
            <Link href={content.verification.supportHref} className="text-sm font-medium text-neutral-900 hover:underline">
              {content.verification.supportLabel}
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.verification.steps.map((s) => (
              <StepCard key={s.n} n={s.n} title={s.title} desc={s.desc} />
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <p className="text-sm font-semibold">Want more details?</p>
            <BlockHtml html={content.verification.moreHtml} className="mt-2 text-sm text-neutral-600" />
          </div>
        </Container>
      </section>

      {/* Support hub */}
      <section className="border-t border-neutral-200 bg-white py-14">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{content.support.title}</h2>
              <p className="mt-2 text-sm text-neutral-600">
                {content.support.intro}
              </p>
            </div>
            <Link href={content.support.linkHref} className="text-sm font-medium text-neutral-900 hover:underline">
              {content.support.linkLabel}
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {content.support.links.map((x) => (
              <SupportLink key={x.href} href={x.href} title={x.title} desc={x.desc} />
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {content.support.cards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
                <p className="text-sm font-semibold">{card.title}</p>
                <BlockHtml html={card.bodyHtml} className="mt-2 text-sm text-neutral-600" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-14">
        <Container>
          <FaqSection
            items={content.faq.items}
            title={content.faq.title}
            intro={content.faq.intro}
            linkHref={content.faq.linkHref}
            linkLabel={content.faq.linkLabel}
            includeSchema
            variant="soft"
            footer={
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <p className="text-sm font-semibold">Still need help?</p>
                <BlockHtml html={content.faq.footerHtml} className="mt-2 text-sm text-neutral-600" />
              </div>
            }
          />
        </Container>
      </section>

      {/* Final CTA */}
      <section className="border-t border-neutral-200 bg-white py-14">
        <Container>
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {content.finalCta.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {content.finalCta.desc}
                </p>
              </div>
              <div className="lg:col-span-4">
                <div className="grid gap-3">
                  <Link
                    href={content.finalCta.primaryHref}
                    className="rounded-2xl bg-neutral-900 px-6 py-4 text-center text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    {content.finalCta.primaryLabel}
                  </Link>
                  <Link
                    href={content.finalCta.secondaryHref}
                    className="rounded-2xl border border-neutral-200 px-6 py-4 text-center text-sm font-medium hover:bg-neutral-50"
                  >
                    {content.finalCta.secondaryLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-neutral-500">
            {content.finalCta.footerLinks.map((link, idx) => (
              <span key={link.href}>
                <Link href={link.href} className="text-neutral-900 hover:underline">
                  {link.label}
                </Link>
                {idx < content.finalCta.footerLinks.length - 1 ? " / " : null}
              </span>
            ))}
          </p>
        </Container>
      </section>
    </div>
  );
}
