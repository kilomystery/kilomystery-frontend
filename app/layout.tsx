import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import CookieBanner from "./components/CookieBanner";
import NewsletterModal from "./components/NewsletterModal";
import CartProviderRoot from "./CartProviderRoot";

import { cookies, headers } from "next/headers";
import { detectLangFromHeader, normalizeLang, type Lang } from "@/i18n/lang";

const GA_ID = "G-YEY91KKVR2";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

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
    description:
      "Mystery Box e Mystery Box al kg (Standard e Premium).",
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
      <body>

        {/* =========================
            GA INIT + CONSENT
        ========================= */}
        <Script id="ga-init-consent" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;

            function getCookie(name){
              var match = document.cookie
                .split('; ')
                .find(function(r){
                  return r.indexOf(name + '=') === 0;
                });

              return match
                ? decodeURIComponent(match.split('=')[1] || '')
                : '';
            }

            var consent = getCookie('km_cookie_consent');
            var granted = (consent === 'accept');

            gtag('consent','default',{
              analytics_storage: granted ? 'granted' : 'denied',
              ad_storage: granted ? 'granted' : 'denied',
              ad_user_data: granted ? 'granted' : 'denied',
              ad_personalization: granted ? 'granted' : 'denied',
              functionality_storage: granted ? 'granted' : 'denied',
              personalization_storage: granted ? 'granted' : 'denied',
              security_storage: 'granted',
              wait_for_update: 500
            });
          `}
        </Script>

        {/* =========================
            Load gtag.js
        ========================= */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />

        {/* =========================
            GA CONFIG + CROSS DOMAIN
        ========================= */}
        <Script id="ga-config" strategy="afterInteractive">
          {`
            gtag('js', new Date());

            gtag('config','${GA_ID}',{
              linker:{
                domains:[
                'www.kilomystery.com',
                  'kilomystery.com',
                  'shop.kilomystery.com',
                  'account.kilomystery.com'
                ]
              }
            });
          `}
        </Script>

        {/* =========================
            APP
        ========================= */}
        <CartProviderRoot>
          {children}
          <CookieBanner />
          <NewsletterModal />
        </CartProviderRoot>

      </body>
    </html>
  );
}
