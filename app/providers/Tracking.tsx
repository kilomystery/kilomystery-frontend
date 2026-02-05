"use client";

import Script from "next/script";

const GA_ID = "G-YEY91KKVR2";
const TIKTOK_PIXEL_ID = "D625ESBC77U70QB7D710";

export default function Tracking() {
  return (
    <>
      {/* ================= GA ================= */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;

          gtag('js', new Date());
          gtag('config','${GA_ID}');
        `}
      </Script>

      {/* ================= TIKTOK ================= */}
      <Script id="tiktok-pixel" strategy="afterInteractive">
        {`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;
            var ttq=w[t]=w[t]||[];

            ttq.methods=[
              "page","track","identify","instances","debug","on","off",
              "once","ready","alias","group","enableCookie","disableCookie"
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
              var s=d.createElement("script");
              s.type="text/javascript";
              s.async=true;
              s.src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid="+e+"&lib="+t;
              var x=d.getElementsByTagName("script")[0];
              x.parentNode.insertBefore(s,x);
            };

            ttq.load('${TIKTOK_PIXEL_ID}');
            ttq.page();

          }(window, document, 'ttq');
        `}
      </Script>
    </>
  );
}
