"use client";

import { useEffect, useState } from "react";

const SUPPORTED = ["it", "en", "es", "fr", "de"] as const;
type Lang = (typeof SUPPORTED)[number];

/* =========================
   Lingua
========================= */
function getLang(): Lang {
  if (typeof window === "undefined") return "it";

  const saved = localStorage.getItem("km_lang");
  if (saved && SUPPORTED.includes(saved as Lang)) return saved as Lang;

  const pathLang = window.location.pathname.split("/")[1];
  if (SUPPORTED.includes(pathLang as Lang)) return pathLang as Lang;

  return "it";
}

/* =========================
   Cookie helpers
========================= */
function setCookie(name: string, value: string, days = 180) {
  if (typeof document === "undefined") return;

  const maxAge = days * 24 * 60 * 60;
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  const shouldSetDomain =
    hostname &&
    hostname !== "localhost" &&
    hostname.endsWith("kilomystery.com");

  const domainAttr = shouldSetDomain ? "; Domain=.kilomystery.com" : "";

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Max-Age=${maxAge}; Path=/; SameSite=Lax${domainAttr}`;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;

  const row = document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="));

  if (!row) return undefined;

  return decodeURIComponent(row.split("=")[1] || "");
}

/* =========================
   GA4 Consent Update
========================= */
function updateGoogleConsent(choice: "accept" | "reject") {
  if (typeof window === "undefined") return;

  const granted = choice === "accept";

  // Aggiorna Consent Mode v2
  window.gtag?.("consent", "update", {
    ad_storage: granted ? "granted" : "denied",
    analytics_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
  });
}

/* =========================
   Component
========================= */
export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const savedCookie = getCookie("km_cookie_consent");
    const savedLocal = localStorage.getItem("km-cookie-consent");
    const saved = savedCookie || savedLocal || "";

    if (!saved) {
      setOpen(true);
    } else {
      // Se già salvato, aggiorna subito GA
      updateGoogleConsent(saved as "accept" | "reject");
    }
  }, []);

  function handle(choice: "accept" | "reject") {
    // salva scelta
    localStorage.setItem("km-cookie-consent", choice);
    setCookie("km_cookie_consent", choice);

    // aggiorna GA4
    updateGoogleConsent(choice);

    // compatibilità con stub layout
    if (typeof window !== "undefined") {
      window.kmApplyConsent?.(choice);
    }

    setOpen(false);
  }

  if (!open) return null;

  const lang = getLang();
  const privacyUrl = `/${lang}/policy/privacy`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4">
      <div className="container">
        <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 bg-[#121622]/95 backdrop-blur-md border-white/15">
          <p className="text-sm md:text-base text-white/85">
            Usiamo cookie tecnici e, con il tuo consenso, cookie analitici per
            migliorare l’esperienza di navigazione.
            <br className="hidden md:block" />
            <a
              href={privacyUrl}
              className="underline underline-offset-2 text-emerald-400 hover:text-emerald-300 ml-1"
            >
              Leggi la Privacy Policy
            </a>
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => handle("reject")}
              type="button"
            >
              Solo necessari
            </button>

            <button
              className="btn btn-brand btn-sm"
              onClick={() => handle("accept")}
              type="button"
            >
              Accetta tutti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
