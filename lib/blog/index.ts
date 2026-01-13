import type { Lang } from "@/i18n/lang";
import type { BlogPost } from "./types";
import { BLOG_POSTS } from "./posts";

export type { BlogPost } from "./types";

export function getAllPostsMeta(): Array<{
  slug: string;
  date: string;
  tags: string[];
  featured?: boolean;
  title: BlogPost["title"];
  description: BlogPost["description"];
  cover?: BlogPost["cover"];
}> {
  return [...BLOG_POSTS]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((p) => ({
      slug: p.slug,
      date: p.date,
      tags: p.tags,
      featured: p.featured,
      title: p.title,
      description: p.description,
      cover: p.cover,
    }));
}

export function getPostBySlug(slug: string, lang: Lang): BlogPost | null {
  const p = BLOG_POSTS.find((x) => x.slug === slug);
  if (!p) return null;

  // “normalizziamo” garantendo che esista content per quella lingua (fallback it)
  const safe: BlogPost = {
    ...p,
    title: { ...p.title, [lang]: p.title[lang] ?? p.title.it },
    description: { ...p.description, [lang]: p.description[lang] ?? p.description.it },
    content: { ...p.content, [lang]: p.content[lang] ?? p.content.it },
  };

  return safe;
}
