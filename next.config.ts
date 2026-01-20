import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: "https", hostname: "sahoolat.pk" },
      { protocol: "https", hostname: "www.sahoolat.pk" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
