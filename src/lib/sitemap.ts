import { prisma } from "@/lib/prisma";

export async function getBaseUrl() {
  const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
  const base = settings?.siteUrl || process.env.SITE_URL || "http://localhost:3000";
  return base.replace(/\/$/, "");
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
