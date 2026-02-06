import "./globals.css";
import Script from "next/script";
import ClientTracking from "./providers/ClientTracking";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <Script
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
