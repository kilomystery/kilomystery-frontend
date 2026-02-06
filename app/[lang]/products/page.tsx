"use client";

/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../components/cart/CartProvider";
import { Lang, normalizeLang } from "@/i18n/lang";
import SectionInsideBox from "../../components/SectionInsideBox";
import LazyHoverVideo from "../../components/LazyHoverVideo";

// ✅ GA4 helpers
import { gaAddToCart, gaViewItemList } from "@/app/lib/ga";

declare global {
  interface Window {
    ttq?: any;
    __tiktokConsentGranted?: boolean;

    // ✅ Meta
    fbq?: (...args: any[]) => void;
    __metaConsentGranted?: boolean;
  }
}

type Kg = 1 | 2 | 3 | 5 | 10;

const stdV = (kg: Kg) => `/videos/packs/std-${kg}.mp4`;
const prmV = (kg: Kg) => `/videos/packs/prm-${kg}.mp4`;
const stdJ = (kg: Kg) => `/videos/packs/std-${kg}.jpg`;
const prmJ = (kg: Kg) => `/videos/packs/prm-${kg}.jpg`;

/* =========================================================
   ✅ PREZZI FRONTEND (REAL + COMPARE) — ALLINEATI A SHOPIFY
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

// === EXPLORER BOX (BUNDLE) — ALLINEATA A SHOPIFY ===
const EXPLORER_SHOPIFY_ID = "52089141363026";
const EXPLORER_TOTAL_KG = 16; // 15kg + 1kg omaggio
const EXPLORER_PRICE_TOTAL = 314.0; // prezzo reale
const EXPLORER_COMPARE_TOTAL = 418.5; // prezzo di confronto

const EXPLORER_PRICE_PER_KG = +(EXPLORER_PRICE_TOTAL / EXPLORER_TOTAL_KG).toFixed(
  2
);

const EXPLORER_COMPARE_PER_KG = +(
  EXPLORER_COMPARE_TOTAL / EXPLORER_TOTAL_KG
).toFixed(2);

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

/* =========================
   COPY (identico al tuo)
========================= */
const PRODUCTS_COPY: Record<Lang, CopyPerLang> = {
  it: {
    heroTitleHighlight: "Pesa il mistero",
    heroTitleRest: "e spacchetta la sorpresa",
    heroSubtitle1:
      "Standard o Premium, da 1 a 10 kg: decidi quanto intensa sarà la tua sessione di unboxing. Ogni box è selezionata, sigillata e collegata a un lotto reale.",
    heroSubtitle2:
      "Non vendiamo “valore garantito”, ma un'esperienza di sorpresa che recupera pacchi esistenti e riduce sprechi e CO₂ lungo la filiera.",

    trustShippingTitle: "Spedizione",
    trustShippingText:
      "Spediamo in tutta Europa con tracking attivo. Tempi medi 48–72h. Spedizione gratuita per ordini superiori a 100€.",
    trustPaymentsTitle: "Pagamenti sicuri",
    trustPaymentsText:
      "Paghi tramite provider affidabili, con riepilogo completo via email.",
    trustSupportTitle: "Assistenza",
    trustSupportText:
      "Supporto diretto via email: nessun call center impersonale.",

    standardDescription:
      "Ideale per chi vuole provare l'esperienza KiloMystery con un mix bilanciato di prodotti e prezzo.",
    premiumDescription:
      "Per chi cerca un mix più spinto: lotti selezionati e maggiore probabilità di articoli di fascia medio–alta.",

    returnTitle: "Politica resi",
    returnText:
      "Le box sono vendute come mystery sigillate: il reso non è previsto per semplice mancato gradimento, perché il contenuto è per definizione non conosciuto in anticipo. In etichetta trovi peso, lotto e tracciabilità per la massima trasparenza.",
    returnCta: "Leggi la policy completa",

    badgeStd: "Perfetta per iniziare",
    badgePrm: "Per chi vuole il massimo",

    bullets1: "Contenuto misto e misterioso da lotti reali.",
    bullets2: "Peso netto con tolleranza ±3% su ogni box.",
    bullets3: "Sigillo con ID lotto e data di preparazione.",
    bullets4: "Nessun prodotto illegale o vietato.",

    addToCart: "Aggiungi al carrello",

    explorerTitle: "Explorer Box 15 kg + 1 kg omaggio",
    explorerSubtitle:
      "Bundle speciale con mix di Standard e Premium: 16 kg totali per un unboxing lungo, denso e pieno di sorpresa.",
    explorerBadge: "Best value",
    explorerCta: "Aggiungi Explorer Box",

    wheelTitle: "Ruota della fortuna",
    wheelText:
      "Con un ordine da almeno 10 kg ottieni 1 giro automatico quando vai al carrello. Puoi vincere fino a +2 kg bonus che aggiungiamo al tuo ordine come peso extra.",
    wheelCtaStd: "Vai ai 10 kg Standard",
    wheelCtaPrm: "Vai ai 10 kg Premium",

    seoCtaTitle: "Cerchi una Mystery Box?",
    seoCtaText:
      "Scopri la nostra guida completa: cos’è una mystery box, come funziona, cosa aspettarsi e come scegliere tra Standard e Premium.",
    seoCtaPrimary: "Vai alla pagina Mystery Box",
    seoCtaSecondary: "Come funziona",
    seoCtaTertiary: "FAQ",
  },

  en: {
    heroTitleHighlight: "Weigh the mystery",
    heroTitleRest: "and unbox the surprise",
    heroSubtitle1:
      "Standard or Premium, from 1 to 10 kg: you decide how intense your unboxing session will be. Each box is selected, sealed and linked to a real batch.",
    heroSubtitle2:
      "We don’t sell “guaranteed value”, but a surprise experience that gives a second life to existing parcels and reduces waste and CO₂ in the logistics chain.",

    trustShippingTitle: "Shipping",
    trustShippingText:
      "We ship across Europe with active tracking. Average delivery time 48–72h. Free shipping on orders over €100.",
    trustPaymentsTitle: "Secure payments",
    trustPaymentsText:
      "Payments are processed via trusted providers, with a full order summary sent by email.",
    trustSupportTitle: "Support",
    trustSupportText:
      "Direct support via email: no anonymous call centers.",

    standardDescription:
      "Ideal if you want to experience KiloMystery for the first time, with a balanced mix of products and price.",
    premiumDescription:
      "For those looking for a stronger mix: selected lots and a higher chance of medium–high range items.",

    returnTitle: "Return policy",
    returnText:
      "Boxes are sold as sealed mystery boxes: returns are not provided for simple lack of satisfaction, because the content is not known in advance. The label includes weight, batch and traceability for full transparency.",
    returnCta: "Read the full policy",

    badgeStd: "Perfect to start",
    badgePrm: "For those who want more",

    bullets1: "Mixed and mysterious content from real lots.",
    bullets2: "Net weight with ±3% tolerance on every box.",
    bullets3: "Seal with batch ID and preparation date.",
    bullets4: "No illegal or prohibited products.",

    addToCart: "Add to cart",

    explorerTitle: "Explorer Box 15 kg + 1 kg free",
    explorerSubtitle:
      "Special bundle with a mix of Standard and Premium: 16 kg total for an extra-long, high-intensity unboxing.",
    explorerBadge: "Best value",
    explorerCta: "Add Explorer Box",

    wheelTitle: "Mystery Wheel",
    wheelText:
      "With an order of at least 10 kg you unlock 1 automatic spin when you go to the cart. You can win up to +2 kg bonus that we add as extra weight to your order.",
    wheelCtaStd: "Go to 10 kg Standard",
    wheelCtaPrm: "Go to 10 kg Premium",

    seoCtaTitle: "Looking for a Mystery Box?",
    seoCtaText:
      "Read our complete guide: what a mystery box is, how it works, what to expect, and how to choose Standard vs Premium.",
    seoCtaPrimary: "Open the Mystery Box page",
    seoCtaSecondary: "How it works",
    seoCtaTertiary: "FAQ",
  },

  es: {
    heroTitleHighlight: "Pesa el misterio",
    heroTitleRest: "y abre la sorpresa",
    heroSubtitle1:
      "Standard o Premium, de 1 a 10 kg: tú decides cuán intensa será tu sesión de unboxing. Cada caja está seleccionada, precintada y vinculada a un lote real.",
    heroSubtitle2:
      "No vendemos “valor garantizado”, sino una experiencia de sorpresa que da una segunda vida a paquetes existentes y reduce residuos y CO₂.",

    trustShippingTitle: "Envío",
    trustShippingText:
      "Enviamos a toda Europa con seguimiento activo. Plazos medios de entrega 48–72h. Envío gratis en pedidos superiores a 100€.",
    trustPaymentsTitle: "Pagos seguros",
    trustPaymentsText:
      "Pagas a través de proveedores fiables, con un resumen completo del pedido por email.",
    trustSupportTitle: "Soporte",
    trustSupportText:
      "Soporte directo por email: sin call centers anónimos.",

    standardDescription:
      "Ideal para quien quiere probar KiloMystery con una mezcla equilibrada de productos y precio.",
    premiumDescription:
      "Para quien busca algo más potente: lotes seleccionados y mayor probabilidad de artículos de gama media–alta.",

    returnTitle: "Política de devoluciones",
    returnText:
      "Las cajas se venden como mystery boxes precintadas: no se aceptan devoluciones por simple falta de satisfacción. En la etiqueta encontrarás peso, lote y trazabilidad para máxima transparencia.",
    returnCta: "Leer la política completa",

    badgeStd: "Perfecta para empezar",
    badgePrm: "Para quienes quieren más",

    bullets1: "Contenido mixto y misterioso procedente de lotes reales.",
    bullets2: "Peso neto con una tolerancia de ±3%.",
    bullets3: "Precinto con ID de lote y fecha de preparación.",
    bullets4: "Ningún producto ilegal o prohibido.",

    addToCart: "Añadir al carrito",

    explorerTitle: "Explorer Box 15 kg + 1 kg de regalo",
    explorerSubtitle:
      "Bundle especial con mix de Standard y Premium: 16 kg totales para un unboxing largo e intenso.",
    explorerBadge: "Mejor valor",
    explorerCta: "Añadir Explorer Box",

    wheelTitle: "Ruleta de la suerte",
    wheelText:
      "Con un pedido de al menos 10 kg consigues 1 tirada automática al ir al carrito. Puedes ganar hasta +2 kg extra que añadimos como peso adicional a tu pedido.",
    wheelCtaStd: "Ir a 10 kg Standard",
    wheelCtaPrm: "Ir a 10 kg Premium",

    seoCtaTitle: "¿Buscas una Mystery Box?",
    seoCtaText:
      "Lee nuestra guía completa: qué es una mystery box, cómo funciona, qué esperar y cómo elegir entre Standard y Premium.",
    seoCtaPrimary: "Abrir la página Mystery Box",
    seoCtaSecondary: "Cómo funciona",
    seoCtaTertiary: "FAQ",
  },

  fr: {
    heroTitleHighlight: "Pèse le mystère",
    heroTitleRest: "et déballe la surprise",
    heroSubtitle1:
      "Standard ou Premium, de 1 à 10 kg : tu choisis l’intensité de ton unboxing. Chaque box est sélectionnée, scellée et liée à un lot réel.",
    heroSubtitle2:
      "Nous ne vendons pas une “valeur garantie”, mais une expérience de surprise qui donne une seconde vie à des colis existants et réduit les déchets et le CO₂.",

    trustShippingTitle: "Livraison",
    trustShippingText:
      "Livraison dans toute l’Europe avec suivi. Délais moyens 48–72h. Livraison gratuite dès 100€ d’achat.",
    trustPaymentsTitle: "Paiements sécurisés",
    trustPaymentsText:
      "Paiements gérés via des prestataires de confiance, avec récapitulatif complet envoyé par email.",
    trustSupportTitle: "Support",
    trustSupportText:
      "Support direct par email : aucun call center anonyme.",

    standardDescription:
      "Idéal pour découvrir KiloMystery avec un mix équilibré.",
    premiumDescription:
      "Pour ceux qui veulent un mix plus recherché : lots sélectionnés et plus grande chance d’articles de gamme moyenne–haute.",

    returnTitle: "Politique de retours",
    returnText:
      "Les box sont vendues scellées : aucun retour n’est accepté pour simple insatisfaction. L’étiquette inclut poids, lot et traçabilité pour une transparence totale.",
    returnCta: "Lire la politique complète",

    badgeStd: "Parfait pour commencer",
    badgePrm: "Pour ceux qui en veulent plus",

    bullets1: "Contenu mixte issu de lots réels.",
    bullets2: "Poids net avec une tolérance de ±3%.",
    bullets3: "Scellé avec ID de lot et date.",
    bullets4: "Aucun produit illégal ou interdit.",

    addToCart: "Ajouter au panier",

    explorerTitle: "Explorer Box 15 kg + 1 kg offert",
    explorerSubtitle:
      "Bundle spécial mêlant Standard et Premium : 16 kg au total pour un unboxing long et intense.",
    explorerBadge: "Meilleur deal",
    explorerCta: "Ajouter l’Explorer Box",

    wheelTitle: "Roue mystère",
    wheelText:
      "Avec une commande d’au moins 10 kg, tu gagnes 1 tirage automatique en arrivant au panier. Jusqu’à +2 kg bonus ajoutés comme poids supplémentaire à ta commande.",
    wheelCtaStd: "Aller aux 10 kg Standard",
    wheelCtaPrm: "Aller aux 10 kg Premium",

    seoCtaTitle: "Tu cherches une Mystery Box ?",
    seoCtaText:
      "Découvre notre guide complet : définition, fonctionnement, attentes réalistes, et comment choisir Standard vs Premium.",
    seoCtaPrimary: "Ouvrir la page Mystery Box",
    seoCtaSecondary: "Comment ça marche",
    seoCtaTertiary: "FAQ",
  },

  de: {
    heroTitleHighlight: "Wiege das Geheimnis",
    heroTitleRest: "und pack die Überraschung aus",
    heroSubtitle1:
      "Standard oder Premium, von 1 bis 10 kg: Du entscheidest, wie intensiv dein Unboxing wird. Jede Box wird ausgewählt, versiegelt und einem echten Posten zugeordnet.",
    heroSubtitle2:
      "Wir verkaufen keinen „garantierten Wert“, sondern ein Überraschungserlebnis, das bestehenden Paketen ein zweites Leben gibt und Abfall sowie CO₂ reduziert.",

    trustShippingTitle: "Versand",
    trustShippingText:
      "Versand in ganz Europa mit Sendungsverfolgung. Durchschnittliche Lieferzeit 48–72h. Kostenloser Versand ab 100€ Bestellwert.",
    trustPaymentsTitle: "Sichere Zahlungen",
    trustPaymentsText:
      "Zahlungen über vertrauenswürdige Anbieter, mit vollständiger Bestellübersicht per E-Mail.",
    trustSupportTitle: "Support",
    trustSupportText:
      "Direkter Support per E-Mail – kein anonymes Callcenter.",

    standardDescription: "Ideal, um KiloMystery zum ersten Mal zu testen.",
    premiumDescription:
      "Für alle, die mehr wollen: ausgewählte Posten und höhere Chance auf hochwertige Artikel.",

    returnTitle: "Rückgabebedingungen",
    returnText:
      "Mystery Boxen sind versiegelt: Rückgaben bei Nichtgefallen sind ausgeschlossen. Das Etikett enthält Gewicht, Posten und Nachverfolgbarkeit.",
    returnCta: "Vollständige Richtlinien lesen",

    badgeStd: "Perfekt zum Start",
    badgePrm: "Für alle, die mehr wollen",

    bullets1: "Gemischter Inhalt aus echten Posten.",
    bullets2: "Nettogewicht mit ±3% Toleranz.",
    bullets3: "Siegel mit Posten-ID und Datum.",
    bullets4: "Keine illegalen oder verbotenen Produkte.",

    addToCart: "In den Warenkorb",

    explorerTitle: "Explorer Box 15 kg + 1 kg gratis",
    explorerSubtitle:
      "Spezielles Bundle mit Standard- und Premium-Mix: 16 kg insgesamt für ein langes, intensives Unboxing.",
    explorerBadge: "Bestes Angebot",
    explorerCta: "Explorer Box hinzufügen",

    wheelTitle: "Glücksrad",
    wheelText:
      "Mit einer Bestellung von mindestens 10 kg bekommst du 1 Dreh automatisch im Warenkorb. Gewinne bis zu +2 kg Bonus, die wir als zusätzliches Gewicht zu deiner Bestellung packen.",
    wheelCtaStd: "Zu 10 kg Standard",
    wheelCtaPrm: "Zu 10 kg Premium",

    seoCtaTitle: "Suchst du eine Mystery Box?",
    seoCtaText:
      "Lies unseren Guide: Was ist eine Mystery Box, wie funktioniert’s, was ist realistisch zu erwarten und wie du Standard vs Premium wählst.",
    seoCtaPrimary: "Zur Mystery-Box-Seite",
    seoCtaSecondary: "So funktioniert’s",
    seoCtaTertiary: "FAQ",
  },
};

// CO₂ text per kg e per lingua
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

function safeError(label: string, err: unknown) {
  const msg =
    err instanceof Error
      ? err.message
      : (() => {
          try {
            return typeof err === "string" ? err : JSON.stringify(err);
          } catch {
            return String(err);
          }
        })();
  console.error(`${label}: ${msg}`);
}

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

function PackCard({
  kind,
  kg,
  video,
  poster,
  lang,
  t,
}: {
  kind: "Standard" | "Premium";
  kg: Kg;
  video: string;
  poster: string;
  lang: Lang;
  t: CopyPerLang;
}) {
  const { addItem } = useCart();

  const { total, compareTotal, ppk } = prices(kind, kg);
  const isStd = kind === "Standard";
  const anchorId = kg === 10 ? `buy-${kind.toLowerCase()}-10` : undefined;
  const variantId = VARIANT_IDS[kind][kg];

  // ✅ TikTok ViewContent (solo quando la card entra in viewport, anti-spam)
  const viewTrackedRef = useRef(false);
  useEffect(() => {
    if (viewTrackedRef.current) return;
    if (typeof window === "undefined") return;

    const el = document.getElementById(`${kind}-${kg}-card`);
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        viewTrackedRef.current = true;

        if (window.__tiktokConsentGranted && window.ttq) {
          window.ttq.track("ViewContent", {
            contents: [
              {
                content_id: variantId,
                content_type: "product",
                content_name: `${kind} · ${kg} kg`,
              },
            ],
            value: Number(total),
            currency: "EUR",
          });
        }

        obs.disconnect();
      },
      { threshold: 0.6 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [kind, kg, variantId, total]);

  function handleAddToCart() {
    const cartItem = {
      id: `${kind}-${kg}`,
      shopifyId: variantId,
      title: `${kind} · ${kg} kg`,
      tier: kind, // ✅ Standard/Premium coerente
      weightKg: kg,
      pricePerKg: +(total / kg).toFixed(2),
      qty: 1,
      image: video,
    };

    addItem(cartItem as any);
    gaAddToCart(cartItem as any, 1);

    // ✅ TikTok AddToCart (solo se consenso)
    if (window.__tiktokConsentGranted && window.ttq) {
      window.ttq.track("AddToCart", {
        contents: [
          {
            content_id: variantId,
            content_type: "product",
            content_name: cartItem.title,
            price: Number(total),
            num_items: 1,
          },
        ],
        value: Number(total),
        currency: "EUR",
      });
    }

    // ✅ Meta AddToCart (solo se consenso)
    if (window.__metaConsentGranted && window.fbq) {
      window.fbq("track", "AddToCart", {
        content_ids: [String(variantId)],
        content_type: "product",
        content_name: cartItem.title,
        value: Number(total),
        currency: "EUR",
      });
    }
  }

  const badgeTextTop = kind === "Standard" ? t.badgeStd : t.badgePrm;
  const co2Text = co2ByKg[kg][lang] ?? co2ByKg[kg].it ?? "";

  return (
    <article
      id={`${kind}-${kg}-card`}
      className={`card ${isStd ? "card--standard" : "card--premium"}`}
      data-anchor={anchorId}
    >
      {/* mantengo l'anchor originale per scroll-to */}
      {anchorId ? <div id={anchorId} /> : null}

      <div className="flex items-center justify-between mb-2 text-[0.7rem] uppercase tracking-[.15em] text-white/60">
        <span>{badgeTextTop}</span>
        <span className={`pill ${isStd ? "pill--std" : "pill--prm"}`}>
          {kg} kg · {isStd ? "Standard" : "Premium"}
        </span>
      </div>

      <div className={`media-wrap ${isStd ? "media-wrap--std" : "media-wrap--prm"}`}>
        <div className="ratio-16-9">
          <LazyHoverVideo
            className="media rounded-[12px] object-cover"
            src={video}
            poster={poster}
            preload="none"
          />
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h4 className="product-title text-xl">
          {kind} <span className="dot" /> {kg} kg
        </h4>

        <div className="text-right space-y-1">
          <div className="text-sm line-through text-white/45">{euro(compareTotal)}</div>

          <div
            className={`price-figure ${isStd ? "price-figure--std" : "price-figure--prm"} text-3xl`}
          >
            {euro(total)}
          </div>

          <div className="price-perkg">({ppk.toFixed(2)} €/kg)</div>

          {co2Text && (
            <div className="text-[0.7rem] text-emerald-200/90">♻ {co2Text}</div>
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

function ExplorerCard({ lang, t }: { lang: Lang; t: CopyPerLang }) {
  const { addItem } = useCart();

  function handleAdd() {
    const cartItem = {
      id: "Explorer-16",
      shopifyId: EXPLORER_SHOPIFY_ID,
      title: t.explorerTitle,
      tier: "Premium",
      weightKg: EXPLORER_TOTAL_KG,
      pricePerKg: EXPLORER_PRICE_PER_KG,
      qty: 1,
      image: "/videos/packs/ExplorerBox.mp4",
    };

    addItem(cartItem as any);
    gaAddToCart(cartItem as any, 1);

    // ✅ TikTok AddToCart (solo se consenso)
    if (window.__tiktokConsentGranted && window.ttq) {
      window.ttq.track("AddToCart", {
        contents: [
          {
            content_id: EXPLORER_SHOPIFY_ID,
            content_type: "product",
            content_name: t.explorerTitle,
            price: Number(EXPLORER_PRICE_TOTAL),
            num_items: 1,
          },
        ],
        value: Number(EXPLORER_PRICE_TOTAL),
        currency: "EUR",
      });
    }

    // ✅ Meta AddToCart (solo se consenso)
    if (window.__metaConsentGranted && window.fbq) {
      window.fbq("track", "AddToCart", {
        content_ids: [String(EXPLORER_SHOPIFY_ID)],
        content_type: "product",
        content_name: t.explorerTitle,
        value: Number(EXPLORER_PRICE_TOTAL),
        currency: "EUR",
      });
    }
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

      <p className="text-sm md:text-base text-white/75 max-w-2xl">{t.explorerSubtitle}</p>

      <div className="grid md:grid-cols-[1.4fr,1fr] gap-4 items-stretch">
        <div className="card relative overflow-hidden bg-gradient-to-br from-[#7A20FF]/40 via-[#111827] to-[#20D27A]/30">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),transparent_55%)]" />
          <div className="relative flex flex-col md:flex-row gap-4 items-center md:items-stretch">
            <div className="w-full md:w-1/2">
              <div className="relative aspect-video rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
                <LazyHoverVideo
                  src="/videos/packs/ExplorerBox.mp4"
                  poster="/videos/packs/ExplorerBox.jpg"
                  className="w-full h-full object-cover"
                  preload="none"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-white/80 flex items-center justify-between">
                  <span className="tracking-[.18em] uppercase text-emerald-200/90">
                    Explorer
                  </span>
                  <span className="text-[0.7rem]">15 kg + 1 kg 🎁</span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 p-2 md:p-0">
              <ul className="text-sm text-white/80 space-y-1">
                <li>
                  {lang === "it"
                    ? "• Mix di lotti Standard e Premium"
                    : lang === "en"
                    ? "• Mix of Standard and Premium lots"
                    : lang === "es"
                    ? "• Mix de lotes Standard y Premium"
                    : lang === "fr"
                    ? "• Mix de lots Standard et Premium"
                    : "• Mix aus Standard- und Premium-Posten"}
                </li>
                <li>
                  {lang === "it"
                    ? "• Pensata per un unboxing lungo e condiviso"
                    : lang === "en"
                    ? "• Designed for a long, shared unboxing"
                    : lang === "es"
                    ? "• Pensada para un unboxing largo y compartido"
                    : lang === "fr"
                    ? "• Pensée pour un unboxing long et partagé"
                    : "• Für ein langes, gemeinsames Unboxing gedacht"}
                </li>
                <li>
                  {lang === "it"
                    ? "• Ideale per regali o sessioni in gruppo"
                    : lang === "en"
                    ? "• Perfect for gifts or group sessions"
                    : lang === "es"
                    ? "• Ideal para regalos o sesiones en grupo"
                    : lang === "fr"
                    ? "• Idéale pour des cadeaux ou des sessions en groupe"
                    : "• Ideal für Geschenke oder Gruppen-Sessions"}
                </li>
              </ul>

              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[.16em] text-white/60">
                    {lang === "it"
                      ? "Totale bundle"
                      : lang === "en"
                      ? "Bundle total"
                      : lang === "es"
                      ? "Total del bundle"
                      : lang === "fr"
                      ? "Total du bundle"
                      : "Bundle-Gesamtpreis"}
                  </div>

                  <div className="text-sm line-through text-white/45">
                    {euro(EXPLORER_COMPARE_TOTAL)}
                  </div>

                  <div className="text-3xl font-extrabold">{euro(EXPLORER_PRICE_TOTAL)}</div>

                  <div className="text-xs text-white/60">
                    ≈ {EXPLORER_PRICE_PER_KG.toFixed(2)} €/kg{" "}
                    <span className="line-through ml-1 text-white/45">
                      {EXPLORER_COMPARE_PER_KG.toFixed(2)} €/kg
                    </span>
                  </div>
                </div>

                <button type="button" onClick={handleAdd} className="btn btn-brand px-6 py-3">
                  {t.explorerCta}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card text-xs text-white/70 space-y-2">
          <p>
            💡
            {lang === "it"
              ? " L’Explorer Box è pensata come bundle speciale: non puoi modificarne il peso o il mix, ma ottieni più kg a un prezzo medio più conveniente."
              : lang === "en"
              ? " The Explorer Box is a special bundle: weight and mix are fixed, but you get more kilos at a better average rate."
              : lang === "es"
              ? " La Explorer Box es un bundle especial: no puedes cambiar peso o mix, pero obtienes más kilos a un precio medio mejor."
              : lang === "fr"
              ? " L’Explorer Box est un bundle spécial : poids et mix sont fixes, mais tu profites de plus de kilos à un tarif moyen plus avantageux."
              : " Die Explorer Box ist ein spezielles Bundle: Gewicht und Mix sind fix, dafür bekommst du mehr Kilos zu einem besseren Durchschnittspreis."}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function ProductsPage({ params }: { params: { lang: string } }) {
  const lang: Lang = normalizeLang(params?.lang);
  const t = PRODUCTS_COPY[lang] ?? PRODUCTS_COPY.it;
  const animRef = useRef<HTMLDivElement>(null);

  // ✅ GA4: view_item_list una volta (anti doppioni)
  const listTrackedRef = useRef<string>("");

  useEffect(() => {
    const key = `products-page:${lang}`;
    if (listTrackedRef.current === key) return;
    listTrackedRef.current = key;

    const items: any[] = [];

    (["Standard", "Premium"] as const).forEach((kind) => {
      ([1, 2, 3, 5, 10] as const).forEach((kg) => {
        const variantId = VARIANT_IDS[kind][kg];
        const { total } = prices(kind, kg);

        items.push({
          id: `${kind}-${kg}`,
          shopifyId: variantId,
          title: `${kind} · ${kg} kg`,
          tier: kind,
          weightKg: kg,
          pricePerKg: +(total / kg).toFixed(2),
          qty: 1,
        });
      });
    });

    items.push({
      id: "Explorer-16",
      shopifyId: EXPLORER_SHOPIFY_ID,
      title: t.explorerTitle,
      tier: "Premium",
      weightKg: EXPLORER_TOTAL_KG,
      pricePerKg: EXPLORER_PRICE_PER_KG,
      qty: 1,
    });

    gaViewItemList("Products", items);
  }, [lang, t]);

  useEffect(() => {
    let destroyed = false;
    let anim: import("lottie-web").AnimationItem | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    timer = setTimeout(() => {
      (async () => {
        try {
          const { default: lottie } = await import("lottie-web");

          const res = await fetch("/lottie/products-animation.json", {
            cache: "force-cache",
          });
          if (!res.ok) {
            safeError("Lottie load error", `HTTP ${res.status}`);
            return;
          }
          const data = await res.json();

          if (!destroyed && animRef.current) {
            anim = lottie.loadAnimation({
              container: animRef.current,
              renderer: "svg",
              loop: true,
              autoplay: true,
              animationData: data,
            });
            (animRef.current.style as any).willChange = "transform";
          }
        } catch (e) {
          safeError("Lottie load error", e);
        }
      })();
    }, 2000);

    return () => {
      destroyed = true;
      if (timer) clearTimeout(timer);
      try {
        anim?.destroy();
      } catch {}
    };
  }, []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";

  const productJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name:
        lang === "it"
          ? "Mystery box al kg KiloMystery"
          : lang === "en"
          ? "KiloMystery mystery boxes by the kilo"
          : lang === "es"
          ? "Mystery box al kilo KiloMystery"
          : lang === "fr"
          ? "Mystery box au kilo KiloMystery"
          : "Mystery Box zum Kilo-Preis KiloMystery",
      brand: { "@type": "Brand", name: "KiloMystery" },
      url: `${siteUrl}/${lang}/products`,
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "EUR",
        lowPrice: "20.15",
        highPrice: "26.90",
        availability: "https://schema.org/InStock",
      },
    }),
    [lang, siteUrl]
  );

  const webPageJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name:
        lang === "it"
          ? "Mystery Box e Mystery Box al Kg | KiloMystery"
          : lang === "en"
          ? "Mystery Boxes & Mystery Boxes by the Kilo | KiloMystery"
          : lang === "es"
          ? "Mystery Boxes y Mystery Box por Kilo | KiloMystery"
          : lang === "fr"
          ? "Mystery Boxes et Mystery Box au Kilo | KiloMystery"
          : "Mystery Boxen & Mystery Box pro Kilo | KiloMystery",
      url: `${siteUrl}/${lang}/products`,
      isPartOf: { "@type": "WebSite", name: "KiloMystery", url: siteUrl },
    }),
    [lang, siteUrl]
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <Header lang={lang} />

      <main className="container py-10 mb-16 space-y-10">
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="mx-auto w-[160px] md:w-[220px] relative aspect-[3/1]">
            <Image src="/logo.svg" alt="KiloMystery" fill className="object-contain" priority />
          </div>

          <div ref={animRef} className="mx-auto w-[280px] md:w-[360px] h-[220px] md:h-[260px]" />

          <header className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
                {t.heroTitleHighlight}
              </span>{" "}
              <span className="brand-text">{t.heroTitleRest}</span>
            </h1>
            <p className="text-white/70">{t.heroSubtitle1}</p>
            <p className="text-white/70">{t.heroSubtitle2}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <a href={`/${lang}/mystery-box`} className="btn btn-brand px-5 py-2">
                {t.seoCtaPrimary}
              </a>
              <a href={`/${lang}/how-it-works`} className="btn btn-ghost px-5 py-2">
                {t.seoCtaSecondary}
              </a>
              <a href={`/${lang}/faq`} className="btn btn-ghost px-5 py-2">
                {t.seoCtaTertiary}
              </a>
            </div>
          </header>
        </section>

        <section className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="card p-3 space-y-1">
            <p className="text-xs uppercase tracking-[.16em] text-emerald-300/80">
              🚚 {t.trustShippingTitle}
            </p>
            <p className="text-white/80">{t.trustShippingText}</p>
          </div>
          <div className="card p-3 space-y-1">
            <p className="text-xs uppercase tracking-[.16em] text-emerald-300/80">
              💳 {t.trustPaymentsTitle}
            </p>
            <p className="text-white/80">{t.trustPaymentsText}</p>
          </div>
          <div className="card p-3 space-y-1">
            <p className="text-xs uppercase tracking-[.16em] text-emerald-300/80">
              🤝 {t.trustSupportTitle}
            </p>
            <p className="text-white/80">{t.trustSupportText}</p>
          </div>
        </section>

        <section className="card p-5 md:p-6 bg-gradient-to-br from-white/[0.04] via-[#111827]/60 to-white/[0.06]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-extrabold">{t.seoCtaTitle}</h2>
              <p className="text-white/70 text-sm md:text-base max-w-2xl">{t.seoCtaText}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`/${lang}/mystery-box`} className="btn btn-brand px-5 py-2">
                {t.seoCtaPrimary}
              </a>
              <a href={`/${lang}/how-it-works`} className="btn btn-ghost px-5 py-2">
                {t.seoCtaSecondary}
              </a>
            </div>
          </div>
        </section>

        {/* ✅ WHEEL: usa PNG fisso in public/wheel/wheel.png */}
        <section className="card flex flex-col md:flex-row items-center gap-5">
          <div className="shrink-0 rounded-xl overflow-hidden border border-white/15 bg-white/10">
            <Image
              src="/wheel/wheel.png"
              alt={t.wheelTitle}
              width={500}
              height={250}
              loading="lazy"
              sizes="(min-width: 768px) 500px, 100vw"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-extrabold">{t.wheelTitle}</h3>
            <p className="text-white/70 text-sm md:text-base">{t.wheelText}</p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <a href="#buy-standard-10" className="btn btn-silver">
              {t.wheelCtaStd}
            </a>
            <a href="#buy-premium-10" className="btn btn-gold">
              {t.wheelCtaPrm}
            </a>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-extrabold text-silver-soft">Standard</h2>
            <p className="text-xs text-white/60 max-w-md">{t.standardDescription}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 5, 10].map((kg) => (
              <PackCard
                key={`std-${kg}`}
                kind="Standard"
                kg={kg as Kg}
                video={stdV(kg as Kg)}
                poster={stdJ(kg as Kg)}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-extrabold text-gold-soft">Premium</h2>
            <p className="text-xs text-white/60 max-w-md">{t.premiumDescription}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 5, 10].map((kg) => (
              <PackCard
                key={`prm-${kg}`}
                kind="Premium"
                kg={kg as Kg}
                video={prmV(kg as Kg)}
                poster={prmJ(kg as Kg)}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        </section>

        <ExplorerCard lang={lang} t={t} />

        <SectionInsideBox lang={lang} />

        <section id="policy" className="card">
          <h3 className="text-xl font-extrabold mb-2">{t.returnTitle}</h3>
          <p className="text-white/70 text-sm md:text-base">{t.returnText}</p>
          <a href={`/${lang}/policy/returns`} className="btn btn-ghost mt-3 inline-flex">
            {t.returnCta}
          </a>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
