"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

type CopyKey =
  | "kicker"
  | "heroTitle"
  | "heroSubtitle"
  | "calendarTitle"
  | "calendarText"
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
    calendarTitle: "Calendario eventi",
    calendarText:
      "Stiamo aggiornando il calendario. Torna presto per scoprire le prossime date.",
    ctaTitle: "Vuoi ospitare un pop-up KiloMystery?",
    ctaText: "Siamo aperti a collaborazioni con store, fiere ed eventi.",
    ctaButton: "Vai alla sezione contatti",
  },
  en: {
    kicker: "Pop-Up & Events",
    heroTitle: "KiloMystery Pop-Up & Events",
    heroSubtitle:
      "Discover our mystery boxes in real life at our official pop-up events.",
    calendarTitle: "Events calendar",
    calendarText:
      "We’re updating the calendar. Check back soon for upcoming dates.",
    ctaTitle: "Want to host a KiloMystery pop-up?",
    ctaText: "We are open to collaborations with stores, fairs and events.",
    ctaButton: "Go to contacts section",
  },
  es: {
    kicker: "Pop-Up y Eventos",
    heroTitle: "Pop-Up y Eventos KiloMystery",
    heroSubtitle:
      "Descubre nuestras mystery boxes en directo en los pop-up oficiales.",
    calendarTitle: "Calendario de eventos",
    calendarText:
      "Estamos actualizando el calendario. Vuelve pronto para ver las próximas fechas.",
    ctaTitle: "¿Quieres acoger un pop-up de KiloMystery?",
    ctaText: "Estamos abiertos a colaborar con tiendas, ferias y eventos.",
    ctaButton: "Ir a la sección de contacto",
  },
  fr: {
    kicker: "Pop-Up & Événements",
    heroTitle: "Pop-Up & Événements KiloMystery",
    heroSubtitle:
      "Découvre nos mystery box en vrai lors de nos pop-up officiels.",
    calendarTitle: "Calendrier des événements",
    calendarText:
      "Nous mettons à jour le calendrier. Reviens bientôt pour les prochaines dates.",
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
    calendarTitle: "Event-Kalender",
    calendarText:
      "Wir aktualisieren gerade den Kalender. Schau bald wieder vorbei für neue Termine.",
    ctaTitle: "Möchtest du ein KiloMystery Pop-Up hosten?",
    ctaText: "Wir sind offen für Kooperationen mit Shops, Messen und Events.",
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

        {/* PLACEHOLDER CALENDARIO */}
        <section className="card text-center py-10 px-6 space-y-3">
          <div className="text-4xl">🗓️</div>
          <h2 className="text-2xl md:text-3xl font-extrabold">
            {t.calendarTitle}
          </h2>
          <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto">
            {t.calendarText}
          </p>
        </section>

        {/* CTA */}
        <section className="card space-y-3">
          <h3 className="text-lg md:text-xl font-extrabold">{t.ctaTitle}</h3>
          <p className="text-white/70 text-sm md:text-base">{t.ctaText}</p>
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
