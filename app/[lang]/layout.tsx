import type { Metadata } from "next";

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
      <CartProviderRoot>
        {children}
        <CookieBanner />
        <NewsletterModalDelayed />
      </CartProviderRoot>
    </div>
  );
}
