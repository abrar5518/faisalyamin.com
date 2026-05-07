import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const sitemapPaths = [
    "/sitemap.xml",
    "/sitemap/pages.xml",
    "/sitemap/products.xml",
    "/sitemap/categories.xml",
    "/sitemap/subcategories.xml",
    "/sitemap/blogs.xml",
    "/sitemap/authors.xml",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/account",
          "/cart",
          "/checkout",
          "/login",
          "/logout",
          "/signup",
          "/search",
          "/api",
          "/portal",
        ],
      },
    ],
    sitemap: sitemapPaths.map((path) => canonicalUrl(path)),
  };
}
