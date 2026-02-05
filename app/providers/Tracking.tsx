"use client";

import { useEffect } from "react";

type Props = {
  gaId: string;
  tiktokPixelId: string;
};

declare global {
  interface Window {
    ttq?: any;
    __tiktokConsentGranted?: boolean;
    kmApplyConsent?: (choice?: "accept" | "reject") => void;
    gtag?: (...args: any[]) => void;
  }
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : "";
}

function getConsent(): "accept" | "reject" | "" {
  // cookie “vero” (quello che serve anche a Shopify/checkout flow)
  const c = readCookie("km_cookie_consent");
  if (c === "accept" || c === "reject") return c;

  // fallback localStorage (solo se esiste)
  try {
    const ls = localStorage.getItem("km-cookie-consent");
    if (ls === "accept" || ls === "reject") return ls;
  } catch {}

  return "";
}

function ensureTikTokBaseLoaded(pixelId: string) {
  if (typeof window === "undefined") return;
  if (window.ttq) return; // già presente

  // Base snippet (uguale a quello ufficiale)
  (function (w: any, d: any, t: string) {
    w.TiktokAnalyticsObject = t;
    const ttq = (w[t] = w[t] || []);
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
      "holdConsent",
      "revokeConsent",
      "grantConsent",
    ];
    ttq.setAndDefer = function (t: any, e: string) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t: string) {
      const e = ttq._i[t] || [];
      for (let n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (e: string, n?: any) {
      const r = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = r;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};

      const s = d.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = r + "?sdkid=" + e + "&lib=" + t;

      // tag marker (debug)
      s.setAttribute("data-km-tiktok", "1");

      const f = d.getElementsByTagName("script")[0];
      f.parentNode.insertBefore(s, f);
    };

    ttq.load(pixelId);
    ttq.page();
  })(window, document, "ttq");
}

function applyConsentEverywhere(choice: "accept" | "reject") {
  const granted = choice === "accept";

  // GA Consent update
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
      functionality_storage: granted ? "granted" : "denied",
      personalization_storage: granted ? "granted" : "denied",
      security_storage: "granted",
    });
  }

  // TikTok Consent
  window.__tiktokConsentGranted = granted;

  if (window.ttq?.grantConsent && window.ttq?.holdConsent) {
    if (granted) window.ttq.grantConsent();
    else window.ttq.holdConsent();
  }
}

export default function Tracking({ tiktokPixelId }: Props) {
  useEffect(() => {
    // 1) carica sempre base ttq (poi il consenso decide cookie/eventi)
    ensureTikTokBaseLoaded(tiktokPixelId);

    // 2) espone funzione globale chiamabile dal CookieBanner
    window.kmApplyConsent = (choice?: "accept" | "reject") => {
      const c = choice || (getConsent() as any) || "reject";
      applyConsentEverywhere(c);
    };

    // 3) applica consenso iniziale
    const initial = getConsent();
    if (initial === "accept" || initial === "reject") window.kmApplyConsent(initial);
    else window.kmApplyConsent("reject");
  }, [tiktokPixelId]);

  return null;
}
