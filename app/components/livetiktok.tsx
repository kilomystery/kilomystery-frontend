/* eslint-disable react/no-unescaped-entities */
"use client";

type Lang = "it" | "en" | "es" | "fr" | "de";

type Props = {
  lang: Lang;
  href?: string; // es: "/live-tiktok"
  tiktokUrl: string; // es: "https://www.tiktok.com/@kilomystery"
};

const COPY: Record<
  Lang,
  {
    kicker: string;
    title: string;
    subtitle: string;
    pill1: string;
    pill2: string;
    pill3: string;
    ctaPrimary: string;
    ctaSecondary: string;
    howTitle: string;
    step1: string;
    step2: string;
    step3: string;
    note: string;
  }
> = {
  it: {
    kicker: "TIKTOK LIVE",
    title: "Mystery Box su TikTok Live",
    subtitle:
      "Mystery box di pacchi smarriti e resi non reclamati: durante le live su TikTok puoi partecipare con un ticket di acconto e provare ad aggiudicarti una box.",
    pill1: "Ticket di acconto",
    pill2: "Pacchi smarriti & resi",
    pill3: "Assegnazione durante la live",
    ctaPrimary: "Scopri le Live",
    ctaSecondary: "Seguici su TikTok",
    howTitle: "Come partecipare",
    step1: "Apri la pagina Live",
    step2: "Prendi il ticket di acconto",
    step3: "Partecipa alla live su TikTok",
    note: "Le date vengono annunciate sui nostri canali.",
  },
  en: {
    kicker: "TIKTOK LIVE",
    title: "Mystery Boxes on TikTok Live",
    subtitle:
      "Mystery boxes from lost parcels and unclaimed returns: during our TikTok lives you can join with a deposit ticket and try to claim a box.",
    pill1: "Deposit ticket",
    pill2: "Lost parcels & returns",
    pill3: "Assigned during the live",
    ctaPrimary: "See the Live page",
    ctaSecondary: "Follow us on TikTok",
    howTitle: "How to join",
    step1: "Open the Live page",
    step2: "Get your deposit ticket",
    step3: "Join the TikTok live",
    note: "Dates are announced on our channels.",
  },
  es: {
    kicker: "LIVE EN TIKTOK",
    title: "Mystery Box en TikTok Live",
    subtitle:
      "Cajas mystery de paquetes perdidos y devoluciones no reclamadas: durante nuestras lives en TikTok puedes participar con un ticket de anticipo e intentar conseguir una caja.",
    pill1: "Ticket de anticipo",
    pill2: "Paquetes perdidos & devoluciones",
    pill3: "Asignación durante la live",
    ctaPrimary: "Ver la página Live",
    ctaSecondary: "Síguenos en TikTok",
    howTitle: "Cómo participar",
    step1: "Abre la página Live",
    step2: "Consigue el ticket de anticipo",
    step3: "Únete a la live en TikTok",
    note: "Las fechas se anuncian en nuestros canales.",
  },
  fr: {
    kicker: "LIVE TIKTOK",
    title: "Mystery Box sur TikTok Live",
    subtitle:
      "Mystery box issues de colis perdus et retours non réclamés : pendant nos lives TikTok, tu peux participer avec un ticket d’acompte et tenter d’obtenir une box.",
    pill1: "Ticket d’acompte",
    pill2: "Colis perdus & retours",
    pill3: "Attribution pendant le live",
    ctaPrimary: "Voir la page Live",
    ctaSecondary: "Nous suivre sur TikTok",
    howTitle: "Comment participer",
    step1: "Ouvre la page Live",
    step2: "Prends le ticket d’acompte",
    step3: "Rejoins le live sur TikTok",
    note: "Les dates sont annoncées sur nos réseaux.",
  },
  de: {
    kicker: "TIKTOK LIVE",
    title: "Mystery Box auf TikTok Live",
    subtitle:
      "Mystery Boxen aus verlorenen Paketen und nicht abgeholten Retouren: während unserer TikTok-Lives kannst du mit einem Anzahlungsticket teilnehmen und versuchen, eine Box zu bekommen.",
    pill1: "Anzahlungsticket",
    pill2: "Verlorene Pakete & Retouren",
    pill3: "Vergabe während des Lives",
    ctaPrimary: "Zur Live-Seite",
    ctaSecondary: "Folge uns auf TikTok",
    howTitle: "So nimmst du teil",
    step1: "Öffne die Live-Seite",
    step2: "Hol dir das Anzahlungsticket",
    step3: "Mach beim TikTok-Live mit",
    note: "Termine kündigen wir auf unseren Kanälen an.",
  },
};

export default function LiveTikTok({ lang, href = "/live-tiktok", tiktokUrl }: Props) {
  const t = COPY[lang] ?? COPY.it;
  const liveUrl = `/${lang}${href.startsWith("/") ? href : `/${href}`}`;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      {/* glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#7A20FF]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#20D27A]/18 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-stretch md:justify-between">
        {/* LEFT */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.6)]" />
            <p className="text-xs font-semibold tracking-[.18em] text-white/70">
              {t.kicker}
            </p>
          </div>

          <h2 className="mt-4 text-2xl md:text-4xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
              {t.title}
            </span>
          </h2>

          <p className="mt-3 text-white/70">{t.subtitle}</p>

          {/* pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/75">
              {t.pill1}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/75">
              {t.pill2}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/75">
              {t.pill3}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={liveUrl}
              className="inline-flex items-center justify-center rounded-full px-6 py-3 font-extrabold text-[#0c0f10]
                         bg-gradient-to-r from-[#7A20FF] to-[#20D27A]
                         shadow-[0_14px_36px_rgba(122,32,255,.22),0_8px_24px_rgba(32,210,122,.18)]
                         border border-white/70 transition-transform duration-150 hover:-translate-y-0.5"
            >
              {t.ctaPrimary}
            </a>

            <a
              href={tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full px-5 py-3 font-bold
                         text-white/90 bg-white/5 border border-white/15
                         hover:bg-white/10 transition-colors"
            >
              {t.ctaSecondary}
            </a>
          </div>

          <p className="mt-3 text-xs text-white/50">{t.note}</p>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-[360px]">
          <div className="h-full rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[.15em] text-white/60">
              {t.howTitle}
            </p>

            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div className="flex gap-3">
                <div className="mt-0.5 h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  1
                </div>
                <p>{t.step1}</p>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  2
                </div>
                <p>{t.step2}</p>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  3
                </div>
                <p>{t.step3}</p>
              </div>
            </div>

            <a href={liveUrl} className="mt-5 btn btn-brand w-full">
              {t.ctaPrimary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
