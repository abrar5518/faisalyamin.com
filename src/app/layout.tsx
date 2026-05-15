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
import GoogleTagManager from "@/components/GoogleTagManager";
import SiteCustomScripts from "@/components/SiteCustomScripts";
import { normalizeSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

type LayoutSiteSettings = {
  siteName?: string | null;
  siteUrl?: string | null;
  logoUrl?: string | null;
  siteIconUrl?: string | null;
  facebookDomainVerification?: string | null;
  googleSiteVerification?: string | null;
  metaPixelIds?: string | null;
  googleTagManagerId?: string | null;
  microsoftClarityId?: string | null;
  customHeadScripts?: string | null;
  customBodyStartScripts?: string | null;
  customBodyEndScripts?: string | null;
};

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

function splitIds(value?: string | null) {
  return (value ?? "")
    .split(/[\s,]+/)
    .map((id) => id.trim())
    .filter(Boolean);
}

function getMetaPixelIds(value?: string | null) {
  return splitIds(value).filter((id) => /^\d{5,30}$/.test(id));
}

function getSafeToken(value?: string | null, pattern = /^[a-z0-9_-]+$/i) {
  const token = value?.trim();
  return token && pattern.test(token) ? token : "";
}

async function getSiteSettings() {
  return prisma.siteSettings.findFirst({
    orderBy: { id: "asc" },
  }) as Promise<LayoutSiteSettings | null>;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
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
      ...(settings?.facebookDomainVerification?.trim()
        ? { "facebook-domain-verification": settings.facebookDomainVerification.trim() }
        : {}),
      ...(settings?.googleSiteVerification?.trim()
        ? { "google-site-verification": settings.googleSiteVerification.trim() }
        : {}),
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const metaPixelIds = getMetaPixelIds(settings?.metaPixelIds);
  const googleTagManagerId = getSafeToken(settings?.googleTagManagerId, /^GTM-[A-Z0-9]+$/i);
  const microsoftClarityId = getSafeToken(settings?.microsoftClarityId);
  const customHeadScripts = settings?.customHeadScripts?.trim();
  const customBodyStartScripts = settings?.customBodyStartScripts?.trim();
  const customBodyEndScripts = settings?.customBodyEndScripts?.trim();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <MicrosoftClarity clarityId={microsoftClarityId} />
      </head>
      <body className="min-h-screen bg-brand-bg text-brand-text antialiased">
        <GoogleTagManager gtmId={googleTagManagerId} />
        <MetaPixel pixelIds={metaPixelIds} />
        <SiteCustomScripts
          bodyEndHtml={customBodyEndScripts}
          bodyStartHtml={customBodyStartScripts}
          headHtml={customHeadScripts}
        />
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
