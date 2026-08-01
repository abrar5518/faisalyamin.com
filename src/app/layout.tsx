// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CartProvider } from "@/components/cart/CartProvider";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import RichTextTableEnhancer from "@/components/RichTextTableEnhancer";
import { prisma } from "@/lib/prisma";
import MetaPixel from "@/components/MetaPixel";
import MicrosoftClarity from "@/components/MicrosoftClarity";
import GoogleTagManager from "@/components/GoogleTagManager";
import SiteCustomScripts from "@/components/SiteCustomScripts";
import { GlobalCopyProvider } from "@/components/GlobalCopyProvider";
import { normalizeSiteUrl } from "@/lib/siteUrl";
import { parseCatalogSettings } from "@/lib/catalogSettings";
import {
  getTrackingStatus,
  sanitizeGoogleTagManagerId,
  sanitizeCustomScriptHtml,
  sanitizeMetaPixelIds,
  sanitizeMicrosoftClarityId,
} from "@/lib/trackingSettings";
import { parseThemeSettings, themeSettingsToCssVars } from "@/lib/themeSettings";

export const dynamic = "force-dynamic";

type LayoutSiteSettings = {
  siteName?: string | null;
  siteUrl?: string | null;
  logoUrl?: string | null;
  siteIconUrl?: string | null;
  facebookDomainVerification?: string | null;
  googleSiteVerification?: string | null;
  metaPixelEnabled?: boolean | null;
  metaPixelIds?: string | null;
  googleTagManagerEnabled?: boolean | null;
  googleTagManagerId?: string | null;
  microsoftClarityEnabled?: boolean | null;
  microsoftClarityId?: string | null;
  customHeadScriptsEnabled?: boolean | null;
  customHeadScripts?: string | null;
  customBodyStartScriptsEnabled?: boolean | null;
  customBodyStartScripts?: string | null;
  customBodyEndScriptsEnabled?: boolean | null;
  customBodyEndScripts?: string | null;
  globalCopy?: string | null;
  themeSettings?: string | null;
  catalogSettings?: string | null;
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
      "Pakistan-based online shopping store with secure checkout, clear returns, and delivery across Pakistan.",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
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
      title: `${siteName} | Online Shopping Pakistan`,
      description:
        "Pakistan-based online shopping store with secure checkout, clear returns, and delivery across Pakistan.",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: `${siteName} | Online Shopping Pakistan`,
      description:
        "Pakistan-based online shopping store with secure checkout, clear returns, and delivery across Pakistan.",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const metaPixelIds = getTrackingStatus(settings?.metaPixelEnabled)
    ? sanitizeMetaPixelIds(settings?.metaPixelIds)
    : [];
  const googleTagManagerId = getTrackingStatus(settings?.googleTagManagerEnabled)
    ? sanitizeGoogleTagManagerId(settings?.googleTagManagerId)
    : "";
  const microsoftClarityId = getTrackingStatus(settings?.microsoftClarityEnabled)
    ? sanitizeMicrosoftClarityId(settings?.microsoftClarityId)
    : "";
  const customHeadScripts = getTrackingStatus(settings?.customHeadScriptsEnabled)
    ? sanitizeCustomScriptHtml(settings?.customHeadScripts)
    : "";
  const customBodyStartScripts = getTrackingStatus(settings?.customBodyStartScriptsEnabled)
    ? sanitizeCustomScriptHtml(settings?.customBodyStartScripts)
    : "";
  const customBodyEndScripts = getTrackingStatus(settings?.customBodyEndScriptsEnabled)
    ? sanitizeCustomScriptHtml(settings?.customBodyEndScripts)
    : "";
  const themeSettings = parseThemeSettings(settings?.themeSettings);
  const themeStyle = themeSettingsToCssVars(themeSettings);
  const catalogSettings = parseCatalogSettings(settings?.catalogSettings);

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <MicrosoftClarity clarityId={microsoftClarityId} />
      </head>
      <body
        className="min-h-screen bg-brand-bg text-brand-text antialiased"
        data-mobile-card-layout={catalogSettings.mobileProductCardLayout}
        style={themeStyle}
      >
        <GoogleTagManager gtmId={googleTagManagerId} />
        <MetaPixel pixelIds={metaPixelIds} />
        <SiteCustomScripts
          bodyEndHtml={customBodyEndScripts}
          bodyStartHtml={customBodyStartScripts}
          headHtml={customHeadScripts}
        />
        <GlobalCopyProvider initialGlobalCopy={settings?.globalCopy}>
          <CartProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <WhatsAppFloatButton />
            <RichTextTableEnhancer />
          </CartProvider>
        </GlobalCopyProvider>
      </body>
    </html>
  );
}
