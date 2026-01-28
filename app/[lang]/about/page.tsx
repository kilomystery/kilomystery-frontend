/* eslint-disable react/no-unescaped-entities */

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

/* -------------------------------- TYPES -------------------------------- */

type CopyKey =
  | "kicker"
  | "heroTitle"
  | "heroTagline"
  | "heroSubtitle"
  | "badge1"
  | "badge2"
  | "badge3"
  | "supplyTitle"
  | "supplyText"
  | "qualityTitle"
  | "qualityText"
  | "supportTitle"
  | "supportText"
  | "sustainTitle"
  | "sustainP1"
  | "sustainP2"
  | "sustainLi1"
  | "sustainLi2"
  | "sustainLi3"
  | "popupTitle"
  | "popupP1"
  | "popupP2"
  | "popupP3"
  | "popupCta"
  | "promiseTitle"
  | "promiseP1"
  | "promiseP2"
  | "howTitle"
  | "howS1t"
  | "howS1p"
  | "howS2t"
  | "howS2p"
  | "howS3t"
  | "howS3p"
  | "legalTitle"
  | "legalP1"
  | "legalName"
  | "legalVat"
  | "legalAddress"
  | "legalEmail"
  | "legalPhone"
  | "legalHours";

type CopyPerLang = Record<CopyKey, string>;

/* ------------------------------- CONTENT ------------------------------- */

const ABOUT_COPY: Record<Lang, CopyPerLang> = {
  /* ============================== IT ============================== */
  it: {
    kicker: "About",
    heroTitle: "Chi siamo",
    heroTagline: "Pacchi smarriti, seconde possibilità 🎁",
    heroSubtitle:
      "Siamo una realtà giovane nata da un’idea semplice: dare una seconda vita ai pacchi che il sistema tradizionale considera persi. Selezione, trasparenza e velocità.",

    badge1: "Lotti reali certificati",
    badge2: "Peso netto al Kg",
    badge3: "Meno sprechi, più sorpresa",

    supplyTitle: "Lotti certificati",
    supplyText:
      "Acquistiamo e selezioniamo lotti da canali autorizzati. Ogni box contiene una selezione casuale basata sul lotto di provenienza.",

    qualityTitle: "Controlli e sicurezza",
    qualityText:
      "Peso con tolleranza ±3%, sigillo anti-manomissione e ID lotto per ogni box.",

    supportTitle: "Assistenza diretta",
    supportText:
      "Supporto via email prima e dopo l’acquisto, gestito internamente.",

    sustainTitle: "Meno sprechi 🌱",
    sustainP1:
      "Recuperiamo pacchi e stock inutilizzati per ridurre l’impatto ambientale.",
    sustainP2:
      "Ogni acquisto contribuisce a un modello più sostenibile.",
    sustainLi1: "Riduzione dei rifiuti",
    sustainLi2: "Minore impatto CO₂",
    sustainLi3: "Packaging responsabile",

    howTitle: "Come funziona",
    howS1t: "1) Recupero",
    howS1p: "Acquisto lotti da canali autorizzati.",
    howS2t: "2) Preparazione",
    howS2p: "Selezione, pesatura e sigillo.",
    howS3t: "3) Spedizione",
    howS3p: "Invio tracciato e supporto.",

    popupTitle: "Eventi Pop-Up 🎪",
    popupP1:
      "Organizziamo eventi in tutta Italia per incontrare la community.",
    popupP2:
      "Puoi vedere le box dal vivo e parlare con il nostro team.",
    popupP3:
      "Consulta la pagina eventi per le date.",
    popupCta: "Vai agli eventi",

    promiseTitle: "La nostra promessa",
    promiseP1:
      "Trasparenza, qualità e rispetto per l’ambiente.",
    promiseP2:
      "Miglioriamo continuamente grazie alla community.",

    legalTitle: "Dati aziendali",
    legalP1:
      "Qui trovi le informazioni ufficiali del venditore.",
    legalName: "Ragione sociale: KILO MYSTERY SRLS",
    legalVat: "Partita IVA: 02794550745",
    legalAddress:
      "P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italia",
    legalEmail: "Email: sales@kilomystery.com",
    legalPhone: "Telefono: +39 353 492 3350",
    legalHours: "Lun–Ven, 09:00–18:00",
  },

  /* ============================== EN ============================== */
  en: {
    kicker: "About",
    heroTitle: "About us",
    heroTagline: "Lost parcels, second chances 🎁",
    heroSubtitle:
      "We give a second life to parcels considered lost by traditional logistics.",

    badge1: "Certified lots",
    badge2: "Net weight",
    badge3: "Less waste",

    supplyTitle: "Certified sourcing",
    supplyText:
      "We source lots through authorized channels.",

    qualityTitle: "Quality checks",
    qualityText:
      "Weight tolerance ±3% and tamper seals.",

    supportTitle: "Direct support",
    supportText:
      "Fast internal customer service.",

    sustainTitle: "Sustainability 🌱",
    sustainP1:
      "We reduce waste by reusing parcels.",
    sustainP2:
      "Every order supports sustainability.",
    sustainLi1: "Less waste",
    sustainLi2: "Lower CO₂",
    sustainLi3: "Eco packaging",

    howTitle: "How it works",
    howS1t: "1) Sourcing",
    howS1p: "Authorized suppliers.",
    howS2t: "2) Packing",
    howS2p: "Weigh and seal.",
    howS3t: "3) Shipping",
    howS3p: "Tracked delivery.",

    popupTitle: "Pop-Up Events 🎪",
    popupP1: "Meet us offline.",
    popupP2: "See boxes live.",
    popupP3: "Check event dates.",
    popupCta: "Go to events",

    promiseTitle: "Our promise",
    promiseP1: "Transparency and quality.",
    promiseP2: "Constant improvement.",

    legalTitle: "Company details",
    legalP1: "Official seller information.",
    legalName: "Legal name: KILO MYSTERY SRLS",
    legalVat: "VAT: 02794550745",
    legalAddress:
      "P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italy",
    legalEmail: "Email: sales@kilomystery.com",
    legalPhone: "Phone: +39 353 492 3350",
    legalHours: "Mon–Fri, 9:00–18:00",
  },

  /* ============================== ES ============================== */
  es: {
    kicker: "About",
    heroTitle: "Quiénes somos",
    heroTagline: "Paquetes perdidos 🎁",
    heroSubtitle:
      "Damos una segunda vida a paquetes perdidos.",

    badge1: "Lotes certificados",
    badge2: "Peso neto",
    badge3: "Menos residuos",

    supplyTitle: "Origen certificado",
    supplyText:
      "Proveedores autorizados.",

    qualityTitle: "Control de calidad",
    qualityText:
      "Sellos y tolerancia ±3%.",

    supportTitle: "Soporte directo",
    supportText:
      "Atención interna rápida.",

    sustainTitle: "Sostenibilidad 🌱",
    sustainP1:
      "Reducimos residuos.",
    sustainP2:
      "Consumo responsable.",
    sustainLi1: "Menos basura",
    sustainLi2: "Menos CO₂",
    sustainLi3: "Packaging eco",

    howTitle: "Cómo funciona",
    howS1t: "1) Origen",
    howS1p: "Canales autorizados.",
    howS2t: "2) Preparación",
    howS2p: "Pesado y sellado.",
    howS3t: "3) Envío",
    howS3p: "Seguimiento.",

    popupTitle: "Eventos 🎪",
    popupP1: "Conócenos.",
    popupP2: "Ver cajas.",
    popupP3: "Próximas fechas.",
    popupCta: "Eventos",

    promiseTitle: "Nuestra promesa",
    promiseP1: "Calidad.",
    promiseP2: "Mejora continua.",

    legalTitle: "Datos legales",
    legalP1: "Información oficial.",
    legalName: "Razón social: KILO MYSTERY SRLS",
    legalVat: "IVA: 02794550745",
    legalAddress:
      "P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italia",
    legalEmail: "Email: sales@kilomystery.com",
    legalPhone: "Tel: +39 353 492 3350",
    legalHours: "Lun–Vie, 09:00–18:00",
  },

  /* ============================== FR ============================== */
  fr: {
    kicker: "About",
    heroTitle: "Qui sommes-nous",
    heroTagline: "Colis perdus 🎁",
    heroSubtitle:
      "Nous donnons une seconde vie aux colis.",

    badge1: "Lots certifiés",
    badge2: "Poids net",
    badge3: "Moins de déchets",

    supplyTitle: "Origine contrôlée",
    supplyText:
      "Fournisseurs autorisés.",

    qualityTitle: "Qualité",
    qualityText:
      "Tolérance ±3% et scellé.",

    supportTitle: "Support direct",
    supportText:
      "Service interne.",

    sustainTitle: "Écologie 🌱",
    sustainP1:
      "Réduction des déchets.",
    sustainP2:
      "Consommation responsable.",
    sustainLi1: "Moins de déchets",
    sustainLi2: "Moins de CO₂",
    sustainLi3: "Emballage recyclable",

    howTitle: "Fonctionnement",
    howS1t: "1) Source",
    howS1p: "Canaux officiels.",
    howS2t: "2) Préparation",
    howS2p: "Pesée et scellage.",
    howS3t: "3) Livraison",
    howS3p: "Suivi.",

    popupTitle: "Événements 🎪",
    popupP1: "Rencontrez-nous.",
    popupP2: "Voir les box.",
    popupP3: "Dates à venir.",
    popupCta: "Événements",

    promiseTitle: "Notre promesse",
    promiseP1: "Qualité.",
    promiseP2: "Amélioration continue.",

    legalTitle: "Infos légales",
    legalP1: "Informations officielles.",
    legalName: "Raison sociale : KILO MYSTERY SRLS",
    legalVat: "TVA : 02794550745",
    legalAddress:
      "P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italie",
    legalEmail: "Email : sales@kilomystery.com",
    legalPhone: "Téléphone : +39 353 492 3350",
    legalHours: "Lun–Ven, 09h–18h",
  },

  /* ============================== DE ============================== */
  de: {
    kicker: "About",
    heroTitle: "Über uns",
    heroTagline: "Verlorene Pakete 🎁",
    heroSubtitle:
      "Wir geben Paketen ein zweites Leben.",

    badge1: "Zertifizierte Posten",
    badge2: "Nettogewicht",
    badge3: "Weniger Müll",

    supplyTitle: "Geprüfte Quelle",
    supplyText:
      "Autorisierte Lieferanten.",

    qualityTitle: "Qualität",
    qualityText:
      "±3% Toleranz und Siegel.",

    supportTitle: "Direkter Support",
    supportText:
      "Interner Kundenservice.",

    sustainTitle: "Nachhaltigkeit 🌱",
    sustainP1:
      "Weniger Abfall.",
    sustainP2:
      "Bewusster Konsum.",
    sustainLi1: "Weniger Müll",
    sustainLi2: "Weniger CO₂",
    sustainLi3: "Recycling",

    howTitle: "So funktioniert’s",
    howS1t: "1) Quelle",
    howS1p: "Autorisierte Kanäle.",
    howS2t: "2) Verpackung",
    howS2p: "Wiegen und Versiegeln.",
    howS3t: "3) Versand",
    howS3p: "Tracking.",

    popupTitle: "Events 🎪",
    popupP1: "Triff uns.",
    popupP2: "Boxen live.",
    popupP3: "Termine.",
    popupCta: "Events",

    promiseTitle: "Unser Versprechen",
    promiseP1: "Qualität.",
    promiseP2: "Ständige Verbesserung.",

    legalTitle: "Firmendaten",
    legalP1: "Offizielle Informationen.",
    legalName: "Firmenname: KILO MYSTERY SRLS",
    legalVat: "USt-IdNr.: 02794550745",
    legalAddress:
      "P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italien",
    legalEmail: "E-Mail: sales@kilomystery.com",
    legalPhone: "Telefon: +39 353 492 3350",
    legalHours: "Mo–Fr, 09:00–18:00",
  },
};

/* ------------------------------ PAGE ------------------------------ */

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolved = await params;
  const lang: Lang = normalizeLang(resolved?.lang);
  const t = ABOUT_COPY[lang] ?? ABOUT_COPY.it;

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-10">

        {/* HERO */}
        <section className="card text-center space-y-3">
          <h1 className="text-4xl font-extrabold">{t.heroTitle}</h1>
          <p className="text-emerald-400">{t.heroTagline}</p>
          <p className="text-white/70">{t.heroSubtitle}</p>
        </section>

        {/* INFO */}
        <section className="grid md:grid-cols-3 gap-4">
          <div className="card">
            <h3>{t.supplyTitle}</h3>
            <p>{t.supplyText}</p>
          </div>
          <div className="card">
            <h3>{t.qualityTitle}</h3>
            <p>{t.qualityText}</p>
          </div>
          <div className="card">
            <h3>{t.supportTitle}</h3>
            <p>{t.supportText}</p>
          </div>
        </section>

        {/* HOW */}
        <section className="card space-y-2">
          <h2>{t.howTitle}</h2>
          <p><b>{t.howS1t}</b> — {t.howS1p}</p>
          <p><b>{t.howS2t}</b> — {t.howS2p}</p>
          <p><b>{t.howS3t}</b> — {t.howS3p}</p>
        </section>

        {/* LEGAL */}
        <section className="card space-y-2">
          <h2>{t.legalTitle}</h2>
          <p>{t.legalP1}</p>
          <ul className="text-sm space-y-1">
            <li>{t.legalName}</li>
            <li>{t.legalVat}</li>
            <li>{t.legalAddress}</li>
            <li>{t.legalEmail}</li>
            <li>{t.legalPhone}</li>
            <li>{t.legalHours}</li>
          </ul>
        </section>

      </main>

      <Footer lang={lang} />
    </>
  );
}
