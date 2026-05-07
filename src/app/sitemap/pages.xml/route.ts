import { NextResponse } from "next/server";
import { buildUrlset, getBaseUrl } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = await getBaseUrl();
  const staticPages = [
    "/",
    "/shop",
    "/categories",
    "/deals",
    "/about-us",
    "/blog",
    "/contact",
    "/faq",
    "/privacy",
    "/reviews",
    "/returns",
    "/shipping",
    "/terms",
  ];

  const urls = staticPages.map((path) => ({
    loc: `${baseUrl}${path}`,
  }));

  const xml = buildUrlset(urls);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
