"use client";

import Script from "next/script";

const GA_ID = "G-YEY91KKVR2";

export default function Tracking() {
  return (
    <>
      {/* GA */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script src="/ga-init.js" strategy="afterInteractive" />

      {/* TikTok (NO INLINE) */}
      <Script src="/tiktok-init.js" strategy="afterInteractive" />
    </>
  );
}
