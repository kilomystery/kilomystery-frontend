// app/layout.tsx
import "./globals.css";
import ClientTracking from "./providers/ClientTracking";
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <Script
          id="km-consent-stub"
          src="/km-consent-stub.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <ClientTracking />
        {children}
      </body>
    </html>
  );
}
