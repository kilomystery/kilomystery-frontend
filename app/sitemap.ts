import type { MetadataRoute } from "next";
import { getAllPostsMeta } from "@/lib/blog";

const BASE_URL = "https://www.kilomystery.com";
const LANGS = ["it", "en", "es", "fr", "de"] as const;

const PATHS = [
  "",
  "/products",
  "/how-it-works",
  "/about",
  "/events",
  "/contact",
  "/faq",
  "/mystery-box",
  "/policy/shipping",
  "/policy/returns",
  "/policy/terms",
  "/policy/privacy",
  "/blog",
  "/press",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of LANGS) {
    for (const path of PATHS) {
      const isHome = path === "";
      const url = isHome
        ? `${BASE_URL}/${lang}`
        : `${BASE_URL}/${lang}${path}`;

      entries.push({
        url,
        lastModified,
        changeFrequency: "weekly",
        priority: isHome ? 1 : path === "/products" ? 0.9 : 0.7,
      });
    }
  }

  // ✅ BLOG POSTS (auto)
  const posts = getAllPostsMeta();
  for (const p of posts) {
    for (const lang of LANGS) {
      entries.push({
        url: `${BASE_URL}/${lang}/blog/${p.slug}`,
        lastModified: new Date(p.date),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
