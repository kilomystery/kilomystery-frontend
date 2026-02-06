"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  flushPendingMetaEvents,
  flushPendingTikTokEvents,
  initAttributionStorage,
  trackPageView,
} from "@/app/lib/tracking";

const IS_DEV = process.env.NODE_ENV !== "production";

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.split("; ").find((r) => r.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1] || "") : "";
}

type ConsentChoice = "accept" | "reject";

function getStoredConsent(): ConsentChoice {
  const cookieValue = getCookie("km_cookie_consent");
  if (cookieValue === "accept" || cookieValue === "reject") return cookieValue;
  if (typeof window !== "undefined") {
    const local = window.localStorage.getItem("km-cookie-consent");
    if (local === "accept" || local === "reject") return local;
  }
  return "reject";
}

function loadTikTok(pixelId: string) {
  if (typeof window === "undefined") return;
  if (window.__kmTikTokLoaded) {
    flushPendingTikTokEvents();
    return;
  }
  window.__kmTikTokLoaded = true;
  if (IS_DEV) {
    console.info("[KM Tracking] loading TikTok pixel", pixelId);
  }

  (function (w: any, d: any, t: any) {
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
    ttq.setAndDefer = function (_t: any, e: any) {
      _t[e] = function () {
        _t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (id: any) {
      const e = ttq._i[id] || [];
      for (let n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (id: any, opts: any) {
      const u = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[id] = [];
      ttq._i[id]._u = u;
      ttq._t = ttq._t || {};
      ttq._t[id] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[id] = opts || {};
      const a = d.createElement("script");
      a.type = "text/javascript";
      a.async = true;
      a.src = u + "?sdkid=" + id + "&lib=" + t;
      a.addEventListener("load", () => flushPendingTikTokEvents());
      const s = d.getElementsByTagName("script")[0];
      s?.parentNode?.insertBefore(a, s);
    };
    ttq.load(pixelId);
  })(window as any, document, "ttq");
}

function loadMetaPixel(pixelId: string) {
  if (typeof window === "undefined") return;
  if (window.__kmMetaLoaded) {
    flushPendingMetaEvents();
    return;
  }
  window.__kmMetaLoaded = true;
  if (IS_DEV) {
    console.info("[KM Tracking] loading Meta pixel", pixelId);
  }

  if (typeof window.fbq === "function") {
    flushPendingMetaEvents();
    return;
  }

  const fbq: any = function (...args: any[]) {
    fbq.callMethod ? fbq.callMethod.apply(fbq, args) : fbq.queue.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  window.fbq = fbq;
  window._fbq = fbq;

  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  s.addEventListener("load", () => flushPendingMetaEvents());
  document.head.appendChild(s);

  (window.fbq as typeof fbq)?.("init", pixelId);
}

export default function Tracking({
  gaId: _gaId,
  tiktokPixelId,
  metaPixelId,
}: {
  gaId: string;
  tiktokPixelId: string;
  metaPixelId: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<ConsentChoice>(getStoredConsent());
  const lastTrackedRef = useRef<string>("");

  useEffect(() => {
    initAttributionStorage();
    if (IS_DEV) {
      console.info("[KM Tracking] provider mounted");
    }
  }, []);

  const applyConsent = useCallback(
    (choice?: ConsentChoice) => {
      const normalized: ConsentChoice = choice === "accept" ? "accept" : "reject";
      const granted = normalized === "accept";

      if (typeof window !== "undefined") {
        window.__kmConsentChoice = normalized;
        window.__gaConsentGranted = granted;
        window.__metaConsentGranted = granted;
        window.__tiktokConsentGranted = granted;
      }
      if (IS_DEV) {
        console.info("[KM Tracking] consent applied:", normalized);
      }

      const gtag = typeof window !== "undefined" ? window.gtag : undefined;
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

      if (granted) {
        if (metaPixelId) loadMetaPixel(metaPixelId);
        if (tiktokPixelId) loadTikTok(tiktokPixelId);
        window.ttq?.enableCookie?.();
        if (window.fbq) {
          try {
            window.fbq("consent", "grant");
          } catch {
            /* ignore */
          }
        }
      } else {
        window.ttq?.disableCookie?.();
        if (window.fbq) {
          try {
            window.fbq("consent", "revoke");
          } catch {
            /* ignore */
          }
        }
      }

      setConsent(normalized);
    },
    [metaPixelId, tiktokPixelId]
  );

  useEffect(() => {
    window.kmApplyConsent = applyConsent;
    const pending = window.__kmPendingConsentChoice;
    if (pending) {
      applyConsent(pending);
      delete window.__kmPendingConsentChoice;
    } else {
      applyConsent(getStoredConsent());
    }
    if (IS_DEV) {
      console.info("[KM Tracking] kmApplyConsent ready");
    }
    return () => {
      if (window.kmApplyConsent === applyConsent) {
        delete window.kmApplyConsent;
      }
    };
  }, [applyConsent]);

  const search = searchParams?.toString() ?? "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (consent !== "accept") return;
    if (!pathname) return;

    const key = search ? `${pathname}?${search}` : pathname;
    if (window.__kmLastTrackedPath === key || lastTrackedRef.current === key) return;
    window.__kmLastTrackedPath = key;
    lastTrackedRef.current = key;

    trackPageView(pathname, search);
  }, [pathname, search, consent]);

  return null;
}
