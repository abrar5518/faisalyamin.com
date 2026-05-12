// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CartProvider } from "@/components/cart/CartProvider";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { prisma } from "@/lib/prisma";
import MetaPixel from "@/components/MetaPixel";
import MicrosoftClarity from "@/components/MicrosoftClarity";
import { normalizeSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "863606865641935";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
  const siteName = settings?.siteName?.trim() || "Sahoolat";
  const baseUrlResolved = normalizeSiteUrl(settings?.siteUrl);
  const metadataBase = (() => {
    if (!baseUrlResolved) return undefined;
    try {
      return new URL(baseUrlResolved);
    } catch {
      return undefined;
    }
  })();
  const ogImageRaw = settings?.logoUrl || settings?.siteIconUrl || "";
  const ogImage = ogImageRaw
    ? ogImageRaw.startsWith("http")
      ? ogImageRaw
      : metadataBase
        ? `${metadataBase.toString().replace(/\/$/, "")}${ogImageRaw.startsWith("/") ? "" : "/"}${ogImageRaw}`
        : undefined
    : undefined;

  return {
    metadataBase,
    title: siteName,
    description:
      "Pakistan-based online shopping store for water bottles with secure checkout, clear returns, and delivery across Pakistan.",
    robots: { index: true, follow: true },
    other: {
      "facebook-domain-verification": "yf46xy2cxecanwy1wjjeigq6v3uj9l",
    },
    icons: settings?.siteIconUrl ? { icon: settings.siteIconUrl } : undefined,
    openGraph: {
      type: "website",
      siteName,
      url: baseUrlResolved || undefined,
      title: `${siteName} | Water Bottles Pakistan`,
      description:
        "Pakistan-based online shopping store for water bottles with secure checkout, clear returns, and delivery across Pakistan.",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: `${siteName} | Water Bottles Pakistan`,
      description:
        "Pakistan-based online shopping store for water bottles with secure checkout, clear returns, and delivery across Pakistan.",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <MicrosoftClarity />
      </head>
      <body className="min-h-screen bg-brand-bg text-brand-text antialiased">
        <MetaPixel pixelId={metaPixelId} />
        <CartProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <WhatsAppFloatButton />
        </CartProvider>
      </body>
    </html>
  );
}
