// app/layout.tsx
import "./globals.css";
import ClientTracking from "./providers/ClientTracking";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head />
      <body>
        <ClientTracking />
        {children}
      </body>
    </html>
  );
}
