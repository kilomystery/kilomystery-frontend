// app/[lang]/pacchi-smarriti-amazon/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductsTabs from "../../components/ProductsTabs";

type Lang = "it" | "en" | "es" | "fr" | "de";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";

function normLang(l: string): Lang {
  const x = String(l || "it").toLowerCase();
  if (x === "en" || x === "es" || x === "fr" || x === "de") return x;
  return "it";
}

type FAQ = { q: string; a: string };

/* =========================
   SEO DATA (server-side)
========================= */
const CURRENCY = "EUR";
const WEIGHTS = [1, 2, 3, 5, 10] as const;
type Kg = (typeof WEIGHTS)[number];

const PRICE_TABLE: Record<"std" | "prm", Record<Kg, { total: number; compareAt: number }>> = {
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

function perKg(total: number, kg: number) {
  return Math.round((total / kg) * 100) / 100;
}

function webPageJsonLd(args: { siteUrl: string; lang: Lang; title: string; description: string }) {
  const { siteUrl, lang, title, description } = args;
  const url = `${siteUrl}/${lang}/pacchi-smarriti-amazon`;

  const aboutByLang: Record<Lang, string[]> = {
    it: [
      "pacchi smarriti amazon",
      "resi amazon non ritirati",
      "pacchi non consegnati",
      "vendita pacchi smarriti",
      "mystery box al kg",
    ],
    en: [
      "amazon lost parcels",
      "unclaimed amazon returns",
      "undelivered parcels",
      "lost parcels for sale",
      "mystery boxes by the kilo",
    ],
    es: [
      "paquetes perdidos amazon",
      "devoluciones amazon no reclamadas",
      "paquetes no entregados",
      "venta de paquetes perdidos",
      "mystery box por kilo",
    ],
    fr: [
      "colis perdus amazon",
      "retours amazon non réclamés",
      "colis non livrés",
      "vente de colis perdus",
      "mystery box au kilo",
    ],
    de: [
      "amazon verlorene pakete",
      "nicht abgeholte amazon rücksendungen",
      "nicht zugestellte pakete",
      "verlorene pakete kaufen",
      "mystery box pro kilo",
    ],
  };

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    inLanguage: lang,
    isPartOf: {
      "@type": "WebSite",
      name: "KiloMystery",
      url: siteUrl,
    },
    about: aboutByLang[lang].map((name) => ({ "@type": "Thing", name })),
  };
}

function productJsonLd(args: { siteUrl: string; lang: Lang; tier: "Standard" | "Premium" }) {
  const { siteUrl, lang, tier } = args;

  const tab = tier === "Standard" ? "std" : "prm";
  const pageUrl = `${siteUrl}/${lang}/pacchi-smarriti-amazon`;

  // ✅ Offer URL: punta al posto con maggiore intent (10kg) nella pagina /products
  const tierAnchor =
    tier === "Standard"
      ? `${siteUrl}/${lang}/products#buy-standard-10`
      : `${siteUrl}/${lang}/products#buy-premium-10`;

  const offers = WEIGHTS.map((kg) => {
    const p = PRICE_TABLE[tab][kg];
    return {
      "@type": "Offer",
      url: tierAnchor, // ✅ conversione: deep link diretto alla sezione acquisto
      priceCurrency: CURRENCY,
      price: p.total,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      eligibleQuantity: { "@type": "QuantitativeValue", value: kg, unitText: "kg" },
      priceSpecification: [
        {
          "@type": "UnitPriceSpecification",
          priceCurrency: CURRENCY,
          price: p.total,
          unitText: `${kg} kg`,
        },
        {
          "@type": "UnitPriceSpecification",
          priceCurrency: CURRENCY,
          price: perKg(p.total, kg),
          referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "kg" },
          unitText: "per kg",
        },
      ],
    };
  });

  const lowPrice = Math.min(...WEIGHTS.map((kg) => PRICE_TABLE[tab][kg].total));
  const highPrice = Math.max(...WEIGHTS.map((kg) => PRICE_TABLE[tab][kg].total));

  const descByLang: Record<Lang, Record<"Standard" | "Premium", string>> = {
    it: {
      Standard:
        "Pacchi smarriti (stile Amazon) in formato Standard: contenuto variabile a sorpresa, box sigillata con ID lotto e data, peso 1–10 kg.",
      Premium:
        "Pacchi smarriti (stile Amazon) in formato Premium: contenuto variabile a sorpresa, box sigillata con ID lotto e data, peso 1–10 kg.",
    },
    en: {
      Standard:
        "Amazon-style lost parcels in Standard tier: variable surprise contents, sealed box with batch ID and date, 1–10 kg formats.",
      Premium:
        "Amazon-style lost parcels in Premium tier: variable surprise contents, sealed box with batch ID and date, 1–10 kg formats.",
    },
    es: {
      Standard:
        "Paquetes perdidos (estilo Amazon) en formato Standard: contenido sorpresa variable, caja precintada con ID de lote y fecha, 1–10 kg.",
      Premium:
        "Paquetes perdidos (estilo Amazon) en formato Premium: contenido sorpresa variable, caja precintada con ID de lote y fecha, 1–10 kg.",
    },
    fr: {
      Standard:
        "Colis perdus (style Amazon) Standard : contenu surprise variable, box scellée avec ID de lot et date, formats 1–10 kg.",
      Premium:
        "Colis perdus (style Amazon) Premium : contenu surprise variable, box scellée avec ID de lot et date, formats 1–10 kg.",
    },
    de: {
      Standard:
        "Amazon-ähnliche verlorene Pakete (Standard): variabler Überraschungsinhalt, versiegelte Box mit Posten-ID und Datum, 1–10 kg.",
      Premium:
        "Amazon-ähnliche verlorene Pakete (Premium): variabler Überraschungsinhalt, versiegelte Box mit Posten-ID und Datum, 1–10 kg.",
    },
  };

  const nameByLang: Record<Lang, Record<"Standard" | "Premium", string>> = {
    it: {
      Standard: "KiloMystery Standard · Pacchi Smarriti Amazon (1–10 kg)",
      Premium: "KiloMystery Premium · Pacchi Smarriti Amazon (1–10 kg)",
    },
    en: {
      Standard: "KiloMystery Standard · Amazon Lost Parcels (1–10 kg)",
      Premium: "KiloMystery Premium · Amazon Lost Parcels (1–10 kg)",
    },
    es: {
      Standard: "KiloMystery Standard · Paquetes Perdidos Amazon (1–10 kg)",
      Premium: "KiloMystery Premium · Paquetes Perdidos Amazon (1–10 kg)",
    },
    fr: {
      Standard: "KiloMystery Standard · Colis Perdus Amazon (1–10 kg)",
      Premium: "KiloMystery Premium · Colis Perdus Amazon (1–10 kg)",
    },
    de: {
      Standard: "KiloMystery Standard · Amazon Verlorene Pakete (1–10 kg)",
      Premium: "KiloMystery Premium · Amazon Verlorene Pakete (1–10 kg)",
    },
  };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: nameByLang[lang][tier],
    description: descByLang[lang][tier],
    brand: { "@type": "Brand", name: "KiloMystery" },
    url: pageUrl,
    offers: {
      "@type": "AggregateOffer",
      url: tierAnchor, // ✅ deep link forte
      priceCurrency: CURRENCY,
      lowPrice,
      highPrice,
      offerCount: WEIGHTS.length,
      offers,
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Tier", value: tier },
      { "@type": "PropertyValue", name: "Weight options", value: "1, 2, 3, 5, 10 kg" },
      { "@type": "PropertyValue", name: "Format", value: "Surprise / variable contents" },
      { "@type": "PropertyValue", name: "Net weight tolerance", value: "±3%" },
      { "@type": "PropertyValue", name: "Batch seal", value: "Batch ID + date" },
    ],
  };
}

function itemListJsonLd(args: { siteUrl: string; lang: Lang }) {
  const { siteUrl, lang } = args;
  const pageUrl = `${siteUrl}/${lang}/pacchi-smarriti-amazon`;

  const listNameByLang: Record<Lang, string> = {
    it: "KiloMystery — Pacchi Smarriti Amazon (Standard & Premium) — formati e prezzi",
    en: "KiloMystery — Amazon Lost Parcels (Standard & Premium) — formats and pricing",
    es: "KiloMystery — Paquetes Perdidos Amazon (Standard & Premium) — formatos y precios",
    fr: "KiloMystery — Colis Perdus Amazon (Standard & Premium) — formats et prix",
    de: "KiloMystery — Amazon Verlorene Pakete (Standard & Premium) — Formate und Preise",
  };

  const items: any[] = [];
  let pos = 1;

  for (const tier of ["Standard", "Premium"] as const) {
    const tab = tier === "Standard" ? "std" : "prm";
    for (const kg of WEIGHTS) {
      const total = PRICE_TABLE[tab][kg].total;
      items.push({
        "@type": "ListItem",
        position: pos++,
        url: pageUrl,
        name: `${tier} · ${kg} kg`,
        item: {
          "@type": "Product",
          name: `${tier} · ${kg} kg`,
          brand: { "@type": "Brand", name: "KiloMystery" },
          offers: {
            "@type": "Offer",
            url: `${siteUrl}/${lang}/products`, // stabile
            priceCurrency: CURRENCY,
            price: total,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            eligibleQuantity: { "@type": "QuantitativeValue", value: kg, unitText: "kg" },
          },
        },
      });
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listNameByLang[lang],
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: items.length,
    itemListElement: items,
  };
}

/* =========================
   COPY (5 languages)
========================= */
const COPY: Record<
  Lang,
  {
    title: string;
    description: string;

    h1: string;
    intro: string;

    disclaimer: string;

    venditaTitle: string;
    venditaIntro: string;
    venditaBullets: string[];

    howTitle: string;
    howBody: string;

    resiTitle: string;
    resiBody: string;

    legalTitle: string;
    legalBody: string;

    shopTitle: string;
    shopIntro: string;

    linksTitle: string;
    linksBody: string;
    links: { href: string; label: string }[];

    faqTitle: string;
    faqIntro: string;
    faqs: FAQ[];

    finalTitle: string;
    finalBody: string;
    finalPrimary: string;
    finalSecondary: string;
  }
> = {
  it: {
    title: "Pacchi smarriti Amazon: resi non ritirati e acquisto online | KiloMystery",
    description:
      "Cerchi pacchi smarriti Amazon o resi Amazon non ritirati? Scopri come funziona il mercato dei lotti e acquista box sorpresa Standard/Premium da 1 a 10 kg.",
    h1: "Pacchi smarriti Amazon: cosa sono e come comprarli online",
    intro:
      "Molte persone cercano “pacchi smarriti Amazon” o “resi Amazon non ritirati” per capire dove finiscono i colli non consegnati o non reclamati. Qui trovi una spiegazione completa e un modo semplice per acquistare box sorpresa al kg (Standard o Premium).",
    disclaimer:
      "Nota: questa pagina è informativa. KiloMystery non è affiliata ad Amazon. Parliamo di “stile Amazon” come intenzione di ricerca (resi, giacenze, lotti logistici).",

    venditaTitle: "Vendita pacchi smarriti Amazon: formati e prezzi",
    venditaIntro:
      "Su KiloMystery acquisti box sorpresa al kg (1–10 kg) in due livelli: Standard e Premium. Il contenuto è variabile: la trasparenza è nel processo (peso, sigillo, lotto), non nelle promesse.",
    venditaBullets: [
      "Standard/Premium: due livelli di selezione, stesso formato sorpresa.",
      "Formati 1, 2, 3, 5, 10 kg con prezzi chiari (€/kg).",
      "Peso netto con tolleranza ±3% e sigillo con ID lotto e data.",
      "Spedizione e tracking secondo policy (quando disponibili).",
    ],

    howTitle: "Perché esistono pacchi “persi” e resi non ritirati",
    howBody:
      "Nel commercio online e nella logistica su larga scala, una parte di spedizioni non viene consegnata o non viene ritirata. Indirizzi errati, etichette rovinate, giacenze non reclamate e resi: tutto questo genera stock che spesso viene liquidato in lotti.",
    resiTitle: "Resi Amazon non ritirati: cosa significa",
    resiBody:
      "Quando un pacco va in giacenza e non viene ritirato, può tornare al mittente. Se anche il rientro fallisce (o il contenuto non è più gestibile come flusso standard), può finire in stock di liquidazione insieme ad altre unità.",
    legalTitle: "È legale comprare pacchi smarriti?",
    legalBody:
      "Sì, quando provengono da canali di liquidazione e non sono più reclamabili come consegne standard. Evita venditori con promesse “valore garantito”: in questi stock conta la variabilità.",

    shopTitle: "Acquista ora (box sorpresa al kg)",
    shopIntro:
      "Scegli Standard o Premium e seleziona il peso. Qui sotto trovi i prodotti disponibili direttamente in pagina.",
    linksTitle: "Link interni utili",
    linksBody:
      "Per approfondire e rafforzare la fiducia (spedizioni, resi, guida), usa questi link:",
    links: [
      { href: "/products", label: "Prodotti" },
      { href: "/pacchi-smarriti", label: "Pacchi Smarriti (guida generale)" },
      { href: "/mystery-box", label: "Guida Mystery Box" },
      { href: "/how-it-works", label: "Come funziona" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Spedizioni" },
      { href: "/policy/returns", label: "Resi" },
      { href: "/about", label: "Chi siamo" },
      { href: "/contact", label: "Contatti" },
      { href: "/blog", label: "Blog" },
    ],

    faqTitle: "FAQ – Pacchi smarriti Amazon & resi non ritirati",
    faqIntro: "Risposte rapide alle domande più comuni.",
    faqs: [
      {
        q: "KiloMystery vende pacchi Amazon originali?",
        a: "No. KiloMystery non è affiliata ad Amazon. La pagina risponde a un intento di ricerca: pacchi smarriti/resi non ritirati e lotti logistici. Le box sono in formato sorpresa al kg.",
      },
      {
        q: "Cosa sono i “resi non ritirati”?",
        a: "Sono spedizioni o resi che restano in giacenza e non vengono reclamati entro i tempi, oppure che non rientrano correttamente al mittente e finiscono in stock di gestione.",
      },
      {
        q: "Cosa posso trovare dentro?",
        a: "Contenuto variabile: elettronica, accessori, abbigliamento, casa e altro. Non esiste una lista garantita: la variabilità è parte del formato.",
      },
      {
        q: "Posso fare reso?",
        a: "Di norma no, perché è un formato sorpresa/variabile. Consulta la policy resi per i dettagli.",
      },
      {
        q: "C’è tracking?",
        a: "Quando disponibile sì. I dettagli completi sono nella pagina Spedizioni.",
      },
    ],

    finalTitle: "Vuoi acquistare pacchi smarriti (stile Amazon)?",
    finalBody:
      "Se cercavi pacchi smarriti Amazon o resi non ritirati, qui trovi una guida chiara e la possibilità di acquistare box sorpresa al kg.",
    finalPrimary: "Vai ai prodotti",
    finalSecondary: "Contattaci",
  },

  en: {
    title: "Amazon lost parcels: unclaimed returns & buying online | KiloMystery",
    description:
      "Looking for Amazon lost parcels or unclaimed Amazon returns? Learn how liquidation lots work and shop surprise boxes (Standard/Premium) from 1 to 10 kg.",
    h1: "Amazon lost parcels: what they are and how to buy online",
    intro:
      "Many people search for “Amazon lost parcels” or “unclaimed Amazon returns” to understand where undelivered or unclaimed shipments end up. This page explains it clearly and lets you shop kilo-based surprise boxes (Standard or Premium).",
    disclaimer:
      "Note: this is an informational page. KiloMystery is not affiliated with Amazon. “Amazon-style” refers to search intent (returns, storage, logistics lots).",

    venditaTitle: "Amazon lost parcels for sale: formats and pricing",
    venditaIntro:
      "On KiloMystery you buy kilo-based surprise boxes (1–10 kg) in two tiers: Standard and Premium. Contents vary: transparency is in the process (weight, seal, batch), not in unrealistic guarantees.",
    venditaBullets: [
      "Standard/Premium: two tiers, same surprise format.",
      "1, 2, 3, 5, 10 kg options with clear pricing (€/kg).",
      "Net weight ±3% and a seal with batch ID and date.",
      "Shipping/tracking according to policy (when available).",
    ],

    howTitle: "Why “lost parcels” and unclaimed returns exist",
    howBody:
      "At scale, e-commerce logistics generates exceptions: undelivered parcels, damaged labels, incomplete addresses, unclaimed pickups, and returns. Some of this stock may be liquidated in lots instead of being stored long-term or destroyed.",
    resiTitle: "Unclaimed Amazon returns: what it means",
    resiBody:
      "When a parcel sits in pickup storage and isn’t collected, it may be returned. If return processing fails or becomes non-standard, it can end up in liquidation stock together with other items.",
    legalTitle: "Is it legal to buy lost parcels?",
    legalBody:
      "Yes—when sourced via liquidation channels and no longer reclaimable as standard deliveries. Avoid sellers promising guaranteed value; variability is part of the format.",

    shopTitle: "Shop now (kilo surprise boxes)",
    shopIntro:
      "Pick Standard or Premium and select the weight. You can shop directly below.",
    linksTitle: "Helpful internal links",
    linksBody:
      "For more details and trust signals (shipping, returns, guides), use these links:",
    links: [
      { href: "/products", label: "Products" },
      { href: "/pacchi-smarriti", label: "Lost Parcels (general guide)" },
      { href: "/mystery-box", label: "Mystery Box guide" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Shipping" },
      { href: "/policy/returns", label: "Returns" },
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Blog" },
    ],

    faqTitle: "FAQ – Amazon lost parcels & unclaimed returns",
    faqIntro: "Quick answers to common questions.",
    faqs: [
      {
        q: "Does KiloMystery sell official Amazon parcels?",
        a: "No. KiloMystery is not affiliated with Amazon. This page targets search intent (lost parcels/unclaimed returns and logistics lots). The boxes are kilo-based surprise formats.",
      },
      {
        q: "What are “unclaimed returns”?",
        a: "Shipments/returns that remain in storage and aren’t collected within time limits, or that cannot be processed as standard returns and become liquidation stock.",
      },
      {
        q: "What can be inside?",
        a: "Variable contents: electronics, accessories, clothing, home items, and more. No guaranteed list—variability is the point.",
      },
      {
        q: "Can I return it?",
        a: "Typically no, because it’s a surprise/variable-content format. Check the Returns policy for details.",
      },
      {
        q: "Do you provide tracking?",
        a: "When available, yes. See the Shipping page for full details.",
      },
    ],

    finalTitle: "Want to buy Amazon-style lost parcels?",
    finalBody:
      "If you searched for Amazon lost parcels or unclaimed returns, this page explains it clearly and lets you shop kilo surprise boxes.",
    finalPrimary: "Go to products",
    finalSecondary: "Contact us",
  },

  es: {
    title: "Paquetes perdidos Amazon: devoluciones no reclamadas | KiloMystery",
    description:
      "¿Buscas paquetes perdidos Amazon o devoluciones Amazon no reclamadas? Aprende cómo funcionan los lotes y compra cajas sorpresa (Standard/Premium) de 1 a 10 kg.",
    h1: "Paquetes perdidos Amazon: qué son y cómo comprarlos online",
    intro:
      "Muchas personas buscan “paquetes perdidos Amazon” o “devoluciones Amazon no reclamadas” para entender qué ocurre con envíos no entregados o no recogidos. Aquí lo explicamos y puedes comprar cajas sorpresa por kilo (Standard o Premium).",
    disclaimer:
      "Nota: página informativa. KiloMystery no está afiliada a Amazon. “Estilo Amazon” se refiere a la intención de búsqueda (devoluciones, lotes logísticos).",

    venditaTitle: "Venta de paquetes perdidos Amazon: formatos y precios",
    venditaIntro:
      "En KiloMystery compras cajas sorpresa por kilo (1–10 kg) en dos niveles: Standard y Premium. El contenido es variable: transparencia en el proceso (peso, precinto, lote), no en promesas irreales.",
    venditaBullets: [
      "Standard/Premium: dos niveles, mismo formato sorpresa.",
      "Formatos 1, 2, 3, 5, 10 kg con precios claros (€/kg).",
      "Peso neto ±3% y precinto con ID de lote y fecha.",
      "Envío/seguimiento según política (cuando esté disponible).",
    ],

    howTitle: "Por qué existen paquetes “perdidos” y devoluciones no reclamadas",
    howBody:
      "En logística a gran escala hay incidencias: envíos no entregados, etiquetas dañadas, direcciones incompletas, puntos de recogida no reclamados y devoluciones. Parte de ese stock puede liquidarse en lotes.",
    resiTitle: "Devoluciones Amazon no reclamadas: qué significa",
    resiBody:
      "Cuando un paquete queda en un punto de recogida y no se retira, puede devolverse. Si el proceso falla o deja de ser estándar, puede acabar como stock de liquidación con otros artículos.",
    legalTitle: "¿Es legal comprar paquetes perdidos?",
    legalBody:
      "Sí, si provienen de canales de liquidación y ya no son reclamables como entregas estándar. Evita promesas de valor garantizado: la variabilidad forma parte del formato.",

    shopTitle: "Compra ahora (cajas sorpresa por kilo)",
    shopIntro:
      "Elige Standard o Premium y selecciona el peso. Puedes comprar directamente aquí abajo.",
    linksTitle: "Enlaces internos útiles",
    linksBody:
      "Para más detalles y confianza (envíos, devoluciones, guías), usa estos enlaces:",
    links: [
      { href: "/products", label: "Productos" },
      { href: "/pacchi-smarriti", label: "Paquetes perdidos (guía general)" },
      { href: "/mystery-box", label: "Guía Mystery Box" },
      { href: "/how-it-works", label: "Cómo funciona" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Envíos" },
      { href: "/policy/returns", label: "Devoluciones" },
      { href: "/about", label: "Quiénes somos" },
      { href: "/contact", label: "Contacto" },
      { href: "/blog", label: "Blog" },
    ],

    faqTitle: "FAQ – Paquetes perdidos Amazon & devoluciones no reclamadas",
    faqIntro: "Respuestas rápidas a preguntas comunes.",
    faqs: [
      {
        q: "¿KiloMystery vende paquetes Amazon oficiales?",
        a: "No. KiloMystery no está afiliada a Amazon. Esta página responde a la intención de búsqueda (paquetes perdidos/devoluciones no reclamadas). Las cajas son formato sorpresa por kilo.",
      },
      {
        q: "¿Qué son las “devoluciones no reclamadas”?",
        a: "Envíos/devoluciones que quedan en almacén/punto de recogida y no se retiran, o que no pueden procesarse como devolución estándar y pasan a stock de liquidación.",
      },
      {
        q: "¿Qué puede venir dentro?",
        a: "Contenido variable: electrónica, accesorios, ropa, hogar y más. No hay lista garantizada.",
      },
      {
        q: "¿Puedo devolverlo?",
        a: "Normalmente no, porque es un formato sorpresa/variable. Consulta la política de devoluciones.",
      },
      {
        q: "¿Hay tracking?",
        a: "Cuando esté disponible, sí. Ver detalles en la página de envíos.",
      },
    ],

    finalTitle: "¿Quieres comprar paquetes perdidos estilo Amazon?",
    finalBody:
      "Si buscabas paquetes perdidos Amazon o devoluciones no reclamadas, aquí tienes explicación y acceso directo a cajas sorpresa por kilo.",
    finalPrimary: "Ver productos",
    finalSecondary: "Contactar",
  },

  fr: {
    title: "Colis perdus Amazon : retours non réclamés | KiloMystery",
    description:
      "Tu cherches colis perdus Amazon ou retours Amazon non réclamés ? Comprends le fonctionnement des lots et achète des box surprise (Standard/Premium) de 1 à 10 kg.",
    h1: "Colis perdus Amazon : définition et achat en ligne",
    intro:
      "Beaucoup de personnes recherchent “colis perdus Amazon” ou “retours Amazon non réclamés” pour comprendre où finissent les envois non livrés ou non récupérés. Ici, on explique clairement et tu peux acheter des box surprise au kilo (Standard ou Premium).",
    disclaimer:
      "Note : page informative. KiloMystery n’est pas affiliée à Amazon. “Style Amazon” = intention de recherche (retours, lots logistiques).",

    venditaTitle: "Vente de colis perdus Amazon : formats et prix",
    venditaIntro:
      "Sur KiloMystery, tu achètes des box surprise au kilo (1–10 kg) en deux niveaux : Standard et Premium. Le contenu varie : transparence sur le process (poids, scellé, lot), pas sur des promesses irréalistes.",
    venditaBullets: [
      "Standard/Premium : deux niveaux, même format surprise.",
      "Formats 1, 2, 3, 5, 10 kg avec prix clairs (€/kg).",
      "Poids net ±3 % et scellé avec ID de lot et date.",
      "Livraison/tracking selon la policy (quand disponible).",
    ],

    howTitle: "Pourquoi les colis “perdus” et retours non réclamés existent",
    howBody:
      "À grande échelle, la logistique e-commerce génère des exceptions : colis non livrés, étiquettes abîmées, adresses incomplètes, retraits non effectués, retours. Une partie peut être liquidée en lots.",
    resiTitle: "Retours Amazon non réclamés : signification",
    resiBody:
      "Quand un colis reste en point relais et n’est pas récupéré, il peut repartir. Si le process échoue ou sort du flux standard, il peut finir en stock de liquidation avec d’autres articles.",
    legalTitle: "Est-ce légal d’acheter des colis perdus ?",
    legalBody:
      "Oui, quand la source est une liquidation et que le colis n’est plus réclamable comme livraison standard. Évite les garanties de valeur : la variabilité fait partie du format.",

    shopTitle: "Acheter maintenant (box surprise au kilo)",
    shopIntro:
      "Choisis Standard ou Premium et sélectionne le poids. Tu peux acheter directement ci-dessous.",
    linksTitle: "Liens internes utiles",
    linksBody:
      "Pour plus d’infos et de confiance (livraison, retours, guides), utilise ces liens :",
    links: [
      { href: "/products", label: "Produits" },
      { href: "/pacchi-smarriti", label: "Colis perdus (guide général)" },
      { href: "/mystery-box", label: "Guide Mystery Box" },
      { href: "/how-it-works", label: "Comment ça marche" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Livraison" },
      { href: "/policy/returns", label: "Retours" },
      { href: "/about", label: "À propos" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Blog" },
    ],

    faqTitle: "FAQ – Colis perdus Amazon & retours non réclamés",
    faqIntro: "Réponses rapides aux questions fréquentes.",
    faqs: [
      {
        q: "KiloMystery vend des colis Amazon officiels ?",
        a: "Non. KiloMystery n’est pas affiliée à Amazon. Cette page vise l’intention de recherche (colis perdus/retours non réclamés). Les box sont en format surprise au kilo.",
      },
      {
        q: "Que signifie “retours non réclamés” ?",
        a: "Des envois/retours qui restent en stockage et ne sont pas récupérés, ou qui ne peuvent pas être traités comme retours standards et deviennent du stock de liquidation.",
      },
      {
        q: "Que peut-on trouver dedans ?",
        a: "Contenu variable : électronique, accessoires, vêtements, maison, etc. Aucune liste garantie.",
      },
      {
        q: "Puis-je retourner ?",
        a: "Généralement non, car c’est un format surprise/variable. Voir la policy retours.",
      },
      {
        q: "Tracking ?",
        a: "Quand disponible, oui. Voir la page Livraison.",
      },
    ],

    finalTitle: "Envie d’acheter des colis perdus (style Amazon) ?",
    finalBody:
      "Si tu cherchais colis perdus Amazon ou retours non réclamés, ici tu as l’explication et l’accès direct aux box surprise au kilo.",
    finalPrimary: "Voir les produits",
    finalSecondary: "Nous contacter",
  },

  de: {
    title: "Amazon verlorene Pakete: nicht abgeholte Rücksendungen | KiloMystery",
    description:
      "Suchst du Amazon verlorene Pakete oder nicht abgeholte Amazon Rücksendungen? Erfahre, wie Liquidationslots funktionieren, und kaufe Überraschungsboxen (Standard/Premium) von 1 bis 10 kg.",
    h1: "Amazon verlorene Pakete: was sie sind und wie man online kauft",
    intro:
      "Viele suchen nach „Amazon verlorene Pakete“ oder „nicht abgeholte Amazon Rücksendungen“, um zu verstehen, was mit nicht zugestellten oder nicht abgeholten Sendungen passiert. Hier erklären wir es klar und du kannst Kilo-Überraschungsboxen (Standard/Premium) kaufen.",
    disclaimer:
      "Hinweis: Diese Seite ist informativ. KiloMystery ist nicht mit Amazon verbunden. „Amazon-ähnlich“ bezieht sich auf die Suchintention (Rücksendungen, Lagerbestände, Logistik-Lots).",

    venditaTitle: "Amazon verlorene Pakete kaufen: Formate und Preise",
    venditaIntro:
      "Bei KiloMystery kaufst du Kilo-Überraschungsboxen (1–10 kg) in zwei Stufen: Standard und Premium. Inhalt ist variabel: Transparenz im Prozess (Gewicht, Siegel, Posten), nicht in unrealistischen Versprechen.",
    venditaBullets: [
      "Standard/Premium: zwei Stufen, gleiches Überraschungsformat.",
      "1, 2, 3, 5, 10 kg Formate mit klaren Preisen (inkl. €/kg).",
      "Nettogewicht ±3 % und Siegel mit Posten-ID und Datum.",
      "Versand/Tracking gemäß Policy (wenn verfügbar).",
    ],

    howTitle: "Warum „verlorene Pakete“ und nicht abgeholte Rücksendungen entstehen",
    howBody:
      "In großskaliger E-Commerce-Logistik gibt es Ausnahmen: unzustellbare Pakete, beschädigte Labels, unvollständige Adressen, nicht abgeholte Abholpunkte und Rücksendungen. Ein Teil kann als Lots liquidiert werden.",
    resiTitle: "Nicht abgeholte Amazon Rücksendungen: Bedeutung",
    resiBody:
      "Wenn ein Paket in der Abholung liegt und nicht abgeholt wird, kann es zurückgehen. Wenn der Rücklauf scheitert oder aus dem Standardprozess fällt, kann es als Liquidationsbestand enden.",
    legalTitle: "Ist der Kauf legal?",
    legalBody:
      "Ja, wenn die Ware aus Liquidation stammt und nicht mehr als Standardzustellung reklamierbar ist. Vermeide Anbieter mit „garantiertem Wert“: Variabilität gehört dazu.",

    shopTitle: "Jetzt kaufen (Kilo-Überraschungsboxen)",
    shopIntro:
      "Wähle Standard oder Premium und das Gewicht. Du kannst direkt unten kaufen.",
    linksTitle: "Nützliche interne Links",
    linksBody:
      "Für mehr Details und Vertrauen (Versand, Rückgabe, Guides), nutze diese Links:",
    links: [
      { href: "/products", label: "Produkte" },
      { href: "/pacchi-smarriti", label: "Verlorene Pakete (allgemeiner Guide)" },
      { href: "/mystery-box", label: "Mystery-Box-Guide" },
      { href: "/how-it-works", label: "So funktioniert’s" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Versand" },
      { href: "/policy/returns", label: "Rückgabe" },
      { href: "/about", label: "Über uns" },
      { href: "/contact", label: "Kontakt" },
      { href: "/blog", label: "Blog" },
    ],

    faqTitle: "FAQ – Amazon verlorene Pakete & nicht abgeholte Rücksendungen",
    faqIntro: "Kurze Antworten auf häufige Fragen.",
    faqs: [
      {
        q: "Verkauft KiloMystery offizielle Amazon-Pakete?",
        a: "Nein. KiloMystery ist nicht mit Amazon verbunden. Die Seite richtet sich an die Suchintention (verlorene Pakete/nicht abgeholte Rücksendungen). Boxen sind Kilo-Überraschungsformate.",
      },
      {
        q: "Was bedeutet „nicht abgeholte Rücksendungen“?",
        a: "Sendungen/Rücksendungen, die in Lagerung verbleiben und nicht abgeholt werden oder nicht als Standardrücksendung verarbeitet werden können und zu Liquidationsbestand werden.",
      },
      {
        q: "Was kann drin sein?",
        a: "Variabler Inhalt: Elektronik, Zubehör, Kleidung, Haushalt u. a. Keine garantierte Liste.",
      },
      {
        q: "Kann ich zurückgeben?",
        a: "Meistens nein, da es ein Überraschungs-/variabler Inhalt ist. Rückgabe-Policy prüfen.",
      },
      {
        q: "Tracking?",
        a: "Wenn verfügbar ja. Details auf der Versandseite.",
      },
    ],

    finalTitle: "Amazon-ähnliche verlorene Pakete kaufen?",
    finalBody:
      "Wenn du nach Amazon verlorene Pakete oder nicht abgeholten Rücksendungen gesucht hast: Hier findest du Erklärung und direkten Kauf von Kilo-Überraschungsboxen.",
    finalPrimary: "Zu den Produkten",
    finalSecondary: "Kontakt",
  },
};

/* =========================
   METADATA
========================= */
export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = normLang(params?.lang);
  const c = COPY[lang];
  const url = `${SITE_URL}/${lang}/pacchi-smarriti-amazon`;

  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: url,
      languages: {
        it: `${SITE_URL}/it/pacchi-smarriti-amazon`,
        en: `${SITE_URL}/en/pacchi-smarriti-amazon`,
        es: `${SITE_URL}/es/pacchi-smarriti-amazon`,
        fr: `${SITE_URL}/fr/pacchi-smarriti-amazon`,
        de: `${SITE_URL}/de/pacchi-smarriti-amazon`,
      },
    },
    openGraph: {
      title: c.title,
      description: c.description,
      url,
      type: "article",
    },
  };
}

/* =========================
   PAGE
========================= */
export default function PacchiSmarritiAmazonPage({
  params,
}: {
  params: { lang: string };
}) {
  const lang = normLang(params?.lang);
  const c = COPY[lang];
  const pageUrl = `${SITE_URL}/${lang}/pacchi-smarriti-amazon`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "KiloMystery", item: `${SITE_URL}/${lang}` },
      { "@type": "ListItem", position: 2, name: c.h1, item: pageUrl },
    ],
  };

  const webPageLd = webPageJsonLd({
    siteUrl: SITE_URL,
    lang,
    title: c.title,
    description: c.description,
  });

  const productStdLd = productJsonLd({ siteUrl: SITE_URL, lang, tier: "Standard" });
  const productPrmLd = productJsonLd({ siteUrl: SITE_URL, lang, tier: "Premium" });
  const itemListLd = itemListJsonLd({ siteUrl: SITE_URL, lang });

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-10">
        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productStdLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productPrmLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

        {/* HERO */}
        <header className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{c.h1}</h1>
          <p className="text-white/75 mt-4 text-lg leading-relaxed">{c.intro}</p>

          <p className="mt-4 text-xs text-white/55">{c.disclaimer}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${lang}/products`} className="btn btn-brand px-6 py-3 font-bold">
              {lang === "it"
                ? "Vai ai prodotti"
                : lang === "en"
                ? "Go to products"
                : lang === "es"
                ? "Ver productos"
                : lang === "fr"
                ? "Voir les produits"
                : "Zu den Produkten"}
            </Link>
            <Link href={`/${lang}/pacchi-smarriti`} className="btn btn-ghost px-6 py-3 font-bold">
              {lang === "it"
                ? "Guida pacchi smarriti"
                : lang === "en"
                ? "Lost parcels guide"
                : lang === "es"
                ? "Guía paquetes perdidos"
                : lang === "fr"
                ? "Guide colis perdus"
                : "Guide verlorene Pakete"}
            </Link>
          </div>
        </header>

        {/* VENDITA */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.venditaTitle}</h2>
          <p className="text-white/75 mt-3 leading-relaxed">{c.venditaIntro}</p>

          <ul className="mt-4 space-y-2 text-white/75">
            {c.venditaBullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="mt-[2px]">✅</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/${lang}/products`} className="btn btn-brand">
              {lang === "it"
                ? "Compra ora"
                : lang === "en"
                ? "Shop now"
                : lang === "es"
                ? "Comprar ahora"
                : lang === "fr"
                ? "Acheter"
                : "Jetzt kaufen"}
            </Link>
            <Link href={`/${lang}/policy/shipping`} className="btn btn-ghost">
              {lang === "it"
                ? "Spedizioni"
                : lang === "en"
                ? "Shipping"
                : lang === "es"
                ? "Envíos"
                : lang === "fr"
                ? "Livraison"
                : "Versand"}
            </Link>
            <Link href={`/${lang}/policy/returns`} className="btn btn-ghost">
              {lang === "it"
                ? "Resi"
                : lang === "en"
                ? "Returns"
                : lang === "es"
                ? "Devoluciones"
                : lang === "fr"
                ? "Retours"
                : "Rückgabe"}
            </Link>
          </div>
        </section>

        {/* EXPLAIN */}
        <section className="grid md:grid-cols-2 gap-5">
          <article className="card">
            <h2 className="text-2xl font-extrabold">{c.howTitle}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">{c.howBody}</p>
          </article>

          <article className="card">
            <h2 className="text-2xl font-extrabold">{c.resiTitle}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">{c.resiBody}</p>
          </article>

          <article className="card md:col-span-2">
            <h2 className="text-2xl font-extrabold">{c.legalTitle}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">{c.legalBody}</p>
          </article>
        </section>

        {/* SHOP INLINE */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.shopTitle}</h2>
          <p className="text-white/75 mt-3 leading-relaxed">{c.shopIntro}</p>

          <div className="mt-6">
            <ProductsTabs lang={lang} />
          </div>
        </section>

        {/* INTERNAL LINKS (10 links) */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.linksTitle}</h2>
          <p className="text-white/75 mt-3">{c.linksBody}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {c.links.map((l) => (
              <Link key={l.href} href={`/${lang}${l.href}`} className="btn btn-ghost">
                {l.label}
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.faqTitle}</h2>
          <p className="text-white/70 mt-2">{c.faqIntro}</p>

          <div className="mt-5 space-y-3">
            {c.faqs.map((f, idx) => (
              <details key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <summary className="cursor-pointer font-bold">{f.q}</summary>
                <p className="text-white/75 mt-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="card text-center">
          <h2 className="text-2xl font-extrabold">{c.finalTitle}</h2>
          <p className="text-white/75 mt-2">{c.finalBody}</p>
          <div className="mt-5 flex justify-center gap-3 flex-wrap">
            <Link href={`/${lang}/products`} className="btn btn-brand px-7 py-3 font-bold">
              {c.finalPrimary}
            </Link>
            <Link href={`/${lang}/contact`} className="btn btn-ghost px-7 py-3 font-bold">
              {c.finalSecondary}
            </Link>
          </div>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
