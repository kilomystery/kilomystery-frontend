"use client";

import { useEffect } from "react";

type Props = {
  gaId: string;
  tiktokPixelId: string;
};

declare global {
  interface Window {
    ttq?: any;
    __kmTrackingMounted?: boolean;
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
  const c = readCookie("km_cookie_consent");
  if (c === "accept" || c === "reject") return c;

  try {
    const ls = localStorage.getItem("km-cookie-consent");
    if (ls === "accept" || ls === "reject") return ls;
  } catch {}

  return "";
}

function ensureTikTokBaseLoaded(pixelId: string) {
  if (typeof window === "undefined") return;

  // Se già presente, stop
  if (window.ttq) return;

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
    ttq.setAndDefer = function (obj: any, method: string) {
      obj[method] = function () {
        obj.push([method].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);

    ttq.load = function (id: string) {
      const r = "https://analytics.tiktok.com/i18n/pixel/events.js";
      const s = d.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = r + "?sdkid=" + id + "&lib=" + t;
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

  window.__tiktokConsentGranted = granted;

  if (window.ttq?.grantConsent && window.ttq?.holdConsent) {
    if (granted) window.ttq.grantConsent();
    else window.ttq.holdConsent();
  }
}

export default function Tracking({ tiktokPixelId }: Props) {
  useEffect(() => {
    // ✅ PROVA CHE SI MONTA
    window.__kmTrackingMounted = true;

    // marker DOM (così lo vedi anche senza console)
    const el = document.createElement("div");
    el.id = "km-tracking-marker";
    el.setAttribute("data-mounted", "1");
    el.style.display = "none";
    document.body.appendChild(el);

    // 1) crea ttq
    ensureTikTokBaseLoaded(tiktokPixelId);

    // 2) funzione globale richiamabile dal banner
    window.kmApplyConsent = (choice?: "accept" | "reject") => {
      const c = choice || (getConsent() as any) || "reject";
      applyConsentEverywhere(c);
    };

    // 3) consenso iniziale
    const initial = getConsent();
    if (initial === "accept" || initial === "reject") window.kmApplyConsent(initial);
    else window.kmApplyConsent("reject");
  }, [tiktokPixelId]);

  return null;
}
