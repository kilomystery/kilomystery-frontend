import type { Lang } from "@/i18n/lang";

export type BlogTag =
  | "mystery-box"
  | "unboxing"
  | "events"
  | "shipping"
  | "sustainability"
  | "guides"
  | "news";

export type Localized = Record<Lang, string>;

export type BlogPost = {
  slug: string;

  // SEO + title
  title: Localized;
  description: Localized;

  // contenuto MDX per lingua (qui teniamo TUTTO in un unico file)
  content: Localized;

  // metadata
  date: string; // ISO: "2026-01-07"
  tags: BlogTag[];
  featured?: boolean;

  // opzionale (carina per blog index)
  cover?: {
    src: string; // es: "/blog/covers/mystery-box.jpg"
    alt: Localized;
  };
};
