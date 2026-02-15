"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/app/components/cart/CartProvider";
import { SHOPIFY_VARIANTS, Kg, Tier } from "@/app/config/shopifyProducts";
import { trackAddToCart, trackViewItemList } from "@/app/lib/tracking";
import type { KMCartItem } from "@/app/lib/ga";

type Lang = "it" | "en" | "es" | "fr" | "de";
type TabTier = "std" | "prm";

/* =========================
   LABELS
========================= */

const LABELS: Record<Lang, any> = {
  it: {
    standard: "Standard",
    premium: "Premium",
    add: "Aggiungi al carrello",
    kg: "kg",
    perkg: "€/kg",
    sectionTitleMain: "Pesa il mistero,",
    sectionTitleAccent: "spacchetta la sorpresa!",
    sectionSubtitle1: "Standard o Premium? 1 kg o 10 kg? Scegli tu.",
    sectionSubtitle2:
      "Ogni box recupera pacchi che altrimenti finirebbero nello smaltimento: meno rifiuti, meno CO₂, più valore estratto da ciò che esiste già.",
    bullet1: "Contenuto misto – sorpresa",
    bullet2: "Peso netto (toll. ±3%)",
    bullet3: "Sigillo con ID lotto e data",
    badgeStd: "Perfetta per iniziare",
    badgePrm: "Per chi vuole il massimo",

    wheelTitle: "Ruota della fortuna",
    wheelText:
      "Con un ordine da almeno 10 kg ottieni 1 giro automatico quando vai al carrello. Puoi vincere fino a +2 kg bonus che aggiungiamo al tuo ordine.",
    wheelCta: "Vai ai 10 kg",
  },
  en: {
    standard: "Standard",
    premium: "Premium",
    add: "Add to cart",
    kg: "kg",
    perkg: "€/kg",
    sectionTitleMain: "Weigh the mystery,",
    sectionTitleAccent: "unbox the surprise!",
    sectionSubtitle1: "Standard or Premium? 1 kg or 10 kg? You decide.",
    sectionSubtitle2:
      "Each box gives a second life to parcels that would otherwise be discarded: less waste, less CO₂, more value from what already exists.",
    bullet1: "Mixed contents – pure surprise",
    bullet2: "Net weight (±3% tolerance)",
    bullet3: "Seal with batch ID and date",
    badgeStd: "Perfect to start",
    badgePrm: "For those who want more",

    wheelTitle: "Mystery Wheel",
    wheelText:
      "With an order of at least 10 kg you unlock 1 automatic spin when you go to the cart. Win up to +2 kg bonus that we add to your order.",
    wheelCta: "Go to 10 kg",
  },
  es: {
    standard: "Standard",
    premium: "Premium",
    add: "Añadir al carrito",
    kg: "kg",
    perkg: "€/kg",
    sectionTitleMain: "Pesa el misterio,",
    sectionTitleAccent: "¡desempaqueta la sorpresa!",
    sectionSubtitle1: "¿Standard o Premium? ¿1 kg o 10 kg? Tú eliges.",
    sectionSubtitle2:
      "Cada caja recupera paquetes que de otro modo acabarían desechados: menos residuos, menos CO₂ y más valor extraído de lo que ya existe.",
    bullet1: "Contenido mixto – sorpresa",
    bullet2: "Peso neto (tolerancia ±3%)",
    bullet3: "Precinto con ID de lote y fecha",
    badgeStd: "Perfecta para empezar",
    badgePrm: "Para quienes quieren más",

    wheelTitle: "Ruleta de la suerte",
    wheelText:
      "Con un pedido de al menos 10 kg consigues 1 tirada automática al ir al carrito. Puedes ganar hasta +2 kg extra que añadimos a tu pedido.",
    wheelCta: "Ir a los 10 kg",
  },
  fr: {
    standard: "Standard",
    premium: "Premium",
    add: "Ajouter au panier",
    kg: "kg",
    perkg: "€/kg",
    sectionTitleMain: "Pèse le mystère,",
    sectionTitleAccent: "déballes la surprise !",
    sectionSubtitle1: "Standard ou Premium ? 1 kg ou 10 kg ? À toi de choisir.",
    sectionSubtitle2:
      "Chaque box redonne vie à des colis qui auraient fini jetés : moins de déchets, moins de CO₂, plus de valeur extraite de l’existant.",
    bullet1: "Contenu varié – surprise",
    bullet2: "Poids net (tolérance ±3 %)",
    bullet3: "Scellé avec ID de lot et date",
    badgeStd: "Parfait pour commencer",
    badgePrm: "Pour ceux qui en veulent plus",

    wheelTitle: "Roue mystère",
    wheelText:
      "Avec une commande d’au moins 10 kg, tu gagnes 1 tirage automatique en arrivant au panier. Jusqu’à +2 kg bonus ajoutés à ta commande.",
    wheelCta: "Aller aux 10 kg",
  },
  de: {
    standard: "Standard",
    premium: "Premium",
    add: "In den Warenkorb",
    kg: "kg",
    perkg: "€/kg",
    sectionTitleMain: "Wiege das Geheimnis,",
    sectionTitleAccent: "pack die Überraschung aus!",
    sectionSubtitle1: "Standard oder Premium? 1 kg oder 10 kg? Du entscheidest.",
    sectionSubtitle2:
      "Jede Box rettet Pakete, die sonst entsorgt würden: weniger Müll, weniger CO₂ und mehr Wert aus dem, was schon da ist.",
    bullet1: "Gemischter Inhalt – Überraschung",
    bullet2: "Nettogewicht (Toleranz ±3 %)",
    bullet3: "Siegel mit Posten-ID und Datum",
    badgeStd: "Perfekt zum Start",
    badgePrm: "Für alle, die mehr wollen",

    wheelTitle: "Glücksrad",
    wheelText:
      "Mit einer Bestellung von mindestens 10 kg bekommst du 1 Dreh automatisch im Warenkorb. Gewinne bis zu +2 kg Bonus, die wir deiner Bestellung hinzufügen.",
    wheelCta: "Zu den 10 kg",
  },
};

/* =========================
   DATA
========================= */

const WEIGHTS: Kg[] = [1, 2, 3, 5, 10];

const PRICE_TABLE: Record<TabTier, Record<Kg, { total: number; compareAt: number }>> = {
  std: {
    1: { total: 22.99, compareAt: 25.9 },
    2: { total: 44.88, compareAt: 51.8 },
    3: { total: 65.28, compareAt: 77.7 },
    5: { total: 105.35, compareAt: 129.5 },
    10: { total: 201.5, compareAt: 259.0 },
  },
  prm: {
    1: { total: 26.9, compareAt: 29.9 },
    2: { total: 51.12, compareAt: 59.8 },
    3: { total: 74.25, compareAt: 89.7 },
    5: { total: 118.35, compareAt: 149.5 },
    10: { total: 215.2, compareAt: 299.0 },
  },
};

const co2ByKg: Record<Lang, Record<Kg, string>> = {
  it: {
    1: "≈0,25 kg di CO₂ evitati",
    2: "≈0,5 kg di CO₂ evitati",
    3: "≈0,75 kg di CO₂ evitati",
    5: "≈1,25 kg di CO₂ evitati",
    10: "≈2,5 kg di CO₂ evitati",
  },
  en: {
    1: "≈0.25 kg of CO₂ avoided",
    2: "≈0.5 kg of CO₂ avoided",
    3: "≈0.75 kg of CO₂ avoided",
    5: "≈1.25 kg of CO₂ avoided",
    10: "≈2.5 kg of CO₂ avoided",
  },
  es: {
    1: "≈0,25 kg de CO₂ evitados",
    2: "≈0,5 kg de CO₂ evitados",
    3: "≈0,75 kg de CO₂ evitados",
    5: "≈1,25 kg de CO₂ evitados",
    10: "≈2,5 kg de CO₂ evitados",
  },
  fr: {
    1: "≈0,25 kg de CO₂ évités",
    2: "≈0,5 kg de CO₂ évités",
    3: "≈0,75 kg de CO₂ évités",
    5: "≈1,25 kg de CO₂ évités",
    10: "≈2,5 kg de CO₂ évités",
  },
  de: {
    1: "≈0,25 kg CO₂ eingespart",
    2: "≈0,5 kg CO₂ eingespart",
    3: "≈0,75 kg CO₂ eingespart",
    5: "≈1,25 kg CO₂ eingespart",
    10: "≈2,5 kg CO₂ eingespart",
  },
};

const euro = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

function isIOSDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent || "";
  const platform = (window.navigator as any).platform || "";
  const maxTouchPoints = (window.navigator as any).maxTouchPoints || 0;

  const iOS = /iPad|iPhone|iPod/.test(ua) || /iPad|iPhone|iPod/.test(platform);
  const iPadOS13Plus = platform === "MacIntel" && maxTouchPoints > 1; // iPadOS
  return iOS || iPadOS13Plus;
}

function VideoFirstMedia({
  videoSrc,
  posterSrc,
  alt,
  priority,
}: {
  videoSrc: string;
  posterSrc: string;
  alt: string;
  priority?: boolean;
}) {
  const [useFallback, setUseFallback] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const iOS = isIOSDevice();
    if (!iOS) return;

    const t = setTimeout(() => {
      if (!canPlay) setUseFallback(true);
    }, 1200);

    return () => clearTimeout(t);
  }, [canPlay]);

  function handleVideoError() {
    setUseFallback(true);
  }

  function handleCanPlay() {
    setCanPlay(true);
  }

  return (
    <>
      {!useFallback ? (
        <video
          src={videoSrc}
          playsInline
          muted
          loop
          autoPlay
          preload="metadata"
          poster={posterSrc}
          className="media rounded-[12px] object-cover"
          onError={handleVideoError}
          onCanPlay={handleCanPlay}
        />
      ) : null}

      {useFallback ? (
        <Image
          src={posterSrc}
          alt={alt}
          fill
          className="media rounded-[12px] object-cover"
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw"
          priority={priority}
        />
      ) : null}
    </>
  );
}

/* =========================
   COMPONENT
========================= */

export default function ProductsTabs({ lang = "it" as Lang }) {
  const [tab, setTab] = useState<TabTier>("std");
  const { addItem } = useCart();

  const supported = ["it", "en", "es", "fr", "de"] as const;
  const normalized = String(lang).toLowerCase();
  const safeLang: Lang = (supported as readonly string[]).includes(normalized as any)
    ? (normalized as Lang)
    : "it";

  const L = LABELS[safeLang];
  const currentKind: "Standard" | "Premium" = tab === "std" ? "Standard" : "Premium";

  // ✅ GA4: view_item_list una volta per tab+lingua
  const listRef = useRef<string>("");
  useEffect(() => {
    const key = `products-tabs:${safeLang}:${tab}`;
    if (listRef.current === key) return;
    listRef.current = key;

    const tierLookup = tab === "std" ? "standard" : "premium";

    const items = WEIGHTS.map((kg) => {
      const { total } = PRICE_TABLE[tab][kg];
      const perKg = +(total / kg).toFixed(2);
      const shopifyId = SHOPIFY_VARIANTS[tierLookup as Tier][kg];

      return {
        id: `${currentKind}-${kg}`,
        shopifyId,
        title: `${currentKind} · ${kg} kg`,
        tier: currentKind,
        weightKg: kg,
        pricePerKg: perKg,
        qty: 1,
      };
    });

    trackViewItemList(`ProductsTabs-${currentKind}`, items as any);
  }, [safeLang, tab, currentKind]);

  function handleAddToCart(kind: "Standard" | "Premium", kg: Kg, perKg: number) {
    const tierLookup = kind === "Standard" ? "standard" : "premium";
    const shopifyId = SHOPIFY_VARIANTS[tierLookup as Tier][kg];

    const cartItem: KMCartItem = {
      id: `${kind}-${kg}`,
      title: `${kind} · ${kg} kg`,
      tier: kind,
      weightKg: kg,
      pricePerKg: perKg,
      qty: 1,
      shopifyId,
    };

    addItem(cartItem as any);
    trackAddToCart(cartItem, 1);
  }

  return (
    <section className="container py-10 space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-2">
          <span className="bg-gradient-to-r from-[#7A20FF] via-emerald-300 to-[#20D27A] bg-clip-text text-transparent">
            {L.sectionTitleMain} {L.sectionTitleAccent}
          </span>
        </h2>
        <p className="text-white/70">{L.sectionSubtitle1}</p>
        <p className="text-white/70 mt-2 text-sm md:text-base">{L.sectionSubtitle2}</p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          className={[
            "px-5 py-2 rounded-full font-semibold transition border",
            tab === "std"
              ? "bg-gradient-to-b from-white/80 to-white/60 text-[#0f1216] border-white/70 shadow-[0_10px_30px_rgba(180,200,190,.25)]"
              : "bg-white/5 text-white/80 border-white/15 hover:bg-white/10",
          ].join(" ")}
          onClick={() => setTab("std")}
          type="button"
        >
          {L.standard}
        </button>

        <button
          className={[
            "px-5 py-2 rounded-full font-semibold transition border",
            tab === "prm"
              ? "bg-gradient-to-b from-[#f6e27a] to-[#d4af37] text-[#1a1a1a] border-yellow-100/70 shadow-[0_10px_30px_rgba(212,175,55,.35)]"
              : "bg-white/5 text-white/80 border-white/15 hover:bg-white/10",
          ].join(" ")}
          onClick={() => setTab("prm")}
          type="button"
        >
          {L.premium}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {WEIGHTS.map((w) => {
          const kg = w as Kg;
          const isStd = tab === "std";

          const { total, compareAt } = PRICE_TABLE[tab][kg];
          const perKg = +(total / kg).toFixed(2);

          // ✅ VIDEO prima, fallback su JPG (public/videos/packs)
          const base = tab === "std" ? "std" : "prm";
          const imgSrc = `/videos/packs/${base}-${w}.jpg`;
          const videoSrc = `/videos/packs/${base}-${w}.mp4`;

          const co2Text = co2ByKg[safeLang][kg];

          return (
            <article
              key={`${tab}-${w}`}
              id={
                tab === "std" && w === 10
                  ? "buy-standard-10"
                  : tab === "prm" && w === 10
                  ? "buy-premium-10"
                  : undefined
              }
              className={`card ${isStd ? "card--standard" : "card--premium"}`}
            >
              <div className="flex items-center justify-between mb-2 text-[0.7rem] uppercase tracking-[.15em] text-white/60">
                <span>{isStd ? L.badgeStd : L.badgePrm}</span>
                <span className={`pill ${isStd ? "pill--std" : "pill--prm"}`}>
                  {w} {L.kg} · {isStd ? L.standard : L.premium}
                </span>
              </div>

              <div className={`media-wrap ${isStd ? "media-wrap--std" : "media-wrap--prm"}`}>
                <div className="ratio-16-9">
                  <VideoFirstMedia
                    videoSrc={videoSrc}
                    posterSrc={imgSrc}
                    alt={`${isStd ? L.standard : L.premium} ${w}${L.kg}`}
                    priority={w === 1} // solo la prima più importante
                  />
                </div>
              </div>

              <div className="mt-4 flex items-start justify-between gap-4">
                <h3 className="product-title text-xl">
                  {isStd ? L.standard : L.premium} <span className="dot" /> {w} {L.kg}
                </h3>

                <div className="text-right space-y-1">
                  <div className="text-sm text-white/60 line-through">{euro(compareAt)}</div>

                  <div
                    className={`price-figure ${isStd ? "price-figure--std" : "price-figure--prm"} text-3xl`}
                  >
                    {euro(total)}
                  </div>

                  <div className="price-perkg">({perKg.toFixed(2)} {L.perkg})</div>

                  {co2Text && <div className="text-[0.7rem] text-emerald-200/90">♻ {co2Text}</div>}
                </div>
              </div>

              <ul className="bullets mt-3 space-y-1">
                <li>{L.bullet1}</li>
                <li>{L.bullet2}</li>
                <li>{L.bullet3}</li>
              </ul>

              <div className="mt-4">
                <button
                  className={`btn w-full ${isStd ? "btn-silver" : "btn-gold"}`}
                  onClick={() => handleAddToCart(currentKind, kg, perKg)}
                  type="button"
                >
                  {L.add}
                </button>
              </div>
            </article>
          );
        })}

        {/* BONUS CARD */}
        <article className="card border border-emerald-300/60 bg-gradient-to-br from-emerald-500/15 via-purple-500/15 to-emerald-400/15 p-5 flex flex-col items-center text-center gap-4">
          <p className="text-[0.7rem] uppercase tracking-[.18em] text-emerald-200/80">🎡 Bonus extra</p>

          <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-black/60 border border-white/20 flex items-center justify-center">
            <Image
              src="/wheel/wheel.png"
              alt={L.wheelTitle}
              width={256}
              height={256}
              className="h-full w-full object-contain"
              loading="lazy"
              sizes="(min-width: 768px) 128px, 112px"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-extrabold">{L.wheelTitle}</h3>
            <p className="text-xs md:text-sm text-white/85">{L.wheelText}</p>
          </div>

          <a
            href={`/${safeLang}/products#buy-standard-10`}
            className="mt-1 inline-flex items-center justify-center rounded-xl px-4 py-2 font-bold bg-gradient-to-r from-purple-300 to-emerald-300 text-[#0f1216] ring-1 ring-white/60 shadow-md hover:shadow-lg text-sm"
          >
            {L.wheelCta}
          </a>
        </article>
      </div>
    </section>
  );
}
