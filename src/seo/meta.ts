// src/seo/meta.ts
import type { Metadata } from "next";
import { Lang, SUPPORTED_LANGS } from "@/i18n/lang";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";

export type PageId =
  | "home"
  | "products"
  | "how"
  | "about"
  | "events"
  | "contact"
  | "shipping"
  | "returns"
  | "terms"
  | "privacy";

const PAGE_PATH: Record<PageId, string> = {
  home: "",
  products: "products",
  how: "how-it-works",
  about: "about",
  events: "events",
  contact: "contact",
  shipping: "policy/shipping",
  returns: "policy/returns",
  terms: "policy/terms",
  privacy: "policy/privacy",
};

type MetaCopy = {
  title: string;
  description: string;
};

const PAGE_COPY: Record<PageId, Record<Lang, MetaCopy>> = {
  home: {
    it: {
      title: "Mystery box al kg – Standard & Premium",
      description:
        "Mystery box al kg da 1 a 10 kg. Scegli Standard o Premium, ricevi pacchi sorpresa da stock reali, spedizione 48–72h tracciata in tutta Europa.",
    },
    en: {
      title: "Mystery boxes by the kilo – Standard & Premium",
      description:
        "Mystery boxes by the kilo from 1 to 10 kg. Choose Standard or Premium, get surprise parcels from real stock, tracked 48–72h shipping across Europe.",
    },
    es: {
      title: "Mystery box al kilo – Standard y Premium",
      description:
        "Mystery box al kilo de 1 a 10 kg. Elige Standard o Premium, recibe cajas sorpresa de stock real, envío 48–72h con seguimiento por Europa.",
    },
    fr: {
      title: "Mystery box au kilo – Standard & Premium",
      description:
        "Mystery box au kilo de 1 à 10 kg. Choisis Standard ou Premium, reçois des colis surprises issus de stocks réels, livraison suivie 48–72h en Europe.",
    },
    de: {
      title: "Mystery Box zum Kilo-Preis – Standard & Premium",
      description:
        "Mystery Box zum Kilo-Preis von 1 bis 10 kg. Wähle Standard oder Premium, erhalte Überraschungspakete aus echten Beständen, Versand 48–72h in ganz Europa.",
    },
  },

  products: {
    it: {
      title: "Prodotti – Mystery box al kg",
      description:
        "Scegli tra mystery box Standard e Premium da 1 a 10 kg. Prezzo al kg chiaro, lotti tracciati, spedizione 48–72h.",
    },
    en: {
      title: "Products – Mystery boxes by the kilo",
      description:
        "Pick Standard or Premium mystery boxes from 1 to 10 kg. Transparent price per kilo, tracked batches, 48–72h shipping.",
    },
    es: {
      title: "Productos – Mystery box al kilo",
      description:
        "Elige mystery box Standard o Premium de 1 a 10 kg. Precio por kilo claro, lotes trazables y envío 48–72h.",
    },
    fr: {
      title: "Produits – Mystery box au kilo",
      description:
        "Choisis des mystery box Standard ou Premium de 1 à 10 kg. Prix au kilo clair, lots traçables, livraison 48–72h.",
    },
    de: {
      title: "Produkte – Mystery Box zum Kilo-Preis",
      description:
        "Wähle Standard oder Premium Mystery Boxen von 1 bis 10 kg. Klarer Kilo-Preis, nachvollziehbare Posten, Versand 48–72h.",
    },
  },

  how: {
    it: {
      title: "Come funziona KiloMystery",
      description:
        "Scopri come funziona KiloMystery: scegli peso e tipologia, paghi in sicurezza e ricevi mystery box al kg con tracking e lotti tracciati.",
    },
    en: {
      title: "How KiloMystery works",
      description:
        "See how KiloMystery works: choose weight and type, pay securely and receive mystery boxes by the kilo with tracking and traceable batches.",
    },
    es: {
      title: "Cómo funciona KiloMystery",
      description:
        "Descubre cómo funciona KiloMystery: elige peso y tipo, paga con seguridad y recibe mystery box al kilo con tracking y lotes trazables.",
    },
    fr: {
      title: "Comment fonctionne KiloMystery",
      description:
        "Découvre le fonctionnement de KiloMystery : choisis poids et type, paie en toute sécurité et reçois des mystery box au kilo avec suivi et lots traçables.",
    },
    de: {
      title: "So funktioniert KiloMystery",
      description:
        "Erfahre, wie KiloMystery funktioniert: Gewicht und Typ wählen, sicher bezahlen und Mystery Boxen zum Kilo-Preis mit Tracking und nachvollziehbaren Posten erhalten.",
    },
  },

  about: {
    it: {
      title: "Chi siamo – KiloMystery",
      description:
        "KiloMystery recupera pacchi, resi e stock fermi e li trasforma in mystery box al kg. Scopri il progetto e il team dietro le box.",
    },
    en: {
      title: "About us – KiloMystery",
      description:
        "KiloMystery recovers lost parcels, returns and idle stock and turns them into mystery boxes by the kilo. Learn more about the project and team.",
    },
    es: {
      title: "Quiénes somos – KiloMystery",
      description:
        "KiloMystery recupera paquetes, devoluciones y stock parado y los convierte en mystery box al kilo. Conoce el proyecto y el equipo.",
    },
    fr: {
      title: "À propos – KiloMystery",
      description:
        "KiloMystery récupère colis perdus, retours et stocks dormants pour les transformer en mystery box au kilo. Découvre le projet et l’équipe.",
    },
    de: {
      title: "Über uns – KiloMystery",
      description:
        "KiloMystery rettet verlorene Pakete, Retouren und ruhende Bestände und macht daraus Mystery Boxen zum Kilo-Preis. Erfahre mehr über das Projekt und das Team.",
    },
  },

  events: {
    it: {
      title: "Eventi pop-up – KiloMystery",
      description:
        "Scopri le date dei prossimi eventi pop-up e fiere dove trovare le mystery box KiloMystery dal vivo.",
    },
    en: {
      title: "Pop-up events – KiloMystery",
      description:
        "Discover upcoming pop-up events and fairs where you can find KiloMystery boxes in real life.",
    },
    es: {
      title: "Eventos pop-up – KiloMystery",
      description:
        "Descubre las próximas fechas de eventos pop-up y ferias donde encontrar las mystery box KiloMystery en directo.",
    },
    fr: {
      title: "Événements pop-up – KiloMystery",
      description:
        "Découvre les prochains événements pop-up et salons pour retrouver les mystery box KiloMystery en vrai.",
    },
    de: {
      title: "Pop-up-Events – KiloMystery",
      description:
        "Entdecke kommende Pop-up-Events und Messen, auf denen du die KiloMystery Boxen live findest.",
    },
  },

  contact: {
    it: {
      title: "Contatti – KiloMystery",
      description:
        "Contattaci per domande su ordini, spedizioni, partnership o eventi KiloMystery.",
    },
    en: {
      title: "Contact – KiloMystery",
      description:
        "Get in touch for questions about orders, shipping, partnerships or KiloMystery events.",
    },
    es: {
      title: "Contacto – KiloMystery",
      description:
        "Escríbenos si tienes dudas sobre pedidos, envíos, colaboraciones o eventos KiloMystery.",
    },
    fr: {
      title: "Contact – KiloMystery",
      description:
        "Contacte-nous pour toute question sur les commandes, livraisons, partenariats ou événements KiloMystery.",
    },
    de: {
      title: "Kontakt – KiloMystery",
      description:
        "Schreib uns bei Fragen zu Bestellungen, Versand, Partnerschaften oder KiloMystery-Events.",
    },
  },

  shipping: {
    it: {
      title: "Spedizioni – Mystery box al kg",
      description:
        "Tempi, costi e tracking delle spedizioni KiloMystery: spedizione 48–72h tracciata in tutta Europa.",
    },
    en: {
      title: "Shipping – Mystery boxes by the kilo",
      description:
        "Shipping times, costs and tracking for KiloMystery boxes: 48–72h tracked shipping across Europe.",
    },
    es: {
      title: "Envíos – Mystery box al kilo",
      description:
        "Plazos, costes y seguimiento de los envíos KiloMystery: envíos 48–72h con seguimiento en Europa.",
    },
    fr: {
      title: "Livraisons – Mystery box au kilo",
      description:
        "Délais, coûts et suivi des livraisons KiloMystery : livraison suivie 48–72h en Europe.",
    },
    de: {
      title: "Versand – Mystery Box zum Kilo-Preis",
      description:
        "Lieferzeiten, Kosten und Tracking für KiloMystery Boxen: Versand 48–72h in ganz Europa.",
    },
  },

  returns: {
    it: {
      title: "Resi – KiloMystery",
      description:
        "Scopri come funzionano i resi per le mystery box sigillate KiloMystery.",
    },
    en: {
      title: "Returns – KiloMystery",
      description:
        "Learn how returns work for sealed KiloMystery mystery boxes.",
    },
    es: {
      title: "Devoluciones – KiloMystery",
      description:
        "Descubre cómo funcionan las devoluciones de las mystery box KiloMystery.",
    },
    fr: {
      title: "Retours – KiloMystery",
      description:
        "Découvre le fonctionnement des retours pour les mystery box scellées KiloMystery.",
    },
    de: {
      title: "Rückgaben – KiloMystery",
      description:
        "Erfahre, wie Rückgaben für versiegelte KiloMystery Mystery Boxen funktionieren.",
    },
  },

  terms: {
    it: {
      title: "Termini e condizioni – KiloMystery",
      description:
        "Leggi termini e condizioni di utilizzo e vendita di KiloMystery.",
    },
    en: {
      title: "Terms and conditions – KiloMystery",
      description:
        "Read KiloMystery terms and conditions of use and sale.",
    },
    es: {
      title: "Términos y condiciones – KiloMystery",
      description:
        "Lee los términos y condiciones de uso y venta de KiloMystery.",
    },
    fr: {
      title: "Conditions générales – KiloMystery",
      description:
        "Lis les conditions générales d’utilisation et de vente de KiloMystery.",
    },
    de: {
      title: "AGB – KiloMystery",
      description:
        "Lies die Allgemeinen Geschäftsbedingungen (AGB) von KiloMystery.",
    },
  },

  privacy: {
    it: {
      title: "Privacy – KiloMystery",
      description:
        "Informativa privacy di KiloMystery su dati personali, cookie e tracciamenti.",
    },
    en: {
      title: "Privacy – KiloMystery",
      description:
        "KiloMystery privacy policy about personal data, cookies and tracking.",
    },
    es: {
      title: "Privacidad – KiloMystery",
      description:
        "Política de privacidad de KiloMystery sobre datos personales, cookies y tracking.",
    },
    fr: {
      title: "Confidentialité – KiloMystery",
      description:
        "Politique de confidentialité de KiloMystery sur les données personnelles, cookies et suivis.",
    },
    de: {
      title: "Datenschutz – KiloMystery",
      description:
        "Datenschutzerklärung von KiloMystery zu personenbezogenen Daten, Cookies und Tracking.",
    },
  },
};

export function getPageMetadata(lang: Lang, page: PageId): Metadata {
  const safeLang: Lang = SUPPORTED_LANGS.includes(lang) ? lang : "it";
  const copy = PAGE_COPY[page][safeLang] ?? PAGE_COPY[page].it;
  const slug = PAGE_PATH[page];
  const path = `/${safeLang}${slug ? `/${slug}` : ""}`;
  const url = new URL(path, SITE_URL).toString();

  const languages: Record<string, string> = {};
  for (const l of SUPPORTED_LANGS) {
    const p = `/${l}${slug ? `/${slug}` : ""}`;
    languages[l] = p;
  }

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url,
      siteName: "KiloMystery",
      type: page === "home" ? "website" : "article",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
    },
  };
}

