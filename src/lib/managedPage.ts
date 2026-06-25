import type { Metadata } from "next";
import type { Page } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeSiteUrl } from "@/lib/siteUrl";

type ManagedPageMetadataFallback = {
  title: string;
  description?: string;
  keywords?: string | string[];
};

export type ManagedPageRecord = Pick<
  Page,
  | "title"
  | "slug"
  | "contentHtml"
  | "metaTitle"
  | "metaDescription"
  | "metaKeywords"
  | "shortDescription"
  | "featureImage"
  | "heroTitle"
  | "heroSubtitle"
  | "heroImage"
>;

export function hasManagedPageBody(page?: Pick<Page, "contentHtml"> | null) {
  if (!page) return false;
  if (page.contentHtml?.trim()) return true;
  return false;
}

export async function getManagedPage(slug: string) {
  return prisma.page.findUnique({ where: { slug } });
}

export async function buildManagedPageMetadata(
  slug: string,
  fallback: ManagedPageMetadataFallback
): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    getManagedPage(slug),
    prisma.siteSettings.findFirst({ orderBy: { id: "asc" } }),
  ]);

  const baseUrl = normalizeSiteUrl(settings?.siteUrl);
  const canonical = baseUrl ? `${baseUrl}/${slug}` : undefined;
  const image = page?.featureImage || page?.heroImage || undefined;
  const ogImage =
    image && baseUrl && !image.startsWith("http")
      ? `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`
      : image;
  const title = page?.metaTitle || page?.title || fallback.title;
  const description =
    page?.metaDescription || page?.shortDescription || fallback.description || undefined;

  return {
    title,
    description,
    keywords: page?.metaKeywords || fallback.keywords || undefined,
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
