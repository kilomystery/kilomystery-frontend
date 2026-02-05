"use client";

import Script from "next/script";
import { useEffect } from "react";

/* =========================
   IDS
========================= */

const GA_ID = "G-YEY91KKVR2";
const TIKTOK_PIXEL_ID = "D625ESBC77U70QB7D710";

/* =========================
   Helpers
========================= */

function readConsent(): "accept" | "reject" | "" {
  if (typeof document === "undefined") return "";

  const m = document.cookie.match(/(?:^|;\s*)km_cookie_consent=([^;]+)/);
  return m ? (decodeURIComponent(m[1]) as any) : "";
}

/* =========================
   Component
========================= */

export default function Tracking() {
  /* =========================
     Apply consent
  ========================= */
  function applyConsent() {
    const consent = readConsent();
    const granted = consent === "accept";

    /* Google */
    if ((window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
        ad_storage: granted ? "granted" : "denied",
        ad_user_data: granted ? "granted" : "denied",
        ad_personalization: granted ? "granted" : "denied",
      });
    }

    /* TikTok */
    if ((window as any).ttq) {
      if (granted) {
        (window as any).ttq.grantConsent();
      } else {
        (window as any).ttq.holdConsent();
      }
    }
  }

  /* =========================
     Init on mount
  ========================= */
  useEffect(() => {
    applyConsent();

    // Riesegui se il cookie cambia
    const i = setInterval(applyConsent, 2000);

    return () => clearInterval(i);
  }, []);

  return (
    <>
      {/* =========================
          GOOGLE ANALYTICS
      ========================= */}

      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];

          function gtag(){dataLayer.push(arguments);}

          window.gtag = window.gtag || gtag;

          gtag('js', new Date());

          gtag('config','${GA_ID}',{
            send_page_view: true
          });
        `}
      </Script>

      {/* =========================
          TIKTOK PIXEL
      ========================= */}

      <Script id="tiktok-pixel" strategy="afterInteractive">
        {`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;

            var ttq=w[t]=w[t]||[];

            ttq.methods=[
              "page","track","identify","instances","debug","on","off","once",
              "ready","alias","group","enableCookie","disableCookie",
              "holdConsent","revokeConsent","grantConsent"
            ];

            ttq.setAndDefer=function(t,e){
              t[e]=function(){
                t.push([e].concat(Array.prototype.slice.call(arguments,0)))
              }
            };

            for(var i=0;i<ttq.methods.length;i++){
              ttq.setAndDefer(ttq,ttq.methods[i]);
            }

            ttq.load=function(e){
              var n=document.createElement("script");
              n.async=true;
              n.src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid="+e+"&lib="+t;

              var s=document.getElementsByTagName("script")[0];
              s.parentNode.insertBefore(n,s);
            };

            ttq.load('${TIKTOK_PIXEL_ID}');
            ttq.page();

          }(window, document, 'ttq');
        `}
      </Script>
    </>
  );
}
