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
  const posts = Array.isArray(PRESS_POSTS) ? PRESS_POSTS : [];

  return [...posts]
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
export function getPressPostBySlug(
  slug: string,
  lang: Lang
): PressPost | null {
  const posts = Array.isArray(PRESS_POSTS) ? PRESS_POSTS : [];

  const p = posts.find((x) => x.slug === slug);
  if (!p) return null;

  const safe: PressPost = {
    ...p,

    title: {
      ...p.title,
      [lang]: p.title[lang] ?? p.title.it,
    },

    description: {
      ...p.description,
      [lang]: p.description[lang] ?? p.description.it,
    },

    content: {
      ...p.content,
      [lang]: p.content[lang] ?? p.content.it,
    },

    cover: p.cover
      ? {
          ...p.cover,
          alt: {
            ...p.cover.alt,
            [lang]: p.cover.alt[lang] ?? p.cover.alt.it,
          },
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
  const mentions = Array.isArray(PRESS_MENTIONS)
    ? PRESS_MENTIONS
    : [];

  return [...mentions].sort((a, b) => {
    const da = a.date ?? "";
    const db = b.date ?? "";

    // se uguali
    if (da === db) return 0;

    // senza data -> in fondo
    if (!da) return 1;
    if (!db) return -1;

    // più recente prima
    return da < db ? 1 : -1;
  });
}
