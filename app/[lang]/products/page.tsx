"use client";

/* eslint-disable react/no-unescaped-entities */

import { useEffect, useRef } from "react";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../components/cart/CartProvider";
import { Lang, normalizeLang } from "@/i18n/lang";
import SectionInsideBox from "../../components/SectionInsideBox";

type Kg = 1 | 2 | 3 | 5 | 10;

const stdV = (kg: Kg) => `/videos/packs/std-${kg}.mp4`;
const prmV = (kg: Kg) => `/videos/packs/prm-${kg}.mp4`;

function pricePerKg(kind: "Standard" | "Premium", kg: Kg) {
  if (kind === "Premium") return kg <= 3 ? 25.99 : 20.99;
  return kg <= 3 ? 19.9 : 17.99;
}

const euro = (n: number) =>
  n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

// === EXPLORER BOX (BUNDLE) ===
const EXPLORER_SHOPIFY_ID = "52089141363026"; // variante Shopify
const EXPLORER_TOTAL_KG = 16; // 15 kg + 1 kg omaggio
const EXPLORER_PRICE_TOTAL = 270; // prezzo totale
const EXPLORER_PRICE_PER_KG = EXPLORER_PRICE_TOTAL / EXPLORER_TOTAL_KG;

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
  // 🔸 NUOVO: testi ruota
  | "wheelTitle"
  | "wheelText"
  | "wheelCtaStd"
  | "wheelCtaPrm";

type CopyPerLang = Record<CopyKey, string>;

// 🔤 Testi per OGNI lingua (IT, EN, ES, FR, DE)
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

    // 🔸 ruota (nuova logica: al carrello)
    wheelTitle: "Ruota della fortuna",
    wheelText:
      "Con un ordine da almeno 10 kg ottieni 1 giro automatico quando vai al carrello. Puoi vincere fino a +2 kg bonus che aggiungiamo al tuo ordine come peso extra.",
    wheelCtaStd: "Vai ai 10 kg Standard",
    wheelCtaPrm: "Vai ai 10 kg Premium",
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

    standardDescription:
      "Ideal, um KiloMystery zum ersten Mal zu testen.",
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

  const ppk = pricePerKg(kind, kg);
  const total = +(ppk * kg).toFixed(2);
  const isStd = kind === "Standard";
  const anchorId = kg === 10 ? `buy-${kind.toLowerCase()}-10` : undefined;
  const variantId = VARIANT_IDS[kind][kg];

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

  const badgeTextTop = kind === "Standard" ? t.badgeStd : t.badgePrm;
  const co2Text = co2ByKg[kg][lang] ?? co2ByKg[kg].it ?? "";

  return (
    <article
      className={`card ${isStd ? "card--standard" : "card--premium"}`}
      id={anchorId}
    >
      {/* badge piccolo sopra */}
      <div className="flex items-center justify-between mb-2 text-[0.7rem] uppercase tracking-[.15em] text-white/60">
        <span>{badgeTextTop}</span>
        <span className="pill pill--std">
          {kg} kg · {isStd ? "Standard" : "Premium"}
        </span>
      </div>

      <div
        className={`media-wrap ${
          isStd ? "media-wrap--std" : "media-wrap--prm"
        }`}
      >
        <div className="ratio-16-9">
          <video
            className="media rounded-[12px] object-cover"
            src={video}
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
          <div
            className={`price-figure ${
              isStd ? "price-figure--std" : "price-figure--prm"
            } text-3xl`}
          >
            {euro(total)}
          </div>
          <div className="price-perkg">({ppk.toFixed(2)} €/kg)</div>
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

function ExplorerCard({ lang, t }: { lang: Lang; t: CopyPerLang }) {
  const { addItem } = useCart();

  function handleAdd() {
    addItem({
      id: "Explorer-16",
      shopifyId: EXPLORER_SHOPIFY_ID,
      title: t.explorerTitle,
      tier: "Premium", // lo trattiamo come bundle "alto"
      weightKg: EXPLORER_TOTAL_KG,
      pricePerKg: EXPLORER_PRICE_PER_KG,
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
                  <div className="text-3xl font-extrabold">
                    {euro(EXPLORER_PRICE_TOTAL)}
                  </div>
                  <div className="text-xs text-white/60">
                    ≈ {EXPLORER_PRICE_PER_KG.toFixed(2)} €/kg
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

  useEffect(() => {
    let destroyed = false;
    let anim: import("lottie-web").AnimationItem | null = null;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    (async () => {
      try {
        const { default: lottie } = await import("lottie-web");

        const res = await fetch("/lottie/products-animation.json", {
          cache: "no-store",
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

    return () => {
      destroyed = true;
      try {
        anim?.destroy();
      } catch {}
    };
  }, []);

  // JSON-LD SEO per il prodotto / categoria
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";

  const productJsonLd = {
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
    brand: {
      "@type": "Brand",
      name: "KiloMystery",
    },
    url: `${siteUrl}/${lang}/products`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: "17.99",
      highPrice: "25.99",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />

      <Header lang={lang} />

      <main className="container py-10 mb-16 space-y-10">
        {/* LOGO + HERO */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="mx-auto w-[160px] md:w-[220px] relative aspect-[3/1]">
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
            className="mx-auto w-[280px] md:w-[360px] h-[220px] md:h-[260px]"
          />

          <header className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
                {t.heroTitleHighlight}
              </span>{" "}
              <span className="brand-text">{t.heroTitleRest}</span>
            </h1>
            <p className="text-white/70">{t.heroSubtitle1}</p>
            <p className="text-white/70">{t.heroSubtitle2}</p>
          </header>
        </section>

        {/* STRIP TRUST */}
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

        {/* 🔸 SEZIONE RUOTA – spiegazione (nuova logica: ruota al carrello) */}
        <section className="card flex flex-col md:flex-row items-center gap-5">
          <div className="shrink-0 rounded-xl overflow-hidden border border-white/15 bg-white/10">
            <img
              src="/wheel/wheel.svg"
              alt={t.wheelTitle}
              width={500}
              height={250}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-extrabold">{t.wheelTitle}</h3>
            <p className="text-white/70 text-sm md:text-base">
              {t.wheelText}
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <a href="#buy-Standard-10" className="btn btn-silver">
              {t.wheelCtaStd}
            </a>
            <a href="#buy-premium-10" className="btn btn-gold">
              {t.wheelCtaPrm}
            </a>
          </div>
        </section>

        {/* STANDARD */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-extrabold text-silver-soft">
              Standard
            </h2>
            <p className="text-xs text-white/60 max-w-md">
              {t.standardDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 5, 10].map((kg) => (
              <PackCard
                key={`std-${kg}`}
                kind="Standard"
                kg={kg as Kg}
                video={stdV(kg as Kg)}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        </section>

        {/* PREMIUM */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-extrabold text-gold-soft">
              Premium
            </h2>
            <p className="text-xs text-white/60 max-w-md">
              {t.premiumDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 5, 10].map((kg) => (
              <PackCard
                key={`prm-${kg}`}
                kind="Premium"
                kg={kg as Kg}
                video={prmV(kg as Kg)}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        </section>

        {/* EXPLORER BUNDLE */}
        <ExplorerCard lang={lang} t={t} />

        {/* COSA PUOI TROVARE NELLE BOX */}
        <SectionInsideBox lang={lang} />

        {/* POLICY RESI */}
        <section id="policy" className="card">
          <h3 className="text-xl font-extrabold mb-2">{t.returnTitle}</h3>
          <p className="text-white/70 text-sm md:text-base">{t.returnText}</p>
          <a
            href={`/${lang}/policy/returns`}
            className="btn btn-ghost mt-3 inline-flex"
          >
            {t.returnCta}
          </a>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
