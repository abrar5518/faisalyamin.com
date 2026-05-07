import { NextResponse } from "next/server";
import { canonicalUrl } from "@/lib/siteUrl";

export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${canonicalUrl("/sitemap.xml")}`,
    "",
    "# Allowed content",
    "Allow: /product/",
    "Allow: /categories/",
    "Allow: /blog/",
    "",
    "# Disallowed",
    "Disallow: /admin/",
    "Disallow: /account/",
    "Disallow: /cart/",
    "Disallow: /checkout/",
    "Disallow: /login/",
    "Disallow: /logout/",
    "Disallow: /portal/",
    "Disallow: /search/",
    "Disallow: /api/",
    "",
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
