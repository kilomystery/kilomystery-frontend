// app/sitemap.ts
import type { MetadataRoute } from "next";

const BASE_URL = "https://www.kilomystery.com";
const LANGS = ["it", "en", "es", "fr", "de"] as const;

const PATHS = [
  "",
  "/products",
  "/mystery-box", // ⭐ SEO CORE
  "/how-it-works",
  "/about",
  "/contact",
   "/faq",
  "/policy/shipping",
  "/policy/returns",
  "/policy/terms",
  "/policy/privacy"
 
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return LANGS.flatMap((lang) =>
    PATHS.map((path) => ({
      url: path === ""
        ? `${BASE_URL}/${lang}`
        : `${BASE_URL}/${lang}${path}`,
      lastModified,
      changeFrequency: "weekly",
      priority:
        path === "" ? 1 :
        path === "/mystery-box" ? 0.95 :
        path === "/products" ? 0.9 :
        0.7,
    }))
  );
}
