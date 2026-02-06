// app/layout.tsx
import "./globals.css";
import ClientTracking from "./providers/ClientTracking";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <script
          id="km-consent-stub"
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  window.__kmPendingConsentChoice = window.__kmPendingConsentChoice || null;
  window.kmApplyConsent =
    window.kmApplyConsent ||
    function(choice){
      window.__kmPendingConsentChoice =
        typeof choice === "string" ? choice : null;
    };
  window.__kmStubLoaded = true;
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
