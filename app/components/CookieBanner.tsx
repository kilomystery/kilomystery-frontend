"use client";

import { useEffect, useState } from "react";

const SUPPORTED = ["it", "en", "es", "fr", "de"] as const;
type Lang = (typeof SUPPORTED)[number];

/**
 * Rileva la lingua corrente:
 * 1) localStorage
 * 2) path /it /en ecc
 * 3) fallback it
 */
function getLang(): Lang {
  if (typeof window === "undefined") return "it";

  // 1) Da localStorage
  const saved = localStorage.getItem("km_lang");
  if (saved && SUPPORTED.includes(saved as Lang)) {
    return saved as Lang;
  }

  // 2) Dal path
  const pathLang = window.location.pathname.split("/")[1];
  if (SUPPORTED.includes(pathLang as Lang)) {
    return pathLang as Lang;
  }

  // 3) Default
  return "it";
}

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  /**
   * Applica consenso a Google Consent Mode
   */
  function applyConsent(choice: "accept" | "reject") {
    if (typeof window === "undefined") return;

    const gtag = (window as any).gtag;
    if (!gtag) return;

    const granted = choice === "accept";

    gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: granted ? "granted" : "denied",

      // Pronti per Google Ads futuri
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
    });
  }

  useEffect(() => {
    const saved = localStorage.getItem("km-cookie-consent");

    if (!saved) {
      // Nessuna scelta → mostra banner
      setOpen(true);
    } else {
      // Applica scelta precedente
      applyConsent(saved === "accept" ? "accept" : "reject");
    }
  }, []);

  function handle(choice: "accept" | "reject") {
    localStorage.setItem("km-cookie-consent", choice);
    applyConsent(choice);
    setOpen(false);
  }

  if (!open) return null;

  const lang = getLang();
  const privacyUrl = `/${lang}/policy/privacy`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4">
      <div className="container">
        <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 bg-[#121622]/95 backdrop-blur-md border-white/15">

          {/* Testo */}
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

          {/* Pulsanti */}
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
