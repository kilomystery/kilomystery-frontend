"use client";

import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

type Event = {
  id: string;
  date: string;
  city: string;
  location: string;
  title: string;
  description: string;
  extraInfo?: string;
  image?: string;
};

const upcomingEvents: Event[] = [
  {
    id: "brindisi-2025-01-03",
    date: "3–4 gennaio 2025",
    city: "Brindisi",
    location:
      "Centro Commerciale Appia Antica – Spazio Conad, Mesagne (BR) 72023",
    title: "KiloMystery Pop-Up – Brindisi",
    description:
      "Due giornate intere di mystery box al kg presso il Centro Commerciale Appia Antica.",
    extraInfo: "Orario continuato 9:00–21:00.",
    image: "/events/brindisi-2025-01-03.png",
  },
  {
    id: "milano-2025-12-10",
    date: "10 dicembre 2025",
    city: "Milano",
    location: "Zona Navigli (location in aggiornamento)",
    title: "KiloMystery Pop-Up – Milano",
    description:
      "Mystery box Standard e Premium, offerte dedicate all’evento.",
    extraInfo: "Dettagli in aggiornamento.",
  },
];

type CopyKey =
  | "kicker"
  | "heroTitle"
  | "heroSubtitle"
  | "upcomingTitle"
  | "pillPopup"
  | "infoDisclaimer"
  | "ctaTitle"
  | "ctaText"
  | "ctaButton";

type CopyPerLang = Record<CopyKey, string>;

const EVENTS_COPY: Record<Lang, CopyPerLang> = {
  it: {
    kicker: "Pop-Up & Eventi",
    heroTitle: "Pop-Up & Eventi KiloMystery",
    heroSubtitle:
      "Vieni a scoprire le nostre mystery box dal vivo nei pop-up ufficiali.",
    upcomingTitle: "Prossimi eventi",
    pillPopup: "Pop-Up Store",
    infoDisclaimer: "*Le informazioni potrebbero subire variazioni.",
    ctaTitle: "Vuoi ospitare un pop-up KiloMystery?",
    ctaText: "Siamo aperti a collaborazioni con store, fiere ed eventi.",
    ctaButton: "Vai alla sezione contatti",
  },
  en: {
    kicker: "Pop-Up & Events",
    heroTitle: "KiloMystery Pop-Up & Events",
    heroSubtitle:
      "Discover our mystery boxes in real life at our official pop-up events.",
    upcomingTitle: "Upcoming events",
    pillPopup: "Pop-Up Store",
    infoDisclaimer: "*Information may be subject to change.",
    ctaTitle: "Want to host a KiloMystery pop-up?",
    ctaText: "We are open to collaborations with stores, fairs and events.",
    ctaButton: "Go to contacts section",
  },
  es: {
    kicker: "Pop-Up y Eventos",
    heroTitle: "Pop-Up y Eventos KiloMystery",
    heroSubtitle:
      "Descubre nuestras mystery boxes en directo en los pop-up oficiales.",
    upcomingTitle: "Próximos eventos",
    pillPopup: "Pop-Up Store",
    infoDisclaimer: "*La información puede estar sujeta a cambios.",
    ctaTitle: "¿Quieres acoger un pop-up de KiloMystery?",
    ctaText:
      "Estamos abiertos a colaborar con tiendas, ferias y eventos.",
    ctaButton: "Ir a la sección de contacto",
  },
  fr: {
    kicker: "Pop-Up & Événements",
    heroTitle: "Pop-Up & Événements KiloMystery",
    heroSubtitle:
      "Découvre nos mystery box en vrai lors de nos pop-up officiels.",
    upcomingTitle: "Prochains événements",
    pillPopup: "Pop-Up Store",
    infoDisclaimer: "*Les informations peuvent être amenées à changer.",
    ctaTitle: "Tu veux accueillir un pop-up KiloMystery ?",
    ctaText:
      "Nous sommes ouverts aux collaborations avec magasins, salons et événements.",
    ctaButton: "Aller à la section contact",
  },
  de: {
    kicker: "Pop-Up & Events",
    heroTitle: "KiloMystery Pop-Up & Events",
    heroSubtitle:
      "Erlebe unsere Mystery Boxen live auf den offiziellen Pop-Up-Events.",
    upcomingTitle: "Bevorstehende Events",
    pillPopup: "Pop-Up Store",
    infoDisclaimer: "*Informationen können sich noch ändern.",
    ctaTitle: "Möchtest du ein KiloMystery Pop-Up hosten?",
    ctaText:
      "Wir sind offen für Kooperationen mit Shops, Messen und Events.",
    ctaButton: "Zur Kontakt-Sektion",
  },
};

export default function EventsPage({
  params,
}: {
  params: { lang: string };
}) {
  const lang: Lang = normalizeLang(params?.lang);
  const t = EVENTS_COPY[lang] ?? EVENTS_COPY.it;

  return (
    <>
      <Header lang={lang} />

      <main className="container py-12 mb-16 space-y-12">
        {/* INTRO */}
        <header className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="uppercase tracking-[.2em] text-emerald-300/80 text-xs md:text-sm">
            {t.kicker}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
            {t.heroTitle}
          </h1>

          <p className="text-white/70 text-sm md:text-base">
            {t.heroSubtitle}
          </p>
        </header>

        {/* LISTA EVENTI */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            {t.upcomingTitle} <span className="text-2xl">📍</span>
          </h2>

          <div className="space-y-5">
            {upcomingEvents.map((event) => (
              <article
                key={event.id}
                className="card grid gap-4 md:grid-cols-[2fr_1fr] md:items-stretch"
              >
                {/* TESTO EVENTO */}
                <div className="flex flex-col justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 uppercase tracking-[.15em] text-[0.65rem] text-emerald-200/90 bg-white/5">
                        {t.pillPopup}
                      </span>

                      <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[0.7rem] text-white/75 bg-white/5">
                        📍 {event.city}
                      </span>

                      <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[0.7rem] text-white/75 bg-white/5">
                        🗓 {event.date}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-extrabold">
                      {event.title}
                    </h3>

                    <p className="text-sm text-white/70">{event.location}</p>
                    <p className="mt-1 text-sm text-white/80">
                      {event.description}
                    </p>

                    {event.extraInfo && (
                      <p className="mt-1 text-xs text-white/60">
                        {event.extraInfo}
                      </p>
                    )}
                  </div>

                  <p className="text-[0.7rem] text-white/40">
                    {t.infoDisclaimer}
                  </p>
                </div>

                {/* LOCANDINA (VERTICALE A4) */}
                <div className="flex justify-center md:justify-end">
                  <div className="relative w-40 sm:w-48 md:w-56 aspect-[3/4] rounded-xl overflow-hidden border border-white/18 bg-[#0b1714] shadow-[0_14px_36px_rgba(0,0,0,0.55)]">
                    {event.image ? (
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white/50 px-3 text-center">
                        Locandina in arrivo
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="card space-y-3">
          <h3 className="text-lg md:text-xl font-extrabold">
            {t.ctaTitle}
          </h3>
          <p className="text-white/70 text-sm md:text-base">
            {t.ctaText}
          </p>
          <a
            href={`/${lang}#contattaci`}
            className="btn btn-ghost inline-flex mt-1"
          >
            {t.ctaButton}
          </a>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
