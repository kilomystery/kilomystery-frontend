import type { PressItem } from "./types";

export const PRESS_ITEMS: PressItem[] = [
  {
    slug: "popup-milano-2026",
    type: "event",
    date: "2026-02-01",

    title: {
      it: "KiloMystery arriva a Milano: primo pop-up store",
      en: "KiloMystery lands in Milan: first pop-up store",
      es: "KiloMystery llega a Milán: primer pop-up store",
      fr: "KiloMystery arrive à Milan : premier pop-up store",
      de: "KiloMystery kommt nach Mailand: erster Pop-up-Store",
    },

    description: {
      it: "Unboxing dal vivo, mystery box al kg e community: ecco cosa è successo.",
      en: "Live unboxing, mystery boxes by the kilo and community vibes.",
      es: "Unboxing en vivo, mystery boxes por kilo y comunidad.",
      fr: "Unboxing en direct, mystery boxes au kilo et communauté.",
      de: "Live-Unboxing, Mystery Boxen nach Gewicht und Community.",
    },

    content: {
      it: `
# Il primo pop-up KiloMystery a Milano

Il nostro primo evento pop-up ha portato **l’esperienza mystery box dal vivo** nel cuore di Milano.

- Unboxing live
- Mystery box al kg
- Incontri con la community

📍 Location: Milano  
📅 Data: Febbraio 2026

Grazie a tutti quelli che hanno partecipato.
      `.trim(),

      en: `
# KiloMystery first pop-up in Milan

Our first pop-up brought the **mystery box experience live**.

Live unboxing, community and surprises.
      `.trim(),

      es: `# Primer pop-up de KiloMystery en Milán`.trim(),
      fr: `# Premier pop-up KiloMystery à Milan`.trim(),
      de: `# Erster KiloMystery Pop-up in Mailand`.trim(),
    },
  },

  {
    slug: "giornale-esempio",
    type: "media",
    date: "2026-02-05",
    source: "La Repubblica",
    externalUrl: "https://www.repubblica.it/…",

    title: {
      it: "La mystery box al kg che conquista i giovani",
      en: "The mystery box by the kilo winning over young people",
      es: "La mystery box por kilo que conquista a los jóvenes",
      fr: "La mystery box au kilo qui séduit les jeunes",
      de: "Die Mystery Box nach Gewicht begeistert junge Leute",
    },

    description: {
      it: "KiloMystery raccontata da La Repubblica.",
      en: "KiloMystery featured by La Repubblica.",
      es: "KiloMystery en La Repubblica.",
      fr: "KiloMystery dans La Repubblica.",
      de: "KiloMystery in La Repubblica.",
    },

    content: {
      it: `
**Articolo pubblicato su La Repubblica.**

👉 [Leggi l’articolo completo](https://www.repubblica.it/…)
      `.trim(),

      en: `Read the full article on La Repubblica.`.trim(),
      es: `Leer el artículo completo.`.trim(),
      fr: `Lire l’article complet.`.trim(),
      de: `Vollständigen Artikel lesen.`.trim(),
    },
  },
];
