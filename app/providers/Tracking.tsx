"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    ttq?: any;
    kmApplyConsent?: (choice?: "accept" | "reject") => void;
  }
}

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const row = document.cookie.split("; ").find((r) => r.startsWith(name + "="));
  return row ? decodeURIComponent(row.split("=")[1] || "") : "";
}

function loadTikTok(pixelId: string) {
  if (typeof window === "undefined") return;
  if ((window as any).__kmTikTokLoaded) return;
  (window as any).__kmTikTokLoaded = true;

  // TikTok base snippet (minimo)
  // NB: lo carichiamo ma NON tracciamo finché non c'è consenso
  (function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    const ttq = (w.ttq = w.ttq || []);
    ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
    ttq.setAndDefer = function (t: any, e: any) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t: any) {
      const e = ttq._i[t] || [];
      for (let n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (e: any, n: any) {
      const i = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      const a = d.createElement("script");
      a.type = "text/javascript";
      a.async = true;
      a.src = i + "?sdkid=" + e + "&lib=" + t;
      const s = d.getElementsByTagName("script")[0];
      s.parentNode?.insertBefore(a, s);
    };
    ttq.load(pixelId);
  })(window as any, document, "ttq");
}

export default function Tracking({
  gaId,
  tiktokPixelId,
}: {
  gaId: string;
  tiktokPixelId: string;
}) {
  useEffect(() => {
    // Bridge globale: CookieBanner chiama questa
    window.kmApplyConsent = (choice?: "accept" | "reject") => {
      const granted = choice === "accept";

      // GA update (se gtag esiste)
      const gtag = (window as any).gtag;
      if (gtag) {
        gtag("consent", "update", {
          analytics_storage: granted ? "granted" : "denied",
          ad_storage: granted ? "granted" : "denied",
          ad_user_data: granted ? "granted" : "denied",
          ad_personalization: granted ? "granted" : "denied",
          functionality_storage: granted ? "granted" : "denied",
          personalization_storage: granted ? "granted" : "denied",
          security_storage: "granted",
        });
      }

      // TikTok: se accetta → abilita cookie + page()
      if (granted) {
        loadTikTok(tiktokPixelId);
        const ttq = (window as any).ttq;
        if (ttq?.enableCookie) ttq.enableCookie();
        if (ttq?.page) ttq.page();
      } else {
        // se rifiuta → prova a disabilitare cookie
        const ttq = (window as any).ttq;
        if (ttq?.disableCookie) ttq.disableCookie();
      }
    };

    // All’avvio: riallinea a cookie esistente
    const consent = getCookie("km_cookie_consent");
    const granted = consent === "accept";

    // Se già accettato, carichiamo TikTok e facciamo page()
    if (granted) {
      window.kmApplyConsent?.("accept");
    } else {
      window.kmApplyConsent?.("reject");
    }
  }, [tiktokPixelId]);

  return null;
}
