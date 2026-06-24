import type { NextConfig } from "next";
import redirects from "./public/redirects.json";

const nextConfig: NextConfig = {
  async redirects() {
    return redirects;
  },
  images: {
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/favicon.ico" },
    ],
    qualities: [75],
    unoptimized: false,
    remotePatterns: [
      { protocol: "https", hostname: "sahoolat.pk" },
      { protocol: "https", hostname: "www.sahoolat.pk" },
      { protocol: "http", hostname: "localhost" },
      {protocol: "https", hostname: "images.unsplash.com"}
    ],
  },
};

export default nextConfig;
