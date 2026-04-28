// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CartProvider } from "@/components/cart/CartProvider";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { prisma } from "@/lib/prisma";
import Script from "next/script";

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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
  const siteName = settings?.siteName?.trim() || "LuxStore";
  const rawBaseUrl = (settings?.siteUrl || process.env.SITE_URL || "").trim();
  const baseUrlResolved = rawBaseUrl
    ? rawBaseUrl.startsWith("http")
      ? rawBaseUrl.replace(/\/$/, "")
      : `https://${rawBaseUrl.replace(/\/$/, "")}`
    : "";
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
    title: { default: `${siteName} | Premium eCommerce`, template: `%s | ${siteName}` },
    description:
      "Premium eCommerce store with curated products, secure checkout, and fast delivery.",
    robots: { index: false, follow: false },
    icons: settings?.siteIconUrl ? { icon: settings.siteIconUrl } : undefined,
    openGraph: {
      type: "website",
      siteName,
      url: baseUrlResolved || undefined,
      title: `${siteName} | Premium eCommerce`,
      description:
        "Premium eCommerce store with curated products, secure checkout, and fast delivery.",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: `${siteName} | Premium eCommerce`,
      description:
        "Premium eCommerce store with curated products, secure checkout, and fast delivery.",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pixelId = "863606865641935";
  
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-brand-bg text-brand-text antialiased">

       {/* 🔥 META PIXEL START */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `}
        </Script>

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          />
        </noscript>
        {/* 🔥 META PIXEL END */}


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
