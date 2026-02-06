import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";

const ClientTracking = dynamic(() => import("./providers/ClientTracking"), {
  ssr: false,
  loading: () => null,
});

export const metadata: Metadata = {
  title: {
    default: "KiloMystery | Mystery Box",
    template: "%s | KiloMystery",
  },
  description:
    "Mystery Box e Mystery Box al kg (Standard e Premium). Spedizione rapida e tracciata.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="bg-[#0b0f14] text-white">
      <head>
        <Script id="km-consent-bridge" strategy="beforeInteractive">
          {`
            window.kmApplyConsent = window.kmApplyConsent || function(choice){
              window.__kmPendingConsentChoice = choice;
            };
          `}
        </Script>
      </head>
      <body>
        <Suspense fallback={null}>
          <ClientTracking />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
