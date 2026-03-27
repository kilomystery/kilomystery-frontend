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
  const url = `${siteUrl}/${lang}/giacenze-ecommerce`;

  const aboutByLang: Record<Lang, string[]> = {
    it: ["giacenze ecommerce", "stock invenduto", "giacenze di magazzino", "prodotti fermi", "mystery box al kg"],
    en: ["ecommerce overstock", "unsold stock", "warehouse overstock", "slow-moving inventory", "mystery boxes by the kilo"],
    es: ["stock ecommerce", "stock no vendido", "exceso de inventario", "productos en almacén", "mystery box por kilo"],
    fr: ["stocks ecommerce", "stock invendu", "surstock entrepôt", "produits immobilisés", "mystery box au kilo"],
    de: ["e-commerce-lagerbestände", "unverkaufter bestand", "lagerüberbestand", "langsam drehender bestand", "mystery box pro kilo"],
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
      { "@type": "WebPage", "@id": `${siteUrl}/${lang}/resi-ecommerce` },
      { "@type": "WebPage", "@id": `${siteUrl}/${lang}/pacchi-non-reclamati` },
      { "@type": "WebPage", "@id": `${siteUrl}/${lang}/pacchi-smarriti` },
    ],
  };
}

function productJsonLd(args: { siteUrl: string; lang: Lang; tier: "Standard" | "Premium" }) {
  const { siteUrl, lang, tier } = args;
  const tab = tier === "Standard" ? "std" : "prm";
  const pageUrl = `${siteUrl}/${lang}/giacenze-ecommerce`;
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
        "Giacenze ecommerce in formato Standard: contenuto variabile a sorpresa, box sigillata con ID lotto e data, peso 1–10 kg.",
      Premium:
        "Giacenze ecommerce in formato Premium: contenuto variabile a sorpresa, box sigillata con ID lotto e data, peso 1–10 kg.",
    },
    en: {
      Standard:
        "Ecommerce overstock in Standard tier: variable surprise contents, sealed box with batch ID and date, 1–10 kg formats.",
      Premium:
        "Ecommerce overstock in Premium tier: variable surprise contents, sealed box with batch ID and date, 1–10 kg formats.",
    },
    es: {
      Standard:
        "Stock ecommerce en formato Standard: contenido sorpresa variable, caja precintada con ID de lote y fecha, 1–10 kg.",
      Premium:
        "Stock ecommerce en formato Premium: contenido sorpresa variable, caja precintada con ID de lote y fecha, 1–10 kg.",
    },
    fr: {
      Standard:
        "Stocks ecommerce Standard : contenu surprise variable, box scellée avec ID de lot et date, formats 1–10 kg.",
      Premium:
        "Stocks ecommerce Premium : contenu surprise variable, box scellée avec ID de lot et date, formats 1–10 kg.",
    },
    de: {
      Standard:
        "E-Commerce-Lagerbestände (Standard): variabler Überraschungsinhalt, versiegelte Box mit Posten-ID und Datum, 1–10 kg.",
      Premium:
        "E-Commerce-Lagerbestände (Premium): variabler Überraschungsinhalt, versiegelte Box mit Posten-ID und Datum, 1–10 kg.",
    },
  };

  const nameByLang: Record<Lang, Record<"Standard" | "Premium", string>> = {
    it: {
      Standard: "KiloMystery Standard · Giacenze Ecommerce (1–10 kg)",
      Premium: "KiloMystery Premium · Giacenze Ecommerce (1–10 kg)",
    },
    en: {
      Standard: "KiloMystery Standard · Ecommerce Overstock (1–10 kg)",
      Premium: "KiloMystery Premium · Ecommerce Overstock (1–10 kg)",
    },
    es: {
      Standard: "KiloMystery Standard · Stock Ecommerce (1–10 kg)",
      Premium: "KiloMystery Premium · Stock Ecommerce (1–10 kg)",
    },
    fr: {
      Standard: "KiloMystery Standard · Stocks Ecommerce (1–10 kg)",
      Premium: "KiloMystery Premium · Stocks Ecommerce (1–10 kg)",
    },
    de: {
      Standard: "KiloMystery Standard · E-Commerce-Lagerbestände (1–10 kg)",
      Premium: "KiloMystery Premium · E-Commerce-Lagerbestände (1–10 kg)",
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
    it: "KiloMystery — Giacenze Ecommerce (Standard & Premium) — formati e prezzi",
    en: "KiloMystery — Ecommerce Overstock (Standard & Premium) — formats and pricing",
    es: "KiloMystery — Stock Ecommerce (Standard & Premium) — formatos y precios",
    fr: "KiloMystery — Stocks Ecommerce (Standard & Premium) — formats et prix",
    de: "KiloMystery — E-Commerce-Lagerbestände (Standard & Premium) — Formate und Preise",
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
    sustainabilityTitle: string;
    sustainabilityBody: string;
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
    title: "Giacenze ecommerce: cosa sono e perché finiscono in stock | KiloMystery",
    description:
      "Cerchi informazioni sulle giacenze ecommerce? Scopri cosa sono, perché si accumulano e come alcuni stock diventano box sorpresa al kg.",
    h1: "Giacenze ecommerce: cosa sono e perché esistono",
    intro:
      "Le giacenze ecommerce sono prodotti fermi in magazzino che non vengono più gestiti come singole vendite normali. Possono derivare da invenduto, rotazione lenta, fine serie, resi o riorganizzazioni di stock.",
    whatTitle: "Cosa sono le giacenze ecommerce",
    whatBody:
      "Sono prodotti che restano bloccati o rallentati nei magazzini logistici. Non sempre sono articoli problematici: spesso sono semplicemente merci fuori ciclo, con domanda bassa o costi troppo alti di rilancio singolo.",
    whyTitle: "Perché si accumulano le giacenze",
    whyBullets: [
      "Fine stagione o cambi di catalogo.",
      "Prodotti con bassa rotazione.",
      "Riorganizzazione dei magazzini.",
      "Costi alti di gestione e riallocazione singola.",
    ],
    sustainabilityTitle: "Perché le giacenze possono diventare un’opportunità",
    sustainabilityBody:
      "Invece di restare ferme per mesi o essere smaltite, una parte delle giacenze può essere recuperata in lotti. Questo riduce sprechi, libera spazio e dà una seconda vita a prodotti già esistenti.",
    shopTitle: "Acquista ora (box sorpresa al kg)",
    shopIntro:
      "Scegli Standard o Premium e seleziona il peso. Qui sotto trovi le box disponibili direttamente.",
    linksTitle: "Link interni utili",
    linksBody:
      "Per collegare il tema delle giacenze ecommerce alle altre guide:",
    links: [
      { href: "/products", label: "Prodotti" },
      { href: "/pacchi-smarriti", label: "Pacchi Smarriti" },
      { href: "/pacchi-non-reclamati", label: "Pacchi Non Reclamati" },
      { href: "/resi-ecommerce", label: "Resi Ecommerce" },
      { href: "/mystery-box", label: "Guida Mystery Box" },
      { href: "/how-it-works", label: "Come funziona" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Spedizioni" },
      { href: "/policy/returns", label: "Resi" },
      { href: "/contact", label: "Contatti" },
    ],
    faqTitle: "FAQ – Giacenze ecommerce",
    faqIntro: "Risposte rapide alle domande più comuni.",
    faqs: [
      {
        q: "Cosa sono le giacenze ecommerce?",
        a: "Prodotti fermi in magazzino che non vengono più gestiti come vendita singola standard.",
      },
      {
        q: "Le giacenze sono prodotti difettosi?",
        a: "Non necessariamente. Possono essere semplicemente prodotti invenduti, fuori stagione o a rotazione lenta.",
      },
      {
        q: "Perché non vengono venduti normalmente?",
        a: "Perché la gestione singola può costare troppo o non essere più efficiente rispetto alla vendita in stock.",
      },
      {
        q: "Cosa posso trovare dentro le box?",
        a: "Contenuti variabili da lotti reali: accessori, casa, elettronica, abbigliamento e altro.",
      },
      {
        q: "Posso fare reso?",
        a: "Di norma no, perché si tratta di un formato sorpresa. Consulta la policy Resi.",
      },
    ],
    finalTitle: "Vuoi provare box da giacenze ecommerce?",
    finalBody:
      "Se cercavi una guida semplice sulle giacenze ecommerce, qui trovi il contesto e l’accesso diretto alle box sorpresa al kg.",
    finalPrimary: "Vai ai prodotti",
    finalSecondary: "Contattaci",
  },

  en: {
    title: "Ecommerce overstock: what it is and why it becomes stock | KiloMystery",
    description:
      "Looking for information on ecommerce overstock? Learn what it is, why it builds up, and how some stock becomes kilo surprise boxes.",
    h1: "Ecommerce overstock: what it is and why it exists",
    intro:
      "Ecommerce overstock refers to products sitting in warehouses that are no longer handled as normal single-item retail sales. It may come from unsold stock, slow-moving inventory, end-of-line items, returns, or stock reorganizations.",
    whatTitle: "What ecommerce overstock is",
    whatBody:
      "These are products that remain blocked or slowed down in logistics warehouses. They are not always problematic items: often they are simply out-of-cycle goods, slow-moving products, or items too costly to relaunch individually.",
    whyTitle: "Why overstock builds up",
    whyBullets: [
      "End of season or catalog changes.",
      "Slow-moving inventory.",
      "Warehouse reorganizations.",
      "High costs of single-item handling and reallocation.",
    ],
    sustainabilityTitle: "Why overstock can become an opportunity",
    sustainabilityBody:
      "Instead of staying in storage for months or being disposed of, part of overstock can be recovered in lots. This reduces waste, frees up space, and gives existing products a second life.",
    shopTitle: "Shop now (kilo surprise boxes)",
    shopIntro: "Choose Standard or Premium and select the weight.",
    linksTitle: "Helpful internal links",
    linksBody: "Use these links to connect overstock with the other guides:",
    links: [
      { href: "/products", label: "Products" },
      { href: "/pacchi-smarriti", label: "Lost Parcels" },
      { href: "/pacchi-non-reclamati", label: "Unclaimed Parcels" },
      { href: "/resi-ecommerce", label: "Ecommerce Returns" },
      { href: "/mystery-box", label: "Mystery Box Guide" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Shipping" },
      { href: "/policy/returns", label: "Returns" },
      { href: "/contact", label: "Contact" },
    ],
    faqTitle: "FAQ – Ecommerce overstock",
    faqIntro: "Quick answers to common questions.",
    faqs: [
      {
        q: "What is ecommerce overstock?",
        a: "Products sitting in warehouses that are no longer handled as normal single-item retail inventory.",
      },
      {
        q: "Is overstock always defective?",
        a: "Not necessarily. It can simply be unsold, out-of-season, or slow-moving inventory.",
      },
      {
        q: "Why isn’t it sold normally?",
        a: "Because single-item handling and relisting may be too expensive or inefficient.",
      },
      {
        q: "What can be inside the boxes?",
        a: "Variable contents from real lots: accessories, home items, electronics, clothing, and more.",
      },
      {
        q: "Can I return it?",
        a: "Usually no, because it is a surprise format. Check the Returns policy.",
      },
    ],
    finalTitle: "Want to try ecommerce-overstock boxes?",
    finalBody:
      "If you were looking for a simple guide to ecommerce overstock, this page gives you the context and direct access to kilo surprise boxes.",
    finalPrimary: "Go to products",
    finalSecondary: "Contact us",
  },

  es: {
    title: "Stock ecommerce: qué es y por qué termina en lotes | KiloMystery",
    description:
      "¿Buscas información sobre stock ecommerce? Descubre qué es, por qué se acumula y cómo parte de ese stock termina en cajas sorpresa por kilo.",
    h1: "Stock ecommerce: qué es y por qué existe",
    intro:
      "El stock ecommerce son productos parados en almacenes que ya no se gestionan como venta individual normal. Puede venir de invendidos, baja rotación, final de serie, devoluciones o reorganizaciones.",
    whatTitle: "Qué es el stock ecommerce",
    whatBody:
      "Son productos bloqueados o ralentizados en almacenes logísticos. No siempre son problemáticos: muchas veces son mercancías fuera de ciclo o demasiado costosas de relanzar individualmente.",
    whyTitle: "Por qué se acumula",
    whyBullets: [
      "Final de temporada o cambios de catálogo.",
      "Productos de baja rotación.",
      "Reorganización de almacenes.",
      "Costes altos de gestión individual.",
    ],
    sustainabilityTitle: "Por qué puede ser una oportunidad",
    sustainabilityBody:
      "En lugar de quedar meses parados o ser desechados, parte del stock puede recuperarse en lotes. Esto reduce desperdicio y libera espacio.",
    shopTitle: "Compra ahora (cajas sorpresa por kilo)",
    shopIntro: "Elige Standard o Premium y selecciona el peso.",
    linksTitle: "Enlaces internos útiles",
    linksBody: "Usa estos enlaces para conectar esta guía con las otras:",
    links: [
      { href: "/products", label: "Productos" },
      { href: "/pacchi-smarriti", label: "Paquetes perdidos" },
      { href: "/pacchi-non-reclamati", label: "Paquetes no reclamados" },
      { href: "/resi-ecommerce", label: "Devoluciones ecommerce" },
      { href: "/mystery-box", label: "Guía Mystery Box" },
      { href: "/how-it-works", label: "Cómo funciona" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Envíos" },
      { href: "/policy/returns", label: "Devoluciones" },
      { href: "/contact", label: "Contacto" },
    ],
    faqTitle: "FAQ – Stock ecommerce",
    faqIntro: "Respuestas rápidas a preguntas comunes.",
    faqs: [
      {
        q: "¿Qué es el stock ecommerce?",
        a: "Productos parados en almacenes que ya no se gestionan como inventario individual normal.",
      },
      {
        q: "¿Siempre está defectuoso?",
        a: "No. Puede ser simplemente invendido, fuera de temporada o de baja rotación.",
      },
      {
        q: "¿Por qué no se vende normalmente?",
        a: "Porque la gestión individual puede ser demasiado cara o ineficiente.",
      },
      {
        q: "¿Qué puede venir dentro?",
        a: "Contenido variable de lotes reales: accesorios, hogar, electrónica, ropa y más.",
      },
      {
        q: "¿Puedo devolverlo?",
        a: "Normalmente no, porque es un formato sorpresa. Consulta la política de devoluciones.",
      },
    ],
    finalTitle: "¿Quieres probar cajas de stock ecommerce?",
    finalBody:
      "Si buscabas una guía sencilla sobre stock ecommerce, aquí tienes el contexto y el acceso a cajas sorpresa por kilo.",
    finalPrimary: "Ver productos",
    finalSecondary: "Contactar",
  },

  fr: {
    title: "Stocks ecommerce : définition et pourquoi ils finissent en lots | KiloMystery",
    description:
      "Tu cherches des infos sur les stocks ecommerce ? Découvre ce que c’est, pourquoi ils s’accumulent et comment une partie finit en box surprise au kilo.",
    h1: "Stocks ecommerce : ce que c’est et pourquoi ils existent",
    intro:
      "Les stocks ecommerce sont des produits immobilisés en entrepôt qui ne sont plus gérés comme des ventes unitaires normales. Ils peuvent provenir d’invendus, de faible rotation, de fins de série, de retours ou de réorganisations.",
    whatTitle: "Ce que sont les stocks ecommerce",
    whatBody:
      "Ce sont des produits bloqués ou ralentis dans des entrepôts logistiques. Ils ne sont pas forcément problématiques : souvent, ils sont simplement hors cycle ou trop coûteux à relancer unitairement.",
    whyTitle: "Pourquoi ils s’accumulent",
    whyBullets: [
      "Fin de saison ou changement de catalogue.",
      "Produits à faible rotation.",
      "Réorganisation des entrepôts.",
      "Coûts élevés de gestion unitaire.",
    ],
    sustainabilityTitle: "Pourquoi cela peut devenir une opportunité",
    sustainabilityBody:
      "Au lieu de rester des mois en entrepôt ou d’être détruits, une partie du stock peut être récupérée en lots. Cela réduit le gaspillage et libère de l’espace.",
    shopTitle: "Acheter maintenant (box surprise au kilo)",
    shopIntro: "Choisis Standard ou Premium et le poids.",
    linksTitle: "Liens internes utiles",
    linksBody: "Utilise ces liens pour relier ce guide aux autres :",
    links: [
      { href: "/products", label: "Produits" },
      { href: "/pacchi-smarriti", label: "Colis perdus" },
      { href: "/pacchi-non-reclamati", label: "Colis non réclamés" },
      { href: "/resi-ecommerce", label: "Retours ecommerce" },
      { href: "/mystery-box", label: "Guide Mystery Box" },
      { href: "/how-it-works", label: "Comment ça marche" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Livraison" },
      { href: "/policy/returns", label: "Retours" },
      { href: "/contact", label: "Contact" },
    ],
    faqTitle: "FAQ – Stocks ecommerce",
    faqIntro: "Réponses rapides aux questions fréquentes.",
    faqs: [
      {
        q: "Que sont les stocks ecommerce ?",
        a: "Des produits immobilisés en entrepôt qui ne sont plus gérés comme du stock unitaire classique.",
      },
      {
        q: "Sont-ils toujours défectueux ?",
        a: "Non. Ils peuvent simplement être invendus, hors saison ou à faible rotation.",
      },
      {
        q: "Pourquoi ne sont-ils pas revendus normalement ?",
        a: "Parce que la gestion unitaire peut être trop coûteuse ou inefficace.",
      },
      {
        q: "Que peut-on trouver dans les box ?",
        a: "Contenu variable issu de lots réels : accessoires, maison, électronique, vêtements et plus.",
      },
      {
        q: "Puis-je retourner ?",
        a: "En général non, car il s’agit d’un format surprise. Voir la politique de retours.",
      },
    ],
    finalTitle: "Tu veux essayer des box de stocks ecommerce ?",
    finalBody:
      "Si tu cherchais un guide simple sur les stocks ecommerce, cette page te donne le contexte et l’accès aux box surprise au kilo.",
    finalPrimary: "Voir les produits",
    finalSecondary: "Nous contacter",
  },

  de: {
    title: "E-Commerce-Lagerbestände: was sie sind und warum sie in Lots enden | KiloMystery",
    description:
      "Suchst du Informationen zu E-Commerce-Lagerbeständen? Erfahre, was das ist, warum sie sich aufbauen und wie ein Teil in Kilo-Überraschungsboxen endet.",
    h1: "E-Commerce-Lagerbestände: was sie sind und warum sie existieren",
    intro:
      "E-Commerce-Lagerbestände sind Produkte, die im Lager verbleiben und nicht mehr als normale Einzelverkäufe behandelt werden. Sie können aus Überbestand, langsamer Rotation, End-of-Line-Artikeln, Retouren oder Umstrukturierungen stammen.",
    whatTitle: "Was E-Commerce-Lagerbestände sind",
    whatBody:
      "Produkte, die in Logistiklagern blockiert oder verlangsamt sind. Sie sind nicht immer problematisch: oft sind es einfach Waren außerhalb des Zyklus oder zu teuer für einen Einzelrelaunch.",
    whyTitle: "Warum sie sich aufbauen",
    whyBullets: [
      "Saisonende oder Katalogwechsel.",
      "Langsam drehender Bestand.",
      "Lagerumstrukturierungen.",
      "Hohe Kosten für Einzelhandling.",
    ],
    sustainabilityTitle: "Warum sie eine Chance sein können",
    sustainabilityBody:
      "Statt monatelang liegen zu bleiben oder entsorgt zu werden, kann ein Teil dieses Bestands in Lots verwertet werden. Das reduziert Verschwendung und schafft Platz.",
    shopTitle: "Jetzt kaufen (Kilo-Überraschungsboxen)",
    shopIntro: "Wähle Standard oder Premium und das Gewicht.",
    linksTitle: "Nützliche interne Links",
    linksBody: "Nutze diese Links, um diesen Guide mit den anderen zu verbinden:",
    links: [
      { href: "/products", label: "Produkte" },
      { href: "/pacchi-smarriti", label: "Verlorene Pakete" },
      { href: "/pacchi-non-reclamati", label: "Nicht abgeholte Pakete" },
      { href: "/resi-ecommerce", label: "E-Commerce-Retouren" },
      { href: "/mystery-box", label: "Mystery-Box-Guide" },
      { href: "/how-it-works", label: "So funktioniert’s" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Versand" },
      { href: "/policy/returns", label: "Rückgabe" },
      { href: "/contact", label: "Kontakt" },
    ],
    faqTitle: "FAQ – E-Commerce-Lagerbestände",
    faqIntro: "Kurze Antworten auf häufige Fragen.",
    faqs: [
      {
        q: "Was sind E-Commerce-Lagerbestände?",
        a: "Produkte, die im Lager verbleiben und nicht mehr als normales Einzelinventar behandelt werden.",
      },
      {
        q: "Sind sie immer defekt?",
        a: "Nein. Sie können einfach unverkauft, außerhalb der Saison oder langsam drehend sein.",
      },
      {
        q: "Warum werden sie nicht normal verkauft?",
        a: "Weil Einzelhandling und Wiedereinlistung zu teuer oder ineffizient sein können.",
      },
      {
        q: "Was kann in den Boxen sein?",
        a: "Variabler Inhalt aus realen Lots: Zubehör, Haushalt, Elektronik, Kleidung und mehr.",
      },
      {
        q: "Kann ich zurückgeben?",
        a: "Meistens nein, da es sich um ein Überraschungsformat handelt. Siehe Rückgabe-Policy.",
      },
    ],
    finalTitle: "Möchtest du Boxen aus E-Commerce-Lagerbeständen testen?",
    finalBody:
      "Wenn du einen einfachen Guide zu E-Commerce-Lagerbeständen gesucht hast, findest du hier Kontext und direkten Zugang zu Kilo-Überraschungsboxen.",
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
  const url = `${SITE_URL}/${lang}/giacenze-ecommerce`;

  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: url,
      languages: {
        it: `${SITE_URL}/it/giacenze-ecommerce`,
        en: `${SITE_URL}/en/giacenze-ecommerce`,
        es: `${SITE_URL}/es/giacenze-ecommerce`,
        fr: `${SITE_URL}/fr/giacenze-ecommerce`,
        de: `${SITE_URL}/de/giacenze-ecommerce`,
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

export default function GiacenzeEcommercePage({
  params,
}: {
  params: { lang: string };
}) {
  const lang = normLang(params?.lang);
  const c = COPY[lang];
  const pageUrl = `${SITE_URL}/${lang}/giacenze-ecommerce`;

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
            <h2 className="text-2xl font-extrabold">{c.sustainabilityTitle}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">{c.sustainabilityBody}</p>
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