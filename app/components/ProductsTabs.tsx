"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/app/components/cart/CartProvider";
import { SHOPIFY_VARIANTS, Kg, Tier } from "@/app/config/shopifyProducts";
import { trackAddToCart, trackViewItemList } from "@/app/lib/tracking";
import type { KMCartItem } from "@/app/lib/ga";

type Lang = "it" | "en" | "es" | "fr" | "de";
type TabTier = "std" | "prm";

type MediaSlide =
  | { type: "video"; src: string; poster: string }
  | { type: "image"; src: string };

type SocialProofItem = {
  addToCartsToday?: number;
  availableNow?: number;
};

type SocialProofResponse = {
  standard?: Partial<Record<Kg, SocialProofItem>>;
  premium?: Partial<Record<Kg, SocialProofItem>>;
};

const LABELS: Record<Lang, any> = {
  it: {
    standard: "Standard",
    premium: "Premium",
    add: "Aggiungi al carrello",
    addFive: "Scegli il 5 kg",
    addFivePremium: "👑 Scegli il 5 kg Premium",
    soldOut: "Sold Out",
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
    badgePrm: "Contenuto più ricco",
    badgeTen: "🎥 Unboxing lungo",
    wheelTitle: "Ruota della fortuna",
    wheelText:
      "Con un ordine da almeno 10 kg ottieni 1 giro automatico quando vai al carrello. Puoi vincere fino a +2 kg bonus che aggiungiamo al tuo ordine.",
    wheelCta: "Vai ai 10 kg",
    bestSeller: "⭐ Più venduto",
    bestValue: "🔥 Miglior valore",
    premiumTop: "👑 Premium Box",
    fiveLine1:
      "💰 Alcuni clienti affermano di aver trovato, nei box più fortunati, prodotti per un valore di centinaia di euro superiore al prezzo pagato.",
    fiveLine2: "📦 In media 7-15 articoli per box",
    tenLine1:
      "💰 Alcuni clienti affermano di aver trovato, nei box più fortunati, prodotti per un valore di centinaia di euro superiore al prezzo pagato.",
    tenLine2: "📦 In media 14-30 articoli per box",
    randomLine: "🎁 Ogni box è diverso e completamente casuale",
    klarnaPrefix: "oppure in 3 rate da",
    klarnaSuffix: "con Klarna",
    cartsPrefix: "🛒 Aggiunto a",
    cartsSuffix: "carrelli oggi",
    stockPrefix: "⚠️ Solo",
    stockSuffix: "disponibili ora",
    stockLowPrefix: "🔥 Lotto quasi finito:",
    stockLowSuffix: "ancora disponibili",
  },
  en: {
    standard: "Standard",
    premium: "Premium",
    add: "Add to cart",
    addFive: "Choose 5 kg",
    addFivePremium: "👑 Choose 5 kg Premium",
    soldOut: "Sold Out",
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
    badgePrm: "Richer content",
    badgeTen: "🎥 Long unboxing",
    wheelTitle: "Mystery Wheel",
    wheelText:
      "With an order of at least 10 kg you unlock 1 automatic spin when you go to the cart. Win up to +2 kg bonus that we add to your order.",
    wheelCta: "Go to 10 kg",
    bestSeller: "⭐ Best seller",
    bestValue: "🔥 Best value",
    premiumTop: "👑 Premium Box",
    fiveLine1:
      "💰 Some customers say they found, in the luckiest boxes, products worth hundreds of euros more than the price paid.",
    fiveLine2: "📦 On average 7-15 items per box",
    tenLine1:
      "💰 Some customers say they found, in the luckiest boxes, products worth hundreds of euros more than the price paid.",
    tenLine2: "📦 On average 14-30 items per box",
    randomLine: "🎁 Every box is different and completely random",
    klarnaPrefix: "or in 3 payments of",
    klarnaSuffix: "with Klarna",
    cartsPrefix: "🛒 Added to",
    cartsSuffix: "carts today",
    stockPrefix: "⚠️ Only",
    stockSuffix: "available now",
    stockLowPrefix: "🔥 Nearly sold out:",
    stockLowSuffix: "left",
  },
  es: {
    standard: "Standard",
    premium: "Premium",
    add: "Añadir al carrito",
    addFive: "Elige 5 kg",
    addFivePremium: "👑 Elige 5 kg Premium",
    soldOut: "Agotado",
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
    badgePrm: "Contenido más rico",
    badgeTen: "🎥 Unboxing largo",
    wheelTitle: "Ruleta de la suerte",
    wheelText:
      "Con un pedido de al menos 10 kg consigues 1 tirada automática al ir al carrito. Puedes ganar hasta +2 kg extra que añadimos a tu pedido.",
    wheelCta: "Ir a los 10 kg",
    bestSeller: "⭐ Más vendido",
    bestValue: "🔥 Mejor valor",
    premiumTop: "👑 Premium Box",
    fiveLine1:
      "💰 Algunos clientes afirman haber encontrado, en las cajas más afortunadas, productos con un valor de cientos de euros superior al precio pagado.",
    fiveLine2: "📦 En promedio 7-15 artículos por caja",
    tenLine1:
      "💰 Algunos clientes afirman haber encontrado, en las cajas más afortunadas, productos con un valor de cientos de euros superior al precio pagado.",
    tenLine2: "📦 En promedio 14-30 artículos por caja",
    randomLine: "🎁 Cada caja es diferente y completamente aleatoria",
    klarnaPrefix: "o en 3 pagos de",
    klarnaSuffix: "con Klarna",
    cartsPrefix: "🛒 Añadido a",
    cartsSuffix: "carritos hoy",
    stockPrefix: "⚠️ Solo",
    stockSuffix: "disponibles ahora",
    stockLowPrefix: "🔥 Lote casi agotado:",
    stockLowSuffix: "disponibles",
  },
  fr: {
    standard: "Standard",
    premium: "Premium",
    add: "Ajouter au panier",
    addFive: "Choisir 5 kg",
    addFivePremium: "👑 Choisir 5 kg Premium",
    soldOut: "Rupture de stock",
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
    badgePrm: "Contenu plus riche",
    badgeTen: "🎥 Long unboxing",
    wheelTitle: "Roue mystère",
    wheelText:
      "Avec une commande d’au moins 10 kg, tu gagnes 1 tirage automatique en arrivant au panier. Jusqu’à +2 kg bonus ajoutés à ta commande.",
    wheelCta: "Aller aux 10 kg",
    bestSeller: "⭐ Le plus vendu",
    bestValue: "🔥 Meilleur rapport",
    premiumTop: "👑 Premium Box",
    fiveLine1:
      "💰 Certains clients affirment avoir trouvé, dans les box les plus chanceuses, des produits d’une valeur de plusieurs centaines d’euros supérieure au prix payé.",
    fiveLine2: "📦 En moyenne 7-15 articles par box",
    tenLine1:
      "💰 Certains clients affirment avoir trouvé, dans les box les plus chanceuses, des produits d’une valeur de plusieurs centaines d’euros supérieure au prix payé.",
    tenLine2: "📦 En moyenne 14-30 articles par box",
    randomLine: "🎁 Chaque box est différente et complètement aléatoire",
    klarnaPrefix: "ou en 3 fois de",
    klarnaSuffix: "avec Klarna",
    cartsPrefix: "🛒 Ajouté à",
    cartsSuffix: "paniers aujourd’hui",
    stockPrefix: "⚠️ Plus que",
    stockSuffix: "disponibles maintenant",
    stockLowPrefix: "🔥 Lot presque épuisé :",
    stockLowSuffix: "restants",
  },
  de: {
    standard: "Standard",
    premium: "Premium",
    add: "In den Warenkorb",
    addFive: "5 kg wählen",
    addFivePremium: "👑 5 kg Premium wählen",
    soldOut: "Ausverkauft",
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
    badgePrm: "Mehr Inhalt",
    badgeTen: "🎥 Langes Unboxing",
    wheelTitle: "Glücksrad",
    wheelText:
      "Mit einer Bestellung von mindestens 10 kg bekommst du 1 Dreh automatisch im Warenkorb. Gewinne bis zu +2 kg Bonus, die wir deiner Bestellung hinzufügen.",
    wheelCta: "Zu den 10 kg",
    bestSeller: "⭐ Bestseller",
    bestValue: "🔥 Bestes Angebot",
    premiumTop: "👑 Premium Box",
    fiveLine1:
      "💰 Einige Kunden berichten, in den besten Boxen Produkte gefunden zu haben, deren Wert um Hunderte Euro über dem bezahlten Preis lag.",
    fiveLine2: "📦 Im Durchschnitt 7-15 Artikel pro Box",
    tenLine1:
      "💰 Einige Kunden berichten, in den besten Boxen Produkte gefunden zu haben, deren Wert um Hunderte Euro über dem bezahlten Preis lag.",
    tenLine2: "📦 Im Durchschnitt 14-30 Artikel pro Box",
    randomLine: "🎁 Jede Box ist anders und komplett zufällig",
    klarnaPrefix: "oder in 3 Raten à",
    klarnaSuffix: "mit Klarna",
    cartsPrefix: "🛒 Heute in",
    cartsSuffix: "Warenkörbe gelegt",
    stockPrefix: "⚠️ Nur noch",
    stockSuffix: "jetzt verfügbar",
    stockLowPrefix: "🔥 Fast ausverkauft:",
    stockLowSuffix: "übrig",
  },
};

const WEIGHTS: Kg[] = [5, 3, 10, 2, 1];

const PRICE_TABLE: Record<TabTier, Record<Kg, { total: number; compareAt: number }>> = {
  std: {
    1: { total: 25.9, compareAt: 26.9 },
    2: { total: 49.2, compareAt: 53.8 },
    3: { total: 69.9, compareAt: 80.7 },
    5: { total: 110.0, compareAt: 134.5 },
    10: { total: 219.0, compareAt: 269.0 },
  },
  prm: {
    1: { total: 28.9, compareAt: 29.9 },
    2: { total: 54.8, compareAt: 59.8 },
    3: { total: 78.0, compareAt: 89.7 },
    5: { total: 122.5, compareAt: 149.5 },
    10: { total: 239.0, compareAt: 299.0 },
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

const euro = (n: number) =>
  n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

const KLARNA_INSTALLMENTS: Record<TabTier, Partial<Record<Kg, number>>> = {
  std: {
    2: 15.63,
    3: 21.76,
    5: 35.12,
    10: 67.17,
  },
  prm: {
    2: 17.04,
    3: 24.75,
    5: 39.45,
    10: 71.73,
  },
};

function ProductMediaCarousel({
  slides,
  alt,
  priority,
  sizes = "(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw",
}: {
  slides: MediaSlide[];
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  const cleanSlides = slides.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const visibleSlides = useMemo(() => {
    if (!cleanSlides.length) return [];
    if (!videoFailed) return cleanSlides;

    return cleanSlides.map((slide, i) => {
      if (i === 0 && slide.type === "video") {
        return { type: "image" as const, src: slide.poster };
      }
      return slide;
    });
  }, [cleanSlides, videoFailed]);

  useEffect(() => {
    setIndex(0);
  }, [slides]);

  useEffect(() => {
    if (visibleSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % visibleSlides.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [visibleSlides.length]);

  useEffect(() => {
    const current = visibleSlides[index];
    if (!current || current.type !== "video") return;
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = async () => {
      try {
        const p = v.play();
        if (p && typeof (p as any).then === "function") {
          await p;
        }
      } catch {
        setVideoFailed(true);
      }
    };

    tryPlay();
  }, [index, visibleSlides]);

  if (!visibleSlides.length) return null;
  const current = visibleSlides[index];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-black/20">
      {current.type === "video" ? (
        <video
          ref={videoRef}
          src={current.src}
          playsInline
          muted
          loop
          autoPlay
          preload="metadata"
          poster={current.poster}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <Image
          src={current.src}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
          priority={priority}
        />
      )}

      {visibleSlides.length > 1 ? (
        <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
          {visibleSlides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                i === index ? "bg-white" : "bg-white/35"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ProductsTabs({ lang = "it" as Lang }) {
  const [tab, setTab] = useState<TabTier>("std");
  const [socialProof, setSocialProof] = useState<SocialProofResponse>({});
  const { addItem } = useCart();

  const supported = ["it", "en", "es", "fr", "de"] as const;
  const normalized = String(lang).toLowerCase();
  const safeLang: Lang = (supported as readonly string[]).includes(normalized as any)
    ? (normalized as Lang)
    : "it";

  const L = LABELS[safeLang];
  const currentKind: "Standard" | "Premium" = tab === "std" ? "Standard" : "Premium";

  const listRef = useRef<string>("");

  const isSoldOutProduct = (tier: TabTier, kg: Kg) => {
    if (tier === "prm") return true; // tutti i Premium sold out
    if (tier === "std" && kg === 1) return true; // solo Standard 1kg sold out
    return false;
  };

  useEffect(() => {
    const key = `products-tabs:${safeLang}:${tab}`;
    if (listRef.current === key) return;
    listRef.current = key;

    const tierLookup = tab === "std" ? "standard" : "premium";

    const items = WEIGHTS.filter((kg) => !isSoldOutProduct(tab, kg)).map((kg) => {
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

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch("/api/products/social-proof", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = (await res.json()) as SocialProofResponse;
        if (!cancelled) setSocialProof(data || {});
      } catch {
        // fallback silenzioso
      }
    };

    run();
    const interval = window.setInterval(run, 45000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  function handleAddToCart(kind: "Standard" | "Premium", kg: Kg, perKg: number) {
    const soldOut = kind === "Premium" || (kind === "Standard" && kg === 1);
    if (soldOut) return;

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

  const proofMap = tab === "std" ? socialProof.standard : socialProof.premium;

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
            "px-6 py-3 rounded-full font-bold transition border text-base",
            tab === "std"
              ? "bg-gradient-to-b from-white to-white/75 text-[#0f1216] border-white/80 shadow-[0_12px_35px_rgba(255,255,255,.28)] scale-105"
              : "bg-white/8 text-white/90 border-white/15 hover:bg-white/14",
          ].join(" ")}
          onClick={() => setTab("std")}
          type="button"
        >
          {L.standard}
        </button>

        <button
          className={[
            "px-6 py-3 rounded-full font-bold transition border text-base",
            tab === "prm"
              ? "bg-gradient-to-b from-[#fff2a8] via-[#f4cf57] to-[#d4af37] text-[#1a1a1a] border-yellow-100/90 shadow-[0_14px_40px_rgba(212,175,55,.45)] scale-105"
              : "bg-gradient-to-b from-[#4b3a06]/70 to-[#2d2203]/70 text-yellow-100 border-yellow-300/35 hover:border-yellow-200/55 hover:bg-[#5b4709]/70 shadow-[0_8px_26px_rgba(212,175,55,.18)]",
          ].join(" ")}
          onClick={() => setTab("prm")}
          type="button"
        >
          👑 {L.premium}
        </button>
      </div>

      {tab === "prm" ? (
        <div className="mx-auto max-w-xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200/70 bg-gradient-to-r from-[#fff0a6]/25 via-[#f4cf57]/25 to-[#d4af37]/25 px-5 py-2.5 text-sm font-bold text-yellow-100 shadow-[0_14px_40px_rgba(212,175,55,.30)]">
            <span>{L.premiumTop}</span>
            <span className="text-yellow-200/80">•</span>
            <span>{L.badgePrm}</span>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {WEIGHTS.map((w) => {
          const kg = w as Kg;
          const isStd = tab === "std";
          const isSoldOut = isSoldOutProduct(tab, kg);

          const { total, compareAt } = PRICE_TABLE[tab][kg];
          const perKg = +(total / kg).toFixed(2);

          const base = isStd ? "std" : "prm";
          const imgSrc = `/videos/packs/${base}-${w}.jpg`;
          const videoSrc = `/videos/packs/${base}-${w}.mp4`;

          const standardSlides: MediaSlide[] = [
            { type: "video", src: videoSrc, poster: imgSrc },
            { type: "image", src: "/images/real/std-real-1.jpg" },
            { type: "image", src: "/images/real/std-real-2.jpg" },
            { type: "image", src: "/images/real/std-real-3.jpg" },
          ];

          const premiumSlides: MediaSlide[] = [
            { type: "video", src: videoSrc, poster: imgSrc },
            { type: "image", src: "/images/real/prm-real-1.jpg" },
            { type: "image", src: "/images/real/prm-real-2.jpg" },
            { type: "image", src: "/images/real/prm-real-3.jpg" },
          ];

          const slides = isStd ? standardSlides : premiumSlides;
          const co2Text = co2ByKg[safeLang][kg];

          const showBestSeller = kg === 3;
          const showBestValue = kg === 5;
          const isFiveKg = kg === 5;
          const isTenKg = kg === 10;

          const klarnaRate = KLARNA_INSTALLMENTS[tab][kg];
          const liveProof = isSoldOut ? undefined : proofMap?.[kg];
          const addToCartsToday = liveProof?.addToCartsToday;
          const availableNow = liveProof?.availableNow;

          const cardInner = (
            <article
              id={
                tab === "std" && w === 10
                  ? "buy-standard-10"
                  : tab === "prm" && w === 10
                  ? "buy-premium-10"
                  : undefined
              }
              className={[
                "card self-start relative rounded-[24px] border p-4 md:p-5 transition-all duration-300",
                isStd
                  ? "border-white/14 bg-[radial-gradient(circle_at_top,rgba(34,197,94,.10),rgba(9,12,18,.92)_55%)] shadow-[0_18px_50px_rgba(0,0,0,.30)]"
                  : "border-yellow-300/35 bg-[radial-gradient(circle_at_top,rgba(212,175,55,.18),rgba(9,12,18,.94)_58%)] shadow-[0_22px_60px_rgba(212,175,55,.12)]",
                showBestSeller ? "ring-1 ring-white/20" : "",
                showBestValue
                  ? "ring-2 ring-emerald-300/45 shadow-[0_26px_70px_rgba(16,185,129,.20)] scale-[1.01]"
                  : "",
                isFiveKg ? "lg:col-span-2" : "",
                isSoldOut ? "opacity-80" : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between mb-3 pt-1 text-[0.72rem] uppercase tracking-[.18em] text-white/65">
                <span className={!isStd ? "text-yellow-100/85 font-semibold" : ""}>
                  {isTenKg ? L.badgeTen : isStd ? L.badgeStd : L.badgePrm}
                </span>

                <span
                  className={[
                    "rounded-full px-4 py-2 text-[0.78rem] font-bold tracking-[.16em]",
                    isStd
                      ? "border border-white/20 bg-white/8 text-white/90"
                      : "border border-yellow-200/50 bg-gradient-to-r from-[#4a3700]/70 to-[#6e5307]/70 text-yellow-100 shadow-[0_8px_24px_rgba(212,175,55,.18)]",
                  ].join(" ")}
                >
                  {w} {L.kg} · {isStd ? L.standard : L.premium}
                </span>
              </div>

              <div
                className={
                  isStd
                    ? ""
                    : "rounded-[18px] p-[2px] bg-gradient-to-r from-yellow-200/25 via-[#d4af37]/30 to-yellow-200/25"
                }
              >
                <div className={`media-wrap ${isStd ? "media-wrap--std" : "media-wrap--prm"}`}>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[14px] bg-black/20">
                    <ProductMediaCarousel
                      slides={slides}
                      alt={`${isStd ? L.standard : L.premium} ${w}${L.kg}`}
                      priority={w === 5}
                      sizes="(min-width: 1024px) 60vw, (min-width: 640px) 45vw, 92vw"
                    />

                    {showBestSeller ? (
                      <div className="absolute top-3 right-3 z-30">
                        <span className="rounded-full border border-[#ffe9a8] bg-gradient-to-r from-white via-[#fff6d8] to-[#ffe08a] px-4 py-2 text-[0.72rem] font-extrabold text-[#151515] shadow-[0_10px_28px_rgba(255,232,138,.45)]">
                          {L.bestSeller}
                        </span>
                      </div>
                    ) : null}

                    {showBestValue ? (
                      <div className="absolute top-3 right-3 z-30">
                        <span className="rounded-full border border-emerald-200/70 bg-gradient-to-r from-emerald-300 via-green-300 to-lime-200 px-4 py-2 text-[0.72rem] font-extrabold text-[#0f1216] shadow-[0_12px_30px_rgba(52,211,153,.38)]">
                          {L.bestValue}
                        </span>
                      </div>
                    ) : null}

                    {isSoldOut ? (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
                        <span className="rounded-full border border-red-200/70 bg-red-500/90 px-5 py-2 text-sm font-extrabold uppercase tracking-[.18em] text-white shadow-[0_12px_30px_rgba(239,68,68,.35)]">
                          {L.soldOut}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-start justify-between gap-4">
                <h3
                  className={`product-title text-[1.55rem] leading-tight ${
                    !isStd ? "text-yellow-50" : ""
                  }`}
                >
                  {isStd ? L.standard : L.premium} <span className="dot" /> {w} {L.kg}
                </h3>

                <div className="text-right space-y-1">
                  <div className="text-sm text-white/50 line-through">{euro(compareAt)}</div>

                  <div
                    className={`text-[2.35rem] font-extrabold leading-none ${
                      isStd
                        ? "text-white"
                        : "text-yellow-100 drop-shadow-[0_0_18px_rgba(244,207,87,.20)]"
                    }`}
                  >
                    {euro(total)}
                  </div>

                  <div
                    className={`text-sm ${
                      isStd ? "text-white/75" : "text-yellow-100/80"
                    } font-medium`}
                  >
                    ({perKg.toFixed(2)} {L.perkg})
                  </div>

                  {klarnaRate ? (
                    <div className="text-[0.8rem] font-semibold text-sky-200/95">
                      💳 {L.klarnaPrefix} {euro(klarnaRate)} {L.klarnaSuffix}
                    </div>
                  ) : null}

                  {co2Text ? (
                    <div className="text-[0.72rem] text-emerald-200/95 font-medium">
                      ♻ {co2Text}
                    </div>
                  ) : null}
                </div>
              </div>

              {!isSoldOut && (addToCartsToday || availableNow) && (
                <div className="mt-4 space-y-2">
                  {typeof addToCartsToday === "number" && addToCartsToday > 0 ? (
                    <div className="rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-[0.82rem] font-semibold text-sky-100">
                      {L.cartsPrefix} {addToCartsToday} {L.cartsSuffix}
                    </div>
                  ) : null}

                  {typeof availableNow === "number" && availableNow > 0 ? (
                    <div
                      className={`rounded-xl px-3 py-2 text-[0.82rem] font-semibold ${
                        availableNow <= 5
                          ? "border border-red-300/30 bg-red-400/10 text-red-100"
                          : "border border-amber-300/25 bg-amber-300/10 text-amber-100"
                      }`}
                    >
                      {availableNow <= 5
                        ? `${L.stockLowPrefix} ${availableNow} ${L.stockLowSuffix}`
                        : `${L.stockPrefix} ${availableNow} ${L.stockSuffix}`}
                    </div>
                  ) : null}
                </div>
              )}

              <ul className="mt-4 space-y-2 text-[1.03rem]">
                <li className="flex items-start gap-2 text-white/92">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,.5)]" />
                  <span>{L.bullet1}</span>
                </li>
                <li className="flex items-start gap-2 text-white/92">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,.5)]" />
                  <span>{L.bullet2}</span>
                </li>
                <li className="flex items-start gap-2 text-white/92">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,.5)]" />
                  <span>{L.bullet3}</span>
                </li>
              </ul>

              <div className="mt-3 text-sm text-white/80 font-medium">{L.randomLine}</div>

              {showBestValue ? (
                <div className="mt-4 rounded-2xl border border-emerald-200/30 bg-emerald-300/10 px-4 py-3 text-sm font-semibold text-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,.10)]">
                  {L.fiveLine1}
                  <br />
                  {L.fiveLine2}
                </div>
              ) : null}

              {isTenKg ? (
                <div className="mt-4 rounded-2xl border border-yellow-200/30 bg-yellow-300/10 px-4 py-3 text-sm font-semibold text-yellow-100 shadow-[0_10px_30px_rgba(234,179,8,.12)]">
                  {L.tenLine1}
                  <br />
                  {L.tenLine2}
                </div>
              ) : null}

              <div className="mt-5">
                <button
                  className={[
                    "w-full rounded-2xl px-5 py-4 text-[1.02rem] font-extrabold transition-all duration-200",
                    isSoldOut
                      ? "bg-white/10 text-white/45 border border-white/10 cursor-not-allowed"
                      : isStd
                      ? "bg-gradient-to-r from-white to-white/85 text-[#101318] shadow-[0_14px_34px_rgba(255,255,255,.12)] hover:scale-[1.02]"
                      : "bg-gradient-to-r from-[#fff2a8] via-[#f4cf57] to-[#d4af37] text-[#1a1a1a] shadow-[0_16px_40px_rgba(212,175,55,.34)] hover:scale-[1.02]",
                    isFiveKg ? "text-[1.08rem]" : "",
                  ].join(" ")}
                  onClick={() => handleAddToCart(currentKind, kg, perKg)}
                  type="button"
                  disabled={isSoldOut}
                >
                  {isSoldOut
                    ? L.soldOut
                    : isFiveKg
                    ? isStd
                      ? L.addFive
                      : L.addFivePremium
                    : isStd
                    ? L.add
                    : `👑 ${L.add}`}
                </button>
              </div>
            </article>
          );

          if (!isFiveKg) {
            return <div key={`${tab}-${w}`}>{cardInner}</div>;
          }

          return (
            <div
              key={`${tab}-${w}`}
              className="relative lg:col-span-2 rounded-[28px] p-[2px] bg-gradient-to-r from-emerald-300 via-green-400 to-lime-300 shadow-[0_0_0_1px_rgba(110,231,183,.22),0_0_26px_rgba(52,211,153,.16)] transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="rounded-[26px] bg-[#0b1016]">{cardInner}</div>
            </div>
          );
        })}

        <article className="card border border-emerald-300/60 bg-gradient-to-br from-emerald-500/15 via-purple-500/15 to-emerald-400/15 p-5 flex flex-col items-center text-center gap-4 self-start rounded-[24px]">
          <p className="text-[0.7rem] uppercase tracking-[.18em] text-emerald-200/80">
            🎡 Bonus extra
          </p>

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