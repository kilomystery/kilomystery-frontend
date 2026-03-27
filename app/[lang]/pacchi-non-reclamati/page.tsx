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
  const url = `${siteUrl}/${lang}/pacchi-non-reclamati`;

  const aboutByLang: Record<Lang, string[]> = {
    it: [
      "pacchi non reclamati",
      "pacchi non ritirati",
      "spedizioni non reclamate",
      "pacchi in giacenza",
      "vendita pacchi non reclamati",
    ],
    en: [
      "unclaimed parcels",
      "uncollected parcels",
      "unclaimed shipments",
      "parcels in storage",
      "unclaimed parcels for sale",
    ],
    es: [
      "paquetes no reclamados",
      "paquetes no recogidos",
      "envíos no reclamados",
      "paquetes en almacén",
      "venta de paquetes no reclamados",
    ],
    fr: [
      "colis non réclamés",
      "colis non récupérés",
      "envois non réclamés",
      "colis en instance",
      "vente de colis non réclamés",
    ],
    de: [
      "nicht abgeholte pakete",
      "nicht reclamierte pakete",
      "nicht abgeholte sendungen",
      "pakete in lagerung",
      "nicht abgeholte pakete kaufen",
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
    isRelatedTo: [
      { "@type": "WebPage", "@id": `${siteUrl}/${lang}/pacchi-smarriti` },
      { "@type": "WebPage", "@id": `${siteUrl}/${lang}/resi-ecommerce` },
      { "@type": "WebPage", "@id": `${siteUrl}/${lang}/giacenze-ecommerce` },
    ],
  };
}

function productJsonLd(args: { siteUrl: string; lang: Lang; tier: "Standard" | "Premium" }) {
  const { siteUrl, lang, tier } = args;

  const tab = tier === "Standard" ? "std" : "prm";
  const pageUrl = `${siteUrl}/${lang}/pacchi-non-reclamati`;
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
        "Pacchi non reclamati in formato Standard: contenuto variabile a sorpresa, box sigillata con ID lotto e data, peso 1–10 kg.",
      Premium:
        "Pacchi non reclamati in formato Premium: contenuto variabile a sorpresa, box sigillata con ID lotto e data, peso 1–10 kg.",
    },
    en: {
      Standard:
        "Unclaimed parcels in Standard tier: variable surprise contents, sealed box with batch ID and date, 1–10 kg formats.",
      Premium:
        "Unclaimed parcels in Premium tier: variable surprise contents, sealed box with batch ID and date, 1–10 kg formats.",
    },
    es: {
      Standard:
        "Paquetes no reclamados en formato Standard: contenido sorpresa variable, caja precintada con ID de lote y fecha, 1–10 kg.",
      Premium:
        "Paquetes no reclamados en formato Premium: contenido sorpresa variable, caja precintada con ID de lote y fecha, 1–10 kg.",
    },
    fr: {
      Standard:
        "Colis non réclamés Standard : contenu surprise variable, box scellée avec ID de lot et date, formats 1–10 kg.",
      Premium:
        "Colis non réclamés Premium : contenu surprise variable, box scellée avec ID de lot et date, formats 1–10 kg.",
    },
    de: {
      Standard:
        "Nicht abgeholte Pakete (Standard): variabler Überraschungsinhalt, versiegelte Box mit Posten-ID und Datum, 1–10 kg.",
      Premium:
        "Nicht abgeholte Pakete (Premium): variabler Überraschungsinhalt, versiegelte Box mit Posten-ID und Datum, 1–10 kg.",
    },
  };

  const nameByLang: Record<Lang, Record<"Standard" | "Premium", string>> = {
    it: {
      Standard: "KiloMystery Standard · Pacchi Non Reclamati (1–10 kg)",
      Premium: "KiloMystery Premium · Pacchi Non Reclamati (1–10 kg)",
    },
    en: {
      Standard: "KiloMystery Standard · Unclaimed Parcels (1–10 kg)",
      Premium: "KiloMystery Premium · Unclaimed Parcels (1–10 kg)",
    },
    es: {
      Standard: "KiloMystery Standard · Paquetes No Reclamados (1–10 kg)",
      Premium: "KiloMystery Premium · Paquetes No Reclamados (1–10 kg)",
    },
    fr: {
      Standard: "KiloMystery Standard · Colis Non Réclamés (1–10 kg)",
      Premium: "KiloMystery Premium · Colis Non Réclamés (1–10 kg)",
    },
    de: {
      Standard: "KiloMystery Standard · Nicht Abgeholte Pakete (1–10 kg)",
      Premium: "KiloMystery Premium · Nicht Abgeholte Pakete (1–10 kg)",
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

  const listNameByLang: Record<Lang, string> = {
    it: "KiloMystery — Pacchi Non Reclamati (Standard & Premium) — formati e prezzi",
    en: "KiloMystery — Unclaimed Parcels (Standard & Premium) — formats and pricing",
    es: "KiloMystery — Paquetes No Reclamados (Standard & Premium) — formatos y precios",
    fr: "KiloMystery — Colis Non Réclamés (Standard & Premium) — formats et prix",
    de: "KiloMystery — Nicht Abgeholte Pakete (Standard & Premium) — Formate und Preise",
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

const COPY: Record<
  Lang,
  {
    title: string;
    description: string;
    h1: string;
    intro: string;
    venditaTitle: string;
    venditaIntro: string;
    venditaBullets: string[];
    meaningTitle: string;
    meaningBody: string;
    causesTitle: string;
    causesBullets: string[];
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
    title: "Pacchi non reclamati: cosa sono e dove finiscono | KiloMystery",
    description:
      "Cerchi pacchi non reclamati o pacchi non ritirati? Scopri cosa significa, perché succede e acquista box sorpresa Standard/Premium da 1 a 10 kg.",
    h1: "Pacchi non reclamati: cosa sono e come funzionano",
    intro:
      "I pacchi non reclamati sono spedizioni che non vengono ritirate o che restano in giacenza fino alla scadenza dei tempi previsti. In molti casi entrano in flussi di rientro, stock o liquidazione. Qui trovi una guida chiara e un accesso diretto ai formati disponibili.",
    venditaTitle: "Vendita pacchi non reclamati: formati e prezzi",
    venditaIntro:
      "Su KiloMystery puoi acquistare box sorpresa al kg scegliendo Standard o Premium. Il contenuto è variabile: la trasparenza è nel processo, non nella promessa di articoli specifici.",
    venditaBullets: [
      "Standard e Premium: due livelli di selezione, stesso formato sorpresa.",
      "Formati da 1, 2, 3, 5, 10 kg con prezzi chiari.",
      "Peso netto con tolleranza ±3% e sigillo con ID lotto e data.",
      "Spedizione tracciata quando disponibile secondo policy.",
    ],
    meaningTitle: "Cosa significa “non reclamato”",
    meaningBody:
      "Un pacco viene definito non reclamato quando il destinatario non lo ritira, non risponde ai tentativi di consegna oppure non completa il ritiro nei tempi previsti. Se il rientro non viene chiuso come spedizione standard, quel pacco può finire in stock logistici o lotti di liquidazione.",
    causesTitle: "Perché un pacco può non essere reclamato",
    causesBullets: [
      "Assenza del destinatario ai tentativi di consegna.",
      "Ritiro non effettuato dopo l’avviso di giacenza.",
      "Dati incompleti o errati nel recapito.",
      "Mancato interesse del destinatario nel ritirare il pacco.",
    ],
    legalTitle: "È legale acquistare pacchi non reclamati?",
    legalBody:
      "Sì, quando i pacchi provengono da processi di liquidazione o gestione stock e non sono più trattati come normali consegne reclamabili. Conta acquistare da realtà trasparenti e senza promesse irrealistiche.",
    shopTitle: "Acquista ora (box sorpresa al kg)",
    shopIntro:
      "Scegli Standard o Premium e seleziona il peso. Qui sotto trovi i prodotti acquistabili direttamente.",
    linksTitle: "Link interni utili",
    linksBody:
      "Per approfondire il tema e rafforzare fiducia, usa questi link interni:",
    links: [
      { href: "/products", label: "Prodotti" },
      { href: "/pacchi-smarriti", label: "Pacchi Smarriti" },
      { href: "/resi-ecommerce", label: "Resi Ecommerce" },
      { href: "/giacenze-ecommerce", label: "Giacenze Ecommerce" },
      { href: "/mystery-box", label: "Guida Mystery Box" },
      { href: "/how-it-works", label: "Come funziona" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Spedizioni" },
      { href: "/policy/returns", label: "Resi" },
      { href: "/contact", label: "Contatti" },
    ],
    faqTitle: "FAQ – Pacchi non reclamati",
    faqIntro: "Risposte rapide alle domande più comuni.",
    faqs: [
      {
        q: "Cosa sono i pacchi non reclamati?",
        a: "Sono spedizioni non ritirate o non completate entro i tempi di giacenza o gestione previsti.",
      },
      {
        q: "Pacchi non reclamati e pacchi smarriti sono la stessa cosa?",
        a: "Non sempre. I pacchi non reclamati sono una categoria specifica; i pacchi smarriti includono anche spedizioni non consegnabili o non rintracciabili nel normale flusso.",
      },
      {
        q: "Cosa posso trovare dentro?",
        a: "Contenuto variabile: elettronica, accessori, abbigliamento, casa e altro. Non c’è una lista garantita.",
      },
      {
        q: "Posso fare reso?",
        a: "Di norma no, perché si tratta di un formato sorpresa a contenuto variabile. Controlla la policy Resi.",
      },
      {
        q: "C’è tracking?",
        a: "Quando disponibile sì. Trovi i dettagli nella pagina Spedizioni.",
      },
    ],
    finalTitle: "Vuoi acquistare pacchi non reclamati?",
    finalBody:
      "Se cercavi una guida chiara sui pacchi non reclamati, qui trovi spiegazione, contesto e accesso diretto alle box sorpresa al kg.",
    finalPrimary: "Vai ai prodotti",
    finalSecondary: "Contattaci",
  },

  en: {
    title: "Unclaimed parcels: what they are and where they end up | KiloMystery",
    description:
      "Looking for unclaimed parcels or uncollected shipments? Learn what they are, why they happen, and shop Standard/Premium surprise boxes from 1 to 10 kg.",
    h1: "Unclaimed parcels: what they are and how they work",
    intro:
      "Unclaimed parcels are shipments that are not collected or remain in storage until deadlines expire. In many cases they enter return, stock, or liquidation flows. This page explains it clearly and gives direct access to available formats.",
    venditaTitle: "Unclaimed parcels for sale: formats and pricing",
    venditaIntro:
      "On KiloMystery you can buy kilo-based surprise boxes by choosing Standard or Premium. Contents vary: transparency is in the process, not in promises of specific items.",
    venditaBullets: [
      "Standard and Premium: two tiers, same surprise format.",
      "1, 2, 3, 5, 10 kg options with clear pricing.",
      "Net weight with ±3% tolerance and sealed batch ID/date.",
      "Tracked shipping when available according to policy.",
    ],
    meaningTitle: "What “unclaimed” means",
    meaningBody:
      "A parcel is considered unclaimed when the recipient does not pick it up, does not respond to delivery attempts, or fails to complete pickup within the time window. If the return flow is not completed as a standard shipment, it may enter logistics stock or liquidation lots.",
    causesTitle: "Why a parcel may go unclaimed",
    causesBullets: [
      "Recipient absent during delivery attempts.",
      "Pickup not completed after storage notice.",
      "Incomplete or incorrect delivery details.",
      "Recipient no longer interested in collecting the parcel.",
    ],
    legalTitle: "Is it legal to buy unclaimed parcels?",
    legalBody:
      "Yes, when parcels come from liquidation or stock-management processes and are no longer treated as standard reclaimable deliveries. Choose transparent sellers and avoid unrealistic promises.",
    shopTitle: "Shop now (kilo surprise boxes)",
    shopIntro:
      "Choose Standard or Premium and select the weight. You can shop directly below.",
    linksTitle: "Helpful internal links",
    linksBody: "Use these links for more details and internal context:",
    links: [
      { href: "/products", label: "Products" },
      { href: "/pacchi-smarriti", label: "Lost Parcels" },
      { href: "/resi-ecommerce", label: "Ecommerce Returns" },
      { href: "/giacenze-ecommerce", label: "Ecommerce Overstock" },
      { href: "/mystery-box", label: "Mystery Box Guide" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Shipping" },
      { href: "/policy/returns", label: "Returns" },
      { href: "/contact", label: "Contact" },
    ],
    faqTitle: "FAQ – Unclaimed parcels",
    faqIntro: "Quick answers to common questions.",
    faqs: [
      {
        q: "What are unclaimed parcels?",
        a: "Shipments that were not collected or not completed within the expected storage or pickup time window.",
      },
      {
        q: "Are unclaimed parcels the same as lost parcels?",
        a: "Not always. Unclaimed parcels are one specific category, while lost parcels may also include undeliverable or untraceable shipments.",
      },
      {
        q: "What can be inside?",
        a: "Variable contents: electronics, accessories, clothing, home items, and more. No guaranteed list.",
      },
      {
        q: "Can I return it?",
        a: "Usually no, because it is a surprise format with variable contents. Check the Returns policy.",
      },
      {
        q: "Do you provide tracking?",
        a: "When available, yes. See the Shipping page.",
      },
    ],
    finalTitle: "Want to buy unclaimed parcels?",
    finalBody:
      "If you were looking for a clear guide to unclaimed parcels, this page gives you context and direct access to kilo surprise boxes.",
    finalPrimary: "Go to products",
    finalSecondary: "Contact us",
  },

  es: {
    title: "Paquetes no reclamados: qué son y dónde terminan | KiloMystery",
    description:
      "¿Buscas paquetes no reclamados o envíos no recogidos? Descubre qué son, por qué ocurre y compra cajas sorpresa Standard/Premium de 1 a 10 kg.",
    h1: "Paquetes no reclamados: qué son y cómo funcionan",
    intro:
      "Los paquetes no reclamados son envíos que no se recogen o que permanecen en almacén hasta que expiran los plazos. En muchos casos pasan a flujos de devolución, stock o liquidación.",
    venditaTitle: "Venta de paquetes no reclamados: formatos y precios",
    venditaIntro:
      "En KiloMystery puedes comprar cajas sorpresa por kilo eligiendo Standard o Premium. El contenido es variable: la transparencia está en el proceso, no en promesas de artículos concretos.",
    venditaBullets: [
      "Standard y Premium: dos niveles, mismo formato sorpresa.",
      "Formatos de 1, 2, 3, 5, 10 kg con precios claros.",
      "Peso neto ±3% y sello con ID de lote y fecha.",
      "Envío con seguimiento cuando esté disponible.",
    ],
    meaningTitle: "Qué significa “no reclamado”",
    meaningBody:
      "Un paquete se considera no reclamado cuando el destinatario no lo recoge, no responde a los intentos de entrega o no completa la retirada dentro del plazo previsto.",
    causesTitle: "Por qué un paquete puede no reclamarse",
    causesBullets: [
      "Ausencia del destinatario en los intentos de entrega.",
      "No retirar el paquete tras el aviso de almacén.",
      "Datos incompletos o incorrectos del destinatario.",
      "Falta de interés del destinatario en recogerlo.",
    ],
    legalTitle: "¿Es legal comprar paquetes no reclamados?",
    legalBody:
      "Sí, cuando proceden de procesos de liquidación o gestión de stock y ya no se tratan como entregas normales reclamables.",
    shopTitle: "Compra ahora (cajas sorpresa por kilo)",
    shopIntro: "Elige Standard o Premium y selecciona el peso. Puedes comprar aquí abajo.",
    linksTitle: "Enlaces internos útiles",
    linksBody: "Usa estos enlaces para profundizar:",
    links: [
      { href: "/products", label: "Productos" },
      { href: "/pacchi-smarriti", label: "Paquetes perdidos" },
      { href: "/resi-ecommerce", label: "Devoluciones ecommerce" },
      { href: "/giacenze-ecommerce", label: "Stock ecommerce" },
      { href: "/mystery-box", label: "Guía Mystery Box" },
      { href: "/how-it-works", label: "Cómo funciona" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Envíos" },
      { href: "/policy/returns", label: "Devoluciones" },
      { href: "/contact", label: "Contacto" },
    ],
    faqTitle: "FAQ – Paquetes no reclamados",
    faqIntro: "Respuestas rápidas a preguntas comunes.",
    faqs: [
      {
        q: "¿Qué son los paquetes no reclamados?",
        a: "Son envíos que no se recogieron o no se completaron dentro del tiempo previsto de almacenamiento o retirada.",
      },
      {
        q: "¿Son lo mismo que los paquetes perdidos?",
        a: "No siempre. Los no reclamados son una categoría específica; los perdidos pueden incluir también envíos no entregables o no rastreables.",
      },
      {
        q: "¿Qué puede venir dentro?",
        a: "Contenido variable: electrónica, accesorios, ropa, hogar y más. No hay lista garantizada.",
      },
      {
        q: "¿Puedo devolverlo?",
        a: "Normalmente no, porque es un formato sorpresa. Consulta la política de devoluciones.",
      },
      {
        q: "¿Hay tracking?",
        a: "Cuando esté disponible, sí. Ver la página de envíos.",
      },
    ],
    finalTitle: "¿Quieres comprar paquetes no reclamados?",
    finalBody:
      "Si buscabas una guía clara sobre paquetes no reclamados, aquí tienes contexto y acceso directo a cajas sorpresa por kilo.",
    finalPrimary: "Ver productos",
    finalSecondary: "Contactar",
  },

  fr: {
    title: "Colis non réclamés : définition et destination | KiloMystery",
    description:
      "Tu cherches colis non réclamés ou envois non récupérés ? Découvre ce que c’est et achète des box surprise Standard/Premium de 1 à 10 kg.",
    h1: "Colis non réclamés : ce que c’est et comment ça fonctionne",
    intro:
      "Les colis non réclamés sont des envois qui ne sont pas récupérés ou qui restent en instance jusqu’à expiration des délais. Ils peuvent ensuite entrer dans des flux de retour, de stock ou de liquidation.",
    venditaTitle: "Vente de colis non réclamés : formats et prix",
    venditaIntro:
      "Sur KiloMystery, tu peux acheter des box surprise au kilo en choisissant Standard ou Premium. Le contenu est variable : la transparence est dans le processus.",
    venditaBullets: [
      "Standard et Premium : deux niveaux, même format surprise.",
      "Formats 1, 2, 3, 5, 10 kg avec prix clairs.",
      "Poids net ±3 % et scellé avec ID de lot et date.",
      "Livraison suivie quand disponible.",
    ],
    meaningTitle: "Que signifie “non réclamé”",
    meaningBody:
      "Un colis est dit non réclamé lorsque le destinataire ne le récupère pas, ne répond pas aux tentatives de livraison ou ne finalise pas le retrait dans les délais.",
    causesTitle: "Pourquoi un colis peut ne pas être réclamé",
    causesBullets: [
      "Absence du destinataire lors des tentatives de livraison.",
      "Retrait non effectué après avis d’instance.",
      "Informations incomplètes ou incorrectes.",
      "Le destinataire n’est plus intéressé par le colis.",
    ],
    legalTitle: "Est-il légal d’acheter des colis non réclamés ?",
    legalBody:
      "Oui, lorsqu’ils proviennent de processus de liquidation ou de gestion de stock et qu’ils ne sont plus traités comme des livraisons standard réclamables.",
    shopTitle: "Acheter maintenant (box surprise au kilo)",
    shopIntro: "Choisis Standard ou Premium et le poids. Achat direct ci-dessous.",
    linksTitle: "Liens internes utiles",
    linksBody: "Utilise ces liens pour approfondir :",
    links: [
      { href: "/products", label: "Produits" },
      { href: "/pacchi-smarriti", label: "Colis perdus" },
      { href: "/resi-ecommerce", label: "Retours ecommerce" },
      { href: "/giacenze-ecommerce", label: "Stocks ecommerce" },
      { href: "/mystery-box", label: "Guide Mystery Box" },
      { href: "/how-it-works", label: "Comment ça marche" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Livraison" },
      { href: "/policy/returns", label: "Retours" },
      { href: "/contact", label: "Contact" },
    ],
    faqTitle: "FAQ – Colis non réclamés",
    faqIntro: "Réponses rapides aux questions fréquentes.",
    faqs: [
      {
        q: "Que sont les colis non réclamés ?",
        a: "Des envois non récupérés ou non finalisés dans le délai prévu d’instance ou de retrait.",
      },
      {
        q: "Est-ce la même chose que des colis perdus ?",
        a: "Pas toujours. Les colis non réclamés sont une catégorie spécifique ; les colis perdus peuvent aussi inclure des envois non livrables.",
      },
      {
        q: "Que peut-on trouver dedans ?",
        a: "Contenu variable : électronique, accessoires, vêtements, maison, etc. Aucune liste garantie.",
      },
      {
        q: "Puis-je retourner ?",
        a: "En général non, car il s’agit d’un format surprise. Voir la politique de retours.",
      },
      {
        q: "Y a-t-il un suivi ?",
        a: "Quand disponible, oui. Voir la page Livraison.",
      },
    ],
    finalTitle: "Tu veux acheter des colis non réclamés ?",
    finalBody:
      "Si tu cherchais un guide clair sur les colis non réclamés, cette page te donne le contexte et l’accès aux box surprise au kilo.",
    finalPrimary: "Voir les produits",
    finalSecondary: "Nous contacter",
  },

  de: {
    title: "Nicht abgeholte Pakete: was sie sind und wohin sie gehen | KiloMystery",
    description:
      "Suchst du nicht abgeholte Pakete oder nicht abgeholte Sendungen? Erfahre, was das ist, und kaufe Standard/Premium-Überraschungsboxen von 1 bis 10 kg.",
    h1: "Nicht abgeholte Pakete: was sie sind und wie sie funktionieren",
    intro:
      "Nicht abgeholte Pakete sind Sendungen, die nicht abgeholt werden oder bis zum Ablauf der Fristen in Lagerung bleiben. Sie können danach in Rücklauf-, Lager- oder Liquidationsprozesse übergehen.",
    venditaTitle: "Nicht abgeholte Pakete kaufen: Formate und Preise",
    venditaIntro:
      "Bei KiloMystery kannst du Kilo-Überraschungsboxen als Standard oder Premium kaufen. Der Inhalt ist variabel; die Transparenz liegt im Prozess.",
    venditaBullets: [
      "Standard und Premium: zwei Stufen, gleiches Überraschungsformat.",
      "1, 2, 3, 5, 10 kg Formate mit klaren Preisen.",
      "Nettogewicht ±3 % und Siegel mit Posten-ID und Datum.",
      "Sendungsverfolgung, wenn verfügbar.",
    ],
    meaningTitle: "Was „nicht abgeholt“ bedeutet",
    meaningBody:
      "Ein Paket gilt als nicht abgeholt, wenn der Empfänger es nicht abholt, nicht auf Zustellversuche reagiert oder die Abholung innerhalb der Frist nicht abschließt.",
    causesTitle: "Warum ein Paket nicht abgeholt wird",
    causesBullets: [
      "Empfänger bei Zustellversuchen nicht anwesend.",
      "Abholung nach Lagerhinweis nicht erfolgt.",
      "Unvollständige oder falsche Daten.",
      "Empfänger hat kein Interesse mehr am Paket.",
    ],
    legalTitle: "Ist der Kauf legal?",
    legalBody:
      "Ja, wenn die Pakete aus Liquidations- oder Lagerbestandsprozessen stammen und nicht mehr als normale reklamierbare Lieferungen behandelt werden.",
    shopTitle: "Jetzt kaufen (Kilo-Überraschungsboxen)",
    shopIntro: "Wähle Standard oder Premium und das Gewicht. Direkt unten kaufen.",
    linksTitle: "Nützliche interne Links",
    linksBody: "Nutze diese Links für mehr Kontext:",
    links: [
      { href: "/products", label: "Produkte" },
      { href: "/pacchi-smarriti", label: "Verlorene Pakete" },
      { href: "/resi-ecommerce", label: "E-Commerce-Retouren" },
      { href: "/giacenze-ecommerce", label: "E-Commerce-Lagerbestände" },
      { href: "/mystery-box", label: "Mystery-Box-Guide" },
      { href: "/how-it-works", label: "So funktioniert’s" },
      { href: "/faq", label: "FAQ" },
      { href: "/policy/shipping", label: "Versand" },
      { href: "/policy/returns", label: "Rückgabe" },
      { href: "/contact", label: "Kontakt" },
    ],
    faqTitle: "FAQ – Nicht abgeholte Pakete",
    faqIntro: "Kurze Antworten auf häufige Fragen.",
    faqs: [
      {
        q: "Was sind nicht abgeholte Pakete?",
        a: "Sendungen, die nicht abgeholt oder nicht innerhalb der erwarteten Lager- oder Abholfrist abgeschlossen wurden.",
      },
      {
        q: "Sind sie dasselbe wie verlorene Pakete?",
        a: "Nicht immer. Nicht abgeholte Pakete sind eine spezifische Kategorie; verlorene Pakete können auch unzustellbare Sendungen einschließen.",
      },
      {
        q: "Was kann drin sein?",
        a: "Variabler Inhalt: Elektronik, Zubehör, Kleidung, Haushalt und mehr. Keine garantierte Liste.",
      },
      {
        q: "Kann ich zurückgeben?",
        a: "Meistens nein, da es sich um ein Überraschungsformat handelt. Siehe Rückgabe-Policy.",
      },
      {
        q: "Gibt es Tracking?",
        a: "Wenn verfügbar, ja. Siehe Versandseite.",
      },
    ],
    finalTitle: "Nicht abgeholte Pakete kaufen?",
    finalBody:
      "Wenn du nach einem klaren Guide zu nicht abgeholten Paketen gesucht hast, findest du hier Kontext und direkten Zugang zu Kilo-Überraschungsboxen.",
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
  const url = `${SITE_URL}/${lang}/pacchi-non-reclamati`;

  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: url,
      languages: {
        it: `${SITE_URL}/it/pacchi-non-reclamati`,
        en: `${SITE_URL}/en/pacchi-non-reclamati`,
        es: `${SITE_URL}/es/pacchi-non-reclamati`,
        fr: `${SITE_URL}/fr/pacchi-non-reclamati`,
        de: `${SITE_URL}/de/pacchi-non-reclamati`,
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

export default function PacchiNonReclamatiPage({
  params,
}: {
  params: { lang: string };
}) {
  const lang = normLang(params?.lang);
  const c = COPY[lang];
  const pageUrl = `${SITE_URL}/${lang}/pacchi-non-reclamati`;

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
        </section>

        <section className="grid md:grid-cols-2 gap-5">
          <article className="card">
            <h2 className="text-2xl font-extrabold">{c.meaningTitle}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">{c.meaningBody}</p>
          </article>

          <article className="card">
            <h2 className="text-2xl font-extrabold">{c.causesTitle}</h2>
            <ul className="mt-4 space-y-2 text-white/75">
              {c.causesBullets.map((b, i) => (
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