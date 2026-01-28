"use client";

import { useEffect, useCallback, useState } from "react";

type Choice = "accept" | "reject";

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  const setConsentDefault = useCallback(() => {
    if (typeof window === "undefined") return;

    // Crea dataLayer/gtag se non esistono ancora (safe)
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag =
      (window as any).gtag ||
      function gtag() {
        (window as any).dataLayer.push(arguments);
      };

    const gtag = (window as any).gtag;

    // Default "denied" finché non arriva una scelta
    gtag("consent", "default", {
      ad_storage: "denied",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
      wait_for_update: 500,
    });
  }, []);

  const applyConsent = useCallback((choice: Choice) => {
    if (typeof window === "undefined") return;

    const granted = choice === "accept";

    // Se gtag non è pronto, lo inizializziamo comunque (safe)
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag =
      (window as any).gtag ||
      function gtag() {
        (window as any).dataLayer.push(arguments);
      };

    const gtag = (window as any).gtag;

    gtag("consent", "update", {
      // Se vuoi ADS in futuro: metti granted solo se fai Google Ads
      ad_storage: "denied",
      analytics_storage: granted ? "granted" : "denied",

      functionality_storage: "granted", // cookie tecnici UI
      personalization_storage: granted ? "granted" : "denied",
      security_storage: "granted",
    });
  }, []);

  useEffect(() => {
    // Ridondanza utile: mettiamo comunque default denied
    setConsentDefault();

    const saved = localStorage.getItem("km-cookie-consent") as Choice | null;

    if (!saved) {
      setOpen(true);
      return;
    }

    // Se c'è già una scelta, applicala.
    // (In alcuni casi GA/gtag arriva dopo: facciamo 3 tentativi veloci)
    applyConsent(saved);

    let tries = 0;
    const t = setInterval(() => {
      tries += 1;
      applyConsent(saved);
      if (tries >= 3) clearInterval(t);
    }, 400);

    return () => clearInterval(t);
  }, [applyConsent, setConsentDefault]);

  const handle = (choice: Choice) => {
    localStorage.setItem("km-cookie-consent", choice);
    applyConsent(choice);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4">
      <div className="container">
        <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 bg-[#121622]/95 backdrop-blur-md border-white/15">
          <div className="space-y-1">
            <p className="text-sm md:text-base text-white/85">
              Usiamo cookie tecnici e, con il tuo consenso, cookie analitici per
              migliorare l’esperienza e misurare le visite.
            </p>

            <p className="text-xs text-white/55">
              Puoi rifiutare o accettare. Leggi la{" "}
              <a href="/it/privacy" className="btn-link">
                Privacy Policy
              </a>
              .
            </p>
          </div>

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
              Accetta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
