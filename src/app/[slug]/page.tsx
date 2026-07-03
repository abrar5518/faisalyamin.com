import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { withImageParams } from "@/lib/image";
import { prisma } from "@/lib/prisma";
import { normalizeSiteUrl } from "@/lib/siteUrl";
import { withResponsiveTables } from "@/lib/richText";

type PublicPageProps = {
  params: Promise<{ slug: string }>;
};

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}

export async function generateMetadata({ params }: PublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    prisma.page.findUnique({ where: { slug } }),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);

  if (!page) return {};

  const baseUrl = normalizeSiteUrl(settings?.siteUrl);
  const canonical = baseUrl ? `${baseUrl}/${page.slug}` : undefined;
  const image = page.featureImage || undefined;
  const ogImage =
    image && baseUrl && !image.startsWith("http")
      ? `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`
      : image;

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.shortDescription || undefined,
    keywords: page.metaKeywords || undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.shortDescription || undefined,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.shortDescription || undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });

  if (!page) notFound();

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container>
          <div className="flex h-10 items-center gap-2 text-xs text-neutral-600">
            <Link href="/" className="hover:text-neutral-900">
              Home
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900">{page.title}</span>
          </div>
        </Container>
      </div>

      <section className="border-b border-neutral-200 bg-white py-10 sm:py-12">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              {page.title}
            </h1>
            {page.shortDescription ? (
              <p className="mt-4 text-base leading-7 text-neutral-600">{page.shortDescription}</p>
            ) : null}
          </div>
        </Container>
      </section>

      {page.featureImage ? (
        <section className="bg-white pt-8">
          <Container>
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
              <Image
                src={withImageParams(page.featureImage, "auto=format&fit=crop&w=1400&q=85")}
                alt={page.featureImageAlt || page.title}
                width={1400}
                height={700}
                className="h-72 w-full object-cover sm:h-96"
              />
            </div>
          </Container>
        </section>
      ) : null}

      {page.contentHtml ? (
        <section className="bg-white py-10 sm:py-12">
          <Container>
            <div
              className="rt-content rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8"
              dangerouslySetInnerHTML={{ __html: withResponsiveTables(page.contentHtml) }}
            />
          </Container>
        </section>
      ) : null}
    </main>
  );
}
