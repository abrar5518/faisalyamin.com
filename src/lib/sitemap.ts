import { prisma } from "@/lib/prisma";
import { normalizeSiteUrl } from "@/lib/siteUrl";

export async function getBaseUrl() {
  const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
  return normalizeSiteUrl(settings?.siteUrl);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type SitemapImage = {
  loc: string;
  title?: string;
  caption?: string;
};

export function buildUrlset(
  urls: Array<{
    loc: string;
    lastmod?: string;
    changefreq?: string;
    priority?: string;
    images?: SitemapImage[];
  }>
) {
  const entries = urls
    .map((u) => {
      const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "";
      const changefreq = u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : "";
      const priority = u.priority ? `<priority>${u.priority}</priority>` : "";
      const images = (u.images ?? [])
        .filter((image) => image.loc)
        .map(
          (image) =>
            `<image:image><image:loc>${escapeXml(image.loc)}</image:loc>` +
            (image.title ? `<image:title>${escapeXml(image.title)}</image:title>` : "") +
            (image.caption ? `<image:caption>${escapeXml(image.caption)}</image:caption>` : "") +
            `</image:image>`
        )
        .join("");
      return `<url><loc>${escapeXml(u.loc)}</loc>${lastmod}${changefreq}${priority}${images}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries}</urlset>`;
}

export function buildSitemapIndex(sitemaps: Array<{ loc: string; lastmod?: string }>) {
  const entries = sitemaps
    .map((s) => {
      const lastmod = s.lastmod ? `<lastmod>${s.lastmod}</lastmod>` : "";
      return `<sitemap><loc>${escapeXml(s.loc)}</loc>${lastmod}</sitemap>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`;
}
