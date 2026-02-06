import type { Metadata } from "next";
import Script from "next/script";

import CookieBanner from "../components/CookieBanner";
import NewsletterModalDelayed from "../components/NewsletterModalDelayed";
import CartProviderRoot from "../CartProviderRoot";

import { cookies, headers } from "next/headers";
import { detectLangFromHeader, normalizeLang, type Lang } from "@/i18n/lang";
import { TRACKING_IDS } from "@/app/config/tracking";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com"
).replace(/\/$/, "");

/* =========================
   Metadata
========================= */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "KiloMystery | Mystery Box", template: "%s | KiloMystery" },
  description:
    "Mystery Box e Mystery Box al kg (Standard e Premium). Spedizione rapida e tracciata.",
  alternates: {
    canonical: "/",
    languages: { it: "/it", en: "/en", es: "/es", fr: "/fr", de: "/de" },
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

export default async function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getHtmlLang();

  return (
    <div className={`${inter.className} antialiased`} data-lang-layout="1">
      {/* 1) Consent Mode DEFAULT - PRIMA di tutto (legge cookie km_cookie_consent) */}
      <Script id="km-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;

          function getCookie(name){
            var match = document.cookie
              .split('; ')
              .find(function(r){ return r.indexOf(name + '=') === 0; });
            return match ? decodeURIComponent(match.split('=')[1] || '') : '';
          }

          var consent = getCookie('km_cookie_consent');
          var granted = (consent === 'accept');

          // Consent mode default
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

      {/* 2) Loader GA */}
      {TRACKING_IDS.GA ? (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${TRACKING_IDS.GA}`}
          strategy="afterInteractive"
        />
      ) : null}

      {/* 3) Config GA - UNA SOLA VOLTA */}
      {TRACKING_IDS.GA ? (
        <Script id="km-ga-config" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;

          gtag('js', new Date());
          gtag('config','${TRACKING_IDS.GA}',{
            send_page_view: false,
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
      ) : null}

      <CartProviderRoot>
        {children}
        <CookieBanner />
        <NewsletterModalDelayed />
      </CartProviderRoot>
    </div>
  );
}
