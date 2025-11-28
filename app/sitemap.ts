// app/sitemap.ts
import type { MetadataRoute } from "next";

const BASE_URL = "https://www.kilomystery.com";

const LANGS = ["it", "en", "es", "fr", "de"] as const;

const PATHS = [
  "", // homepage lingua
  "/products",
  "/how-it-works",
  "/about",
  "/events",
  "/contact",
  "/policy/shipping",
  "/policy/returns",
  "/policy/terms",
  "/policy/privacy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2025-11-22T13:02:05.290Z"); // puoi mettere new Date()

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

  return entries;
}
