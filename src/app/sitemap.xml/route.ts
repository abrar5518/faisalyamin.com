import { NextResponse } from "next/server";
import { buildSitemapIndex, getBaseUrl } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = await getBaseUrl();
  const urls = [
    `${baseUrl}/sitemap/pages.xml`,
    `${baseUrl}/sitemap/products.xml`,
    `${baseUrl}/sitemap/categories.xml`,
    `${baseUrl}/sitemap/subcategories.xml`,
    `${baseUrl}/sitemap/blogs.xml`,
    `${baseUrl}/sitemap/authors.xml`,
  ];

  const xml = buildSitemapIndex(urls.map((loc) => ({ loc })));
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
