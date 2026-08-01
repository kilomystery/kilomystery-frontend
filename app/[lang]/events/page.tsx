"use client";

import Image from "next/image";
import Link from "next/link";
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
  | "dateLabel"
  | "locationLabel"
  | "hoursTitle"
  | "hoursThursday"
  | "hoursFriday"
  | "hoursSaturday"
  | "hoursSunday"
  | "mapButton"
  | "ctaTitle"
  | "ctaText"
  | "ctaButton"
  | "posterAlt";

type CopyPerLang = Record<CopyKey, string>;

const POSTER_SRC =
  "/events/monopoli-2026-13-16-agosto.webp";

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Via+Muzio+Sforza+13+70043+Monopoli+BA";

const EVENTS_COPY: Record<Lang, CopyPerLang> = {
  it: {
    kicker: "Pop-Up & Eventi",

    heroTitle: "Pop-Up & Eventi KiloMystery",

    heroSubtitle:
      "Vieni a scoprire dal vivo il mondo Kilo Mystery: pacchi smarriti, non reclamati, resi, giacenze e sorprese tutte da aprire.",

    calendarTitle: "Prossimo evento",

    calendarText:
      "Kilo Mystery arriva a Monopoli con pacchi smarriti e non reclamati in vendita per soli quattro giorni, fino a esaurimento scorte.",

    eventBadge: "Evento ufficiale",

    eventTitle:
      "Pacchi smarriti e non reclamati in vendita a Monopoli",

    eventDate: "13 · 14 · 15 · 16 agosto 2026",

    eventLocation: "Kilo Mystery Pop-Up Store",

    eventAddress: "Via Muzio Sforza 13, Monopoli (BA)",

    eventDescription:
      "Un evento aperto al pubblico dove potrai scegliere liberamente i pacchi disponibili, pesarli, acquistarli e scoprire cosa contengono. Le Mystery Box possono contenere pacchi non reclamati, resi, giacenze, overstock e spedizioni smarrite.",

    eventHowTitle: "Come funziona",

    eventHow1: "Scegli liberamente i pacchi disponibili",

    eventHow2: "Li pesi e paghi solamente in base al peso",

    eventHow3:
      "Dopo l’acquisto li apri e scopri il contenuto mystery",

    eventPrizeTitle: "Golden Ticket",

    eventPrizeText:
      "Durante l’evento sarà nascosto un Golden Ticket all’interno di uno dei pacchi. Chi lo troverà vincerà un iPhone 17.",

    eventStock:
      "Quantità limitate · Fino a esaurimento scorte",

    dateLabel: "Date",

    locationLabel: "Luogo",

    hoursTitle: "Orari di apertura",

    hoursThursday:
      "Giovedì 13 agosto: 17:00 – 01:00",

    hoursFriday:
      "Venerdì 14 agosto: 10:30 – 13:30 e 17:00 – 01:00",

    hoursSaturday:
      "Sabato 15 agosto: 17:00 – 01:00",

    hoursSunday:
      "Domenica 16 agosto: 10:30 – 13:30 e 17:00 – 01:00",

    mapButton: "Apri la posizione",

    ctaTitle: "Vuoi ospitare un pop-up KiloMystery?",

    ctaText:
      "Siamo aperti a collaborazioni con proprietari di locali, store, fiere ed eventi in tutta Italia.",

    ctaButton: "Vai alla sezione contatti",

    posterAlt:
      "Locandina del pop-up Kilo Mystery di Monopoli dal 13 al 16 agosto 2026",
  },

  en: {
    kicker: "Pop-Up & Events",

    heroTitle: "KiloMystery Pop-Up & Events",

    heroSubtitle:
      "Discover the Kilo Mystery world in real life: lost parcels, unclaimed parcels, returns, leftover stock and surprises to open.",

    calendarTitle: "Next event",

    calendarText:
      "Kilo Mystery arrives in Monopoli with lost and unclaimed parcels on sale for only four days, while stocks last.",

    eventBadge: "Official event",

    eventTitle:
      "Lost and unclaimed parcels on sale in Monopoli",

    eventDate: "13 · 14 · 15 · 16 August 2026",

    eventLocation: "Kilo Mystery Pop-Up Store",

    eventAddress: "Via Muzio Sforza 13, Monopoli, Italy",

    eventDescription:
      "A public event where you can freely choose the available parcels, weigh them, purchase them and discover what is inside. The Mystery Boxes may contain unclaimed parcels, returns, leftover stock, overstock and lost shipments.",

    eventHowTitle: "How it works",

    eventHow1: "Choose freely from the available parcels",

    eventHow2:
      "Weigh them and pay only according to their weight",

    eventHow3:
      "Open them after your purchase and discover the mystery contents",

    eventPrizeTitle: "Golden Ticket",

    eventPrizeText:
      "A Golden Ticket will be hidden inside one of the parcels during the event. Whoever finds it will win an iPhone 17.",

    eventStock: "Limited quantities · While stocks last",

    dateLabel: "Dates",

    locationLabel: "Location",

    hoursTitle: "Opening hours",

    hoursThursday:
      "Thursday 13 August: 5:00 PM – 1:00 AM",

    hoursFriday:
      "Friday 14 August: 10:30 AM – 1:30 PM and 5:00 PM – 1:00 AM",

    hoursSaturday:
      "Saturday 15 August: 5:00 PM – 1:00 AM",

    hoursSunday:
      "Sunday 16 August: 10:30 AM – 1:30 PM and 5:00 PM – 1:00 AM",

    mapButton: "Open location",

    ctaTitle:
      "Would you like to host a KiloMystery pop-up?",

    ctaText:
      "We are open to collaborations with property owners, stores, fairs and events throughout Italy.",

    ctaButton: "Go to the contact section",

    posterAlt:
      "Poster for the Kilo Mystery pop-up event in Monopoli from 13 to 16 August 2026",
  },

  es: {
    kicker: "Pop-Up y Eventos",

    heroTitle: "Pop-Up y Eventos KiloMystery",

    heroSubtitle:
      "Descubre el mundo Kilo Mystery en vivo: paquetes perdidos, no reclamados, devoluciones, stock y sorpresas por abrir.",

    calendarTitle: "Próximo evento",

    calendarText:
      "Kilo Mystery llega a Monopoli con paquetes perdidos y no reclamados a la venta durante solo cuatro días, hasta agotar existencias.",

    eventBadge: "Evento oficial",

    eventTitle:
      "Paquetes perdidos y no reclamados a la venta en Monopoli",

    eventDate: "13 · 14 · 15 · 16 de agosto de 2026",

    eventLocation: "Kilo Mystery Pop-Up Store",

    eventAddress: "Via Muzio Sforza 13, Monopoli, Italia",

    eventDescription:
      "Un evento abierto al público donde podrás elegir libremente los paquetes disponibles, pesarlos, comprarlos y descubrir qué contienen. Las Mystery Boxes pueden contener paquetes no reclamados, devoluciones, excedentes, overstock y envíos perdidos.",

    eventHowTitle: "Cómo funciona",

    eventHow1: "Elige libremente los paquetes disponibles",

    eventHow2: "Pésalos y paga solamente según su peso",

    eventHow3:
      "Ábrelos después de la compra y descubre el contenido mystery",

    eventPrizeTitle: "Golden Ticket",

    eventPrizeText:
      "Durante el evento habrá un Golden Ticket escondido dentro de uno de los paquetes. Quien lo encuentre ganará un iPhone 17.",

    eventStock:
      "Cantidades limitadas · Hasta agotar existencias",

    dateLabel: "Fechas",

    locationLabel: "Lugar",

    hoursTitle: "Horario de apertura",

    hoursThursday:
      "Jueves 13 de agosto: 17:00 – 01:00",

    hoursFriday:
      "Viernes 14 de agosto: 10:30 – 13:30 y 17:00 – 01:00",

    hoursSaturday:
      "Sábado 15 de agosto: 17:00 – 01:00",

    hoursSunday:
      "Domingo 16 de agosto: 10:30 – 13:30 y 17:00 – 01:00",

    mapButton: "Abrir ubicación",

    ctaTitle:
      "¿Quieres acoger un pop-up de KiloMystery?",

    ctaText:
      "Estamos abiertos a colaborar con propietarios, tiendas, ferias y eventos en toda Italia.",

    ctaButton: "Ir a la sección de contacto",

    posterAlt:
      "Cartel del evento pop-up Kilo Mystery en Monopoli del 13 al 16 de agosto de 2026",
  },

  fr: {
    kicker: "Pop-Up & Événements",

    heroTitle: "Pop-Up & Événements KiloMystery",

    heroSubtitle:
      "Découvre l’univers Kilo Mystery en vrai : colis perdus, non réclamés, retours, stocks et surprises à ouvrir.",

    calendarTitle: "Prochain événement",

    calendarText:
      "Kilo Mystery arrive à Monopoli avec des colis perdus et non réclamés en vente pendant quatre jours seulement, jusqu’à épuisement des stocks.",

    eventBadge: "Événement officiel",

    eventTitle:
      "Colis perdus et non réclamés en vente à Monopoli",

    eventDate: "13 · 14 · 15 · 16 août 2026",

    eventLocation: "Kilo Mystery Pop-Up Store",

    eventAddress: "Via Muzio Sforza 13, Monopoli, Italie",

    eventDescription:
      "Un événement ouvert au public où tu peux choisir librement les colis disponibles, les peser, les acheter et découvrir leur contenu. Les Mystery Boxes peuvent contenir des colis non réclamés, des retours, des surplus, du surstock et des envois perdus.",

    eventHowTitle: "Comment ça marche",

    eventHow1:
      "Choisis librement les colis disponibles",

    eventHow2:
      "Pèse-les et paie uniquement selon leur poids",

    eventHow3:
      "Ouvre-les après l’achat et découvre le contenu mystery",

    eventPrizeTitle: "Golden Ticket",

    eventPrizeText:
      "Pendant l’événement, un Golden Ticket sera caché dans l’un des colis. La personne qui le trouvera gagnera un iPhone 17.",

    eventStock:
      "Quantités limitées · Jusqu’à épuisement des stocks",

    dateLabel: "Dates",

    locationLabel: "Lieu",

    hoursTitle: "Horaires d’ouverture",

    hoursThursday:
      "Jeudi 13 août : 17h00 – 01h00",

    hoursFriday:
      "Vendredi 14 août : 10h30 – 13h30 et 17h00 – 01h00",

    hoursSaturday:
      "Samedi 15 août : 17h00 – 01h00",

    hoursSunday:
      "Dimanche 16 août : 10h30 – 13h30 et 17h00 – 01h00",

    mapButton: "Ouvrir l’itinéraire",

    ctaTitle:
      "Tu veux accueillir un pop-up KiloMystery ?",

    ctaText:
      "Nous sommes ouverts aux collaborations avec propriétaires, magasins, salons et événements dans toute l’Italie.",

    ctaButton: "Aller à la section contact",

    posterAlt:
      "Affiche du pop-up Kilo Mystery à Monopoli du 13 au 16 août 2026",
  },

  de: {
    kicker: "Pop-Up & Events",

    heroTitle: "KiloMystery Pop-Up & Events",

    heroSubtitle:
      "Erlebe Kilo Mystery live: verlorene Pakete, nicht abgeholte Pakete, Retouren, Restbestände und Überraschungen zum Öffnen.",

    calendarTitle: "Nächstes Event",

    calendarText:
      "Kilo Mystery kommt nach Monopoli. Verlorene und nicht abgeholte Pakete werden vier Tage lang verkauft, solange der Vorrat reicht.",

    eventBadge: "Offizielles Event",

    eventTitle:
      "Verlorene und nicht abgeholte Pakete in Monopoli im Verkauf",

    eventDate: "13 · 14 · 15 · 16 August 2026",

    eventLocation: "Kilo Mystery Pop-Up Store",

    eventAddress: "Via Muzio Sforza 13, Monopoli, Italien",

    eventDescription:
      "Eine öffentliche Veranstaltung, bei der du die verfügbaren Pakete frei auswählst, wiegst, kaufst und ihren Inhalt entdeckst. Die Mystery Boxes können nicht abgeholte Pakete, Retouren, Restbestände, Überbestände und verlorene Sendungen enthalten.",

    eventHowTitle: "So funktioniert es",

    eventHow1:
      "Wähle die verfügbaren Pakete frei aus",

    eventHow2:
      "Wiege sie und zahle ausschließlich nach Gewicht",

    eventHow3:
      "Öffne sie nach dem Kauf und entdecke den Mystery-Inhalt",

    eventPrizeTitle: "Golden Ticket",

    eventPrizeText:
      "Während des Events wird ein Golden Ticket in einem der Pakete versteckt. Wer es findet, gewinnt ein iPhone 17.",

    eventStock:
      "Begrenzte Menge · Solange der Vorrat reicht",

    dateLabel: "Termine",

    locationLabel: "Ort",

    hoursTitle: "Öffnungszeiten",

    hoursThursday:
      "Donnerstag, 13. August: 17:00 – 01:00 Uhr",

    hoursFriday:
      "Freitag, 14. August: 10:30 – 13:30 Uhr und 17:00 – 01:00 Uhr",

    hoursSaturday:
      "Samstag, 15. August: 17:00 – 01:00 Uhr",

    hoursSunday:
      "Sonntag, 16. August: 10:30 – 13:30 Uhr und 17:00 – 01:00 Uhr",

    mapButton: "Standort öffnen",

    ctaTitle:
      "Möchtest du ein KiloMystery Pop-Up hosten?",

    ctaText:
      "Wir sind offen für Kooperationen mit Eigentümern, Shops, Messen und Events in ganz Italien.",

    ctaButton: "Zum Kontaktbereich",

    posterAlt:
      "Plakat für das Kilo Mystery Pop-up in Monopoli vom 13. bis 16. August 2026",
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

      <main className="container py-12 mb-16 space-y-10">
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

        <section className="card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[.18em] text-emerald-300 mb-2">
              {t.calendarTitle}
            </div>

            <p className="text-white/75 text-sm md:text-base max-w-3xl">
              {t.calendarText}
            </p>
          </div>

          <div className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-extrabold text-emerald-300">
            13–16 agosto 2026
          </div>
        </section>

        <section className="card overflow-hidden p-0">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-0">
            {/*
              Non usiamo "fill" né "object-cover".
              In questo modo la locandina mantiene le proporzioni
              originali e non viene mai ritagliata.
            */}
            <div className="bg-black flex items-start justify-center p-2 sm:p-4">
              <Image
                src={POSTER_SRC}
                alt={t.posterAlt}
                width={1080}
                height={1350}
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="block w-full h-auto object-contain"
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

                <p className="text-white/70 text-sm md:text-base leading-relaxed">
                  {t.eventDescription}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-white/50 text-xs uppercase tracking-[.18em] mb-1">
                    {t.dateLabel}
                  </div>

                  <div className="font-extrabold text-lg text-emerald-300">
                    {t.eventDate}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-white/50 text-xs uppercase tracking-[.18em] mb-1">
                    {t.locationLabel}
                  </div>

                  <div className="font-extrabold text-lg">
                    {t.eventLocation}
                  </div>

                  <div className="text-white/60 text-sm mt-1">
                    {t.eventAddress}
                  </div>

                  <a
                    href={MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex mt-4 text-sm font-bold text-emerald-300 hover:text-emerald-200 transition-colors"
                  >
                    📍 {t.mapButton}
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 space-y-3">
                <h3 className="text-lg md:text-xl font-extrabold text-emerald-300">
                  🕒 {t.hoursTitle}
                </h3>

                <div className="grid gap-2 text-sm md:text-base text-white/80">
                  <div>{t.hoursThursday}</div>
                  <div>{t.hoursFriday}</div>
                  <div>{t.hoursSaturday}</div>
                  <div>{t.hoursSunday}</div>
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

                <p className="text-white/75 text-sm md:text-base leading-relaxed">
                  {t.eventPrizeText}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-center font-extrabold text-emerald-300">
                {t.eventStock}
              </div>
            </div>
          </div>
        </section>

        <section className="card space-y-4">
          <h3 className="text-lg md:text-xl font-extrabold">
            {t.ctaTitle}
          </h3>

          <p className="text-white/70 text-sm md:text-base">
            {t.ctaText}
          </p>

          <Link
            href={`/${lang}#contattaci`}
            className="btn btn-ghost inline-flex mt-1"
          >
            {t.ctaButton}
          </Link>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}