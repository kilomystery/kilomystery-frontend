import type { Metadata } from "next";
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
  icons: { icon: "/favicon.ico" },
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
        <CartProviderRoot>
          {children}
          <CookieBanner />
          <NewsletterModal />
        </CartProviderRoot>
      </body>
    </html>
  );
}
