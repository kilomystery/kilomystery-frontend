// lib/press/index.ts
import type { Lang } from "@/i18n/lang";
import type { PressPost, PressMention } from "./types";
import { PRESS_POSTS, PRESS_MENTIONS } from "./posts";

export type { PressPost, PressMention } from "./types";

/**
 * Ritorna SOLO i meta dati dei post "ufficiali" (quelli interni /press/[slug]).
 */
export function getAllPressPostsMeta(): Array<{
  slug: string;
  date: string;
  tags: string[];
  title: PressPost["title"];
  description: PressPost["description"];
  cover?: PressPost["cover"];
}> {
  return [...PRESS_POSTS]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((p) => ({
      slug: p.slug,
      date: p.date,
      tags: p.tags,
      title: p.title,
      description: p.description,
      cover: p.cover,
    }));
}

/**
 * Ritorna il post completo in base allo slug + lingua (con fallback).
 */
export function getPressPostBySlug(slug: string, lang: Lang): PressPost | null {
  const p = PRESS_POSTS.find((x) => x.slug === slug);
  if (!p) return null;

  const safe: PressPost = {
    ...p,
    title: { ...p.title, [lang]: p.title[lang] ?? p.title.it },
    description: {
      ...p.description,
      [lang]: p.description[lang] ?? p.description.it,
    },
    content: { ...p.content, [lang]: p.content[lang] ?? p.content.it },
    cover: p.cover
      ? {
          ...p.cover,
          alt: { ...p.cover.alt, [lang]: p.cover.alt[lang] ?? p.cover.alt.it },
        }
      : undefined,
  };

  return safe;
}

/**
 * Rassegna stampa (link esterni).
 * Nota: `date` può essere opzionale, quindi ordiniamo con fallback.
 */
export function getAllPressMentions(): PressMention[] {
  return [...PRESS_MENTIONS].sort((a, b) => {
    const da = a.date ?? ""; // fallback stringa vuota
    const db = b.date ?? "";
    // più recente prima; se manca la data finisce in fondo
    if (da === db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da < db ? 1 : -1;
  });
}
