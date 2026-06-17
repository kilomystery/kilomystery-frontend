"use client";

import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

type CopyKey =
  | "kicker"
  | "heroTitle"
  | "heroSubtitle"
  | "calendarTitle"
  | "calendarText"
  | "eventBadge"
  | "eventTitle"
  | "eventDate"
  | "eventLocation"
  | "eventAddress"
  | "eventDescription"
  | "eventHowTitle"
  | "eventHow1"
  | "eventHow2"
  | "eventHow3"
  | "eventPrizeTitle"
  | "eventPrizeText"
  | "eventStock"
  | "ctaTitle"
  | "ctaText"
  | "ctaButton";

type CopyPerLang = Record<CopyKey, string>;

const EVENTS_COPY: Record<Lang, CopyPerLang> = {
  it: {
    kicker: "Pop-Up & Eventi",
    heroTitle: "Pop-Up & Eventi KiloMystery",
    heroSubtitle:
      "Vieni a scoprire dal vivo il mondo Kilo Mystery: pacchi smarriti, non reclamati, resi, giacenze e sorprese tutte da aprire.",
    calendarTitle: "Prossimo evento",
    calendarText:
      "Il nuovo evento Kilo Mystery arriva a Lecce con pacchi smarriti e non reclamati in vendita fino a esaurimento scorte.",
    eventBadge: "Evento ufficiale",
    eventTitle: "Pacchi smarriti e non reclamati in vendita a Lecce",
    eventDate: "26 · 27 · 28 Giugno 2026",
    eventLocation: "Kilo Mystery Pop-Up Store",
    eventAddress: "Via Nazario Sauro 11, Lecce",
    eventDescription:
      "Un evento aperto al pubblico dove potrai scegliere i pacchi disponibili, pesarli, acquistarli e scoprire cosa contengono. Le nostre Mystery Box possono contenere pacchi non reclamati, smarriti, giacenze e overstock.",
    eventHowTitle: "Come funziona",
    eventHow1: "Scegli i pacchi disponibili",
    eventHow2: "Li pesi e paghi in base al peso",
    eventHow3: "Apri e scopri il contenuto mystery",
    eventPrizeTitle: "Golden Ticket",
    eventPrizeText:
      "Durante l’evento sarà presente il Golden Ticket con in palio un iPhone 17.",
    eventStock: "Quantità limitate · Fino esaurimento scorte",
    ctaTitle: "Vuoi ospitare un pop-up KiloMystery?",
    ctaText: "Siamo aperti a collaborazioni con store, fiere ed eventi.",
    ctaButton: "Vai alla sezione contatti",
  },

  en: {
    kicker: "Pop-Up & Events",
    heroTitle: "KiloMystery Pop-Up & Events",
    heroSubtitle:
      "Discover the Kilo Mystery world in real life: lost parcels, unclaimed parcels, returns, stock leftovers and surprises to open.",
    calendarTitle: "Next event",
    calendarText:
      "The new Kilo Mystery event arrives in Lecce with lost and unclaimed parcels on sale while stocks last.",
    eventBadge: "Official event",
    eventTitle: "Lost and unclaimed parcels on sale in Lecce",
    eventDate: "26 · 27 · 28 June 2026",
    eventLocation: "Kilo Mystery Pop-Up Store",
    eventAddress: "Via Nazario Sauro 11, Lecce",
    eventDescription:
      "A public event where you can choose available parcels, weigh them, buy them and discover what they contain. Our Mystery Boxes may contain unclaimed parcels, lost parcels, stock leftovers and overstock.",
    eventHowTitle: "How it works",
    eventHow1: "Choose your available parcels",
    eventHow2: "Weigh them and pay based on weight",
    eventHow3: "Open them and discover the mystery content",
    eventPrizeTitle: "Golden Ticket",
    eventPrizeText:
      "During the event there will be a Golden Ticket with an iPhone 17 up for grabs.",
    eventStock: "Limited quantities · While stocks last",
    ctaTitle: "Want to host a KiloMystery pop-up?",
    ctaText: "We are open to collaborations with stores, fairs and events.",
    ctaButton: "Go to contacts section",
  },

  es: {
    kicker: "Pop-Up y Eventos",
    heroTitle: "Pop-Up y Eventos KiloMystery",
    heroSubtitle:
      "Descubre el mundo Kilo Mystery en vivo: paquetes perdidos, no reclamados, devoluciones, stock y sorpresas por abrir.",
    calendarTitle: "Próximo evento",
    calendarText:
      "El nuevo evento Kilo Mystery llega a Lecce con paquetes perdidos y no reclamados en venta hasta agotar existencias.",
    eventBadge: "Evento oficial",
    eventTitle: "Paquetes perdidos y no reclamados en venta en Lecce",
    eventDate: "26 · 27 · 28 Junio 2026",
    eventLocation: "Kilo Mystery Pop-Up Store",
    eventAddress: "Via Nazario Sauro 11, Lecce",
    eventDescription:
      "Un evento abierto al público donde podrás elegir los paquetes disponibles, pesarlos, comprarlos y descubrir qué contienen.",
    eventHowTitle: "Cómo funciona",
    eventHow1: "Elige los paquetes disponibles",
    eventHow2: "Pésalos y paga según el peso",
    eventHow3: "Ábrelos y descubre el contenido mystery",
    eventPrizeTitle: "Golden Ticket",
    eventPrizeText:
      "Durante el evento habrá un Golden Ticket con un iPhone 17 en juego.",
    eventStock: "Cantidades limitadas · Hasta agotar existencias",
    ctaTitle: "¿Quieres acoger un pop-up de KiloMystery?",
    ctaText: "Estamos abiertos a colaborar con tiendas, ferias y eventos.",
    ctaButton: "Ir a la sección de contacto",
  },

  fr: {
    kicker: "Pop-Up & Événements",
    heroTitle: "Pop-Up & Événements KiloMystery",
    heroSubtitle:
      "Découvre l’univers Kilo Mystery en vrai : colis perdus, non réclamés, retours, stocks et surprises à ouvrir.",
    calendarTitle: "Prochain événement",
    calendarText:
      "Le nouvel événement Kilo Mystery arrive à Lecce avec des colis perdus et non réclamés en vente jusqu’à épuisement des stocks.",
    eventBadge: "Événement officiel",
    eventTitle: "Colis perdus et non réclamés en vente à Lecce",
    eventDate: "26 · 27 · 28 Juin 2026",
    eventLocation: "Kilo Mystery Pop-Up Store",
    eventAddress: "Via Nazario Sauro 11, Lecce",
    eventDescription:
      "Un événement ouvert au public où tu peux choisir les colis disponibles, les peser, les acheter et découvrir leur contenu.",
    eventHowTitle: "Comment ça marche",
    eventHow1: "Choisis les colis disponibles",
    eventHow2: "Pèse-les et paie selon le poids",
    eventHow3: "Ouvre-les et découvre le contenu mystery",
    eventPrizeTitle: "Golden Ticket",
    eventPrizeText:
      "Pendant l’événement, un Golden Ticket permettra de gagner un iPhone 17.",
    eventStock: "Quantités limitées · Jusqu’à épuisement des stocks",
    ctaTitle: "Tu veux accueillir un pop-up KiloMystery ?",
    ctaText:
      "Nous sommes ouverts aux collaborations avec magasins, salons et événements.",
    ctaButton: "Aller à la section contact",
  },

  de: {
    kicker: "Pop-Up & Events",
    heroTitle: "KiloMystery Pop-Up & Events",
    heroSubtitle:
      "Erlebe Kilo Mystery live: verlorene Pakete, nicht abgeholte Pakete, Retouren, Restbestände und Überraschungen zum Öffnen.",
    calendarTitle: "Nächstes Event",
    calendarText:
      "Das neue Kilo Mystery Event kommt nach Lecce – verlorene und nicht abgeholte Pakete im Verkauf, solange der Vorrat reicht.",
    eventBadge: "Offizielles Event",
    eventTitle: "Verlorene und nicht abgeholte Pakete in Lecce im Verkauf",
    eventDate: "26 · 27 · 28 Juni 2026",
    eventLocation: "Kilo Mystery Pop-Up Store",
    eventAddress: "Via Nazario Sauro 11, Lecce",
    eventDescription:
      "Ein öffentliches Event, bei dem du verfügbare Pakete auswählst, wiegst, kaufst und den Mystery-Inhalt entdeckst.",
    eventHowTitle: "So funktioniert es",
    eventHow1: "Wähle verfügbare Pakete aus",
    eventHow2: "Wiege sie und zahle nach Gewicht",
    eventHow3: "Öffne sie und entdecke den Mystery-Inhalt",
    eventPrizeTitle: "Golden Ticket",
    eventPrizeText:
      "Während des Events gibt es ein Golden Ticket mit einem iPhone 17 als Gewinn.",
    eventStock: "Begrenzte Menge · Solange der Vorrat reicht",
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

        <section className="card overflow-hidden p-0">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-0">
            <div className="relative min-h-[420px] bg-black">
              <Image
                src="/events/lecce-2026-26-06.png"
                alt="Locandina evento Kilo Mystery Lecce pacchi smarriti e non reclamati"
                fill
                priority
                className="object-cover"
              />
            </div>

            <div className="p-6 md:p-8 lg:p-10 space-y-6">
              <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[.18em] text-emerald-300">
                {t.eventBadge}
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
                  {t.eventTitle}
                </h2>

                <p className="text-white/70 text-sm md:text-base">
                  {t.eventDescription}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-white/50 text-xs uppercase tracking-[.18em] mb-1">
                    Data
                  </div>
                  <div className="font-extrabold text-lg text-emerald-300">
                    {t.eventDate}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-white/50 text-xs uppercase tracking-[.18em] mb-1">
                    Luogo
                  </div>
                  <div className="font-extrabold text-lg">
                    {t.eventLocation}
                  </div>
                  <div className="text-white/60 text-sm mt-1">
                    {t.eventAddress}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#7A20FF]/30 bg-[#7A20FF]/10 p-5 space-y-3">
                <h3 className="text-lg md:text-xl font-extrabold">
                  {t.eventHowTitle}
                </h3>

                <div className="grid gap-3 text-sm md:text-base text-white/75">
                  <div>📦 {t.eventHow1}</div>
                  <div>⚖️ {t.eventHow2}</div>
                  <div>🎁 {t.eventHow3}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 space-y-2">
                <h3 className="text-lg md:text-xl font-extrabold text-yellow-300">
                  🎟️ {t.eventPrizeTitle}
                </h3>
                <p className="text-white/75 text-sm md:text-base">
                  {t.eventPrizeText}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-center font-extrabold text-emerald-300">
                {t.eventStock}
              </div>
            </div>
          </div>
        </section>

        <section className="card space-y-3">
          <h3 className="text-lg md:text-xl font-extrabold">{t.ctaTitle}</h3>
          <p className="text-white/70 text-sm md:text-base">{t.ctaText}</p>
          <a href={`/${lang}#contattaci`} className="btn btn-ghost inline-flex mt-1">
            {t.ctaButton}
          </a>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}