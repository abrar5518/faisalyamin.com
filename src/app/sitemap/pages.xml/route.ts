import { NextResponse } from "next/server";
import { buildUrlset, getBaseUrl } from "@/lib/sitemap";

export async function GET() {
  const baseUrl = await getBaseUrl();
  const staticPages = [
    "/",
    "/shop",
    "/categories",
    "/deals",
    "/pre-owned",
    "/blog",
    "/contact",
    "/faq",
    "/privacy",
    "/returns",
    "/shipping",
  ];

  const urls = staticPages.map((path) => ({
    loc: `${baseUrl}${path}`,
  }));

  const xml = buildUrlset(urls);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
