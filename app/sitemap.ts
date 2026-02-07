// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllPostsMeta } from "@/lib/blog";

const BASE_URL = "https://www.kilomystery.com";
const LANGS = ["it", "en", "es", "fr", "de"] as const;
type Lang = (typeof LANGS)[number];

/**
 * IMPORTANTE: evita lastModified "finto" (new Date()) su tutte le pagine.
 * Opzione semplice: usa una build date stabile (es. env var) oppure ometti lastModified per le statiche.
 *
 * 1) Se usi CI/CD, imposta NEXT_PUBLIC_BUILD_DATE="2026-02-07" (o in runtime)
 * 2) Se non vuoi gestirla: metti undefined e togli lastModified dalle statiche.
 */
const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE
  ? new Date(process.env.NEXT_PUBLIC_BUILD_DATE)
  : undefined;

// Pagine statiche che vuoi indicizzare (solo "money / hub / utili")
const PATHS = [
  "",
  "/products",
  "/how-it-works",
  "/about",
  "/contact",
  "/faq",
  "/mystery-box",
  "/pacchi-smarriti", // ✅ fondamentale
  "/policy/shipping",
  "/policy/returns",
  "/policy/terms",
  "/policy/privacy",
  "/blog",
  "/press",
] as const;

// Se il blog NON è tradotto davvero in tutte le lingue, NON generare duplicati.
// Metti qui solo le lingue con contenuto blog reale:
const BLOG_LANGS: Lang[] = ["it"]; // cambia in ["it","en",...] solo se traduci davvero i post

function absUrl(lang: Lang, path: (typeof PATHS)[number]) {
  return path === "" ? `${BASE_URL}/${lang}` : `${BASE_URL}/${lang}${path}`;
}

function alternatesFor(path: (typeof PATHS)[number]) {
  const out: Record<Lang, string> = {} as any;
  for (const l of LANGS) out[l] = absUrl(l, path);
  return out;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // ✅ Static pages
  for (const lang of LANGS) {
    for (const path of PATHS) {
      const isHome = path === "";
      const url = absUrl(lang, path);

      entries.push({
        url,
        // ✅ non "fake freshness": se non hai BUILD_DATE, ometti lastModified
        ...(BUILD_DATE ? { lastModified: BUILD_DATE } : {}),
        changeFrequency: isHome ? "weekly" : "monthly",
        priority: isHome ? 1 : path === "/pacchi-smarriti" ? 0.95 : path === "/products" ? 0.9 : 0.7,

        // ✅ hreflang in sitemap (se TS/Next non lo accetta, puoi rimuovere questo blocco)
        alternates: {
          languages: alternatesFor(path),
        },
      } as any);
    }
  }

  // ✅ Blog posts
  const posts = getAllPostsMeta();

  for (const p of posts) {
    // lastmod blog: meglio data reale del post (ok)
    const postLastMod = p.date ? new Date(p.date) : undefined;

    for (const lang of BLOG_LANGS) {
      const url = `${BASE_URL}/${lang}/blog/${p.slug}`;

      entries.push({
        url,
        ...(postLastMod ? { lastModified: postLastMod } : {}),
        changeFrequency: "monthly",
        priority: 0.8,

        // alternates solo per le lingue realmente pubblicate
        alternates: {
          languages: Object.fromEntries(
            BLOG_LANGS.map((l) => [l, `${BASE_URL}/${l}/blog/${p.slug}`])
          ),
        },
      } as any);
    }
  }

  return entries;
}
