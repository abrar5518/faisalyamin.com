import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
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
          "/signup",
          "/api",
          "/portal",
        ],
      },
    ],
    sitemap: [
      "https://sahoolat.pk/sitemap.xml",
      "https://sahoolat.pk/sitemap/pages.xml",
      "https://sahoolat.pk/sitemap/products.xml",
      "https://sahoolat.pk/sitemap/categories.xml",
      "https://sahoolat.pk/sitemap/subcategories.xml",
      "https://sahoolat.pk/sitemap/blogs.xml",
      "https://sahoolat.pk/sitemap/authors.xml",
    ],
  };
}
