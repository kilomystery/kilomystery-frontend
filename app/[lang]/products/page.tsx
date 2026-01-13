"use client";

/* eslint-disable react/no-unescaped-entities */

import { use, useEffect, useRef } from "react";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../components/cart/CartProvider";
import { Lang, normalizeLang } from "@/i18n/lang";
import SectionInsideBox from "../../components/SectionInsideBox";

type Kg = 1 | 2 | 3 | 5 | 10;

const stdV = (kg: Kg) => `/videos/packs/std-${kg}.mp4`;
const prmV = (kg: Kg) => `/videos/packs/prm-${kg}.mp4`;

/* =========================================================
   PREZZI FRONTEND (REAL + COMPARE)
   Standard: base compare 25,90 €/kg
   Premium : base compare 29,90 €/kg
========================================================= */

const PRICE_TABLE: Record<
  "Standard" | "Premium",
  Record<Kg, { total: number; compareTotal: number }>
> = {
  Standard: {
    1: { total: 22.9, compareTotal: 25.9 },
    2: { total: 44.88, compareTotal: 51.8 },
    3: { total: 65.28, compareTotal: 77.7 },
    5: { total: 105.35, compareTotal: 129.5 },
    10: { total: 201.5, compareTotal: 259.0 },
  },
  Premium: {
    1: { total: 26.9, compareTotal: 29.9 },
    2: { total: 51.12, compareTotal: 59.8 },
    3: { total: 74.25, compareTotal: 89.7 },
    5: { total: 118.35, compareTotal: 149.5 },
    10: { total: 215.2, compareTotal: 299.0 },
  },
};

function prices(kind: "Standard" | "Premium", kg: Kg) {
  const { total, compareTotal } = PRICE_TABLE[kind][kg];
  const ppk = +(total / kg).toFixed(2);
  const comparePpk = +(compareTotal / kg).toFixed(2);
  return { total, compareTotal, ppk, comparePpk };
}

const euro = (n: number) =>
  n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

/* =========================================================
   EXPLORER BOX
   7,5 kg Standard + 7,5 kg Premium + 1 kg omaggio
   Compare price: 418,50 €
   Prezzo reale: -25% → 314,00 €
========================================================= */

const EXPLORER_SHOPIFY_ID = "52089141363026";
const EXPLORER_TOTAL_KG = 16;

const EXPLORER_COMPARE_PRICE = 418.5;
const EXPLORER_PRICE_TOTAL = 314.0;
const EXPLORER_PRICE_PER_KG =
  EXPLORER_PRICE_TOTAL / EXPLORER_TOTAL_KG;

/* =========================================================
   COPY / I18N — DEFINIZIONI
========================================================= */

type CopyKey =
  | "heroTitleHighlight"
  | "heroTitleRest"
  | "heroSubtitle1"
  | "heroSubtitle2"
  | "trustShippingTitle"
  | "trustShippingText"
  | "trustPaymentsTitle"
  | "trustPaymentsText"
  | "trustSupportTitle"
  | "trustSupportText"
  | "standardDescription"
  | "premiumDescription"
  | "returnTitle"
  | "returnText"
  | "returnCta"
  | "badgeStd"
  | "badgePrm"
  | "bullets1"
  | "bullets2"
  | "bullets3"
  | "bullets4"
  | "addToCart"
  | "explorerTitle"
  | "explorerSubtitle"
  | "explorerBadge"
  | "explorerCta"
  | "wheelTitle"
  | "wheelText"
  | "wheelCtaStd"
  | "wheelCtaPrm"
  | "seoCtaTitle"
  | "seoCtaText"
  | "seoCtaPrimary"
  | "seoCtaSecondary"
  | "seoCtaTertiary";

type CopyPerLang = Record<CopyKey, string>;
/* =========================================================
   TESTI MULTILINGUA
========================================================= */

const PRODUCTS_COPY: Record<Lang, CopyPerLang> = {
  it: {
    heroTitleHighlight: "Pesa il mistero",
    heroTitleRest: "e spacchetta la sorpresa",
    heroSubtitle1:
      "Standard o Premium, da 1 a 10 kg: decidi quanto intensa sarà la tua sessione di unboxing.",
    heroSubtitle2:
      "Non vendiamo valore garantito, ma un’esperienza di recupero, sorpresa e riduzione degli sprechi.",

    trustShippingTitle: "Spedizione",
    trustShippingText:
      "Spediamo in tutta Europa con tracking. Gratis sopra i 100€.",
    trustPaymentsTitle: "Pagamenti sicuri",
    trustPaymentsText:
      "Pagamenti protetti tramite provider certificati.",
    trustSupportTitle: "Assistenza",
    trustSupportText:
      "Supporto diretto via email, senza call center.",

    standardDescription:
      "Ideale per iniziare e scoprire l’esperienza KiloMystery.",
    premiumDescription:
      "Per chi vuole lotti più spinti e articoli di fascia superiore.",

    returnTitle: "Politica resi",
    returnText:
      "Le mystery box sono sigillate: il reso non è previsto per semplice ripensamento.",
    returnCta: "Leggi la policy completa",

    badgeStd: "Perfetta per iniziare",
    badgePrm: "Per chi vuole il massimo",

    bullets1: "Contenuto misto e misterioso",
    bullets2: "Peso netto ±3%",
    bullets3: "Sigillo e lotto tracciabile",
    bullets4: "Nessun prodotto vietato",

    addToCart: "Aggiungi al carrello",

    explorerTitle: "Explorer Box 15 kg + 1 kg omaggio",
    explorerSubtitle:
      "7,5 kg Standard + 7,5 kg Premium, più 1 kg extra gratuito.",
    explorerBadge: "Miglior valore",
    explorerCta: "Aggiungi Explorer Box",

    wheelTitle: "Ruota della fortuna",
    wheelText:
      "Con almeno 10 kg ottieni 1 giro automatico al carrello.",
    wheelCtaStd: "Vai ai 10 kg Standard",
    wheelCtaPrm: "Vai ai 10 kg Premium",

    seoCtaTitle: "Cerchi una Mystery Box?",
    seoCtaText:
      "Scopri come funzionano e quale scegliere tra Standard e Premium.",
    seoCtaPrimary: "Vai alla guida",
    seoCtaSecondary: "Come funziona",
    seoCtaTertiary: "FAQ",
  },

  en: {
    heroTitleHighlight: "Weigh the mystery",
    heroTitleRest: "and unbox the surprise",
    heroSubtitle1:
      "Standard or Premium, from 1 to 10 kg: you choose the experience.",
    heroSubtitle2:
      "We sell surprise, recovery and sustainability.",

    trustShippingTitle: "Shipping",
    trustShippingText:
      "Tracked shipping across Europe. Free over €100.",
    trustPaymentsTitle: "Secure payments",
    trustPaymentsText:
      "Protected payments via certified providers.",
    trustSupportTitle: "Support",
    trustSupportText:
      "Direct email support.",

    standardDescription:
      "Perfect to start with KiloMystery.",
    premiumDescription:
      "For those who want more premium lots.",

    returnTitle: "Returns",
    returnText:
      "Mystery boxes are sealed and non-returnable.",
    returnCta: "Read full policy",

    badgeStd: "Perfect to start",
    badgePrm: "For those who want more",

    bullets1: "Mixed mystery contents",
    bullets2: "Net weight ±3%",
    bullets3: "Sealed & traceable",
    bullets4: "No prohibited items",

    addToCart: "Add to cart",

    explorerTitle: "Explorer Box 15 kg + 1 kg free",
    explorerSubtitle:
      "7.5 kg Standard + 7.5 kg Premium plus 1 kg free.",
    explorerBadge: "Best value",
    explorerCta: "Add Explorer Box",

    wheelTitle: "Mystery Wheel",
    wheelText:
      "Orders of 10 kg unlock 1 automatic spin.",
    wheelCtaStd: "Go to 10 kg Standard",
    wheelCtaPrm: "Go to 10 kg Premium",

    seoCtaTitle: "Looking for a Mystery Box?",
    seoCtaText:
      "Learn how it works and choose the right tier.",
    seoCtaPrimary: "Open guide",
    seoCtaSecondary: "How it works",
    seoCtaTertiary: "FAQ",
  },

  // ⬇️ ES / FR / DE IDENTICI A STRUTTURA
  es: PRODUCTS_COPY.it,
  fr: PRODUCTS_COPY.it,
  de: PRODUCTS_COPY.it,
};
/* =========================================================
   CO₂ RISPARMIATA (STIMA) PER KG
========================================================= */

const co2ByKg: Record<Kg, Partial<Record<Lang, string>>> = {
  1: {
    it: "≈0,25 kg di CO₂ evitati",
    en: "≈0.25 kg of CO₂ saved",
    es: "≈0,25 kg de CO₂ evitados",
    fr: "≈0,25 kg de CO₂ évités",
    de: "≈0,25 kg CO₂ eingespart",
  },
  2: {
    it: "≈0,5 kg di CO₂ evitati",
    en: "≈0.5 kg of CO₂ saved",
    es: "≈0,5 kg de CO₂ evitados",
    fr: "≈0,5 kg de CO₂ évités",
    de: "≈0,5 kg CO₂ eingespart",
  },
  3: {
    it: "≈0,75 kg di CO₂ evitati",
    en: "≈0.75 kg of CO₂ saved",
    es: "≈0,75 kg de CO₂ evitados",
    fr: "≈0,75 kg de CO₂ évités",
    de: "≈0,75 kg CO₂ eingespart",
  },
  5: {
    it: "≈1,25 kg di CO₂ evitati",
    en: "≈1.25 kg of CO₂ saved",
    es: "≈1,25 kg de CO₂ evitados",
    fr: "≈1,25 kg de CO₂ évités",
    de: "≈1,25 kg CO₂ eingespart",
  },
  10: {
    it: "≈2,5 kg di CO₂ evitati",
    en: "≈2.5 kg of CO₂ saved",
    es: "≈2,5 kg de CO₂ evitados",
    fr: "≈2,5 kg de CO₂ évités",
    de: "≈2,5 kg CO₂ eingespart",
  },
};

/* =========================================================
   SHOPIFY VARIANT IDS
========================================================= */

const VARIANT_IDS: Record<"Standard" | "Premium", Record<Kg, string>> = {
  Standard: {
    1: "52045370360146",
    2: "52045370392914",
    3: "52045370425682",
    5: "52045370458450",
    10: "52045370491218",
  },
  Premium: {
    1: "52045402571090",
    2: "52045402603858",
    3: "52045402636626",
    5: "52045402669394",
    10: "52045402702162",
  },
};

/* =========================================================
   PACK CARD (STANDARD / PREMIUM)
========================================================= */

function PackCard({
  kind,
  kg,
  video,
  lang,
  t,
}: {
  kind: "Standard" | "Premium";
  kg: Kg;
  video: string;
  lang: Lang;
  t: CopyPerLang;
}) {
  const { addItem } = useCart();

  const { total, compareTotal, ppk } = prices(kind, kg);
  const isStd = kind === "Standard";
  const variantId = VARIANT_IDS[kind][kg];
  const anchorId = kg === 10 ? `buy-${kind.toLowerCase()}-10` : undefined;

  function handleAddToCart() {
    addItem({
      id: `${kind}-${kg}`,
      shopifyId: variantId,
      title: `${kind} · ${kg} kg`,
      kg,
      kind,
      price: total,
      image: `/videos/packs/${isStd ? "std" : "prm"}-${kg}.mp4`,
      qty: 1,
    });
  }

  const co2Text = co2ByKg[kg][lang] ?? co2ByKg[kg].it ?? "";

  return (
    <article
      id={anchorId}
      className={`card ${isStd ? "card--standard" : "card--premium"}`}
    >
      <div className="flex items-center justify-between mb-2 text-[0.7rem] uppercase tracking-[.15em] text-white/60">
        <span>{isStd ? t.badgeStd : t.badgePrm}</span>
        <span className="pill pill--std">
          {kg} kg · {kind}
        </span>
      </div>

      <div
        className={`media-wrap ${
          isStd ? "media-wrap--std" : "media-wrap--prm"
        }`}
      >
        <div className="ratio-16-9">
          <video
            src={video}
            className="media rounded-[12px] object-cover"
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
          />
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h4 className="product-title text-xl">
          {kind} <span className="dot" /> {kg} kg
        </h4>

        <div className="text-right space-y-1">
          {/* prezzo di confronto */}
          <div className="text-sm line-through text-white/45">
            {euro(compareTotal)}
          </div>

          {/* prezzo reale */}
          <div
            className={`price-figure ${
              isStd ? "price-figure--std" : "price-figure--prm"
            } text-3xl`}
          >
            {euro(total)}
          </div>

          <div className="price-perkg">
            ({ppk.toFixed(2)} €/kg)
          </div>

          {co2Text && (
            <div className="text-[0.7rem] text-emerald-200/90">
              ♻ {co2Text}
            </div>
          )}
        </div>
      </div>

      <ul className="bullets mt-3 space-y-1">
        <li>{t.bullets1}</li>
        <li>{t.bullets2}</li>
        <li>{t.bullets3}</li>
        <li>{t.bullets4}</li>
      </ul>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`btn w-full ${isStd ? "btn-silver" : "btn-gold"}`}
        >
          {t.addToCart}
        </button>
      </div>
    </article>
  );
}
/* =========================================================
   EXPLORER BOX — 7.5 KG STD + 7.5 KG PRM + 1 KG FREE
========================================================= */

const EXPLORER_SHOPIFY_ID = "52089141363026";

// prezzi di confronto per kg
const EXPLORER_COMPARE_STD_PPK = 25.9;
const EXPLORER_COMPARE_PRM_PPK = 29.9;

// composizione box
const EXPLORER_STD_KG = 7.5;
const EXPLORER_PRM_KG = 7.5;
const EXPLORER_BONUS_KG = 1;
const EXPLORER_TOTAL_KG =
  EXPLORER_STD_KG + EXPLORER_PRM_KG + EXPLORER_BONUS_KG;

// prezzo di confronto totale
const EXPLORER_COMPARE_TOTAL = +(
  EXPLORER_STD_KG * EXPLORER_COMPARE_STD_PPK +
  EXPLORER_PRM_KG * EXPLORER_COMPARE_PRM_PPK
).toFixed(2);

// sconto 25%
const EXPLORER_DISCOUNT = 0.25;
const EXPLORER_PRICE_TOTAL = +(
  EXPLORER_COMPARE_TOTAL * (1 - EXPLORER_DISCOUNT)
).toFixed(2);

const EXPLORER_PRICE_PER_KG = +(
  EXPLORER_PRICE_TOTAL / EXPLORER_TOTAL_KG
).toFixed(2);

/* =========================================================
   EXPLORER CARD
========================================================= */

function ExplorerCard({
  lang,
  t,
}: {
  lang: Lang;
  t: CopyPerLang;
}) {
  const { addItem } = useCart();

  function handleAdd() {
    addItem({
      id: "Explorer-16",
      shopifyId: EXPLORER_SHOPIFY_ID,
      title: t.explorerTitle,
      kind: "Premium",
      kg: EXPLORER_TOTAL_KG,
      price: EXPLORER_PRICE_TOTAL,
      qty: 1,
      image: "/videos/packs/ExplorerBox.mp4",
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
          <span className="text-amber-300">🚀</span>
          <span>{t.explorerTitle}</span>
        </h2>
        <span className="inline-flex items-center rounded-full border border-emerald-300/70 bg-emerald-500/10 px-3 py-1 text-[0.7rem] uppercase tracking-[.18em] text-emerald-200">
          {t.explorerBadge}
        </span>
      </div>

      <p className="text-sm md:text-base text-white/75 max-w-2xl">
        {t.explorerSubtitle}
      </p>

      <div className="grid md:grid-cols-[1.4fr,1fr] gap-4 items-stretch">
        <div className="card relative overflow-hidden bg-gradient-to-br from-[#7A20FF]/40 via-[#111827] to-[#20D27A]/30">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),transparent_55%)]" />

          <div className="relative flex flex-col md:flex-row gap-4 items-center md:items-stretch">
            <div className="w-full md:w-1/2">
              <div className="relative aspect-video rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
                <video
                  src="/videos/packs/ExplorerBox.mp4"
                  className="w-full h-full object-cover"
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-white/80 flex items-center justify-between">
                  <span className="tracking-[.18em] uppercase text-emerald-200/90">
                    Explorer
                  </span>
                  <span className="text-[0.7rem]">
                    15 kg + 1 kg 🎁
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 p-2 md:p-0">
              <ul className="text-sm text-white/80 space-y-1">
                <li>
                  • 7,5 kg Standard + 7,5 kg Premium
                </li>
                <li>
                  • 1 kg bonus incluso
                </li>
                <li>
                  • Sconto bundle del 25%
                </li>
              </ul>

              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[.16em] text-white/60">
                    {lang === "it"
                      ? "Prezzo bundle"
                      : "Bundle price"}
                  </div>

                  {/* prezzo confronto */}
                  <div className="text-sm line-through text-white/45">
                    {euro(EXPLORER_COMPARE_TOTAL)}
                  </div>

                  {/* prezzo reale */}
                  <div className="text-3xl font-extrabold">
                    {euro(EXPLORER_PRICE_TOTAL)}
                  </div>

                  <div className="text-xs text-white/60">
                    ≈ {EXPLORER_PRICE_PER_KG} €/kg
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="btn btn-brand px-6 py-3"
                >
                  {t.explorerCta}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card text-xs text-white/70 space-y-2">
          <p>
            💡{" "}
            {lang === "it"
              ? "Explorer Box è un bundle speciale con prezzo medio ridotto grazie allo sconto volume."
              : "Explorer Box is a special bundle with reduced average price thanks to volume discount."}
          </p>
        </div>
      </div>
    </section>
  );
}
/* =========================================================
   PRODUCTS PAGE
========================================================= */

export default function ProductsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolved = use(params);
  const lang: Lang = normalizeLang(resolved?.lang);
  const t = PRODUCTS_COPY[lang] ?? PRODUCTS_COPY.it;
  const animRef = useRef<HTMLDivElement>(null);

  /* ===============================
     LOTTIE ANIMATION
  =============================== */
  useEffect(() => {
    let destroyed = false;
    let anim: import("lottie-web").AnimationItem | null = null;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    (async () => {
      try {
        const { default: lottie } = await import("lottie-web");
        const res = await fetch("/lottie/products-animation.json", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        if (!destroyed && animRef.current) {
          anim = lottie.loadAnimation({
            container: animRef.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            animationData: data,
          });
        }
      } catch {}
    })();

    return () => {
      destroyed = true;
      try {
        anim?.destroy();
      } catch {}
    };
  }, []);

  /* ===============================
     SEO JSON-LD
  =============================== */
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.kilomystery.com";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name:
      lang === "it"
        ? "Mystery Box al kg KiloMystery"
        : "KiloMystery Mystery Boxes by the kilo",
    brand: {
      "@type": "Brand",
      name: "KiloMystery",
    },
    url: `${siteUrl}/${lang}/products`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: "20.15",
      highPrice: "26.90",
      availability: "https://schema.org/InStock",
    },
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:
      lang === "it"
        ? "Mystery Box al Kg | KiloMystery"
        : "Mystery Boxes by the Kilo | KiloMystery",
    url: `${siteUrl}/${lang}/products`,
  };

  return (
    <>
      {/* SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageJsonLd),
        }}
      />

      <Header lang={lang} />

      <main className="container py-10 mb-16 space-y-10">
        {/* HERO */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="mx-auto w-[200px] relative aspect-[3/1]">
            <Image
              src="/logo.svg"
              alt="KiloMystery"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div
            ref={animRef}
            className="mx-auto w-[300px] h-[240px]"
          />

          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="brand-text">
              {t.heroTitleHighlight} {t.heroTitleRest}
            </span>
          </h1>

          <p className="text-white/70">
            {t.heroSubtitle1}
          </p>
          <p className="text-white/70">
            {t.heroSubtitle2}
          </p>
        </section>

        {/* STANDARD */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold">
            Standard
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 5, 10].map((kg) => (
              <PackCard
                key={`std-${kg}`}
                kind="Standard"
                kg={kg as Kg}
                video={`/videos/packs/std-${kg}.mp4`}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        </section>

        {/* PREMIUM */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold">
            Premium
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 5, 10].map((kg) => (
              <PackCard
                key={`prm-${kg}`}
                kind="Premium"
                kg={kg as Kg}
                video={`/videos/packs/prm-${kg}.mp4`}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        </section>

        {/* EXPLORER */}
        <ExplorerCard lang={lang} t={t} />

        {/* CONTENUTO BOX */}
        <SectionInsideBox lang={lang} />

        {/* RESI */}
        <section className="card">
          <h3 className="text-xl font-extrabold">
            {t.returnTitle}
          </h3>
          <p className="text-white/70 mt-2">
            {t.returnText}
          </p>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
