// app/components/SeoStructuredData.tsx
"use client";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";

export default function SeoStructuredData() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "KiloMystery",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      sameAs: [
        "https://www.instagram.com/kilo.mystery/",
        "https://www.tiktok.com/@kilomystery",
        "https://www.facebook.com/profile.php?id=61584042208386",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      url: SITE_URL,
      name: "KiloMystery",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
