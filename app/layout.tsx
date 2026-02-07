import "./globals.css";
import ClientTracking from "./providers/ClientTracking";
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <Script id="km-consent-stub" strategy="beforeInteractive">
          {`
            (function () {
              window.__kmPendingConsentChoice = window.__kmPendingConsentChoice || null;
              window.kmApplyConsent = window.kmApplyConsent || function (choice) {
                window.__kmPendingConsentChoice =
                  typeof choice === "string" ? choice : null;
              };
              window.__kmStubLoaded = true;
            })();
          `}
        </Script>
      </head>
      <body>
        <ClientTracking />
        {children}
      </body>
    </html>
  );
}
