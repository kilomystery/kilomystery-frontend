"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem("km-cookie-consent");
    if (!v) setOpen(true);
  }, []);

  function handle(choice: "accept" | "reject") {
    localStorage.setItem("km-cookie-consent", choice);
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
