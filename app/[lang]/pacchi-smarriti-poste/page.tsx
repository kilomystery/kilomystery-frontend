// app/[lang]/pacchi-smarriti-poste/page.tsx
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
  const url = `${siteUrl}/${lang}/pacchi-smarriti-poste`;

  const aboutByLang: Record<Lang, string[]> = {
    it: [
      "pacchi smarriti poste",
      "pacchi poste non consegnati",
      "pacchi in giacenza",
      "pacchi non reclamati",
      "vendita pacchi smarriti",
    ],
    en: [
      "poste italiane lost parcels",
      "undelivered poste parcels",
      "parcels in storage",
      "unclaimed parcels",
      "lost parcels for sale",
    ],
    es: [
      "paquetes perdidos poste italiane",
      "paquetes no entregados",
      "paquetes en almacén",
      "paquetes no reclamados",
      "venta de paquetes perdidos",
    ],
    fr: [
      "colis perdus poste italiane",
      "colis non livrés",
      "colis en instance",
      "colis non réclamés",
      "vente de colis perdus",
    ],
    de: [
      "poste italiane verlorene pakete",
      "nicht zugestellte poste pakete",
      "pakete in lagerung",
      "nicht abgeholte pakete",
      "verlorene pakete kaufen",
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
  const pageUrl = `${siteUrl}/${lang}/pacchi-smarriti-poste`;

  // ✅ Offer URL: deep link conversione su products (10kg)
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
        "Pacchi smarriti (intento Poste) in formato Standard: contenuto variabile a sorpresa, box sigillata con ID lotto e data, peso 1–10 kg.",
      Premium:
        "Pacchi smarriti (intento Poste) in formato Premium: contenuto variabile a sorpresa, box sigillata con ID lotto e data, peso 1–10 kg.",
    },
    en: {
      Standard:
        "Poste-style lost parcels in Standard tier: variable surprise contents, sealed box with batch ID and date, 1–10 kg formats.",
      Premium:
        "Poste-style lost parcels in Premium tier: variable surprise contents, sealed box with batch ID and date, 1–10 kg formats.",
    },
    es: {
      Standard:
        "Paquetes perdidos (intención Poste) Standard: contenido sorpresa variable, caja precintada con ID de lote y fecha, 1–10 kg.",
      Premium:
        "Paquetes perdidos (intención Poste) Premium: contenido sorpresa variable, caja precintada con ID de lote y fecha, 1–10 kg.",
    },
    fr: {
      Standard:
        "Colis perdus (intention Poste) Standard : contenu surprise variable, box scellée avec ID de lot et date, formats 1–10 kg.",
      Premium:
        "Colis perdus (intention Poste) Premium : contenu surprise variable, box scellée avec ID de lot et date, formats 1–10 kg.",
    },
    de: {
      Standard:
        "Poste-ähnliche verlorene Pakete (Standard): variabler Überraschungsinhalt, versiegelte Box mit Posten-ID und Datum, 1–10 kg.",
      Premium:
        "Poste-ähnliche verlorene Pakete (Premium): variabler Überraschungsinhalt, versiegelte Box mit Posten-ID und Datum, 1–10 kg.",
    },
  };

  const nameByLang: Record<Lang, Record<"Standard" | "Premium", string>> = {
    it: {
      Standard: "KiloMystery Standard · Pacchi Smarriti Poste (1–10 kg)",
      Premium: "KiloMystery Premium · Pacchi Smarriti Poste (1–10 kg)",
    },
    en: {
      Standard: "KiloMystery Standard · Poste Lost Parcels (1–10 kg)",
      Premium: "KiloMystery Premium · Poste Lost Parcels (1–10 kg)",
    },
    es: {
      Standard: "KiloMystery Standard · Paquetes Perdidos Poste (1–10 kg)",
      Premium: "KiloMystery Premium · Paquetes Perdidos Poste (1–10 kg)",
    },
    fr: {
      Standard: "KiloMystery Standard · Colis Perdus Poste (1–10 kg)",
      Premium: "KiloMystery Premium · Colis Perdus Poste (1–10 kg)",
    },
    de: {
      Standard: "KiloMystery Standard · Poste Verlorene Pakete (1–10 kg)",
      Premium: "KiloMystery Premium · Poste Verlorene Pakete (1–10 kg)",
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
  const pageUrl = `${siteUrl}/${lang}/pacchi-smarriti-poste`;

  const listNameByLang: Record<Lang, string> = {
    it: "KiloMystery — Pacchi Smarriti Poste (Standard & Premium) — formati e prezzi",
    en: "KiloMystery — Poste Lost Parcels (Standard & Premium) — formats and pricing",
    es: "KiloMystery — Paquetes Perdidos Poste (Standard & Premium) — formatos y precios",
    fr: "KiloMystery — Colis Perdus Poste (Standard & Premium) — formats et prix",
    de: "KiloMystery — Poste Verlorene Pakete (Standard & Premium) — Formate und Preise",
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
            url: `${siteUrl}/${lang}/products`,
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

    giacenzaTitle: string;
    giacenzaBody: string;

    causeTitle: string;
    causeBullets: string[];

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
    title: "Pacchi smarriti Poste: pacchi in giacenza e non reclamati | KiloMystery",
    description:
      "Cerchi pacchi smarriti Poste o pacchi in giacenza non reclamati? Scopri cosa significa, perché succede e acquista box sorpresa Standard/Premium da 1 a 10 kg.",
    h1: "Pacchi smarriti Poste: cosa sono e cosa succede ai pacchi in giacenza",
    intro:
      "Molti cercano “pacchi smarriti Poste” o “pacchi in giacenza” per capire dove finiscono i colli non consegnati o non reclamati. Qui trovi una spiegazione semplice e un modo diretto per acquistare box sorpresa al kg (Standard o Premium).",
    disclaimer:
      "Nota: questa pagina è informativa. KiloMystery non è affiliata a Poste Italiane. “Poste” indica l’intento di ricerca (giacenza, non consegnati, non reclamati).",

    venditaTitle: "Vendita pacchi smarriti Poste: formati e prezzi",
    venditaIntro:
      "Su KiloMystery acquisti box sorpresa al kg (1–10 kg) scegliendo Standard o Premium. Il contenuto è variabile: la trasparenza è nel processo (peso, sigillo, lotto), non nelle promesse.",
    venditaBullets: [
      "Standard/Premium: due livelli di selezione, stesso formato sorpresa.",
      "Formati 1, 2, 3, 5, 10 kg con prezzi chiari (€/kg).",
      "Peso netto con tolleranza ±3% e sigillo con ID lotto e data.",
      "Spedizione e tracking secondo policy (quando disponibili).",
    ],

    giacenzaTitle: "Pacchi in giacenza: cosa significa",
    giacenzaBody:
      "“Giacenza” indica che il pacco è fermo in un centro/postazione perché la consegna non è andata a buon fine (assenza, indirizzo incompleto, problemi di accesso) oppure perché richiede un ritiro. Se non viene reclamato entro i tempi previsti, può avviare procedure di rientro o gestione stock.",
    causeTitle: "Perché un pacco può risultare non consegnato o smarrito",
    causeBullets: [
      "Indirizzo errato o incompleto, CAP non corretto.",
      "Etichetta illeggibile o danneggiata durante il trasporto.",
      "Mancata presenza o impossibilità di consegna (accesso, citofono, ecc.).",
      "Ritiro non effettuato dopo avviso e periodo di giacenza.",
    ],

    legalTitle: "È legale acquistare pacchi “smarriti”?",
    legalBody:
      "Sì, quando provengono da processi di liquidazione e non sono più gestibili come consegne standard. Diffida da promesse “valore garantito”: in questo tipo di stock conta la variabilità.",
    shopTitle: "Acquista ora (box sorpresa al kg)",
    shopIntro:
      "Scegli Standard o Premium e seleziona il peso. Qui sotto trovi i prodotti disponibili direttamente in pagina.",

    linksTitle: "Link interni utili",
    linksBody:
      "Per approfondire e aumentare fiducia (spedizioni, resi, guida), usa questi link:",
    links: [
      { href: "/products", label: "Prodotti" },
      { href: "/pacchi-smarriti", label: "Pacchi Smarriti (guida generale)" },
      { href: "/pacchi-smarriti-amazon", label: "Pacchi Smarriti Amazon (guida)" },
      { href: "/mystery-box", label: "Guida Mystery Box" },
      { href: "/how-it-works", label: "Come funziona" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Spedizioni" },
      { href: "/policy/returns", label: "Resi" },
      { href: "/about", label: "Chi siamo" },
      { href: "/contact", label: "Contatti" },
    ],

    faqTitle: "FAQ – Pacchi smarriti Poste",
    faqIntro: "Risposte rapide alle domande più comuni.",
    faqs: [
      {
        q: "KiloMystery è affiliata a Poste Italiane?",
        a: "No. KiloMystery non è affiliata a Poste Italiane. Questa pagina risponde all’intento di ricerca (giacenza, non consegnati, non reclamati) e propone box sorpresa al kg.",
      },
      {
        q: "Cosa significa “pacco in giacenza”?",
        a: "Significa che la consegna non è andata a buon fine e il pacco è fermo in attesa di nuova consegna o ritiro entro un periodo definito.",
      },
      {
        q: "Cosa può contenere una box?",
        a: "Contenuto variabile: elettronica, accessori, abbigliamento, casa e altro. Non esiste una lista garantita: la variabilità è parte del formato.",
      },
      {
        q: "Posso fare reso?",
        a: "Di norma no, perché è un formato sorpresa/variabile. Consulta la policy resi per i dettagli.",
      },
      {
        q: "C’è tracking?",
        a: "Quando disponibile sì. Trovi i dettagli completi nella pagina Spedizioni.",
      },
    ],

    finalTitle: "Vuoi acquistare pacchi smarriti (intento Poste)?",
    finalBody:
      "Se cercavi pacchi smarriti Poste o pacchi in giacenza, qui trovi una guida chiara e la possibilità di acquistare box sorpresa al kg.",
    finalPrimary: "Vai ai prodotti",
    finalSecondary: "Contattaci",
  },

  en: {
    title: "Poste lost parcels: undelivered parcels & storage | KiloMystery",
    description:
      "Searching for Poste lost parcels or parcels in storage? Learn what it means and shop kilo-based surprise boxes (Standard/Premium) from 1 to 10 kg.",
    h1: "Poste lost parcels: what they are and what happens to parcels in storage",
    intro:
      "People search for “Poste lost parcels” or “parcels in storage” to understand where undelivered or unclaimed shipments end up. Here’s a clear explanation and a direct way to shop kilo surprise boxes.",
    disclaimer:
      "Note: informational page. KiloMystery is not affiliated with Poste Italiane. “Poste” refers to search intent (storage, undelivered, unclaimed).",

    venditaTitle: "Poste lost parcels for sale: formats and pricing",
    venditaIntro:
      "On KiloMystery you buy kilo surprise boxes (1–10 kg) in two tiers: Standard and Premium. Contents vary: transparency is in the process (weight, seal, batch).",
    venditaBullets: [
      "Standard/Premium: two tiers, same surprise format.",
      "1, 2, 3, 5, 10 kg options with clear pricing (€/kg).",
      "Net weight ±3% and a seal with batch ID and date.",
      "Shipping/tracking according to policy (when available).",
    ],

    giacenzaTitle: "Parcels in storage: what it means",
    giacenzaBody:
      "“In storage” means a parcel is held because delivery couldn’t be completed (absence, incomplete address, access issues) or requires pickup. If it isn’t claimed within the time window, it may enter return or stock-handling flows.",
    causeTitle: "Why a parcel can be undelivered or marked as lost",
    causeBullets: [
      "Wrong or incomplete address / postal code.",
      "Unreadable or damaged labels during transport.",
      "Delivery constraints (access, intercom, etc.).",
      "Pickup not completed within the storage period.",
    ],

    legalTitle: "Is it legal to buy “lost parcels”?",
    legalBody:
      "Yes, when sourced through liquidation processes and no longer manageable as standard deliveries. Avoid “guaranteed value” promises—variability is part of the format.",

    shopTitle: "Shop now (kilo surprise boxes)",
    shopIntro:
      "Choose Standard or Premium and select the weight. You can shop directly below.",

    linksTitle: "Helpful internal links",
    linksBody:
      "For more details and trust signals (shipping, returns, guides), use these links:",
    links: [
      { href: "/products", label: "Products" },
      { href: "/pacchi-smarriti", label: "Lost Parcels (general guide)" },
      { href: "/pacchi-smarriti-amazon", label: "Amazon Lost Parcels (guide)" },
      { href: "/mystery-box", label: "Mystery Box guide" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Shipping" },
      { href: "/policy/returns", label: "Returns" },
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
    ],

    faqTitle: "FAQ – Poste lost parcels",
    faqIntro: "Quick answers to common questions.",
    faqs: [
      {
        q: "Is KiloMystery affiliated with Poste Italiane?",
        a: "No. This page targets search intent (storage, undelivered, unclaimed) and offers kilo surprise boxes.",
      },
      {
        q: "What does “in storage” mean?",
        a: "Delivery failed and the parcel is being held for redelivery or pickup within a time window.",
      },
      {
        q: "What can be inside?",
        a: "Variable contents: electronics, accessories, clothing, home items, and more. No guaranteed list.",
      },
      {
        q: "Can I return it?",
        a: "Typically no (surprise/variable-content). Check the Returns policy.",
      },
      {
        q: "Do you provide tracking?",
        a: "When available, yes. See the Shipping page for details.",
      },
    ],

    finalTitle: "Want to buy Poste-intent lost parcels?",
    finalBody:
      "If you searched for Poste lost parcels or parcels in storage, this page explains it clearly and lets you shop kilo surprise boxes.",
    finalPrimary: "Go to products",
    finalSecondary: "Contact us",
  },

  es: {
    title: "Paquetes perdidos Poste: paquetes en almacén | KiloMystery",
    description:
      "¿Buscas paquetes perdidos Poste o paquetes en almacén? Aprende qué significa y compra cajas sorpresa por kilo (Standard/Premium) de 1 a 10 kg.",
    h1: "Paquetes perdidos Poste: qué son y qué pasa con los paquetes en almacén",
    intro:
      "Se busca “paquetes perdidos Poste” o “paquetes en almacén” para entender qué ocurre con envíos no entregados o no reclamados. Aquí lo explicamos y puedes comprar cajas sorpresa por kilo.",
    disclaimer:
      "Nota: página informativa. KiloMystery no está afiliada a Poste Italiane. “Poste” se refiere a la intención de búsqueda (almacén, no entregados, no reclamados).",

    venditaTitle: "Venta paquetes perdidos Poste: formatos y precios",
    venditaIntro:
      "En KiloMystery compras cajas sorpresa por kilo (1–10 kg) en dos niveles: Standard y Premium. El contenido es variable: transparencia en el proceso (peso, precinto, lote).",
    venditaBullets: [
      "Standard/Premium: dos niveles, mismo formato sorpresa.",
      "Formatos 1, 2, 3, 5, 10 kg con precios claros (€/kg).",
      "Peso neto ±3% y precinto con ID de lote y fecha.",
      "Envío/seguimiento según política (cuando esté disponible).",
    ],

    giacenzaTitle: "Paquetes en almacén: qué significa",
    giacenzaBody:
      "“En almacén” significa que el envío está retenido porque no se pudo entregar (ausencia, dirección incompleta, problemas de acceso) o requiere recogida. Si no se reclama a tiempo, puede pasar a flujos de devolución o gestión de stock.",
    causeTitle: "Por qué un paquete puede no entregarse o figurar como perdido",
    causeBullets: [
      "Dirección incorrecta o incompleta / código postal erróneo.",
      "Etiqueta ilegible o dañada durante el transporte.",
      "Restricciones de entrega (acceso, portero automático, etc.).",
      "Recogida no realizada dentro del plazo.",
    ],

    legalTitle: "¿Es legal comprar paquetes “perdidos”?",
    legalBody:
      "Sí, si provienen de liquidación y ya no son gestionables como entregas estándar. Evita promesas de valor garantizado: la variabilidad es parte del formato.",

    shopTitle: "Compra ahora (cajas sorpresa por kilo)",
    shopIntro:
      "Elige Standard o Premium y selecciona el peso. Puedes comprar directamente aquí abajo.",

    linksTitle: "Enlaces internos útiles",
    linksBody:
      "Para más detalles (envíos, devoluciones, guías), usa estos enlaces:",
    links: [
      { href: "/products", label: "Productos" },
      { href: "/pacchi-smarriti", label: "Paquetes perdidos (guía general)" },
      { href: "/pacchi-smarriti-amazon", label: "Paquetes perdidos Amazon (guía)" },
      { href: "/mystery-box", label: "Guía Mystery Box" },
      { href: "/how-it-works", label: "Cómo funciona" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Envíos" },
      { href: "/policy/returns", label: "Devoluciones" },
      { href: "/about", label: "Quiénes somos" },
      { href: "/contact", label: "Contacto" },
    ],

    faqTitle: "FAQ – Paquetes perdidos Poste",
    faqIntro: "Respuestas rápidas a preguntas comunes.",
    faqs: [
      {
        q: "¿KiloMystery está afiliada a Poste Italiane?",
        a: "No. Esta página responde a la intención de búsqueda (almacén/no entregados/no reclamados) y ofrece cajas sorpresa por kilo.",
      },
      {
        q: "¿Qué significa “en almacén”?",
        a: "La entrega falló y el paquete queda retenido para nueva entrega o recogida dentro de un plazo.",
      },
      {
        q: "¿Qué puede venir dentro?",
        a: "Contenido variable: electrónica, accesorios, ropa, hogar y más. No hay lista garantizada.",
      },
      {
        q: "¿Puedo devolverlo?",
        a: "Normalmente no (formato sorpresa/variable). Consulta la política de devoluciones.",
      },
      {
        q: "¿Hay tracking?",
        a: "Cuando esté disponible, sí. Ver la página de envíos.",
      },
    ],

    finalTitle: "¿Quieres comprar paquetes perdidos (intención Poste)?",
    finalBody:
      "Si buscabas paquetes perdidos Poste o paquetes en almacén, aquí tienes explicación y acceso directo a cajas sorpresa por kilo.",
    finalPrimary: "Ver productos",
    finalSecondary: "Contactar",
  },

  fr: {
    title: "Colis perdus Poste : colis en instance | KiloMystery",
    description:
      "Tu cherches colis perdus Poste ou colis en instance ? Comprends ce que cela signifie et achète des box surprise au kilo (Standard/Premium) de 1 à 10 kg.",
    h1: "Colis perdus Poste : définition et que deviennent les colis en instance",
    intro:
      "On recherche “colis perdus Poste” ou “colis en instance” pour comprendre ce qui arrive aux envois non livrés ou non réclamés. Ici, c’est expliqué clairement, et tu peux acheter des box surprise au kilo.",
    disclaimer:
      "Note : page informative. KiloMystery n’est pas affiliée à Poste Italiane. “Poste” renvoie à l’intention de recherche (instance, non livrés, non réclamés).",

    venditaTitle: "Vente colis perdus Poste : formats et prix",
    venditaIntro:
      "Sur KiloMystery, tu achètes des box surprise au kilo (1–10 kg) en deux niveaux : Standard et Premium. Contenu variable : transparence sur le process (poids, scellé, lot).",
    venditaBullets: [
      "Standard/Premium : deux niveaux, même format surprise.",
      "Formats 1, 2, 3, 5, 10 kg avec prix clairs (€/kg).",
      "Poids net ±3 % et scellé avec ID de lot et date.",
      "Livraison/tracking selon la policy (quand disponible).",
    ],

    giacenzaTitle: "Colis en instance : signification",
    giacenzaBody:
      "“En instance” signifie que le colis est retenu car la livraison a échoué (absence, adresse incomplète, accès) ou nécessite un retrait. S’il n’est pas réclamé à temps, il peut passer en flux de retour ou de gestion de stock.",
    causeTitle: "Pourquoi un colis peut être non livré ou considéré comme perdu",
    causeBullets: [
      "Adresse incorrecte/incomplète, code postal erroné.",
      "Étiquette illisible ou abîmée pendant le transport.",
      "Contraintes de livraison (accès, interphone, etc.).",
      "Retrait non effectué dans le délai d’instance.",
    ],

    legalTitle: "Est-ce légal d’acheter des colis “perdus” ?",
    legalBody:
      "Oui, si la source est une liquidation et que le colis n’est plus traitable comme livraison standard. Évite les promesses de valeur garantie : la variabilité fait partie du format.",

    shopTitle: "Acheter maintenant (box surprise au kilo)",
    shopIntro:
      "Choisis Standard ou Premium et le poids. Achat direct ci-dessous.",

    linksTitle: "Liens internes utiles",
    linksBody:
      "Pour plus d’infos (livraison, retours, guides), utilise ces liens :",
    links: [
      { href: "/products", label: "Produits" },
      { href: "/pacchi-smarriti", label: "Colis perdus (guide général)" },
      { href: "/pacchi-smarriti-amazon", label: "Colis perdus Amazon (guide)" },
      { href: "/mystery-box", label: "Guide Mystery Box" },
      { href: "/how-it-works", label: "Comment ça marche" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Livraison" },
      { href: "/policy/returns", label: "Retours" },
      { href: "/about", label: "À propos" },
      { href: "/contact", label: "Contact" },
    ],

    faqTitle: "FAQ – Colis perdus Poste",
    faqIntro: "Réponses rapides aux questions fréquentes.",
    faqs: [
      {
        q: "KiloMystery est affiliée à Poste Italiane ?",
        a: "Non. Cette page répond à l’intention de recherche (instance/non livrés/non réclamés) et propose des box surprise au kilo.",
      },
      {
        q: "Que signifie “en instance” ?",
        a: "La livraison a échoué et le colis est retenu pour une nouvelle livraison ou un retrait dans un délai.",
      },
      {
        q: "Que peut-on trouver dedans ?",
        a: "Contenu variable : électronique, accessoires, vêtements, maison, etc. Aucune liste garantie.",
      },
      {
        q: "Puis-je retourner ?",
        a: "Généralement non (format surprise/variable). Voir la policy retours.",
      },
      {
        q: "Tracking ?",
        a: "Quand disponible, oui. Voir la page Livraison.",
      },
    ],

    finalTitle: "Envie d’acheter des colis perdus (intention Poste) ?",
    finalBody:
      "Si tu cherchais colis perdus Poste ou colis en instance, ici tu as l’explication et l’accès direct aux box surprise au kilo.",
    finalPrimary: "Voir les produits",
    finalSecondary: "Nous contacter",
  },

  de: {
    title: "Poste verlorene Pakete: Pakete in Lagerung | KiloMystery",
    description:
      "Suchst du Poste verlorene Pakete oder Pakete in Lagerung? Erfahre, was das bedeutet, und kaufe Kilo-Überraschungsboxen (Standard/Premium) von 1 bis 10 kg.",
    h1: "Poste verlorene Pakete: was sie sind und was mit Paketen in Lagerung passiert",
    intro:
      "Viele suchen nach „Poste verlorene Pakete“ oder „Pakete in Lagerung“, um zu verstehen, wo nicht zugestellte oder nicht abgeholte Sendungen enden. Hier erklären wir es klar und du kannst Kilo-Überraschungsboxen kaufen.",
    disclaimer:
      "Hinweis: Informationsseite. KiloMystery ist nicht mit Poste Italiane verbunden. „Poste“ bezieht sich auf die Suchintention (Lagerung, nicht zugestellt, nicht abgeholt).",

    venditaTitle: "Poste verlorene Pakete kaufen: Formate und Preise",
    venditaIntro:
      "Bei KiloMystery kaufst du Kilo-Überraschungsboxen (1–10 kg) in zwei Stufen: Standard und Premium. Inhalt variabel: Transparenz im Prozess (Gewicht, Siegel, Posten).",
    venditaBullets: [
      "Standard/Premium: zwei Stufen, gleiches Überraschungsformat.",
      "1, 2, 3, 5, 10 kg Formate mit klaren Preisen (inkl. €/kg).",
      "Nettogewicht ±3 % und Siegel mit Posten-ID und Datum.",
      "Versand/Tracking gemäß Policy (wenn verfügbar).",
    ],

    giacenzaTitle: "Pakete in Lagerung: Bedeutung",
    giacenzaBody:
      "„In Lagerung“ bedeutet: Zustellung war nicht möglich (Abwesenheit, unvollständige Adresse, Zugang) oder Abholung ist nötig. Wenn nicht rechtzeitig abgeholt, kann die Sendung in Rücklauf- oder Bestandsprozesse übergehen.",
    causeTitle: "Warum ein Paket nicht zugestellt wird oder als verloren gilt",
    causeBullets: [
      "Falsche/unvollständige Adresse oder PLZ.",
      "Unleserliche/beschädigte Labels während des Transports.",
      "Zustellhindernisse (Zugang, Klingel, etc.).",
      "Abholung nicht innerhalb der Lagerfrist.",
    ],

    legalTitle: "Ist der Kauf legal?",
    legalBody:
      "Ja, wenn die Ware aus Liquidation stammt und nicht mehr als Standardzustellung bearbeitbar ist. Vermeide „garantierter Wert“ – Variabilität gehört dazu.",

    shopTitle: "Jetzt kaufen (Kilo-Überraschungsboxen)",
    shopIntro:
      "Wähle Standard oder Premium und das Gewicht. Direkt unten kaufen.",

    linksTitle: "Nützliche interne Links",
    linksBody:
      "Für mehr Infos (Versand, Rückgabe, Guides), nutze diese Links:",
    links: [
      { href: "/products", label: "Produkte" },
      { href: "/pacchi-smarriti", label: "Verlorene Pakete (allgemeiner Guide)" },
      { href: "/pacchi-smarriti-amazon", label: "Amazon verlorene Pakete (Guide)" },
      { href: "/mystery-box", label: "Mystery-Box-Guide" },
      { href: "/how-it-works", label: "So funktioniert’s" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Versand" },
      { href: "/policy/returns", label: "Rückgabe" },
      { href: "/about", label: "Über uns" },
      { href: "/contact", label: "Kontakt" },
    ],

    faqTitle: "FAQ – Poste verlorene Pakete",
    faqIntro: "Kurze Antworten auf häufige Fragen.",
    faqs: [
      {
        q: "Ist KiloMystery mit Poste Italiane verbunden?",
        a: "Nein. Diese Seite richtet sich an die Suchintention (Lagerung/nicht zugestellt/nicht abgeholt) und bietet Kilo-Überraschungsboxen.",
      },
      {
        q: "Was bedeutet „in Lagerung“?",
        a: "Zustellung ist gescheitert und das Paket wird für erneute Zustellung oder Abholung innerhalb einer Frist gelagert.",
      },
      {
        q: "Was kann drin sein?",
        a: "Variabler Inhalt: Elektronik, Zubehör, Kleidung, Haushalt usw. Keine garantierte Liste.",
      },
      {
        q: "Kann ich zurückgeben?",
        a: "Meistens nein (Überraschungs-/variabler Inhalt). Rückgabe-Policy prüfen.",
      },
      {
        q: "Tracking?",
        a: "Wenn verfügbar ja. Details auf der Versandseite.",
      },
    ],

    finalTitle: "Poste-intent verlorene Pakete kaufen?",
    finalBody:
      "Wenn du nach Poste verlorene Pakete oder Pakete in Lagerung gesucht hast: Hier findest du Erklärung und direkten Kauf von Kilo-Überraschungsboxen.",
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
  const url = `${SITE_URL}/${lang}/pacchi-smarriti-poste`;

  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: url,
      languages: {
        it: `${SITE_URL}/it/pacchi-smarriti-poste`,
        en: `${SITE_URL}/en/pacchi-smarriti-poste`,
        es: `${SITE_URL}/es/pacchi-smarriti-poste`,
        fr: `${SITE_URL}/fr/pacchi-smarriti-poste`,
        de: `${SITE_URL}/de/pacchi-smarriti-poste`,
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
export default function PacchiSmarritiPostePage({
  params,
}: {
  params: { lang: string };
}) {
  const lang = normLang(params?.lang);
  const c = COPY[lang];
  const pageUrl = `${SITE_URL}/${lang}/pacchi-smarriti-poste`;

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

        {/* INFO */}
        <section className="grid md:grid-cols-2 gap-5">
          <article className="card">
            <h2 className="text-2xl font-extrabold">{c.giacenzaTitle}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">{c.giacenzaBody}</p>
          </article>

          <article className="card">
            <h2 className="text-2xl font-extrabold">{c.causeTitle}</h2>
            <ul className="mt-4 space-y-2 text-white/75">
              {c.causeBullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="mt-[2px]">✅</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
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

        {/* INTERNAL LINKS */}
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
