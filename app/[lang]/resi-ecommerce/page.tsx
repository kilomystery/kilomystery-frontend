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
  const url = `${siteUrl}/${lang}/resi-ecommerce`;

  const aboutByLang: Record<Lang, string[]> = {
    it: ["resi ecommerce", "resi online", "prodotti restituiti", "stock di reso", "mystery box al kg"],
    en: ["ecommerce returns", "online returns", "returned products", "return stock", "mystery boxes by the kilo"],
    es: ["devoluciones ecommerce", "devoluciones online", "productos devueltos", "stock de devoluciones", "mystery box por kilo"],
    fr: ["retours ecommerce", "retours en ligne", "produits retournés", "stock de retours", "mystery box au kilo"],
    de: ["e-commerce-retouren", "online-retouren", "zurückgesendete produkte", "retourenbestand", "mystery box pro kilo"],
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
    isRelatedTo: [
      { "@type": "WebPage", "@id": `${siteUrl}/${lang}/pacchi-non-reclamati` },
      { "@type": "WebPage", "@id": `${siteUrl}/${lang}/giacenze-ecommerce` },
      { "@type": "WebPage", "@id": `${siteUrl}/${lang}/pacchi-smarriti` },
    ],
  };
}

function productJsonLd(args: { siteUrl: string; lang: Lang; tier: "Standard" | "Premium" }) {
  const { siteUrl, lang, tier } = args;
  const tab = tier === "Standard" ? "std" : "prm";
  const pageUrl = `${siteUrl}/${lang}/resi-ecommerce`;
  const tierAnchor =
    tier === "Standard"
      ? `${siteUrl}/${lang}/products#buy-standard-10`
      : `${siteUrl}/${lang}/products#buy-premium-10`;

  const offers = WEIGHTS.map((kg) => {
    const p = PRICE_TABLE[tab][kg];
    return {
      "@type": "Offer",
      url: tierAnchor,
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
        "Resi ecommerce in formato Standard: contenuto variabile a sorpresa, box sigillata con ID lotto e data, peso 1–10 kg.",
      Premium:
        "Resi ecommerce in formato Premium: contenuto variabile a sorpresa, box sigillata con ID lotto e data, peso 1–10 kg.",
    },
    en: {
      Standard:
        "Ecommerce returns in Standard tier: variable surprise contents, sealed box with batch ID and date, 1–10 kg formats.",
      Premium:
        "Ecommerce returns in Premium tier: variable surprise contents, sealed box with batch ID and date, 1–10 kg formats.",
    },
    es: {
      Standard:
        "Devoluciones ecommerce en formato Standard: contenido sorpresa variable, caja precintada con ID de lote y fecha, 1–10 kg.",
      Premium:
        "Devoluciones ecommerce en formato Premium: contenido sorpresa variable, caja precintada con ID de lote y fecha, 1–10 kg.",
    },
    fr: {
      Standard:
        "Retours ecommerce Standard : contenu surprise variable, box scellée avec ID de lot et date, formats 1–10 kg.",
      Premium:
        "Retours ecommerce Premium : contenu surprise variable, box scellée avec ID de lot et date, formats 1–10 kg.",
    },
    de: {
      Standard:
        "E-Commerce-Retouren (Standard): variabler Überraschungsinhalt, versiegelte Box mit Posten-ID und Datum, 1–10 kg.",
      Premium:
        "E-Commerce-Retouren (Premium): variabler Überraschungsinhalt, versiegelte Box mit Posten-ID und Datum, 1–10 kg.",
    },
  };

  const nameByLang: Record<Lang, Record<"Standard" | "Premium", string>> = {
    it: {
      Standard: "KiloMystery Standard · Resi Ecommerce (1–10 kg)",
      Premium: "KiloMystery Premium · Resi Ecommerce (1–10 kg)",
    },
    en: {
      Standard: "KiloMystery Standard · Ecommerce Returns (1–10 kg)",
      Premium: "KiloMystery Premium · Ecommerce Returns (1–10 kg)",
    },
    es: {
      Standard: "KiloMystery Standard · Devoluciones Ecommerce (1–10 kg)",
      Premium: "KiloMystery Premium · Devoluciones Ecommerce (1–10 kg)",
    },
    fr: {
      Standard: "KiloMystery Standard · Retours Ecommerce (1–10 kg)",
      Premium: "KiloMystery Premium · Retours Ecommerce (1–10 kg)",
    },
    de: {
      Standard: "KiloMystery Standard · E-Commerce-Retouren (1–10 kg)",
      Premium: "KiloMystery Premium · E-Commerce-Retouren (1–10 kg)",
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
      url: tierAnchor,
      priceCurrency: CURRENCY,
      lowPrice,
      highPrice,
      offerCount: WEIGHTS.length,
      offers,
    },
  };
}

function itemListJsonLd(args: { siteUrl: string; lang: Lang }) {
  const { siteUrl, lang } = args;

  const listNameByLang: Record<Lang, string> = {
    it: "KiloMystery — Resi Ecommerce (Standard & Premium) — formati e prezzi",
    en: "KiloMystery — Ecommerce Returns (Standard & Premium) — formats and pricing",
    es: "KiloMystery — Devoluciones Ecommerce (Standard & Premium) — formatos y precios",
    fr: "KiloMystery — Retours Ecommerce (Standard & Premium) — formats et prix",
    de: "KiloMystery — E-Commerce-Retouren (Standard & Premium) — Formate und Preise",
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
        url: tierAnchor,
        name: `${tier} · ${kg} kg`,
        item: {
          "@type": "Product",
          name: `${tier} · ${kg} kg`,
          brand: { "@type": "Brand", name: "KiloMystery" },
          offers: {
            "@type": "Offer",
            url: tierAnchor,
            priceCurrency: CURRENCY,
            price: total,
            availability: "https://schema.org/InStock",
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

const COPY: Record<
  Lang,
  {
    title: string;
    description: string;
    h1: string;
    intro: string;
    whatTitle: string;
    whatBody: string;
    whyTitle: string;
    whyBullets: string[];
    transparencyTitle: string;
    transparencyBody: string;
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
    title: "Resi ecommerce: cosa sono e dove finiscono | KiloMystery",
    description:
      "Cerchi informazioni sui resi ecommerce? Scopri cosa sono, perché esistono e come alcuni stock di reso finiscono in lotti o mystery box al kg.",
    h1: "Resi ecommerce: cosa sono e perché contano",
    intro:
      "Ogni giorno migliaia di prodotti acquistati online vengono restituiti. Non tutti tornano a scaffale come nuovi: molti entrano in stock di reso, lotti logistici o flussi di liquidazione.",
    whatTitle: "Cosa sono i resi ecommerce",
    whatBody:
      "I resi ecommerce sono prodotti acquistati online e poi restituiti dal cliente. Possono essere integri, aperti, con packaging danneggiato o semplicemente non più idonei a un reinserimento nel canale retail classico.",
    whyTitle: "Perché i resi ecommerce finiscono in stock",
    whyBullets: [
      "Costi troppo alti per controllo, reimballo e rimessa in vendita singola.",
      "Packaging aperto o non perfetto.",
      "Prodotti restituiti fuori dal ciclo commerciale ottimale.",
      "Necessità di liberare spazio nei magazzini logistici.",
    ],
    transparencyTitle: "Come li trattiamo su KiloMystery",
    transparencyBody:
      "Le nostre box non promettono articoli specifici o valore garantito. La trasparenza è nel processo: scegli Standard o Premium, scegli il peso, ricevi una box sorpresa con sigillo, lotto e peso netto dichiarato.",
    shopTitle: "Acquista ora (box sorpresa al kg)",
    shopIntro:
      "Scegli Standard o Premium e seleziona il peso. Qui sotto trovi i prodotti disponibili direttamente.",
    linksTitle: "Link interni utili",
    linksBody:
      "Per approfondire il tema dei resi ecommerce e collegarlo alle altre guide:",
    links: [
      { href: "/products", label: "Prodotti" },
      { href: "/pacchi-smarriti", label: "Pacchi Smarriti" },
      { href: "/pacchi-non-reclamati", label: "Pacchi Non Reclamati" },
      { href: "/giacenze-ecommerce", label: "Giacenze Ecommerce" },
      { href: "/mystery-box", label: "Guida Mystery Box" },
      { href: "/how-it-works", label: "Come funziona" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Spedizioni" },
      { href: "/policy/returns", label: "Resi" },
      { href: "/contact", label: "Contatti" },
    ],
    faqTitle: "FAQ – Resi ecommerce",
    faqIntro: "Risposte rapide alle domande più comuni.",
    faqs: [
      {
        q: "Cosa sono i resi ecommerce?",
        a: "Sono prodotti acquistati online e poi restituiti dal cliente per diversi motivi: ripensamento, taglia errata, prodotto non voluto o packaging danneggiato.",
      },
      {
        q: "I resi ecommerce sono sempre usati?",
        a: "Non necessariamente. Alcuni sono nuovi, altri aperti, altri con confezione non perfetta.",
      },
      {
        q: "Perché non tornano tutti in vendita normale?",
        a: "Perché il costo di verifica, gestione e rimessa in vendita può essere troppo alto rispetto al valore del prodotto.",
      },
      {
        q: "Cosa posso trovare nelle box?",
        a: "Contenuto variabile da lotti reali: accessori, elettronica, casa, abbigliamento e altro.",
      },
      {
        q: "Posso fare reso?",
        a: "Di norma no, perché il formato è sorpresa e a contenuto variabile. Consulta la policy Resi.",
      },
    ],
    finalTitle: "Vuoi provare box da resi ecommerce?",
    finalBody:
      "Se cercavi una guida chiara sui resi ecommerce, qui trovi il contesto e l’accesso diretto alle box sorpresa al kg.",
    finalPrimary: "Vai ai prodotti",
    finalSecondary: "Contattaci",
  },

  en: {
    title: "Ecommerce returns: what they are and where they go | KiloMystery",
    description:
      "Looking for information on ecommerce returns? Learn what they are, why they exist, and how some return stock ends up in lots or kilo surprise boxes.",
    h1: "Ecommerce returns: what they are and why they matter",
    intro:
      "Every day, thousands of products bought online are returned. Not all of them go back on shelves as new: many enter return stock, logistics lots, or liquidation flows.",
    whatTitle: "What ecommerce returns are",
    whatBody:
      "Ecommerce returns are products bought online and later returned by the customer. They may be intact, opened, damaged in packaging, or simply not suitable for standard retail resale.",
    whyTitle: "Why ecommerce returns end up in stock",
    whyBullets: [
      "Inspection, repacking, and relisting costs can be too high.",
      "Packaging may be opened or imperfect.",
      "Returned products may no longer fit the normal retail cycle.",
      "Warehouses need to free up logistics space.",
    ],
    transparencyTitle: "How KiloMystery handles them",
    transparencyBody:
      "Our boxes do not promise specific items or guaranteed value. Transparency is in the process: choose Standard or Premium, choose the weight, and receive a sealed surprise box with lot and net weight.",
    shopTitle: "Shop now (kilo surprise boxes)",
    shopIntro: "Choose Standard or Premium and select the weight.",
    linksTitle: "Helpful internal links",
    linksBody: "Use these links to connect ecommerce returns with the other guides:",
    links: [
      { href: "/products", label: "Products" },
      { href: "/pacchi-smarriti", label: "Lost Parcels" },
      { href: "/pacchi-non-reclamati", label: "Unclaimed Parcels" },
      { href: "/giacenze-ecommerce", label: "Ecommerce Overstock" },
      { href: "/mystery-box", label: "Mystery Box Guide" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Shipping" },
      { href: "/policy/returns", label: "Returns" },
      { href: "/contact", label: "Contact" },
    ],
    faqTitle: "FAQ – Ecommerce returns",
    faqIntro: "Quick answers to common questions.",
    faqs: [
      {
        q: "What are ecommerce returns?",
        a: "Products bought online and later returned by the customer for various reasons.",
      },
      {
        q: "Are ecommerce returns always used?",
        a: "Not necessarily. Some are new, some opened, some only have imperfect packaging.",
      },
      {
        q: "Why don’t they all go back into normal sale?",
        a: "Because inspection, handling, and relisting costs can be too high.",
      },
      {
        q: "What can be inside the boxes?",
        a: "Variable contents from real lots: accessories, electronics, home items, clothing, and more.",
      },
      {
        q: "Can I return it?",
        a: "Usually no, because it is a surprise format with variable contents.",
      },
    ],
    finalTitle: "Want to try ecommerce-return boxes?",
    finalBody:
      "If you were looking for a clear guide on ecommerce returns, this page gives you the context and direct access to kilo surprise boxes.",
    finalPrimary: "Go to products",
    finalSecondary: "Contact us",
  },

  es: {
    title: "Devoluciones ecommerce: qué son y dónde terminan | KiloMystery",
    description:
      "¿Buscas información sobre devoluciones ecommerce? Descubre qué son y cómo parte del stock termina en lotes o cajas sorpresa por kilo.",
    h1: "Devoluciones ecommerce: qué son y por qué importan",
    intro:
      "Cada día, miles de productos comprados online son devueltos. No todos vuelven a venderse como nuevos: muchos terminan en stock de devoluciones o flujos de liquidación.",
    whatTitle: "Qué son las devoluciones ecommerce",
    whatBody:
      "Son productos comprados online y después devueltos por el cliente. Pueden estar intactos, abiertos, con embalaje dañado o fuera del ciclo comercial normal.",
    whyTitle: "Por qué terminan en stock",
    whyBullets: [
      "Costes altos de revisión y reacondicionamiento.",
      "Embalaje abierto o imperfecto.",
      "Producto fuera del ciclo comercial normal.",
      "Necesidad de liberar espacio en almacenes.",
    ],
    transparencyTitle: "Cómo los trata KiloMystery",
    transparencyBody:
      "Nuestras cajas no prometen artículos concretos. La transparencia está en el proceso: eliges Standard o Premium, eliges el peso y recibes una caja sorpresa sellada.",
    shopTitle: "Compra ahora (cajas sorpresa por kilo)",
    shopIntro: "Elige Standard o Premium y selecciona el peso.",
    linksTitle: "Enlaces internos útiles",
    linksBody: "Usa estos enlaces para conectar esta guía con las demás:",
    links: [
      { href: "/products", label: "Productos" },
      { href: "/pacchi-smarriti", label: "Paquetes perdidos" },
      { href: "/pacchi-non-reclamati", label: "Paquetes no reclamados" },
      { href: "/giacenze-ecommerce", label: "Stock ecommerce" },
      { href: "/mystery-box", label: "Guía Mystery Box" },
      { href: "/how-it-works", label: "Cómo funciona" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Envíos" },
      { href: "/policy/returns", label: "Devoluciones" },
      { href: "/contact", label: "Contacto" },
    ],
    faqTitle: "FAQ – Devoluciones ecommerce",
    faqIntro: "Respuestas rápidas a preguntas comunes.",
    faqs: [
      {
        q: "¿Qué son las devoluciones ecommerce?",
        a: "Productos comprados online y después devueltos por el cliente.",
      },
      {
        q: "¿Siempre están usados?",
        a: "No necesariamente. Algunos están nuevos, otros abiertos, otros solo con embalaje imperfecto.",
      },
      {
        q: "¿Por qué no vuelven todos a la venta normal?",
        a: "Porque el coste de revisión y gestión puede ser demasiado alto.",
      },
      {
        q: "¿Qué puede venir en las cajas?",
        a: "Contenido variable de lotes reales: accesorios, electrónica, hogar, ropa y más.",
      },
      {
        q: "¿Puedo devolverlo?",
        a: "Normalmente no, porque es un formato sorpresa. Consulta la política de devoluciones.",
      },
    ],
    finalTitle: "¿Quieres probar cajas de devoluciones ecommerce?",
    finalBody:
      "Si buscabas una guía clara sobre devoluciones ecommerce, aquí tienes el contexto y acceso a cajas sorpresa por kilo.",
    finalPrimary: "Ver productos",
    finalSecondary: "Contactar",
  },

  fr: {
    title: "Retours ecommerce : définition et destination | KiloMystery",
    description:
      "Tu cherches des informations sur les retours ecommerce ? Découvre ce que c’est et comment une partie de ce stock finit en lots ou box surprise au kilo.",
    h1: "Retours ecommerce : ce que c’est et pourquoi c’est important",
    intro:
      "Chaque jour, des milliers de produits achetés en ligne sont retournés. Tous ne reviennent pas en vente comme neufs : beaucoup finissent en stock de retours ou en liquidation.",
    whatTitle: "Ce que sont les retours ecommerce",
    whatBody:
      "Ce sont des produits achetés en ligne puis renvoyés par le client. Ils peuvent être intacts, ouverts, avec emballage abîmé ou hors du cycle commercial normal.",
    whyTitle: "Pourquoi ils finissent en stock",
    whyBullets: [
      "Coûts élevés de contrôle et reconditionnement.",
      "Emballage ouvert ou imparfait.",
      "Produit hors du cycle commercial classique.",
      "Besoin de libérer de l’espace logistique.",
    ],
    transparencyTitle: "Comment KiloMystery les traite",
    transparencyBody:
      "Nos box ne promettent pas d’articles précis. La transparence est dans le processus : tu choisis Standard ou Premium, le poids, et tu reçois une box surprise scellée.",
    shopTitle: "Acheter maintenant (box surprise au kilo)",
    shopIntro: "Choisis Standard ou Premium et le poids.",
    linksTitle: "Liens internes utiles",
    linksBody: "Utilise ces liens pour relier cette guide aux autres :",
    links: [
      { href: "/products", label: "Produits" },
      { href: "/pacchi-smarriti", label: "Colis perdus" },
      { href: "/pacchi-non-reclamati", label: "Colis non réclamés" },
      { href: "/giacenze-ecommerce", label: "Stocks ecommerce" },
      { href: "/mystery-box", label: "Guide Mystery Box" },
      { href: "/how-it-works", label: "Comment ça marche" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Livraison" },
      { href: "/policy/returns", label: "Retours" },
      { href: "/contact", label: "Contact" },
    ],
    faqTitle: "FAQ – Retours ecommerce",
    faqIntro: "Réponses rapides aux questions fréquentes.",
    faqs: [
      {
        q: "Que sont les retours ecommerce ?",
        a: "Des produits achetés en ligne puis retournés par le client.",
      },
      {
        q: "Sont-ils toujours utilisés ?",
        a: "Pas forcément. Certains sont neufs, d’autres ouverts ou avec emballage imparfait.",
      },
      {
        q: "Pourquoi ne reviennent-ils pas tous en vente normale ?",
        a: "Parce que le coût de contrôle et de remise en vente peut être trop élevé.",
      },
      {
        q: "Que peut-on trouver dans les box ?",
        a: "Contenu variable issu de lots réels : accessoires, électronique, maison, vêtements et plus.",
      },
      {
        q: "Puis-je retourner ?",
        a: "En général non, car il s’agit d’un format surprise. Voir la politique de retours.",
      },
    ],
    finalTitle: "Tu veux essayer des box de retours ecommerce ?",
    finalBody:
      "Si tu cherchais un guide clair sur les retours ecommerce, cette page te donne le contexte et l’accès aux box surprise au kilo.",
    finalPrimary: "Voir les produits",
    finalSecondary: "Nous contacter",
  },

  de: {
    title: "E-Commerce-Retouren: was sie sind und wohin sie gehen | KiloMystery",
    description:
      "Suchst du Informationen zu E-Commerce-Retouren? Erfahre, was das ist und wie ein Teil dieses Bestands in Lots oder Kilo-Überraschungsboxen endet.",
    h1: "E-Commerce-Retouren: was sie sind und warum sie wichtig sind",
    intro:
      "Jeden Tag werden tausende online gekaufte Produkte zurückgeschickt. Nicht alle kommen als neu zurück in den Verkauf; viele enden im Retourenbestand oder in Liquidationsflüssen.",
    whatTitle: "Was E-Commerce-Retouren sind",
    whatBody:
      "Produkte, die online gekauft und später vom Kunden zurückgesendet wurden. Sie können intakt, geöffnet, mit beschädigter Verpackung oder außerhalb des normalen Verkaufszyklus sein.",
    whyTitle: "Warum sie im Bestand landen",
    whyBullets: [
      "Hohe Kosten für Prüfung und Wiedereinlistung.",
      "Geöffnete oder unperfekte Verpackung.",
      "Produkt außerhalb des normalen Verkaufszyklus.",
      "Notwendigkeit, Lagerfläche freizumachen.",
    ],
    transparencyTitle: "Wie KiloMystery damit umgeht",
    transparencyBody:
      "Unsere Boxen versprechen keine bestimmten Artikel. Die Transparenz liegt im Prozess: Du wählst Standard oder Premium, das Gewicht und erhältst eine versiegelte Überraschungsbox.",
    shopTitle: "Jetzt kaufen (Kilo-Überraschungsboxen)",
    shopIntro: "Wähle Standard oder Premium und das Gewicht.",
    linksTitle: "Nützliche interne Links",
    linksBody: "Nutze diese Links, um diesen Guide mit den anderen zu verbinden:",
    links: [
      { href: "/products", label: "Produkte" },
      { href: "/pacchi-smarriti", label: "Verlorene Pakete" },
      { href: "/pacchi-non-reclamati", label: "Nicht abgeholte Pakete" },
      { href: "/giacenze-ecommerce", label: "E-Commerce-Lagerbestände" },
      { href: "/mystery-box", label: "Mystery-Box-Guide" },
      { href: "/how-it-works", label: "So funktioniert’s" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Versand" },
      { href: "/policy/returns", label: "Rückgabe" },
      { href: "/contact", label: "Kontakt" },
    ],
    faqTitle: "FAQ – E-Commerce-Retouren",
    faqIntro: "Kurze Antworten auf häufige Fragen.",
    faqs: [
      {
        q: "Was sind E-Commerce-Retouren?",
        a: "Produkte, die online gekauft und später vom Kunden zurückgegeben wurden.",
      },
      {
        q: "Sind sie immer gebraucht?",
        a: "Nicht unbedingt. Einige sind neu, andere geöffnet oder nur mit unperfekter Verpackung.",
      },
      {
        q: "Warum gehen nicht alle zurück in den normalen Verkauf?",
        a: "Weil Prüfung, Handling und Wiedereinlistung zu teuer sein können.",
      },
      {
        q: "Was kann in den Boxen sein?",
        a: "Variabler Inhalt aus realen Lots: Zubehör, Elektronik, Haushalt, Kleidung und mehr.",
      },
      {
        q: "Kann ich zurückgeben?",
        a: "Meistens nein, da es ein Überraschungsformat ist. Siehe Rückgabe-Policy.",
      },
    ],
    finalTitle: "Möchtest du Boxen aus E-Commerce-Retouren probieren?",
    finalBody:
      "Wenn du einen klaren Guide zu E-Commerce-Retouren gesucht hast, findest du hier Kontext und Zugang zu Kilo-Überraschungsboxen.",
    finalPrimary: "Zu den Produkten",
    finalSecondary: "Kontakt",
  },
};

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = normLang(params?.lang);
  const c = COPY[lang];
  const url = `${SITE_URL}/${lang}/resi-ecommerce`;

  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: url,
      languages: {
        it: `${SITE_URL}/it/resi-ecommerce`,
        en: `${SITE_URL}/en/resi-ecommerce`,
        es: `${SITE_URL}/es/resi-ecommerce`,
        fr: `${SITE_URL}/fr/resi-ecommerce`,
        de: `${SITE_URL}/de/resi-ecommerce`,
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

export default function ResiEcommercePage({
  params,
}: {
  params: { lang: string };
}) {
  const lang = normLang(params?.lang);
  const c = COPY[lang];
  const pageUrl = `${SITE_URL}/${lang}/resi-ecommerce`;

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productStdLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productPrmLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

        <header className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{c.h1}</h1>
          <p className="text-white/75 mt-4 text-lg leading-relaxed">{c.intro}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${lang}/products`} className="btn btn-brand px-6 py-3 font-bold">
              {c.finalPrimary}
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

        <section className="grid md:grid-cols-2 gap-5">
          <article className="card">
            <h2 className="text-2xl font-extrabold">{c.whatTitle}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">{c.whatBody}</p>
          </article>

          <article className="card">
            <h2 className="text-2xl font-extrabold">{c.whyTitle}</h2>
            <ul className="mt-4 space-y-2 text-white/75">
              {c.whyBullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="mt-[2px]">✅</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="card md:col-span-2">
            <h2 className="text-2xl font-extrabold">{c.transparencyTitle}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">{c.transparencyBody}</p>
          </article>
        </section>

        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.shopTitle}</h2>
          <p className="text-white/75 mt-3 leading-relaxed">{c.shopIntro}</p>
          <div className="mt-6">
            <ProductsTabs lang={lang} />
          </div>
        </section>

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