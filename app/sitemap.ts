// app/sitemap.ts
import type { MetadataRoute } from "next";
import { SUPPORTED_LANGS } from "@/i18n/lang";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";

const PAGES = [
  "",
  "products",
  "how-it-works",
  "about",
  "events",
  "contact",
  "policy/shipping",
  "policy/returns",
  "policy/terms",
  "policy/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of SUPPORTED_LANGS) {
    for (const slug of PAGES) {
      const path = `/${lang}${slug ? `/${slug}` : ""}`;
      entries.push({
        url: `${SITE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: slug === "" ? 1 : slug === "products" ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
