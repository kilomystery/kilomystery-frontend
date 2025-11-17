// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // ✅ corretto dal root "app/"

import CookieBanner from "./components/CookieBanner";        // ✅ percorso giusto
import NewsletterModal from "./components/NewsletterModal";  // ✅ percorso giusto

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
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
        {children}
        <CookieBanner />
        <NewsletterModal />
      </body>
    </html>
  );
}