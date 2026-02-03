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
  | "info1Title"
  | "info1Value"
  | "info2Title"
  | "info2Value"
  | "info3Title"
  | "info3Value"
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
    info1Title: "Drop #03",
    info1Value: "Febbraio 2026",
    info2Title: "Pop-up tour",
    info2Value: "Brindisi • Surbo • Modena",
    info3Title: "Ingresso ",
    info3Value: "Accesso libero",
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
    info1Title: "Drop #03",
    info1Value: "Spring 2025",
    info2Title: "Pop-up tour",
    info2Value: "Milan • Madrid • Paris",
    info3Title: "Waitlist",
    info3Value: "4.3K people",
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
    info1Title: "Drop #03",
    info1Value: "Primavera 2025",
    info2Title: "Gira pop-up",
    info2Value: "Milán • Madrid • París",
    info3Title: "Lista de espera",
    info3Value: "4.300 personas",
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
    info1Title: "Drop #03",
    info1Value: "Printemps 2025",
    info2Title: "Tournée pop-up",
    info2Value: "Milan • Madrid • Paris",
    info3Title: "Liste d’attente",
    info3Value: "4 300 personnes",
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
    info1Title: "Drop #03",
    info1Value: "Frühjahr 2025",
    info2Title: "Pop-up-Tour",
    info2Value: "Mailand • Madrid • Paris",

    info3Title: "Warteliste",
    info3Value: "4.300 Personen",
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
    index: true,
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

  const highlights = [t.bullet1, t.bullet2, t.bullet3];
  const comingList = [
    t.comingItem1,
    t.comingItem2,
    t.comingItem3,
    t.comingItem4,
  ];
  const infoCards = [
    { title: t.info1Title, value: t.info1Value },
    { title: t.info2Title, value: t.info2Value },
    { title: t.info3Title, value: t.info3Value },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03060b] py-12 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(122,32,255,0.2),_transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(32,210,122,0.15),_transparent_45%)]" />
      </div>
      <div className="container relative space-y-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-white/10/5 via-white/5 to-transparent p-8 pt-12 text-center shadow-[0_45px_80px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 opacity-60 blur-3xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(122,32,255,0.5),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(32,210,122,0.4),transparent_45%)]" />
          </div>

          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-5">
            <div className="relative rounded-full border border-white/30 bg-black/40 p-6 shadow-[0_25px_50px_rgba(0,0,0,0.45)] before:absolute before:inset-3 before:-z-10 before:rounded-full before:bg-gradient-to-r before:from-[#7A20FF] before:to-[#20D27A] before:opacity-70 before:blur-xl">
              <Image
                src="/logo.png"
                alt="KiloMystery"
                width={180}
                height={180}
                className="h-24 w-auto md:h-32"
              />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              {t.badge}
            </span>

            <h1 className="text-3xl md:text-5xl font-black leading-tight">
              <span className="bg-gradient-to-r from-[#7A20FF] via-[#c8fff9] to-[#20D27A] bg-clip-text text-transparent">
                {t.heroTitle}
              </span>
            </h1>
            <p className="text-balance text-base text-white/70 md:text-lg">
              {t.heroSubtitle}
            </p>

            <div className="grid w-full gap-4 md:grid-cols-3">
              {highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white/80 shadow-inner shadow-white/5"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="grid w-full gap-4 md:grid-cols-3">
              {infoCards.map((card, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10/30 to-black/40 px-5 py-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    {card.title}
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="w-full rounded-[28px] border border-white/20 bg-black/40 p-4 text-left shadow-[0_30px_65px_rgba(0,0,0,0.45)]">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
                {t.newsletterLabel}
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder={t.newsletterPlaceholder}
                  className="flex-1 rounded-full border border-white/25 bg-black/60 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#7A20FF]"
                />
                <button
                  type="button"
                  className="rounded-full bg-gradient-to-r from-[#7A20FF] via-[#b55bff] to-[#20D27A] px-6 py-3 text-sm font-extrabold text-[#04070a] shadow-[0_14px_30px_rgba(122,32,255,0.4)]"
                >
                  {t.newsletterButton}
                </button>
              </div>
              <p className="mt-2 text-xs text-white/45">{t.footerNote}</p>
            </div>
          </div>
        </section>

        {/* Roadmap + sustainability */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-black/35 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-extrabold text-white">
              {t.comingTitle}
            </h2>
            <div className="mt-6 space-y-4">
              {comingList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5/20 px-4 py-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-[#7A20FF] to-[#20D27A] text-sm font-bold text-[#05070b]">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-gradient-to-b from-[#0a1114] to-[#03060b] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
            <div className="mb-4 flex items-center gap-3 text-lg font-extrabold text-white">
              <span className="text-2xl">🌱</span>
              <span>{t.sustainTitle}</span>
            </div>
            <p className="text-sm text-white/80">{t.sustainText}</p>

            <div className="mt-6 grid gap-3 text-xs uppercase tracking-[0.2em] text-white/50 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                ♻️ Zero sprechi
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                🔒 Lotti tracciati
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                🚚 Europa intera
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                🎁 Esperienze live
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
