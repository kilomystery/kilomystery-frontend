"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Lang = "it" | "en" | "es" | "fr" | "de";

const LABELS: Record<Lang, any> = {
  it: {
    closeAria: "Chiudi",
    title: "Iscriviti alla newsletter",
    description:
      "Sconti, nuove mystery box e anteprime. Nessuno spam, solo drop utili.",
    placeholderEmail: "la-tua@email.com",
    btnIdle: "Iscrivimi",
    btnOk: "Iscritto ✔️",
    btnErr: "Errore, riprova",
    privacyPrefix: "Iscrivendoti accetti la nostra ",
    privacyLinkText: "Privacy Policy",
    privacySuffix: ".",
  },
  en: {
    closeAria: "Close",
    title: "Subscribe to the newsletter",
    description:
      "Discounts, new mystery boxes and sneak peeks. No spam, only useful drops.",
    placeholderEmail: "your@email.com",
    btnIdle: "Subscribe me",
    btnOk: "Subscribed ✔️",
    btnErr: "Error, try again",
    privacyPrefix: "By subscribing you accept our ",
    privacyLinkText: "Privacy Policy",
    privacySuffix: ".",
  },
  es: {
    closeAria: "Cerrar",
    title: "Suscríbete a la newsletter",
    description:
      "Descuentos, nuevas mystery box y novedades. Nada de spam, solo drops útiles.",
    placeholderEmail: "tu-correo@email.com",
    btnIdle: "Suscribirme",
    btnOk: "Suscrito ✔️",
    btnErr: "Error, inténtalo de nuevo",
    privacyPrefix: "Al suscribirte aceptas nuestra ",
    privacyLinkText: "Política de privacidad",
    privacySuffix: ".",
  },
  fr: {
    closeAria: "Fermer",
    title: "Inscris-toi à la newsletter",
    description:
      "Réductions, nouvelles mystery box et avant-premières. Pas de spam, seulement des drops utiles.",
    placeholderEmail: "ton-email@email.com",
    btnIdle: "M’inscrire",
    btnOk: "Inscrit ✔️",
    btnErr: "Erreur, réessaie",
    privacyPrefix: "En t’inscrivant, tu acceptes notre ",
    privacyLinkText: "Politique de confidentialité",
    privacySuffix: ".",
  },
  de: {
    closeAria: "Schließen",
    title: "Melde dich zum Newsletter an",
    description:
      "Rabatte, neue Mystery Boxen und Previews. Kein Spam, nur wirklich nützliche Drops.",
    placeholderEmail: "deine-mail@email.com",
    btnIdle: "Anmelden",
    btnOk: "Angemeldet ✔️",
    btnErr: "Fehler, bitte erneut versuchen",
    privacyPrefix: "Mit deiner Anmeldung akzeptierst du unsere ",
    privacyLinkText: "Datenschutzerklärung",
    privacySuffix: ".",
  },
};

export default function NewsletterModal({ lang = "it" as Lang }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  const supported = ["it", "en", "es", "fr", "de"] as const;
  const normalized = String(lang).toLowerCase();
  const safeLang: Lang = (supported as readonly string[]).includes(
    normalized as any
  )
    ? (normalized as Lang)
    : "it";

  const L = LABELS[safeLang];

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
          aria-label={L.closeAria}
        >
          ✕
        </button>

        {/* LOGO (usa /public/logo.svg) */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-black/70 overflow-hidden">
            <Image
              src="/logo.svg"
              alt="KiloMystery"
              width={80}
              height={80}
              className="object-contain"
              priority={false}
            />
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-center">
            {L.title}
          </h2>
          <p className="text-sm text-white/75 text-center max-w-sm">
            {L.description}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={L.placeholderEmail}
            className="input w-full rounded-full px-4 py-3 text-[15px]"
          />

          <button
            type="submit"
            className="btn btn-brand btn-lg w-full justify-center rounded-full"
          >
            {state === "ok"
              ? L.btnOk
              : state === "err"
              ? L.btnErr
              : L.btnIdle}
          </button>

          <p className="text-[11px] text-white/60 text-center">
            {L.privacyPrefix}
            <a
              href={`/${safeLang}/legal/privacy`}
              className="underline underline-offset-2"
            >
              {L.privacyLinkText}
            </a>
            {L.privacySuffix}
          </p>
        </form>
      </div>
    </div>
  );
}
