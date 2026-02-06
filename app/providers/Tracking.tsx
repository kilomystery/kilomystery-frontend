"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    ttq?: any;
    fbq?: any;

    kmApplyConsent?: (choice?: "accept" | "reject") => void;

    __tiktokConsentGranted?: boolean;
    __metaConsentGranted?: boolean;
  }
}

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const row = document.cookie.split("; ").find((r) => r.startsWith(name + "="));
  return row ? decodeURIComponent(row.split("=")[1] || "") : "";
}

/* =========================
   TikTok Loader (già presente)
========================= */
function loadTikTok(pixelId: string) {
  if (typeof window === "undefined") return;
  if ((window as any).__kmTikTokLoaded) return;
  (window as any).__kmTikTokLoaded = true;

  (function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    const ttq = (w.ttq = w.ttq || []);
    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
    ];
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

/* =========================
   Meta Pixel Loader
========================= */
function loadMetaPixel(pixelId: string) {
  if (typeof window === "undefined") return;
  if ((window as any).__kmMetaLoaded) return;
  (window as any).__kmMetaLoaded = true;

  // Base snippet
  !(function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", pixelId);
}

export default function Tracking({
  gaId,
  tiktokPixelId,
  metaPixelId,
}: {
  gaId: string;
  tiktokPixelId: string;
  metaPixelId: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1) Bridge consenso + load pixel
  useEffect(() => {
    // Bridge globale: CookieBanner chiama questa
    window.kmApplyConsent = (choice?: "accept" | "reject") => {
      const granted = choice === "accept";

      // Espone flag runtime (utile per bottoni)
      window.__tiktokConsentGranted = granted;
      window.__metaConsentGranted = granted;

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
        const ttq = (window as any).ttq;
        if (ttq?.disableCookie) ttq.disableCookie();
      }

      // Meta: se accetta → load + PageView (una volta)
      if (granted) {
        loadMetaPixel(metaPixelId);
        if (window.fbq) {
          window.fbq("track", "PageView");
        }
      }
    };

    // All’avvio: riallinea a cookie esistente
    const consent = getCookie("km_cookie_consent");
    const granted = consent === "accept";

    if (granted) {
      window.kmApplyConsent?.("accept");
    } else {
      window.kmApplyConsent?.("reject");
    }
  }, [tiktokPixelId, metaPixelId, gaId]);

  // 2) PageView su route-change (solo se consenso Meta)
  useEffect(() => {
    if (!window.__metaConsentGranted) return;
    if (!window.fbq) return;
    window.fbq("track", "PageView");
  }, [pathname, searchParams]);

  return null;
}
