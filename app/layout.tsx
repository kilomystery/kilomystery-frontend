import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import CookieBanner from "./components/CookieBanner";
import NewsletterModalDelayed from "./components/NewsletterModalDelayed";
import CartProviderRoot from "./CartProviderRoot";

import { cookies, headers } from "next/headers";
import { detectLangFromHeader, normalizeLang, type Lang } from "@/i18n/lang";

import { Inter } from "next/font/google";
import Tracking from "./providers/Tracking";

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

/* =========================
   Metadata
========================= */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KiloMystery | Mystery Box",
    template: "%s | KiloMystery",
  },
  description:
    "Mystery Box e Mystery Box al kg (Standard e Premium). Spedizione rapida e tracciata.",
  alternates: {
    canonical: "/",
    languages: {
      it: "/it",
      en: "/en",
      es: "/es",
      fr: "/fr",
      de: "/de",
    },
  },
  openGraph: {
    title: "KiloMystery | Mystery Box",
    description:
      "Mystery Box e Mystery Box al kg (Standard e Premium). Spedizione rapida e tracciata.",
    type: "website",
    url: SITE_URL,
    siteName: "KiloMystery",
    images: [
      {
        url: `${SITE_URL}/og.jpg`,
        width: 1200,
        height: 630,
        alt: "KiloMystery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KiloMystery | Mystery Box",
    description: "Mystery Box e Mystery Box al kg (Standard e Premium).",
    images: [`${SITE_URL}/og.jpg`],
  },
};

/* =========================
   Lang
========================= */
async function getHtmlLang(): Promise<Lang> {
  const c = (await cookies()).get("km_lang")?.value;
  if (c) return normalizeLang(c);

  const al = (await headers()).get("accept-language");
  return detectLangFromHeader(al);
}

/* =========================
   Layout
========================= */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getHtmlLang();

  return (
    <html lang={lang} className="bg-[#0b0f14] text-white">
      <body className={`${inter.className} antialiased`}>
        {/* Debug marker */}
        <div
          id="km-build-marker"
          data-build="tiktok-tracking-v2"
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
            - TikTok Pixel injection + consent bridge
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
