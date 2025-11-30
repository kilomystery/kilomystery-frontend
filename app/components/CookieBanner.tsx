"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  // Applica il consenso a Google quando conosciamo la scelta
  function applyConsent(choice: "accept" | "reject") {
    if (typeof window === "undefined") return;

    const gtag = (window as any).gtag;
    if (!gtag) return;

    const granted = choice === "accept";

    gtag("consent", "update", {
      ad_storage: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied",
    });
  }

  useEffect(() => {
    const v = localStorage.getItem("km-cookie-consent");

    if (!v) {
      // Nessuna scelta → mostro il banner
      setOpen(true);
    } else {
      // Scelta già fatta in passato → applico il consenso coerente
      applyConsent(v === "accept" ? "accept" : "reject");
    }
  }, []);

  function handle(choice: "accept" | "reject") {
    localStorage.setItem("km-cookie-consent", choice);
    applyConsent(choice);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4">
      <div className="container">
        <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 bg-[#121622]/95 backdrop-blur-md border-white/15">
          <p className="text-sm md:text-base text-white/85">
            Usiamo cookie tecnici e, con il tuo consenso, analitici per migliorare
            l’esperienza. Puoi cambiare idea in qualunque momento dalle impostazioni
            del browser.
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
