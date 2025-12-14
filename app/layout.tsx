// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import CookieBanner from "./components/CookieBanner";
import NewsletterModal from "./components/NewsletterModal";
import CartProviderRoot from "./CartProviderRoot";

import { cookies, headers } from "next/headers";
import { detectLangFromHeader, normalizeLang, type Lang } from "@/i18n/lang";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "KiloMystery",
    template: "%s | KiloMystery",
  },
  description: "Mystery box al Kg. Spedizione rapida e tracciata.",
  openGraph: {
    title: "KiloMystery",
    description: "Mystery box al Kg. Spedizione rapida e tracciata.",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },
};

async function getHtmlLang(): Promise<Lang> {
  // ✅ Next 16: cookies() / headers() sono async
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

        <CartProviderRoot>
          {children}
          <CookieBanner />
          <NewsletterModal />
        </CartProviderRoot>
      </body>
    </html>
  );
}
