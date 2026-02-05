import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import CookieBanner from "./components/CookieBanner";
import NewsletterModalDelayed from "./components/NewsletterModalDelayed";
import CartProviderRoot from "./CartProviderRoot";

import { cookies, headers } from "next/headers";
import { detectLangFromHeader, normalizeLang, type Lang } from "@/i18n/lang";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const GA_ID = "G-YEY91KKVR2";

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

        {/* =========================
            GA + TIKTOK CONSENT DEFAULT
        ========================= */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;

            // Cookie: km_cookie_consent=accept|reject
            var m = document.cookie.match(/(?:^|;\\s*)km_cookie_consent=([^;]+)/);
            var consent = m ? decodeURIComponent(m[1]) : "";
            var granted = consent === "accept";

            // Google Consent
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

            // TikTok Consent
            window.__tiktokConsentGranted = granted;
          `}
        </Script>

        {/* =========================
            GOOGLE ANALYTICS
        ========================= */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />

        <Script id="ga-config" strategy="afterInteractive">
          {`
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
            TIKTOK PIXEL (CONSENT AWARE)
        ========================= */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            if (window.__tiktokConsentGranted) {

              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;
                var ttq=w[t]=w[t]||[];

                ttq.methods=[
                  "page","track","identify","instances","debug","on","off",
                  "once","ready","alias","group","enableCookie","disableCookie",
                  "holdConsent","revokeConsent","grantConsent"
                ];

                ttq.setAndDefer=function(t,e){
                  t[e]=function(){
                    t.push([e].concat(Array.prototype.slice.call(arguments,0)))
                  }
                };

                for(var i=0;i<ttq.methods.length;i++){
                  ttq.setAndDefer(ttq,ttq.methods[i]);
                }

                ttq.instance=function(t){
                  for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++){
                    ttq.setAndDefer(e,ttq.methods[n]);
                  }
                  return e;
                };

                ttq.load=function(e,n){
                  var r="https://analytics.tiktok.com/i18n/pixel/events.js",
                      o=n&&n.partner;

                  ttq._i=ttq._i||{};
                  ttq._i[e]=[];
                  ttq._i[e]._u=r;
                  ttq._t=ttq._t||{};
                  ttq._t[e]=+new Date;
                  ttq._o=ttq._o||{};
                  ttq._o[e]=n||{};

                  n=document.createElement("script");
                  n.type="text/javascript";
                  n.async=!0;
                  n.src=r+"?sdkid="+e+"&lib="+t;

                  e=document.getElementsByTagName("script")[0];
                  e.parentNode.insertBefore(n,e);
                };

                ttq.load('D625ESBC77U70QB7D710');
                ttq.page();

              }(window, document, 'ttq');

            }
          `}
        </Script>

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
