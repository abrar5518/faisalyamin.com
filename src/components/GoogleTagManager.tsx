"use client";

import Script from "next/script";

type GoogleTagManagerProps = {
  gtmId?: string;
};

export default function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  const trimmedGtmId = gtmId?.trim();

  if (!trimmedGtmId) {
    return null;
  }

  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
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
