"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function Gtm() {
  const pathname = usePathname();

  // IMPORTANTISSIMO: non caricare GTM nella pagina di redirect
  if (pathname?.startsWith("/r/")) return null;

  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
  if (!GTM_ID) return null;

  return (
    <>
      <Script
        id="gtm"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
    </>
  );
}