// app/robots.ts
import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.kilomystery.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",

        // Nota: evita di bloccare /cart se la tua pagina cart è su /[lang]/cart
        // Blocca solo le rotte tecniche/non utili in SERP:
        disallow: [
          "/api/",
          "/_next/",
          "/admin",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
