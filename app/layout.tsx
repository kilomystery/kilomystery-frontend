// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import CookieBanner from "./components/CookieBanner";
import NewsletterModal from "./components/NewsletterModal";
import CartProviderRoot from "./CartProviderRoot";

import { cookies, headers } from "next/headers";
import { detectLangFromHeader, normalizeLang, type Lang } from "@/i18n/lang";

import { GoogleAnalytics } from "@next/third-parties/google";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "KiloMystery | Mystery Box",
    template: "%s | KiloMystery",
  },

  description:
    "Mystery Box e Mystery Box al kg (Standard e Premium). Spedizione rapida e tracciata. Unboxing sorpresa e box da 1 kg a 10 kg.",

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
      "Mystery Box e Mystery Box al kg (Standard e Premium). Spedizione rapida e tracciata. Box da 1 kg a 10 kg.",
    type: "website",
    url: SITE_URL,
    siteName: "KiloMystery",
    images: [
      {
        url: `${SITE_URL}/og.jpg`,
        width: 1200,
        height: 630,
        alt: "KiloMystery - Mystery Box",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "KiloMystery | Mystery Box",
    description:
      "Mystery Box e Mystery Box al kg (Standard e Premium). Spedizione rapida e tracciata.",
    images: [`${SITE_URL}/og.jpg`],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

async function getHtmlLang(): Promise<Lang> {
  const c = (await cookies()).get("km_lang")?.value;
  if (c) return normalizeLang(c);

  const al = (await headers()).get("accept-language");
  return detectLangFromHeader(al);
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getHtmlLang();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "KiloMystery",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      sameAs: [
        "https://www.instagram.com/kilo.mystery/",
        "https://www.tiktok.com/@kilomystery",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "KiloMystery",
      url: SITE_URL,
      inLanguage: ["it", "en", "es", "fr", "de"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/${lang}/products`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Store",
      name: "KiloMystery",
      url: SITE_URL,
      image: `${SITE_URL}/logo.svg`,
      description:
        "Mystery Box e Mystery Box al kg (Standard e Premium). Box da 1 kg a 10 kg con unboxing sorpresa.",
      priceRange: "€€",
      makesOffer: [
        { "@type": "Offer", name: "Mystery Box Standard (1–10 kg)" },
        { "@type": "Offer", name: "Mystery Box Premium (1–10 kg)" },
      ],
    },
  ];

  return (
    <html lang={lang} className="bg-[#0b0f14] text-white">
      <body>
        {/* ✅ Consent Mode: default negato finché l'utente non accetta */}
        <Script id="ga-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            // Default: tutto negato finché l'utente non accetta dal CookieBanner
            gtag('consent', 'default', {
              ad_storage: 'denied',
              analytics_storage: 'denied',
              functionality_storage: 'denied',
              personalization_storage: 'denied',
              security_storage: 'granted',
              wait_for_update: 500
            });
          `}
        </Script>

        {/* ✅ GA4 via Next third-parties */}
        <GoogleAnalytics gaId="G-YEY91KKVR2" />

        {/* JSON-LD */}
        <Script
          id="jsonld-global"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <CartProviderRoot>
          {children}
          <CookieBanner />
          <NewsletterModal />
        </CartProviderRoot>
      </body>
    </html>
  );
}
