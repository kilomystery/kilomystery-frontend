import type { Lang } from "@/i18n/lang";
import type { PressPost, PressMention } from "./types";
import { PRESS_POSTS, PRESS_MENTIONS } from "./posts";

export type { PressPost, PressMention } from "./types";
export { PRESS_POSTS, PRESS_MENTIONS } from "./posts";

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

export function getPressPostBySlug(slug: string, lang: Lang): PressPost | null {
  const p = PRESS_POSTS.find((x) => x.slug === slug);
  if (!p) return null;

  const safe: PressPost = {
    ...p,
    title: { ...p.title, [lang]: p.title[lang] ?? p.title.it },
    description: { ...p.description, [lang]: p.description[lang] ?? p.description.it },
    content: { ...p.content, [lang]: p.content[lang] ?? p.content.it },
  };

  return safe;
}

export function getAllPressMentions(): PressMention[] {
  return [...PRESS_MENTIONS].sort((a, b) => (a.date < b.date ? 1 : -1));
}
