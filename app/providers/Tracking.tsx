"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  initAttributionStorage,
  trackPageView,
} from "@/app/lib/tracking";
import {
  initGa,
  initMetaPixel,
  initTikTokPixel,
  updateGaConsent,
} from "@/app/lib/tracking/loaders";

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
    if (_gaId) {
      initGa(_gaId);
    }
    if (IS_DEV) {
      console.info("[KM Tracking] provider mounted");
    }
  }, [_gaId]);

  const applyConsent = useCallback(
    (choice?: ConsentChoice) => {
      const normalized: ConsentChoice = choice === "accept" ? "accept" : "reject";
      const granted = normalized === "accept";

      if (typeof window !== "undefined") {
        window.__kmConsentChoice = normalized;
        window.__gaConsentGranted = granted && Boolean(_gaId);
        window.__metaConsentGranted = granted && Boolean(metaPixelId);
        window.__tiktokConsentGranted = granted && Boolean(tiktokPixelId);
      }
      if (IS_DEV) {
        console.info("[KM Tracking] consent applied:", normalized);
      }

      updateGaConsent(granted);

      if (granted) {
        if (metaPixelId) initMetaPixel(metaPixelId);
        if (tiktokPixelId) initTikTokPixel(tiktokPixelId);
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
    [_gaId, metaPixelId, tiktokPixelId]
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
