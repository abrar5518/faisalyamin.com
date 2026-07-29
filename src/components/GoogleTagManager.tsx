"use client";

import Script from "next/script";
import { isGoogleAnalyticsMeasurementId } from "@/lib/trackingSettings";

type GoogleTagManagerProps = {
  gtmId?: string;
};

export default function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  const trimmedGtmId = gtmId?.trim();

  if (!trimmedGtmId) {
    return null;
  }

  if (isGoogleAnalyticsMeasurementId(trimmedGtmId)) {
    return (
      <>
        <Script
          id="google-analytics-library"
          src={`https://www.googletagmanager.com/gtag/js?id=${trimmedGtmId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.__googleTrackingMode = 'ga4';
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            gtag('config', '${trimmedGtmId}');
          `}
        </Script>
      </>
    );
  }

  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          window.__googleTrackingMode = 'gtm';
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${trimmedGtmId}');
        `}
      </Script>
      <noscript>
        <iframe
          height="0"
          src={`https://www.googletagmanager.com/ns.html?id=${trimmedGtmId}`}
          style={{ display: "none", visibility: "hidden" }}
          width="0"
        />
      </noscript>
    </>
  );
}
