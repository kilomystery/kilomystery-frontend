import type { Lang } from "@/i18n/lang";

export type PressTag =
  | "press"
  | "pop-up"
  | "events"
  | "brand"
  | "sustainability";


export type Localized = Record<Lang, string>;

export type PressPost = {
  slug: string;

  title: Localized;
  description: Localized;

  // contenuto MDX per lingua (tutto nello stesso file)
  content: Localized;

  date: string; // ISO "2026-02-06"
  tags: PressTag[];

  // opzionale
  cover?: {
    src: string;
    alt: Localized;
  };

  // opzionale: se vuoi link esterni in evidenza nell’articolo
  externalLinks?: Array<{
    label: Localized;
    url: string;
    source?: string; // es "Giornale X"
    date?: string; // ISO
  }>;
};

export type PressMention = {
  title: Localized;     // titolo linkabile (multilingua)
  source: string;       // es. "Il Quotidiano X"
  url: string;          // link esterno
  date?: string;        // ISO
  note?: Localized;     // descrizione breve
};
