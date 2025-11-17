"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function NewsletterModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem("km-newsletter-dismissed");
    if (!seen) setOpen(true);
  }, []);

  function close() {
    setOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("km-newsletter-dismissed", "1");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("fail");

      setState("ok");
      setEmail("");
    } catch {
      setState("err");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="card relative max-w-md w-full bg-[#0f1216]/95 border border-white/15 rounded-2xl p-6 md:p-8">
        {/* Pulsante chiudi */}
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 text-sm"
          aria-label="Chiudi"
        >
          ✕
        </button>

        {/* LOGO */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-black/70 overflow-hidden">
            <Image
              src="/hero/hero.svg"   // 👈 uso lo stesso logo dell’hero che sappiamo esistere
              alt="KiloMystery"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-center">
            Iscriviti alla newsletter
          </h2>
          <p className="text-sm text-white/75 text-center max-w-sm">
            Sconti, nuove mystery box e anteprime. Nessuno spam, solo drop utili.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="la-tua@email.com"
            className="input w-full rounded-full px-4 py-3 text-[15px]"
          />

          <button
            type="submit"
            className="btn btn-brand btn-lg w-full justify-center rounded-full"
          >
            {state === "ok"
              ? "Iscritto ✔️"
              : state === "err"
              ? "Errore, riprova"
              : "Iscrivimi"}
          </button>

          <p className="text-[11px] text-white/60 text-center">
            Iscrivendoti accetti la nostra{" "}
            <a
              href="/it/legal/privacy"
              className="underline underline-offset-2"
            >
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
