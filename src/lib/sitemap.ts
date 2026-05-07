import { prisma } from "@/lib/prisma";
import { normalizeSiteUrl } from "@/lib/siteUrl";

export async function getBaseUrl() {
  const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
  return normalizeSiteUrl(settings?.siteUrl);
}

export function buildUrlset(
  urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }>
) {
  const entries = urls
    .map((u) => {
      const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "";
      const changefreq = u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : "";
      const priority = u.priority ? `<priority>${u.priority}</priority>` : "";
      return `<url><loc>${u.loc}</loc>${lastmod}${changefreq}${priority}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;
}

export function buildSitemapIndex(sitemaps: Array<{ loc: string; lastmod?: string }>) {
  const entries = sitemaps
    .map((s) => {
      const lastmod = s.lastmod ? `<lastmod>${s.lastmod}</lastmod>` : "";
      return `<sitemap><loc>${s.loc}</loc>${lastmod}</sitemap>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`;
}
