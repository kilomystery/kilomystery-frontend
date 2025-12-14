/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Image from "next/image";
import { Lang, normalizeLang } from "@/i18n/lang";

type ComingKey =
  | "badge"
  | "heroTitle"
  | "heroSubtitle"
  | "bullet1"
  | "bullet2"
  | "bullet3"
  | "comingTitle"
  | "comingItem1"
  | "comingItem2"
  | "comingItem3"
  | "comingItem4"
  | "sustainTitle"
  | "sustainText"
  | "newsletterLabel"
  | "newsletterPlaceholder"
  | "newsletterButton"
  | "footerNote";

type ComingCopyPerLang = Record<ComingKey, string>;

const COMING_COPY: Record<Lang, ComingCopyPerLang> = {
  it: {
    badge: "Coming soon",
    heroTitle: "Sta arrivando la prossima ondata di mystery box al Kg 🔥",
    heroSubtitle:
      "Stiamo preparando nuovi lotti, pop-up ed esperienze speciali per chi ama pesare il mistero e spacchettare la sorpresa.",
    bullet1:
      "♻️ Seconda vita ai pacchi – meno sprechi, più storie",
    bullet2:
      "📦 Lotti tracciati – pesi chiari, zero fuffa",
    bullet3: "🌍 Spedizione in tutta Europa",
    comingTitle: "Cosa stiamo preparando",
    comingItem1:
      "Nuovi lotti Standard e Premium con selezione migliorata",
    comingItem2:
      "Calendario aggiornato degli eventi pop-up e dei corner dal vivo",
    comingItem3:
      "Esperienze extra per gli ordini più grandi (ruote, giochi, ecc.)",
    comingItem4:
      "Più trasparenza su CO₂ evitata, lotti e provenienza",
    sustainTitle: "Seconda vita ai pacchi, meno rifiuti ♻️",
    sustainText:
      "Recuperiamo pacchi smarriti, resi non reclamati e stock fermi. Invece di diventare rifiuti, tornano in circolo come unboxing sorpresa. Ogni box è un piccolo “no” allo spreco e un “sì” a un consumo più consapevole.",
    newsletterLabel: "Lascia la tua email per essere avvisato al lancio",
    newsletterPlaceholder: "tu@esempio.com",
    newsletterButton: "Avvisami",
    footerNote:
      "Niente spam. Solo novità sui prossimi lotti, drop e pop-up.",
  },

  en: {
    badge: "Coming soon",
    heroTitle: "The next wave of mystery boxes by the kilo is coming 🔥",
    heroSubtitle:
      "We’re preparing new batches, upcoming pop-ups and a few extra surprises for people who love to weigh the mystery and unbox the surprise.",
    bullet1:
      "♻️ Second life for parcels – less waste, more stories to unbox",
    bullet2:
      "📦 Traceable batches – batch IDs, clear weights, no fluff",
    bullet3:
      "🌍 Shipping across Europe – mystery boxes by the kilo beyond Italy",
    comingTitle: "What we’re working on",
    comingItem1:
      "New Standard and Premium batches with improved selection",
    comingItem2:
      "Updated pop-up events calendar and offline corners",
    comingItem3:
      "Extra experiences for bigger orders (wheels, games, etc.)",
    comingItem4:
      "More transparency on CO₂ avoided, batches and origins",
    sustainTitle: "Second life for parcels, less waste ♻️",
    sustainText:
      "We recover lost parcels, unclaimed returns and idle stock. Instead of becoming waste, they come back as surprise unboxings. Each box is a small “no” to waste and a “yes” to more conscious consumption.",
    newsletterLabel: "Drop your email to get notified when we launch",
    newsletterPlaceholder: "you@example.com",
    newsletterButton: "Notify me",
    footerNote:
      "No spam. Just launch dates, drops and pop-ups.",
  },

  es: {
    badge: "Muy pronto",
    heroTitle: "Llega la próxima ola de mystery boxes al kilo 🔥",
    heroSubtitle:
      "Estamos preparando nuevos lotes, próximos pop-ups y algunas sorpresas extra para quienes disfrutan pesar el misterio y abrir la sorpresa.",
    bullet1:
      "♻️ Segunda vida para los paquetes – menos residuos, más historias",
    bullet2:
      "📦 Lotes trazables – IDs claros, cero humo",
    bullet3:
      "🌍 Envíos a toda Europa",
    comingTitle: "Qué estamos preparando",
    comingItem1:
      "Nuevos lotes Standard y Premium con una selección mejorada",
    comingItem2:
      "Calendario actualizado de eventos pop-up y corners físicos",
    comingItem3:
      "Experiencias extra para pedidos grandes (ruletas, juegos, etc.)",
    comingItem4:
      "Más transparencia sobre el CO₂ evitado, los lotes y su procedencia",
    sustainTitle: "Segunda vida para los paquetes, menos residuos ♻️",
    sustainText:
      "Rescatamos paquetes perdidos, devoluciones no reclamadas y stock parado. En lugar de convertirse en basura, vuelven como unboxings sorpresa. Cada box es un pequeño “no” al despilfarro y un “sí” a un consumo más consciente.",
    newsletterLabel:
      "Deja tu correo para que te avisemos cuando lancemos",
    newsletterPlaceholder: "tu@ejemplo.com",
    newsletterButton: "Avísame",
    footerNote:
      "Nada de spam. Solo noticias de próximos lotes, drops y pop-ups.",
  },

  fr: {
    badge: "Bientôt disponible",
    heroTitle:
      "La prochaine vague de mystery box au kilo arrive bientôt 🔥",
    heroSubtitle:
      "Nous préparons de nouveaux lots, les prochains pop-up et quelques surprises pour celles et ceux qui aiment peser le mystère et déballer la surprise.",
    bullet1:
      "♻️ Une seconde vie pour les colis – moins de déchets, plus d’histoires à déballer",
    bullet2:
      "📦 Lots traçables – IDs clairs, poids transparents, zéro blabla",
    bullet3:
      "🌍 Expédition dans toute l’Europe",
    comingTitle: "Ce que nous préparons",
    comingItem1:
      "De nouveaux lots Standard et Premium avec une sélection améliorée",
    comingItem2:
      "Un calendrier à jour de nos événements pop-up et corners physiques",
    comingItem3:
      "Des expériences supplémentaires pour les plus grosses commandes (roues, jeux, etc.)",
    comingItem4:
      "Plus de transparence sur le CO₂ évité, les lots et leur origine",
    sustainTitle:
      "Une seconde vie pour les colis, moins de déchets ♻️",
    sustainText:
      "Nous récupérons des colis perdus, des retours non réclamés et des stocks bloqués. Au lieu de finir à la poubelle, ils reviennent à la vie sous forme de déballages surprise. Chaque box est un petit « non » au gaspillage et un « oui » à une consommation plus responsable.",
    newsletterLabel:
      "Laissez votre email pour être averti(e) du lancement",
    newsletterPlaceholder: "vous@exemple.com",
    newsletterButton: "Prévenez-moi",
    footerNote:
      "Pas de spam. Uniquement des nouvelles sur les prochains lots, drops et pop-up.",
  },

  de: {
    badge: "Bald verfügbar",
    heroTitle:
      "Die nächste Welle Mystery-Boxen pro Kilo steht in den Startlöchern 🔥",
    heroSubtitle:
      "Wir bereiten neue Chargen, kommende Pop-up-Events und ein paar Extras für alle vor, die es lieben, das Geheimnis zu wiegen und die Überraschung auszupacken.",
    bullet1:
      "♻️ Zweites Leben für Pakete – weniger Müll, mehr Stories beim Unboxing",
    bullet2:
      "📦 Rückverfolgbare Chargen – klare Gewichte, kein Bullshit",
    bullet3:
      "🌍 Versand in ganz Europa",
    comingTitle: "Woran wir arbeiten",
    comingItem1:
      "Neue Standard- und Premium-Chargen mit besserer Auswahl",
    comingItem2:
      "Aktualisierter Kalender für Pop-up-Events und Offline-Corner",
    comingItem3:
      "Zusätzliche Erlebnisse für größere Bestellungen (Glücksrad, Spiele usw.)",
    comingItem4:
      "Mehr Transparenz über vermiedenes CO₂, Chargen und Herkunft",
    sustainTitle: "Zweites Leben für Pakete, weniger Abfall ♻️",
    sustainText:
      "Wir retten verlorene Pakete, nicht abgeholte Retouren und Lagerbestände. Statt im Müll zu landen, werden sie zu Überraschungs-Unboxings. Jede Box ist ein kleines „Nein“ zur Verschwendung und ein „Ja“ zu bewussterem Konsum.",
    newsletterLabel:
      "Trag deine E-Mail ein, um beim Start benachrichtigt zu werden",
    newsletterPlaceholder: "du@beispiel.de",
    newsletterButton: "Mich benachrichtigen",
    footerNote:
      "Kein Spam. Nur Infos zu neuen Chargen, Drops und Pop-ups.",
  },
};

// NOINDEX solo per la coming soon
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

type PageProps = {
  params: Promise<{ lang: string }>;
};

export default async function ComingSoonPage({ params }: PageProps) {
  const resolved = await params;
  const lang: Lang = normalizeLang(resolved.lang);
  const t = COMING_COPY[lang] ?? COMING_COPY.en;

  return (
    <main className="container space-y-10 py-10 md:py-16">
      {/* CARD PRINCIPALE */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 pt-10 md:p-10 md:pt-12">
        {/* logo + badge */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="KiloMystery"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              KILOMYSTERY
            </span>
          </div>

          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
            {t.badge}
          </span>
        </div>

        {/* titolo gradient */}
        <h1 className="text-center text-3xl md:text-5xl font-extrabold leading-tight">
          <span className="bg-gradient-to-r from-[#7A20FF] via-[#c3fffd] to-[#20D27A] bg-clip-text text-transparent">
            {t.heroTitle}
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-center text-white/70">
          {t.heroSubtitle}
        </p>

        {/* bullet list */}
        <ul className="mx-auto mt-6 max-w-xl space-y-2 text-sm text-white/80">
          <li>{t.bullet1}</li>
          <li>{t.bullet2}</li>
          <li>{t.bullet3}</li>
        </ul>

        {/* newsletter form */}
        <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-white/15 bg-black/30 p-4 backdrop-blur">
          <p className="text-sm font-medium text-white/90">
            {t.newsletterLabel}
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder={t.newsletterPlaceholder}
              className="flex-1 rounded-full border border-white/30 bg-black/60 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#7A20FF]"
            />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-white/70 bg-gradient-to-r from-[#7A20FF] to-[#20D27A] px-5 py-2 text-sm font-extrabold text-[#0c0f10] shadow-[0_10px_28px_rgba(122,32,255,.25),0_6px_20px_rgba(32,210,122,.25)]"
            >
              {t.newsletterButton}
            </button>
          </div>
          <p className="mt-2 text-xs text-white/50">{t.footerNote}</p>
        </div>
      </section>

      {/* card sotto: cosa stiamo preparando + sostenibilità */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
          <h2 className="text-lg md:text-xl font-extrabold">
            {t.comingTitle}
          </h2>
          <ul className="mt-3 list-disc ps-5 space-y-1 text-sm text-white/80">
            <li>{t.comingItem1}</li>
            <li>{t.comingItem2}</li>
            <li>{t.comingItem3}</li>
            <li>{t.comingItem4}</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
          <h2 className="flex items-center gap-2 text-lg md:text-xl font-extrabold">
            <span>{t.sustainTitle}</span>
            <span className="text-base">🌱</span>
          </h2>
          <p className="mt-3 text-sm text-white/80">{t.sustainText}</p>
        </div>
      </section>
    </main>
  );
}
