// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import CookieBanner from "./components/CookieBanner";
import NewsletterModal from "./components/NewsletterModal";
import CartProviderRoot from "./CartProviderRoot";

import { cookies, headers } from "next/headers";
import { detectLangFromHeader, normalizeLang, type Lang } from "@/i18n/lang";

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "KiloMystery | Mystery Box",
    template: "%s | KiloMystery",
  },

  description:
    "Mystery Box e Mystery Box al kg (Standard e Premium). Spedizione rapida e tracciata. Unboxing sorpresa e box da 1 kg a 10 kg.",

  // SEO multilingua (aiuta Google e anche molte AI a capire le versioni lingua)
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

  // Se hai già favicon e icone, puoi aggiungere qui:
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

async function getHtmlLang(): Promise<Lang> {
  // ✅ cookies() / headers() sono async
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

  // JSON-LD: Organization + WebSite + Store
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
        {/* Google Analytics + Consent Mode */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-8MG904NJ76"
        />

        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // 🌍 CONSENT MODE — default: tutto negato finché l'utente non accetta
            gtag('consent', 'default', {
              ad_storage: 'denied',
              analytics_storage: 'denied'
            });

            // Configurazione GA4
            gtag('config', 'G-8MG904NJ76');
          `}
        </Script>

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
