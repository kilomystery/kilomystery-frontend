"use client";

import { useState } from "react";
import { HERO_IMAGE } from "@/lib/staticImages";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "err" | "loading">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;

    setState("loading");

    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!r.ok) throw new Error();
      setState("ok");
      setEmail("");
    } catch {
      setState("err");
    }
  }

  return (
    <div className="card max-w-md mx-auto">
      <div className="flex justify-center mb-3">
        <picture className="drop-shadow-[0_0_20px_rgba(124,58,237,0.3)]">
          <source srcSet={HERO_IMAGE.webp} type="image/webp" />
          <source srcSet={HERO_IMAGE.png} type="image/png" />
          <img
            src={HERO_IMAGE.png}
            alt={HERO_IMAGE.alt}
            width={120}
            height={40}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>

      <h3 className="text-lg font-bold mb-1">Newsletter</h3>

      <p className="text-white/70 text-sm mb-3">
        Drop, offerte e consigli per i tuoi lotti Mystery.
      </p>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="La tua email"
          className="flex-1 input rounded-xl px-4 py-2 bg-[#111317] border border-white/20 focus:border-white/40"
        />

        <button
          type="submit"
          disabled={state === "loading"}
          className="btn btn-brand rounded-xl"
        >
          {state === "loading" ? "Invio…" : "Iscriviti"}
        </button>
      </form>

      {state === "ok" && (
        <p className="text-emerald-400 text-sm mt-2">Iscritto ✔️</p>
      )}
      {state === "err" && (
        <p className="text-rose-400 text-sm mt-2">Errore, riprova.</p>
      )}
    </div>
  );
}
