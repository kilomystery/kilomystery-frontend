// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import CookieBanner from "./components/CookieBanner";
import NewsletterModal from "./components/NewsletterModal";
import CartProviderRoot from "./CartProviderRoot";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "KiloMistery",
    template: "%s | KiloMistery",
  },
  description: "Mystery box al Kg. Spedizione rapida e tracciata.",
  openGraph: {
    title: "KiloMistery",
    description: "Mystery box al Kg. Spedizione rapida e tracciata.",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="bg-[#0b0f14] text-white">
      <body>
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-8MG904NJ76"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
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
