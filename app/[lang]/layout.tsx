import type { Metadata } from "next";
import Script from "next/script";

import CookieBanner from "../components/CookieBanner";
import NewsletterModalDelayed from "../components/NewsletterModalDelayed";
import CartProviderRoot from "../CartProviderRoot";

import { cookies, headers } from "next/headers";
import { detectLangFromHeader, normalizeLang, type Lang } from "@/i18n/lang";

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
   GA4 (DEVE combaciare con Shopify App Google)
========================= */
const GA_MEASUREMENT_ID = "G-YEY91KKVR2";

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

export default async function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getHtmlLang();

  return (
    <>
      {/* CONSENT STUB: deve esistere PRIMA di hydration su /it /en /... */}
      <Script
        id="km-consent-stub"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  window.__kmPendingConsentChoice = window.__kmPendingConsentChoice || null;

  // Funzione che il tuo CookieBanner chiamerà per applicare il consenso
  window.kmApplyConsent =
    window.kmApplyConsent ||
    function(choice){
      window.__kmPendingConsentChoice =
        typeof choice === "string" ? choice : null;
    };

  window.__kmStubLoaded = true;
})();
          `.trim(),
        }}
      />

      {/* GA4: carica gtag.js (ID corretto) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />

      {/* GA4: init + Consent Mode v2 default denied + cross-domain verso Shopify */}
      <Script
        id="km-ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Consent Mode v2 - default denied finché non accetti
gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});

gtag('js', new Date());

// GA4 config + cross-domain (frontend -> shop.kilomystery.com)
gtag('config', '${GA_MEASUREMENT_ID}', {
  linker: {
    domains: [
      'kilomystery.com',
      'www.kilomystery.com',
      'shop.kilomystery.com'
    ]
  }
});
          `.trim(),
        }}
      />

      <div
        className={`${inter.className} antialiased`}
        data-lang-layout="1"
        data-lang={lang}
      >
        <CartProviderRoot>
          {children}
          <CookieBanner />
          <NewsletterModalDelayed />
        </CartProviderRoot>
      </div>
    </>
  );
}