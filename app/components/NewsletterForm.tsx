"use client";

import { useState } from "react";
import { safeError } from "@/app/lib/safeLog";

type Lang = "it" | "en" | "es" | "fr" | "de";

const LABELS: Record<Lang, any> = {
  it: {
    kicker: "Newsletter",
    subtitle: "Iscriviti per offerte & novità",
    placeholder: "email@you.com",
    ariaEmail: "Email",
    btnIdle: "Iscriviti",
    btnLoading: "Invio...",
    success: "Iscrizione completata ✔︎",
    error: "Errore: riprova tra poco",
    privacyPrefix: "Con l’iscrizione accetti la nostra ",
    privacyLinkText: "privacy policy",
    privacySuffix: ".",
  },
  en: {
    kicker: "Newsletter",
    subtitle: "Sign up for offers & updates",
    placeholder: "you@email.com",
    ariaEmail: "Email address",
    btnIdle: "Subscribe",
    btnLoading: "Sending...",
    success: "Subscription completed ✔︎",
    error: "Error: please try again later",
    privacyPrefix: "By subscribing you accept our ",
    privacyLinkText: "privacy policy",
    privacySuffix: ".",
  },
  es: {
    kicker: "Newsletter",
    subtitle: "Suscríbete para ofertas y novedades",
    placeholder: "tu-email@email.com",
    ariaEmail: "Correo electrónico",
    btnIdle: "Suscribirme",
    btnLoading: "Enviando...",
    success: "Suscripción completada ✔︎",
    error: "Error: inténtalo de nuevo en unos minutos",
    privacyPrefix: "Con la suscripción aceptas nuestra ",
    privacyLinkText: "política de privacidad",
    privacySuffix: ".",
  },
  fr: {
    kicker: "Newsletter",
    subtitle: "Inscris-toi pour offres & nouveautés",
    placeholder: "ton-email@email.com",
    ariaEmail: "Adresse e-mail",
    btnIdle: "M’inscrire",
    btnLoading: "Envoi...",
    success: "Inscription confirmée ✔︎",
    error: "Erreur : réessaie dans un instant",
    privacyPrefix: "En t’inscrivant, tu acceptes notre ",
    privacyLinkText: "politique de confidentialité",
    privacySuffix: ".",
  },
  de: {
    kicker: "Newsletter",
    subtitle: "Melde dich für Angebote & News an",
    placeholder: "deine-mail@email.com",
    ariaEmail: "E-Mail-Adresse",
    btnIdle: "Anmelden",
    btnLoading: "Senden...",
    success: "Anmeldung abgeschlossen ✔︎",
    error: "Fehler: versuche es später erneut",
    privacyPrefix: "Mit deiner Anmeldung akzeptierst du unsere ",
    privacyLinkText: "Datenschutzerklärung",
    privacySuffix: ".",
  },
};

export default function NewsletterForm({ lang = "it" as Lang }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle"
  );

  const supported = ["it", "en", "es", "fr", "de"] as const;
  const normalized = String(lang).toLowerCase();
  const safeLang: Lang = (supported as readonly string[]).includes(
    normalized as any
  )
    ? (normalized as Lang)
    : "it";

  const t = LABELS[safeLang];

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
        throw new Error(
          `Subscribe HTTP ${res.status}${txt ? ` – ${txt}` : ""}`
        );
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
        <span className="section-kicker">{t.kicker}</span>
        <span className="text-sm text-white/70">{t.subtitle}</span>
      </div>

      {/* Input + bottone in pill */}
      <div className="flex items-stretch gap-2">
        <input
          className="input flex-1 rounded-full pl-4 pr-4 py-3 !bg-[#0c1411] !border-[#ffffff26] focus:!bg-[#0d1714] text-[15px]"
          type="email"
          name="email"
          placeholder={t.placeholder}
          required
          aria-label={t.ariaEmail}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`btn btn-brand btn-lg whitespace-nowrap px-6 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? t.btnLoading : t.btnIdle}
        </button>
      </div>

      {/* Messaggi stato */}
      <div className="mt-2 h-6">
        {status === "ok" && (
          <span
            role="status"
            className="text-emerald-400 text-sm font-semibold"
          >
            {t.success}
          </span>
        )}
        {status === "err" && (
          <span
            role="status"
            className="text-rose-400 text-sm font-semibold"
          >
            {t.error}
          </span>
        )}
      </div>

      {/* Nota privacy mini */}
      <p className="mt-1 text-xs text-white/50">
        {t.privacyPrefix}
        <a href="/it/legal/privacy" className="btn-link">
          {t.privacyLinkText}
        </a>
        {t.privacySuffix}
      </p>
    </form>
  );
}
