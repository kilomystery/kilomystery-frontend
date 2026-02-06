// app/layout.tsx
import "./globals.css";
import Script from "next/script";
import ClientTracking from "./providers/ClientTracking";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <Script
          id="km-consent-stub"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    window.__kmPendingConsentChoice = window.__kmPendingConsentChoice || null;
    window.kmApplyConsent = window.kmApplyConsent || function(choice){
      try { window.__kmPendingConsentChoice = choice || "accept"; } catch(e){}
    };
  } catch(e) {}
})();
            `.trim(),
          }}
        />
      </head>
      <body>
        <ClientTracking />
        {children}
      </body>
    </html>
  );
}
