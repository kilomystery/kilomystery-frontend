import type { Metadata } from "next";
import Script from "next/script";

import CookieBanner from "../components/CookieBanner";
import NewsletterModalDelayed from "../components/NewsletterModalDelayed";
import CartProviderRoot from "../CartProviderRoot";
import Tracking from "../providers/Tracking";

import { cookies, headers } from "next/headers";
import { detectLangFromHeader, normalizeLang, type Lang } from "@/i18n/lang";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const GA_ID = "G-YEY91KKVR2";
const TIKTOK_PIXEL_ID = "D625ESBC77U70QB7D710";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com"
).replace(/\/$/, "");

/* =========================
   Metadata (per route lang)
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
      { url: `${SITE_URL}/og.jpg`, width: 1200, height: 630, alt: "KiloMystery" },
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
export default async function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getHtmlLang();

  return (
    <div className={`${inter.className} antialiased`} data-lang-layout="1">
      {/* Marker (DEVE comparire nel DOM) */}
      <div
        id="km-build-marker"
        data-build="tiktok-tracking-v2"
        style={{ display: "none" }}
      />

      {/* Google tag loader */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      {/* GA init */}
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

      {/* Tracking client (TikTok injection + bridge) */}
      <Tracking gaId={GA_ID} tiktokPixelId={TIKTOK_PIXEL_ID} />

      <CartProviderRoot>
        {children}
        <CookieBanner />
        <NewsletterModalDelayed />
      </CartProviderRoot>
    </div>
  );
}
