import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import CookieBanner from "../components/CookieBanner";
import NewsletterModalDelayed from "../components/NewsletterModalDelayed";
import CartProviderRoot from "../CartProviderRoot";
import Tracking from "../providers/Tracking";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const GA_ID = "G-YEY91KKVR2";
const TIKTOK_PIXEL_ID = "D625ESBC77U70QB7D710";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KiloMystery | Mystery Box",
    template: "%s | KiloMystery",
  },
  description:
    "Mystery Box e Mystery Box al kg (Standard e Premium). Spedizione rapida e tracciata.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="bg-[#0b0f14] text-white">
      <body className={`${inter.className} antialiased`}>
        {/* ✅ marker ROOT: se questo è null, NON stai usando app router/layout */}
        <div
          id="km-root-marker"
          data-build="ROOT-LAYOUT-v1"
          style={{ display: "none" }}
        />

        {/* =========================
            GOOGLE ANALYTICS
        ========================= */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;

            gtag('js', new Date());
            gtag('config','${GA_ID}',{
              send_page_view: true,
              linker:{
                domains:[
                  'www.kilomystery.com',
                  'kilomystery.com',
                  'shop.kilomystery.com',
                  'account.kilomystery.com'
                ],
                accept_incoming: true
              }
            });
          `}
        </Script>

        {/* =========================
            TRACKING (Client)
        ========================= */}
        <Tracking gaId={GA_ID} tiktokPixelId={TIKTOK_PIXEL_ID} />

        {/* =========================
            APP
        ========================= */}
        <CartProviderRoot>
          {children}
          <CookieBanner />
          <NewsletterModalDelayed />
        </CartProviderRoot>
      </body>
    </html>
  );
}
