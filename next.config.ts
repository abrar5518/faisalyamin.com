import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: "https", hostname: "cantbazar.store" },
      { protocol: "https", hostname: "www.cantbazar.store" },
      { protocol: "http", hostname: "localhost" },
      {protocol: "https", hostname: "images.unsplash.com"}
    ],
  },
};

export default nextConfig;
