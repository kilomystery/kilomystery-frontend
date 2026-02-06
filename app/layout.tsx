import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import ClientTracking from "./providers/ClientTracking";

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
            (function(){
              window.__kmPendingConsentChoice = window.__kmPendingConsentChoice || null;
              window.kmApplyConsent = window.kmApplyConsent || function(choice){
                window.__kmPendingConsentChoice = choice || "reject";
              };
            })();
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
