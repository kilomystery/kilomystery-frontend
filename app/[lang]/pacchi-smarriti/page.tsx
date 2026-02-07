// app/[lang]/pacchi-smarriti/page.tsx
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

const PRICE_TABLE: Record<
  "std" | "prm",
  Record<Kg, { total: number; compareAt: number }>
> = {
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

function webPageJsonLd(args: {
  siteUrl: string;
  lang: Lang;
  title: string;
  description: string;
}) {
  const { siteUrl, lang, title, description } = args;
  const url = `${siteUrl}/${lang}/pacchi-smarriti`;

  const aboutByLang: Record<Lang, string[]> = {
    it: [
      "vendita pacchi smarriti",
      "comprare pacchi smarriti online",
      "pacchi non reclamati",
      "resi non ritirati",
      "mystery box al kg",
    ],
    en: [
      "lost parcels for sale",
      "buy lost parcels online",
      "unclaimed returns",
      "undelivered parcels",
      "mystery boxes by the kilo",
    ],
    es: [
      "venta de paquetes perdidos",
      "comprar paquetes perdidos online",
      "devoluciones no reclamadas",
      "paquetes no entregados",
      "mystery box por kilo",
    ],
    fr: [
      "vente de colis perdus",
      "acheter des colis perdus en ligne",
      "retours non réclamés",
      "colis non livrés",
      "mystery box au kilo",
    ],
    de: [
      "verlorene pakete kaufen",
      "verlorene pakete online",
      "nicht abgeholte rücksendungen",
      "nicht zugestellte pakete",
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

function productJsonLd(args: {
  siteUrl: string;
  lang: Lang;
  tier: "Standard" | "Premium";
}) {
  const { siteUrl, lang, tier } = args;

  const tab = tier === "Standard" ? "std" : "prm";
  const pageUrl = `${siteUrl}/${lang}/pacchi-smarriti`;

  // ✅ DEEP LINK CONSIGLIATO (conversione + intent)
  const tierAnchor =
    tier === "Standard"
      ? `${siteUrl}/${lang}/products#buy-standard-10`
      : `${siteUrl}/${lang}/products#buy-premium-10`;

  const offers = WEIGHTS.map((kg) => {
    const p = PRICE_TABLE[tab][kg];

    return {
      "@type": "Offer",
      url: tierAnchor, // ✅ punta alla sezione acquisto reale
      priceCurrency: CURRENCY,
      price: p.total,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        value: kg,
        unitText: "kg",
      },
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
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: 1,
            unitText: "kg",
          },
          unitText: "per kg",
        },
      ],
    };
  });

  const lowPrice = Math.min(...WEIGHTS.map((kg) => PRICE_TABLE[tab][kg].total));
  const highPrice = Math.max(
    ...WEIGHTS.map((kg) => PRICE_TABLE[tab][kg].total)
  );

  const descByLang: Record<Lang, Record<"Standard" | "Premium", string>> = {
    it: {
      Standard:
        "Pacchi smarriti in formato Standard: contenuto variabile a sorpresa, box sigillata con ID lotto e data, peso 1–10 kg.",
      Premium:
        "Pacchi smarriti in formato Premium: contenuto variabile a sorpresa, box sigillata con ID lotto e data, peso 1–10 kg.",
    },
    en: {
      Standard:
        "Lost parcels in Standard tier: variable surprise contents, sealed box with batch ID and date, 1–10 kg formats.",
      Premium:
        "Lost parcels in Premium tier: variable surprise contents, sealed box with batch ID and date, 1–10 kg formats.",
    },
    es: {
      Standard:
        "Paquetes perdidos en formato Standard: contenido sorpresa variable, caja precintada con ID de lote y fecha, 1–10 kg.",
      Premium:
        "Paquetes perdidos en formato Premium: contenido sorpresa variable, caja precintada con ID de lote y fecha, 1–10 kg.",
    },
    fr: {
      Standard:
        "Colis perdus (Standard) : contenu surprise variable, box scellée avec ID de lot et date, formats 1–10 kg.",
      Premium:
        "Colis perdus (Premium) : contenu surprise variable, box scellée avec ID de lot et date, formats 1–10 kg.",
    },
    de: {
      Standard:
        "Verlorene Pakete (Standard): variabler Überraschungsinhalt, versiegelte Box mit Posten-ID und Datum, 1–10 kg.",
      Premium:
        "Verlorene Pakete (Premium): variabler Überraschungsinhalt, versiegelte Box mit Posten-ID und Datum, 1–10 kg.",
    },
  };

  const nameByLang: Record<Lang, Record<"Standard" | "Premium", string>> = {
    it: {
      Standard: "KiloMystery Standard · Pacchi Smarriti (1–10 kg)",
      Premium: "KiloMystery Premium · Pacchi Smarriti (1–10 kg)",
    },
    en: {
      Standard: "KiloMystery Standard · Lost Parcels (1–10 kg)",
      Premium: "KiloMystery Premium · Lost Parcels (1–10 kg)",
    },
    es: {
      Standard: "KiloMystery Standard · Paquetes Perdidos (1–10 kg)",
      Premium: "KiloMystery Premium · Paquetes Perdidos (1–10 kg)",
    },
    fr: {
      Standard: "KiloMystery Standard · Colis Perdus (1–10 kg)",
      Premium: "KiloMystery Premium · Colis Perdus (1–10 kg)",
    },
    de: {
      Standard: "KiloMystery Standard · Verlorene Pakete (1–10 kg)",
      Premium: "KiloMystery Premium · Verlorene Pakete (1–10 kg)",
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
      url: tierAnchor, // ✅ deep link conversione
      priceCurrency: CURRENCY,
      lowPrice,
      highPrice,
      offerCount: WEIGHTS.length,
      offers,
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Tier", value: tier },
      {
        "@type": "PropertyValue",
        name: "Weight options",
        value: "1, 2, 3, 5, 10 kg",
      },
      {
        "@type": "PropertyValue",
        name: "Format",
        value: "Surprise / variable contents",
      },
      { "@type": "PropertyValue", name: "Net weight tolerance", value: "±3%" },
      { "@type": "PropertyValue", name: "Batch seal", value: "Batch ID + date" },
    ],
  };
}

function itemListJsonLd(args: { siteUrl: string; lang: Lang }) {
  const { siteUrl, lang } = args;
  const pageUrl = `${siteUrl}/${lang}/pacchi-smarriti`;

  const listNameByLang: Record<Lang, string> = {
    it: "KiloMystery — Pacchi Smarriti (Standard & Premium) — formati e prezzi",
    en: "KiloMystery — Lost Parcels (Standard & Premium) — formats and pricing",
    es: "KiloMystery — Paquetes Perdidos (Standard & Premium) — formatos y precios",
    fr: "KiloMystery — Colis Perdus (Standard & Premium) — formats et prix",
    de: "KiloMystery — Verlorene Pakete (Standard & Premium) — Formate und Preise",
  };

  const items: any[] = [];
  let pos = 1;

  for (const tier of ["Standard", "Premium"] as const) {
    const tab = tier === "Standard" ? "std" : "prm";
    const tierAnchor =
      tier === "Standard"
        ? `${siteUrl}/${lang}/products#buy-standard-10`
        : `${siteUrl}/${lang}/products#buy-premium-10`;

    for (const kg of WEIGHTS) {
      const total = PRICE_TABLE[tab][kg].total;
      items.push({
        "@type": "ListItem",
        position: pos++,
        url: tierAnchor, // ✅ porta al punto di acquisto
        name: `${tier} · ${kg} kg`,
        item: {
          "@type": "Product",
          name: `${tier} · ${kg} kg`,
          brand: { "@type": "Brand", name: "KiloMystery" },
          offers: {
            "@type": "Offer",
            url: tierAnchor, // ✅ conversion-first
            priceCurrency: CURRENCY,
            price: total,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            eligibleQuantity: {
              "@type": "QuantitativeValue",
              value: kg,
              unitText: "kg",
            },
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
    seoHubLine: string;

    h1: string;
    intro: string;

    venditaTitle: string;
    venditaIntro: string;
    venditaBullets: string[];

    whyTitle: string;
    whyBullets: string[];

    ctaPrimary: string;
    ctaSecondary: string;

    section1Title: string;
    section1Body: string;
    section2Title: string;
    section2Body: string;
    section3Title: string;
    section3Body: string;
    section4Title: string;
    section4Body: string;

    shopTitle: string;
    shopIntro: string;

    linksTitle: string;
    linksBody: string;
    linkProducts: string;
    linkMysteryBox: string;
    linkHowItWorks: string;
    linkShipping: string;
    linkReturns: string;

    // ✅ NEW (internal links extra)
    linksMoreTitle: string;
    linksMoreBody: string;
    linkFaq: string;
    linkBlog: string;
    linkPress: string;
    linkAbout: string;
    linkContact: string;
    linkPrivacy: string;
    linkTerms: string;

    faqTitle: string;
    faqIntro: string;
    faqs: FAQ[];

    finalTitle: string;
    finalBody: string;
    finalPrimary: string;
    finalSecondary: string;
  }
> = {
  // ==========
  // IT
  // ==========
  it: {
    title: "Vendita Pacchi Smarriti online (al kg 1–10 kg) | KiloMystery",
    description:
      "Vendita pacchi smarriti online: scegli Standard o Premium da 1 a 10 kg. Guida chiara su pacchi smarriti, resi non ritirati e acquisto trasparente.",
    seoHubLine:
      "SEO hub: vendita pacchi smarriti • keyword: comprare pacchi smarriti online",

    h1: "Vendita pacchi smarriti: cosa sono e come comprarli online",
    intro:
      "I pacchi smarriti sono spedizioni che non arrivano a destinazione oppure che non vengono ritirate dopo i tentativi di consegna. In alcuni casi, invece di essere smaltiti, vengono recuperati e rivenduti in stock. Qui trovi una spiegazione chiara e l’accesso diretto ai formati disponibili.",

    venditaTitle: "Vendita pacchi smarriti online: prezzi e formati",
    venditaIntro:
      "Su KiloMystery puoi acquistare pacchi smarriti in formato sorpresa, scegliendo fascia (Standard/Premium) e peso (1–10 kg). Il contenuto è variabile: la trasparenza è nel processo, non nelle promesse.",
    venditaBullets: [
      "Standard o Premium: due livelli di selezione, stessa logica “sorpresa”.",
      "Formati 1, 2, 3, 5, 10 kg con prezzi chiari (anche €/kg).",
      "Peso netto con tolleranza ±3% e sigillo con ID lotto e data.",
      "Spedizione tracciata quando disponibile (vedi policy Spedizioni).",
    ],

    whyTitle: "Perché i pacchi smarriti esistono (e perché vengono rivenduti)",
    whyBullets: [
      "Nei grandi hub logistici passano migliaia di pacchi all’ora: errori e imprevisti accadono.",
      "Molti pacchi diventano “non consegnabili” per etichette rovinate o dati incompleti.",
      "I resi non ritirati occupano spazio e generano costi di gestione.",
      "Rivendere stock è spesso più efficiente di distruggere o stoccare a lungo.",
    ],

    ctaPrimary: "Compra Pacchi Smarriti",
    ctaSecondary: "Come funziona",

    section1Title: "Come si smarriscono i pacchi",
    section1Body:
      "Un pacco può “sparire” per motivi semplici: indirizzo errato, CAP sbagliato, etichetta illeggibile o danneggiata. Nei centri di smistamento, errori di scansione o movimentazione possono deviare una spedizione. Se non è più possibile risalire a destinatario o mittente, il pacco entra in flussi di gestione speciali.",
    section2Title: "Pacchi di ritorno e resi non ritirati",
    section2Body:
      "Una quota importante nasce dai pacchi non ritirati: il corriere tenta la consegna, lascia avvisi, e dopo un periodo di giacenza il pacco torna indietro. Se anche il mittente non lo reclama (o se il rientro fallisce), la spedizione può finire in stock di magazzino.",
    section3Title: "Dal magazzino al macero (e perché alcuni vengono salvati)",
    section3Body:
      "Tenere pacchi fermi è un costo: spazio, inventario, gestione. In molti casi la soluzione è lo smaltimento oppure la liquidazione in lotti. La rivendita consente di recuperare parte del valore e ridurre sprechi: è qui che nasce il mercato dei pacchi smarriti e dei lotti di reso.",
    section4Title: "È legale comprare pacchi smarriti?",
    section4Body:
      "Sì, quando i pacchi sono ceduti tramite canali di liquidazione dopo che non sono più reclamabili o gestibili. L’importante è acquistare da realtà trasparenti e con processi chiari. Diffida da promesse “troppo belle” (valori garantiti, smartphone assicurati, ecc.): nei pacchi smarriti conta la variabilità.",

    shopTitle: "Acquista pacchi smarriti su KiloMystery",
    shopIntro:
      "Scegli Standard o Premium, seleziona il peso (1–10 kg) e procedi all’ordine. Qui sotto trovi prezzi e formati disponibili.",

    linksTitle: "Link utili per approfondire",
    linksBody:
      "Per confrontare formati e verificare spedizioni/resi, usa questi link interni:",
    linkProducts: "Vai ai Prodotti",
    linkMysteryBox: "Guida Mystery Box",
    linkHowItWorks: "Come funziona",
    linkShipping: "Spedizioni",
    linkReturns: "Resi",

    linksMoreTitle: "Risorse e pagine correlate",
    linksMoreBody:
      "Se stai valutando l’acquisto, ecco altre pagine utili (FAQ, blog, press e policy):",
    linkFaq: "FAQ",
    linkBlog: "Blog",
    linkPress: "Press",
    linkAbout: "Chi siamo",
    linkContact: "Contatti",
    linkPrivacy: "Privacy",
    linkTerms: "Termini",

    faqTitle: "FAQ – Pacchi Smarriti",
    faqIntro:
      "Risposte rapide alle domande più comuni su pacchi smarriti, resi non ritirati e acquisto online.",
    faqs: [
      {
        q: "Cosa sono i pacchi smarriti?",
        a: "Sono spedizioni non consegnate o non ritirate che, dopo i tentativi di consegna e le procedure di rientro, possono finire in stock di liquidazione in alcuni casi.",
      },
      {
        q: "Come si smarriscono i pacchi?",
        a: "Per errori di indirizzo, etichette danneggiate/illeggibili, problemi di scansione nei centri di smistamento, oppure perché il destinatario non ritira il pacco e il rientro non va a buon fine.",
      },
      {
        q: "I pacchi non ritirati finiscono sempre al macero?",
        a: "Non sempre. In alcuni casi vengono smaltiti, in altri vengono liquidati in lotti per recuperare valore e liberare spazio nei magazzini.",
      },
      {
        q: "È legale comprare pacchi smarriti?",
        a: "Sì, quando provengono da processi di liquidazione e non sono più reclamabili/gestibili come spedizioni standard. Conta acquistare da venditori trasparenti.",
      },
      {
        q: "Cosa posso trovare dentro?",
        a: "Contenuti variabili: elettronica, accessori, abbigliamento, prodotti casa e altro. Non esiste una lista garantita: la variabilità è parte del formato.",
      },
      {
        q: "Posso fare reso?",
        a: "Trattandosi di prodotti a contenuto variabile/sorpresa, di norma il reso non è previsto. Consulta la policy Resi per i dettagli.",
      },
      {
        q: "Spedite con tracking?",
        a: "Sì, la spedizione è tracciata quando disponibile. I dettagli sono nella pagina Spedizioni.",
      },
    ],

    finalTitle: "Vuoi provare l’esperienza dei pacchi smarriti?",
    finalBody:
      "Se cercavi “vendita pacchi smarriti”, qui trovi una guida chiara e l’accesso diretto ai prodotti. Scegli il formato e inizia l’unboxing.",
    finalPrimary: "Acquista ora",
    finalSecondary: "Contattaci",
  },

  // ==========
  // EN
  // ==========
  en: {
    title: "Lost Parcels for sale (1–10 kg) | KiloMystery",
    description:
      "Lost parcels for sale online: choose Standard or Premium from 1 to 10 kg. Clear guide on lost parcels, unclaimed returns, and transparent purchasing.",
    seoHubLine:
      "SEO hub: lost parcels for sale • keyword: buy lost parcels online",

    h1: "Lost parcels for sale: what they are and how to buy online",
    intro:
      "Lost parcels are shipments that never reach the recipient or aren’t collected after delivery attempts. In some cases, instead of being destroyed, they’re recovered and sold as liquidation stock. Here you’ll find a clear explanation and direct access to available formats.",

    venditaTitle: "Buy lost parcels online: pricing and formats",
    venditaIntro:
      "On KiloMystery you can buy lost parcels in a surprise format by choosing tier (Standard/Premium) and weight (1–10 kg). Contents vary: transparency is in the process, not in unrealistic guarantees.",
    venditaBullets: [
      "Standard vs Premium: two tiers, same surprise format.",
      "1, 2, 3, 5, 10 kg options with clear prices (€/kg included).",
      "Net weight with ±3% tolerance and a seal with batch ID and date.",
      "Tracked shipping when available (see Shipping policy).",
    ],

    whyTitle: "Why lost parcels exist (and why they get resold)",
    whyBullets: [
      "Large sorting hubs process thousands of parcels per hour—exceptions happen.",
      "Damaged labels or incomplete data can make parcels undeliverable.",
      "Unclaimed returns take up space and increase handling costs.",
      "Liquidating stock is often more efficient than long-term storage or destruction.",
    ],

    ctaPrimary: "Shop Lost Parcels",
    ctaSecondary: "How it works",

    section1Title: "How parcels get lost",
    section1Body:
      "Parcels can go missing due to simple issues: wrong address, incorrect ZIP code, unreadable/damaged labels. In sorting centers, scanning or handling errors can reroute shipments. When it’s no longer possible to identify the recipient or sender, parcels may enter special handling flows.",
    section2Title: "Returns and unclaimed parcels",
    section2Body:
      "A major source is unclaimed returns: delivery attempts fail, parcels sit in pickup points, and then get returned. If the sender doesn’t reclaim them (or the return process fails), parcels can become warehouse stock.",
    section3Title: "From warehouse to destruction (and why some are saved)",
    section3Body:
      "Keeping parcels in storage is expensive: space, inventory management, and labor. Some end up destroyed, while others are liquidated in lots to recover value and free space. That’s how the lost-parcel liquidation market exists.",
    section4Title: "Is it legal to buy lost parcels?",
    section4Body:
      "Yes—when parcels are sold through liquidation channels after they’re no longer reclaimable/processable as standard deliveries. Choose transparent sellers and avoid unrealistic guarantees (e.g., “guaranteed smartphone”). Variability is part of the format.",

    shopTitle: "Buy lost parcels on KiloMystery",
    shopIntro:
      "Choose Standard or Premium, select weight (1–10 kg) and place your order. Prices and formats are listed below.",

    linksTitle: "Helpful internal links",
    linksBody: "Compare formats and check shipping/returns:",
    linkProducts: "Go to Products",
    linkMysteryBox: "Mystery Box guide",
    linkHowItWorks: "How it works",
    linkShipping: "Shipping",
    linkReturns: "Returns",

    linksMoreTitle: "Resources & related pages",
    linksMoreBody:
      "More useful pages while you decide (FAQ, blog, press and policies):",
    linkFaq: "FAQ",
    linkBlog: "Blog",
    linkPress: "Press",
    linkAbout: "About us",
    linkContact: "Contact",
    linkPrivacy: "Privacy",
    linkTerms: "Terms",

    faqTitle: "FAQ – Lost Parcels",
    faqIntro: "Quick answers about lost parcels, unclaimed returns, and buying online.",
    faqs: [
      {
        q: "What are lost parcels?",
        a: "They are undelivered or unclaimed shipments that, after delivery/return procedures, can become liquidation stock in some cases.",
      },
      {
        q: "How do parcels get lost?",
        a: "Wrong/incomplete address, damaged labels, scanning errors in sorting centers, or unclaimed pickup/return processes.",
      },
      {
        q: "Do unclaimed parcels always get destroyed?",
        a: "Not always. Some are destroyed, others are liquidated in lots to recover value and free warehouse space.",
      },
      {
        q: "Is it legal to buy lost parcels?",
        a: "Yes, when sourced via liquidation and no longer reclaimable/processable as standard deliveries. Transparency matters.",
      },
      {
        q: "What can be inside?",
        a: "Variable contents: electronics, accessories, clothing, home items, and more. No guaranteed list—variability is the point.",
      },
      {
        q: "Can I return it?",
        a: "Surprise/variable-content formats typically aren’t returnable. Check the Returns policy for details.",
      },
      {
        q: "Do you ship with tracking?",
        a: "Yes, tracking is provided when available. See the Shipping page for details.",
      },
    ],

    finalTitle: "Ready to try lost parcels?",
    finalBody:
      "If you searched for “lost parcels for sale”, this page gives you clarity and direct access to products. Choose a format and start the unboxing.",
    finalPrimary: "Shop now",
    finalSecondary: "Contact us",
  },

  // ==========
  // ES
  // ==========
  es: {
    title: "Venta de paquetes perdidos (1–10 kg) | KiloMystery",
    description:
      "Venta de paquetes perdidos online: elige Standard o Premium de 1 a 10 kg. Guía clara sobre paquetes perdidos, devoluciones no reclamadas y compra transparente.",
    seoHubLine:
      "SEO hub: venta de paquetes perdidos • keyword: comprar paquetes perdidos online",

    h1: "Venta de paquetes perdidos: qué son y cómo comprarlos online",
    intro:
      "Los paquetes perdidos son envíos que no llegan al destinatario o no se recogen tras varios intentos. En algunos casos, en lugar de destruirse, se recuperan y se venden en lotes de liquidación. Aquí tienes una explicación clara y acceso directo a los formatos disponibles.",

    venditaTitle: "Comprar paquetes perdidos online: precios y formatos",
    venditaIntro:
      "En KiloMystery puedes comprar paquetes perdidos en formato sorpresa eligiendo nivel (Standard/Premium) y peso (1–10 kg). El contenido es variable: la transparencia está en el proceso, no en promesas irreales.",
    venditaBullets: [
      "Standard o Premium: dos niveles, misma lógica de sorpresa.",
      "Formatos 1, 2, 3, 5, 10 kg con precios claros (incluye €/kg).",
      "Peso neto con tolerancia ±3% y precinto con ID de lote y fecha.",
      "Envío con seguimiento cuando esté disponible (ver política de Envíos).",
    ],

    whyTitle: "Por qué existen (y por qué se revenden)",
    whyBullets: [
      "Los grandes centros logísticos procesan miles de paquetes por hora: hay incidencias.",
      "Etiquetas dañadas o datos incompletos pueden hacer el envío imposible de entregar.",
      "Las devoluciones no recogidas ocupan espacio y generan costes.",
      "Liquidar lotes suele ser más eficiente que almacenar o destruir.",
    ],

    ctaPrimary: "Comprar Paquetes Perdidos",
    ctaSecondary: "Cómo funciona",

    section1Title: "Cómo se pierden los paquetes",
    section1Body:
      "Pueden perderse por dirección errónea, código postal incorrecto, etiqueta ilegible o dañada. En centros de clasificación, errores de escaneo o manipulación pueden desviar el envío. Si no se puede identificar al destinatario o remitente, pasa a gestión especial.",
    section2Title: "Devoluciones y paquetes no recogidos",
    section2Body:
      "Una fuente importante son los paquetes no recogidos: fallan intentos de entrega, quedan en punto de recogida y luego vuelven. Si el remitente no los reclama (o falla el proceso), pueden convertirse en stock de almacén.",
    section3Title: "Del almacén a la destrucción (y por qué algunos se salvan)",
    section3Body:
      "Guardar paquetes cuesta dinero (espacio y gestión). Algunos se destruyen, otros se liquidan en lotes para recuperar valor y liberar espacio. Así existe el mercado de liquidación de paquetes perdidos.",
    section4Title: "¿Es legal comprar paquetes perdidos?",
    section4Body:
      "Sí, cuando provienen de canales de liquidación tras no ser reclamables/gestionables como entregas estándar. Elige vendedores transparentes y evita garantías irreales: la variabilidad forma parte del formato.",

    shopTitle: "Compra paquetes perdidos en KiloMystery",
    shopIntro:
      "Elige Standard o Premium, selecciona el peso (1–10 kg) y realiza el pedido. Abajo tienes precios y formatos.",

    linksTitle: "Enlaces internos útiles",
    linksBody: "Compara formatos y revisa envíos/devoluciones:",
    linkProducts: "Ver Productos",
    linkMysteryBox: "Guía Mystery Box",
    linkHowItWorks: "Cómo funciona",
    linkShipping: "Envíos",
    linkReturns: "Devoluciones",

    linksMoreTitle: "Recursos y páginas relacionadas",
    linksMoreBody:
      "Otras páginas útiles mientras decides (FAQ, blog, prensa y políticas):",
    linkFaq: "FAQ",
    linkBlog: "Blog",
    linkPress: "Prensa",
    linkAbout: "Quiénes somos",
    linkContact: "Contacto",
    linkPrivacy: "Privacidad",
    linkTerms: "Términos",

    faqTitle: "FAQ – Paquetes perdidos",
    faqIntro: "Respuestas rápidas sobre paquetes perdidos y compras online.",
    faqs: [
      {
        q: "¿Qué son los paquetes perdidos?",
        a: "Envíos no entregados o no recogidos que, tras procesos de devolución/gestión, pueden acabar en lotes de liquidación en algunos casos.",
      },
      {
        q: "¿Cómo se pierden?",
        a: "Dirección incorrecta/incompleta, etiquetas dañadas, errores de escaneo o devoluciones no recogidas.",
      },
      {
        q: "¿Siempre se destruyen?",
        a: "No siempre. Algunos se destruyen y otros se liquidan en lotes para recuperar valor y liberar espacio.",
      },
      {
        q: "¿Es legal comprarlos?",
        a: "Sí, si provienen de liquidación y ya no son reclamables/gestionables como entregas estándar. La transparencia importa.",
      },
      {
        q: "¿Qué puede haber dentro?",
        a: "Contenido variable: electrónica, accesorios, ropa, hogar, etc. No hay lista garantizada.",
      },
      {
        q: "¿Se puede devolver?",
        a: "Los formatos sorpresa/variables normalmente no admiten devolución. Revisa la política de devoluciones.",
      },
      {
        q: "¿Envío con tracking?",
        a: "Sí, con seguimiento cuando esté disponible. Mira la página de envíos.",
      },
    ],

    finalTitle: "¿Listo para probar paquetes perdidos?",
    finalBody:
      "Si buscabas “venta de paquetes perdidos”, aquí tienes una guía clara y acceso directo a productos. Elige un formato y empieza el unboxing.",
    finalPrimary: "Comprar ahora",
    finalSecondary: "Contactar",
  },

  // ==========
  // FR
  // ==========
  fr: {
    title: "Vente de colis perdus (1–10 kg) | KiloMystery",
    description:
      "Vente de colis perdus en ligne : choisissez Standard ou Premium de 1 à 10 kg. Guide clair sur colis perdus, retours non réclamés et achat transparent.",
    seoHubLine:
      "SEO hub: vente de colis perdus • keyword: acheter des colis perdus en ligne",

    h1: "Vente de colis perdus : définition et achat en ligne",
    intro:
      "Les colis perdus sont des envois non livrés ou non récupérés après plusieurs tentatives. Dans certains cas, au lieu d’être détruits, ils sont récupérés et vendus en lots de liquidation. Ici, tu trouves une explication claire et l’accès direct aux formats disponibles.",

    venditaTitle: "Acheter des colis perdus en ligne : prix et formats",
    venditaIntro:
      "Sur KiloMystery, tu peux acheter des colis perdus en format surprise en choisissant le niveau (Standard/Premium) et le poids (1–10 kg). Le contenu est variable : la transparence est dans le processus, pas dans des promesses irréalistes.",
    venditaBullets: [
      "Standard ou Premium : deux niveaux, même logique de surprise.",
      "Formats 1, 2, 3, 5, 10 kg avec prix clairs (€/kg inclus).",
      "Poids net ±3 % et scellé avec ID de lot et date.",
      "Livraison avec suivi quand disponible (voir politique Livraison).",
    ],

    whyTitle: "Pourquoi les colis perdus existent (et pourquoi ils sont revendus)",
    whyBullets: [
      "Les hubs de tri traitent des milliers de colis/heure : des incidents arrivent.",
      "Étiquettes abîmées ou données incomplètes : colis non livrables.",
      "Les retours non récupérés prennent de la place et coûtent cher.",
      "La liquidation de lots est souvent plus efficace que le stockage ou la destruction.",
    ],

    ctaPrimary: "Acheter des Colis Perdus",
    ctaSecondary: "Comment ça marche",

    section1Title: "Comment un colis devient “perdu”",
    section1Body:
      "Adresse incorrecte, code postal erroné, étiquette illisible/abîmée : des causes simples peuvent suffire. Dans les centres de tri, des erreurs de scan ou de manutention peuvent dévier un colis. Si l’identification expéditeur/destinataire échoue, le colis passe en gestion spéciale.",
    section2Title: "Retours et colis non récupérés",
    section2Body:
      "Une source majeure : les colis non récupérés. Après échecs de livraison, le colis reste en point relais puis repart. Si l’expéditeur ne le réclame pas (ou si le retour échoue), il peut devenir du stock d’entrepôt.",
    section3Title: "Entrepôt, destruction… ou liquidation",
    section3Body:
      "Stocker coûte cher : espace, gestion, main-d’œuvre. Certains colis sont détruits, d’autres sont liquidés en lots pour récupérer de la valeur et libérer de l’espace. C’est le principe du marché des colis perdus.",
    section4Title: "Est-ce légal d’acheter des colis perdus ?",
    section4Body:
      "Oui, quand ils proviennent de canaux de liquidation après ne plus être réclamables/traitables comme livraisons standard. Choisis des vendeurs transparents et évite les promesses irréalistes : la variabilité fait partie du format.",

    shopTitle: "Acheter sur KiloMystery",
    shopIntro:
      "Choisis Standard ou Premium, sélectionne le poids (1–10 kg) et commande. Prix et formats ci-dessous.",

    linksTitle: "Liens internes utiles",
    linksBody: "Comparer les formats et consulter livraison/retours :",
    linkProducts: "Voir les Produits",
    linkMysteryBox: "Guide Mystery Box",
    linkHowItWorks: "Comment ça marche",
    linkShipping: "Livraison",
    linkReturns: "Retours",

    linksMoreTitle: "Ressources & pages associées",
    linksMoreBody:
      "D’autres pages utiles pendant ta décision (FAQ, blog, presse, politiques) :",
    linkFaq: "FAQ",
    linkBlog: "Blog",
    linkPress: "Presse",
    linkAbout: "À propos",
    linkContact: "Contact",
    linkPrivacy: "Confidentialité",
    linkTerms: "Conditions",

    faqTitle: "FAQ – Colis perdus",
    faqIntro: "Réponses rapides sur les colis perdus et l’achat en ligne.",
    faqs: [
      {
        q: "Qu’est-ce qu’un colis perdu ?",
        a: "Un envoi non livré ou non récupéré qui, après procédures, peut finir en lot de liquidation dans certains cas.",
      },
      {
        q: "Comment les colis se perdent-ils ?",
        a: "Adresse incomplète, étiquette abîmée, erreurs de scan/manutention, retours non récupérés.",
      },
      {
        q: "Sont-ils toujours détruits ?",
        a: "Non. Certains sont détruits, d’autres liquidés en lots pour récupérer de la valeur.",
      },
      {
        q: "Est-ce légal d’en acheter ?",
        a: "Oui, si la source est une liquidation et que le colis n’est plus réclamable/traitable comme livraison standard.",
      },
      {
        q: "Que peut-on trouver dedans ?",
        a: "Contenu variable : électronique, accessoires, vêtements, maison… aucune liste garantie.",
      },
      {
        q: "Peut-on retourner ?",
        a: "Les formats “surprise” ne sont généralement pas retournables. Voir la politique de retours.",
      },
      {
        q: "Livraison avec suivi ?",
        a: "Oui, avec tracking quand disponible. Voir la page Livraison.",
      },
    ],

    finalTitle: "Prêt à tester les colis perdus ?",
    finalBody:
      "Si tu cherchais “vente de colis perdus”, cette page explique clairement et te permet d’acheter directement. Choisis un format et lance l’unboxing.",
    finalPrimary: "Acheter maintenant",
    finalSecondary: "Nous contacter",
  },

  // ==========
  // DE
  // ==========
  de: {
    title: "Verlorene Pakete kaufen (1–10 kg) | KiloMystery",
    description:
      "Verlorene Pakete online kaufen: Standard oder Premium von 1 bis 10 kg. Klare Erklärung zu verlorenen Paketen, nicht abgeholten Rücksendungen und transparentem Kauf.",
    seoHubLine:
      "SEO hub: verlorene pakete kaufen • keyword: verlorene pakete online",

    h1: "Verlorene Pakete kaufen: was sie sind und wie der Online-Kauf funktioniert",
    intro:
      "Verlorene Pakete sind Sendungen, die nicht zugestellt werden oder nach Zustellversuchen nicht abgeholt werden. In manchen Fällen werden sie nicht zerstört, sondern als Liquidationsware weiterverkauft. Hier findest du eine klare Erklärung und direkten Zugang zu den verfügbaren Formaten.",

    venditaTitle: "Verlorene Pakete online kaufen: Preise und Formate",
    venditaIntro:
      "Bei KiloMystery kannst du verlorene Pakete im Überraschungsformat kaufen: wähle Tier (Standard/Premium) und Gewicht (1–10 kg). Der Inhalt ist variabel: Transparenz steckt im Prozess, nicht in unrealistischen Versprechen.",
    venditaBullets: [
      "Standard oder Premium: zwei Stufen, gleiche Überraschungslogik.",
      "1, 2, 3, 5, 10 kg Formate mit klaren Preisen (inkl. €/kg).",
      "Nettogewicht ±3 % und Siegel mit Posten-ID und Datum.",
      "Versand mit Tracking, wenn verfügbar (siehe Versand-Policy).",
    ],

    whyTitle: "Warum verlorene Pakete existieren (und warum sie verkauft werden)",
    whyBullets: [
      "Große Sortierzentren verarbeiten tausende Pakete pro Stunde – Ausnahmen passieren.",
      "Beschädigte Labels oder unvollständige Daten machen Pakete unzustellbar.",
      "Nicht abgeholte Rücksendungen kosten Lagerfläche und Handling.",
      "Liquidation ist oft effizienter als lange Lagerung oder Zerstörung.",
    ],

    ctaPrimary: "Verlorene Pakete kaufen",
    ctaSecondary: "So funktioniert’s",

    section1Title: "Wie Pakete verloren gehen",
    section1Body:
      "Falsche Adresse, falsche PLZ, unleserliche/beschädigte Labels: schon kleine Ursachen reichen. In Sortierzentren können Scan- oder Handlingfehler Sendungen umleiten. Wenn Absender/Empfänger nicht mehr eindeutig identifizierbar sind, landen Pakete in Sonderprozessen.",
    section2Title: "Rückläufer & nicht abgeholte Sendungen",
    section2Body:
      "Eine wichtige Quelle sind nicht abgeholte Sendungen: Zustellung scheitert, Paket liegt im Abholpunkt und wird zurückgesendet. Wenn der Absender es nicht zurücknimmt (oder der Prozess scheitert), wird es zum Lagerbestand/Lot.",
    section3Title: "Vom Lager zur Zerstörung (oder Liquidation)",
    section3Body:
      "Lagerung kostet: Platz, Verwaltung, Arbeit. Einige Pakete werden zerstört, andere als Lots liquidiert, um Wert zurückzugewinnen und Lager zu leeren. Daraus entsteht der Markt für verlorene Pakete.",
    section4Title: "Ist der Kauf legal?",
    section4Body:
      "Ja, wenn die Ware aus Liquidationskanälen stammt und nicht mehr als Standardzustellung reklamierbar/abwickelbar ist. Kaufe bei transparenten Anbietern und vermeide unrealistische Versprechen – Variabilität gehört dazu.",

    shopTitle: "Verlorene Pakete bei KiloMystery kaufen",
    shopIntro:
      "Wähle Standard oder Premium, Gewicht (1–10 kg) auswählen und bestellen. Preise und Formate findest du unten.",

    linksTitle: "Nützliche interne Links",
    linksBody: "Vergleiche Formate und prüfe Versand/Rückgabe:",
    linkProducts: "Zu den Produkten",
    linkMysteryBox: "Mystery-Box-Guide",
    linkHowItWorks: "So funktioniert’s",
    linkShipping: "Versand",
    linkReturns: "Rückgabe",

    linksMoreTitle: "Ressourcen & verwandte Seiten",
    linksMoreBody:
      "Weitere nützliche Seiten (FAQ, Blog, Presse und Richtlinien):",
    linkFaq: "FAQ",
    linkBlog: "Blog",
    linkPress: "Presse",
    linkAbout: "Über uns",
    linkContact: "Kontakt",
    linkPrivacy: "Datenschutz",
    linkTerms: "AGB",

    faqTitle: "FAQ – Verlorene Pakete",
    faqIntro: "Kurze Antworten zu verlorenen Paketen und Online-Kauf.",
    faqs: [
      {
        q: "Was sind verlorene Pakete?",
        a: "Nicht zugestellte oder nicht abgeholte Sendungen, die nach Prozessen in manchen Fällen als Liquidationslots verkauft werden können.",
      },
      {
        q: "Wie gehen Pakete verloren?",
        a: "Unvollständige/falsche Adresse, beschädigte Labels, Scan-/Handlingfehler, nicht abgeholte Rücksendungen.",
      },
      {
        q: "Werden sie immer zerstört?",
        a: "Nein. Einige werden zerstört, andere als Lots liquidiert, um Wert zurückzugewinnen.",
      },
      {
        q: "Ist es legal, sie zu kaufen?",
        a: "Ja, wenn sie aus Liquidation stammen und nicht mehr als Standardzustellung abwickelbar sind. Transparenz ist entscheidend.",
      },
      {
        q: "Was kann drin sein?",
        a: "Variabler Inhalt: Elektronik, Zubehör, Kleidung, Haushalt u. a. Keine garantierte Liste.",
      },
      {
        q: "Kann ich zurückgeben?",
        a: "Surprise-/variabler Inhalt ist meist nicht rückgabefähig. Bitte Rückgabe-Policy prüfen.",
      },
      {
        q: "Versand mit Tracking?",
        a: "Ja, Tracking wenn verfügbar. Details auf der Versandseite.",
      },
    ],

    finalTitle: "Bereit für verlorene Pakete?",
    finalBody:
      "Wenn du nach „verlorene Pakete kaufen“ gesucht hast: Hier bekommst du Klarheit und kannst direkt bestellen. Format wählen und unboxen.",
    finalPrimary: "Jetzt kaufen",
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
  const url = `${SITE_URL}/${lang}/pacchi-smarriti`;

  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: url,
      languages: {
        it: `${SITE_URL}/it/pacchi-smarriti`,
        en: `${SITE_URL}/en/pacchi-smarriti`,
        es: `${SITE_URL}/es/pacchi-smarriti`,
        fr: `${SITE_URL}/fr/pacchi-smarriti`,
        de: `${SITE_URL}/de/pacchi-smarriti`,
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
export default function PacchiSmarritiPage({
  params,
}: {
  params: { lang: string };
}) {
  const lang = normLang(params?.lang);
  const c = COPY[lang];
  const pageUrl = `${SITE_URL}/${lang}/pacchi-smarriti`;

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
      {
        "@type": "ListItem",
        position: 1,
        name: "KiloMystery",
        item: `${SITE_URL}/${lang}`,
      },
      { "@type": "ListItem", position: 2, name: c.h1, item: pageUrl },
    ],
  };

  const webPageLd = webPageJsonLd({
    siteUrl: SITE_URL,
    lang,
    title: c.title,
    description: c.description,
  });

  const productStdLd = productJsonLd({
    siteUrl: SITE_URL,
    lang,
    tier: "Standard",
  });
  const productPrmLd = productJsonLd({
    siteUrl: SITE_URL,
    lang,
    tier: "Premium",
  });
  const itemListLd = itemListJsonLd({ siteUrl: SITE_URL, lang });

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-10">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productStdLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productPrmLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />

        {/* HERO */}
        <header className="max-w-3xl">
          <p className="text-white/60 text-sm">{c.seoHubLine}</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2">
            {c.h1}
          </h1>
          <p className="text-white/75 mt-4 text-lg leading-relaxed">
            {c.intro}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${lang}/products`}
              className="btn btn-brand px-6 py-3 font-bold"
            >
              {c.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/how-it-works`}
              className="btn btn-ghost px-6 py-3 font-bold"
            >
              {c.ctaSecondary}
            </Link>
          </div>
        </header>

        {/* VENDITA (commercial intent) */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.venditaTitle}</h2>
          <p className="text-white/75 mt-3 leading-relaxed">
            {c.venditaIntro}
          </p>

          <ul className="mt-4 space-y-2 text-white/75">
            {c.venditaBullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="mt-[2px]">
                  ✅
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/${lang}/products`} className="btn btn-brand">
              {c.linkProducts}
            </Link>
            <Link href={`/${lang}/policy/shipping`} className="btn btn-ghost">
              {c.linkShipping}
            </Link>
            <Link href={`/${lang}/policy/returns`} className="btn btn-ghost">
              {c.linkReturns}
            </Link>
          </div>
        </section>

        {/* WHY */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.whyTitle}</h2>
          <ul className="mt-4 space-y-2 text-white/75">
            {c.whyBullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="mt-[2px]">
                  ✅
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* SECTIONS */}
        <section className="grid md:grid-cols-2 gap-5">
          <article className="card">
            <h2 className="text-2xl font-extrabold">{c.section1Title}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">
              {c.section1Body}
            </p>
          </article>

          <article className="card">
            <h2 className="text-2xl font-extrabold">{c.section2Title}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">
              {c.section2Body}
            </p>
          </article>

          <article className="card md:col-span-2">
            <h2 className="text-2xl font-extrabold">{c.section3Title}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">
              {c.section3Body}
            </p>
          </article>

          <article className="card md:col-span-2">
            <h2 className="text-2xl font-extrabold">{c.section4Title}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">
              {c.section4Body}
            </p>
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

        {/* INTERNAL LINKS (core) */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.linksTitle}</h2>
          <p className="text-white/75 mt-3">{c.linksBody}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/${lang}/products`} className="btn btn-brand">
              {c.linkProducts}
            </Link>
            <Link href={`/${lang}/mystery-box`} className="btn btn-ghost">
              {c.linkMysteryBox}
            </Link>
            <Link href={`/${lang}/how-it-works`} className="btn btn-ghost">
              {c.linkHowItWorks}
            </Link>
            <Link href={`/${lang}/policy/shipping`} className="btn btn-ghost">
              {c.linkShipping}
            </Link>
            <Link href={`/${lang}/policy/returns`} className="btn btn-ghost">
              {c.linkReturns}
            </Link>
          </div>
        </section>

        {/* ✅ INTERNAL LINKS (8–12 total) */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.linksMoreTitle}</h2>
          <p className="text-white/75 mt-3">{c.linksMoreBody}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/${lang}/faq`} className="btn btn-ghost">
              {c.linkFaq}
            </Link>
            <Link href={`/${lang}/blog`} className="btn btn-ghost">
              {c.linkBlog}
            </Link>
            <Link href={`/${lang}/press`} className="btn btn-ghost">
              {c.linkPress}
            </Link>
            <Link href={`/${lang}/about`} className="btn btn-ghost">
              {c.linkAbout}
            </Link>
            <Link href={`/${lang}/contact`} className="btn btn-ghost">
              {c.linkContact}
            </Link>
            <Link href={`/${lang}/policy/privacy`} className="btn btn-ghost">
              {c.linkPrivacy}
            </Link>
            <Link href={`/${lang}/policy/terms`} className="btn btn-ghost">
              {c.linkTerms}
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.faqTitle}</h2>
          <p className="text-white/70 mt-2">{c.faqIntro}</p>

          <div className="mt-5 space-y-3">
            {c.faqs.map((f, idx) => (
              <details
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
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
            <Link
              href={`/${lang}/products`}
              className="btn btn-brand px-7 py-3 font-bold"
            >
              {c.finalPrimary}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="btn btn-ghost px-7 py-3 font-bold"
            >
              {c.finalSecondary}
            </Link>
          </div>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
