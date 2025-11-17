"use client";

import { useState } from "react";
import { safeError } from "@/app/lib/safeLog";

export default function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Subscribe HTTP ${res.status}${txt ? ` – ${txt}` : ""}`);
      }

      setStatus("ok");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      safeError("Newsletter subscribe error", err);
      setStatus("err");
    }
  }

  const isLoading = status === "loading";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
      aria-live="polite"
      aria-busy={isLoading}
    >
      {/* Label/descrizione */}
      <div className="mb-2 flex items-center gap-2">
        <span className="section-kicker">Newsletter</span>
        <span className="text-sm text-white/70">Iscriviti per offerte & novità</span>
      </div>

      {/* Input + bottone in pill */}
      <div className="flex items-stretch gap-2">
        <input
          className="input flex-1 rounded-full pl-4 pr-4 py-3 !bg-[#0c1411] !border-[#ffffff26] focus:!bg-[#0d1714] text-[15px]"
          type="email"
          name="email"
          placeholder="email@you.com"
          required
          aria-label="Email"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`btn btn-brand btn-lg whitespace-nowrap px-6 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Invio..." : "Iscriviti"}
        </button>
      </div>

      {/* Messaggi stato */}
      <div className="mt-2 h-6">
        {status === "ok" && (
          <span role="status" className="text-emerald-400 text-sm font-semibold">
            Iscrizione completata ✔︎
          </span>
        )}
        {status === "err" && (
          <span role="status" className="text-rose-400 text-sm font-semibold">
            Errore: riprova tra poco
          </span>
        )}
      </div>

      {/* Nota privacy mini */}
      <p className="mt-1 text-xs text-white/50">
        Con l’iscrizione accetti la nostra{" "}
        <a href="/it/legal/privacy" className="btn-link">privacy policy</a>.
      </p>
    </form>
  );
}