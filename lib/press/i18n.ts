import type { Lang } from "@/i18n/lang";

/**
 * Lingue supportate (allineate al resto del sito).
 */
export const PRESS_LANGS: Lang[] = ["it", "en", "es", "fr", "de"];

/**
 * ✅ IMPORTANTISSIMO:
 * Non usare normalizeLang() per i routes /[lang]/... qui.
 * In alcuni setup normalizeLang può fare fallback indesiderati.
 */
export function safeLang(input: string): Lang {
  return (PRESS_LANGS as string[]).includes(input) ? (input as Lang) : "it";
}

export function getLocale(lang: Lang) {
  return lang === "it"
    ? "it-IT"
    : lang === "en"
    ? "en-GB"
    : lang === "es"
    ? "es-ES"
    : lang === "fr"
    ? "fr-FR"
    : "de-DE";
}

type PressCopy = {
  pageTitle: string;
  pageSubtitle: string;

  ctaProducts: string;
  ctaBlog: string;

  kitTitle: string;
  kitBrand: string;
  kitWhat: string;
  kitContact: string;
  kitSite: string;

  eventsTitle: string;
  openArticle: string;

  mentionsTitle: string;
  mentionsEmpty: string;
  openExternal: string;

  mediaTitle: string;
  mediaText: string;
};

export function pressCopy(lang: Lang): PressCopy {
  const base = {
    it: {
      pageTitle: "Presse & Media",
      pageSubtitle:
        "Rassegna stampa, comunicati, e articoli ufficiali sui Pop-up. Contatto media: info@kilomystery.com",

      ctaProducts: "Vai alle Mystery Box",
      ctaBlog: "Vai al Blog",

      kitTitle: "Media Kit",
      kitBrand: "Brand: KiloMystery",
      kitWhat:
        "Offerta: Mystery box al kg (Standard/Premium 1–10 kg) con spedizione tracciata",
      kitContact: "Contatto: info@kilomystery.com",
      kitSite: "Sito: https://www.kilomystery.com",

      eventsTitle: "Eventi & Pop-ups (articoli ufficiali)",
      openArticle: "Apri articolo →",

      mentionsTitle: "Dicono di noi (link esterni)",
      mentionsEmpty:
        "Ancora nessun link esterno inserito. Appena escono articoli su KiloMystery li aggiungiamo qui.",
      openExternal: "Leggi su sito esterno →",

      mediaTitle: "Contatti stampa",
      mediaText:
        "Se vuoi scrivere un articolo o richiedere materiale (foto, logo, dettagli evento), scrivici qui:",
    },
    en: {
      pageTitle: "Press & Media",
      pageSubtitle:
        "Press coverage, official updates and pop-up articles. Media contact: info@kilomystery.com",

      ctaProducts: "Shop Mystery Boxes",
      ctaBlog: "Go to Blog",

      kitTitle: "Media Kit",
      kitBrand: "Brand: KiloMystery",
      kitWhat:
        "Offer: Mystery boxes by the kilo (Standard/Premium 1–10 kg) with tracked shipping",
      kitContact: "Contact: info@kilomystery.com",
      kitSite: "Website: https://www.kilomystery.com",

      eventsTitle: "Events & Pop-ups (official articles)",
      openArticle: "Open article →",

      mentionsTitle: "They talk about us (external links)",
      mentionsEmpty:
        "No external links yet. As soon as articles about KiloMystery are published, we’ll add them here.",
      openExternal: "Read on external site →",

      mediaTitle: "Press contact",
      mediaText:
        "To write about us or request assets (photos, logo, event details), email:",
    },
    es: {
      pageTitle: "Prensa & Media",
      pageSubtitle:
        "Recortes de prensa, comunicados y artículos oficiales de pop-ups. Contacto: info@kilomystery.com",

      ctaProducts: "Ver Mystery Boxes",
      ctaBlog: "Ir al Blog",

      kitTitle: "Media Kit",
      kitBrand: "Marca: KiloMystery",
      kitWhat:
        "Oferta: mystery boxes por kilo (Standard/Premium 1–10 kg) con envío con tracking",
      kitContact: "Contacto: info@kilomystery.com",
      kitSite: "Sitio: https://www.kilomystery.com",

      eventsTitle: "Eventos & Pop-ups (artículos oficiales)",
      openArticle: "Abrir artículo →",

      mentionsTitle: "Hablan de nosotros (links externos)",
      mentionsEmpty:
        "Aún no hay links externos. Cuando salgan artículos sobre KiloMystery, los añadiremos aquí.",
      openExternal: "Leer en sitio externo →",

      mediaTitle: "Contacto prensa",
      mediaText:
        "Para escribir sobre nosotros o pedir material (fotos, logo, detalles), escribe a:",
    },
    fr: {
      pageTitle: "Presse & Media",
      pageSubtitle:
        "Revue de presse, communiqués et articles officiels sur les pop-ups. Contact media : info@kilomystery.com",

      ctaProducts: "Voir les Mystery Boxes",
      ctaBlog: "Aller au Blog",

      kitTitle: "Media Kit",
      kitBrand: "Marque : KiloMystery",
      kitWhat:
        "Offre : mystery boxes au kilo (Standard/Premium 1–10 kg) avec livraison suivie",
      kitContact: "Contact : info@kilomystery.com",
      kitSite: "Site : https://www.kilomystery.com",

      eventsTitle: "Événements & Pop-ups (articles officiels)",
      openArticle: "Ouvrir l’article →",

      mentionsTitle: "On parle de nous (liens externes)",
      mentionsEmpty:
        "Aucun lien externe pour l’instant. Dès que des articles paraissent, on les ajoute ici.",
      openExternal: "Lire sur un site externe →",

      mediaTitle: "Contact presse",
      mediaText:
        "Pour écrire sur nous ou demander du matériel (photos, logo, détails), écris à :",
    },
    de: {
      pageTitle: "Presse & Media",
      pageSubtitle:
        "Pressespiegel, offizielle Updates und Pop-up-Artikel. Media-Kontakt: info@kilomystery.com",

      ctaProducts: "Mystery Boxen ansehen",
      ctaBlog: "Zum Blog",

      kitTitle: "Media-Kit",
      kitBrand: "Brand: KiloMystery",
      kitWhat:
        "Angebot: Mystery Boxen pro Kilo (Standard/Premium 1–10 kg) mit Tracking-Versand",
      kitContact: "Kontakt: info@kilomystery.com",
      kitSite: "Website: https://www.kilomystery.com",

      eventsTitle: "Events & Pop-ups (offizielle Artikel)",
      openArticle: "Artikel öffnen →",

      mentionsTitle: "Sie schreiben über uns (externe Links)",
      mentionsEmpty:
        "Noch keine externen Links. Sobald Artikel über KiloMystery erscheinen, fügen wir sie hier hinzu.",
      openExternal: "Auf externer Seite lesen →",

      mediaTitle: "Pressekontakt",
      mediaText:
        "Für Presseanfragen oder Material (Fotos, Logo, Event-Details) schreib an:",
    },
  } as const;

  return base[lang] ?? base.it;
}
