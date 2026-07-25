import type { NextConfig } from "next";

const siteHostname = (() => {
  try {
    return new URL(process.env.SITE_URL || "").hostname;
  } catch {
    return "";
  }
})();

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "60mb",
  },
  images: {
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/favicon.ico" },
    ],
    qualities: [70, 75, 80, 85, 90, 95],
    unoptimized: false,
    remotePatterns: [
      { protocol: "https", hostname: "sahoolat.pk" },
      { protocol: "https", hostname: "www.sahoolat.pk" },
      ...(siteHostname
        ? [
            { protocol: "https" as const, hostname: siteHostname },
          ]
        : []),
      { protocol: "http", hostname: "localhost" },
      {protocol: "https", hostname: "images.unsplash.com"}
    ],
  },
};

export default nextConfig;
