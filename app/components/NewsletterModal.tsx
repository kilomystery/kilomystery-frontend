"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function NewsletterModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("km-newsletter-dismissed");
    if (!seen) setOpen(true);
  }, []);

  function close() {
    localStorage.setItem("km-newsletter-dismissed", "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md relative">
        <button
          onClick={close}
          className="absolute top-3 right-3 rounded-full border border-white/20 text-white/80 px-2 py-1"
          aria-label="Chiudi"
        >
          ✕
        </button>

        {/* LOGO SVG */}
        <div className="mx-auto mb-3 w-24 h-24 rounded-xl bg-white/5 border border-white/15 grid place-items-center">
          <Image
            src="/hero.svg"   /* cambia in /logo.svg se vuoi */
            alt="KiloMistery logo"
            width={72}
            height={72}
            priority
          />
        </div>

        <h3 className="text-xl font-extrabold text-center">Iscriviti alla newsletter</h3>
        <p className="text-white/75 text-center mt-1">
          Sconti, nuove mystery box e anteprime. Nessuno spam, promesso.
        </p>

        <form
          className="mt-4 flex flex-col sm:flex-row gap-2"
          action="https://formbold.com/s/your-endpoint" /* sostituisci con il tuo endpoint */
          method="post"
        >
          <input
            required
            type="email"
            name="email"
            placeholder="La tua email"
            className="input w-full"
          />
          <button className="btn-brand w-full sm:w-auto">Iscrivimi</button>
        </form>

        <p className="text-[12px] text-white/50 mt-3 text-center">
          Iscrivendoti accetti la nostra <a href="/policy" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}