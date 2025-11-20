'use client';

import { useState } from 'react';
import { useCart } from '@/app/components/cart/CartProvider';
import {
  SHOPIFY_VARIANTS,
  Kg,
  Tier,
} from '@/app/config/shopifyProducts';

type Lang = 'it' | 'en' | 'es' | 'fr' | 'de';
type TabTier = 'std' | 'prm'; // solo per i tab UI (Standard/Premium)

const LABELS: Record<Lang, any> = {
  it: {
    standard: 'Standard',
    premium: 'Premium',
    add: 'Aggiungi al carrello',
    kg: 'kg',
    perkg: '€/kg',
    sectionTitleMain: 'Pesa il mistero,',
    sectionTitleAccent: 'spacchetta la sorpresa!',
    sectionSubtitle1: 'Standard o Premium? 1 kg o 10 kg? Scegli tu.',
    sectionSubtitle2:
      'Ogni box recupera pacchi che altrimenti finirebbero nello smaltimento: meno rifiuti, meno CO₂, più valore estratto da ciò che esiste già.',
    bullet1: 'Contenuto misto – sorpresa',
    bullet2: 'Peso netto (toll. ±3%)',
    bullet3: 'Sigillo con ID lotto e data',
    badgeStd: 'Perfetta per iniziare',
    badgePrm: 'Per chi vuole il massimo',
  },
  en: {
    standard: 'Standard',
    premium: 'Premium',
    add: 'Add to cart',
    kg: 'kg',
    perkg: '€/kg',
    sectionTitleMain: 'Weigh the mystery,',
    sectionTitleAccent: 'unbox the surprise!',
    sectionSubtitle1:
      'Standard or Premium? 1 kg or 10 kg? You decide.',
    sectionSubtitle2:
      'Each box gives a second life to parcels that would otherwise be discarded: less waste, less CO₂, more value from what already exists.',
    bullet1: 'Mixed contents – pure surprise',
    bullet2: 'Net weight (±3% tolerance)',
    bullet3: 'Seal with batch ID and date',
    badgeStd: 'Perfect to start',
    badgePrm: 'For those who want more',
  },
  es: {
    standard: 'Standard',
    premium: 'Premium',
    add: 'Añadir al carrito',
    kg: 'kg',
    perkg: '€/kg',
    sectionTitleMain: 'Pesa el misterio,',
    sectionTitleAccent: '¡desempaqueta la sorpresa!',
    sectionSubtitle1:
      '¿Standard o Premium? ¿1 kg o 10 kg? Tú eliges.',
    sectionSubtitle2:
      'Cada caja recupera paquetes que de otro modo acabarían desechados: menos residuos, menos CO₂ y más valor extraído de lo que ya existe.',
    bullet1: 'Contenido mixto – sorpresa',
    bullet2: 'Peso neto (tolerancia ±3%)',
    bullet3: 'Precinto con ID de lote y fecha',
    badgeStd: 'Perfecta para empezar',
    badgePrm: 'Para quienes quieren más',
  },
  fr: {
    standard: 'Standard',
    premium: 'Premium',
    add: 'Ajouter au panier',
    kg: 'kg',
    perkg: '€/kg',
    sectionTitleMain: 'Pèse le mystère,',
    sectionTitleAccent: 'déballes la surprise !',
    sectionSubtitle1:
      'Standard ou Premium ? 1 kg ou 10 kg ? À toi de choisir.',
    sectionSubtitle2:
      'Chaque box redonne vie à des colis qui auraient fini jetés : moins de déchets, moins de CO₂, plus de valeur extraite de l’existant.',
    bullet1: 'Contenu varié – surprise',
    bullet2: 'Poids net (tolérance ±3 %)',
    bullet3: 'Scellé avec ID de lot et date',
    badgeStd: 'Parfait pour commencer',
    badgePrm: 'Pour ceux qui en veulent plus',
  },
  de: {
    standard: 'Standard',
    premium: 'Premium',
    add: 'In den Warenkorb',
    kg: 'kg',
    perkg: '€/kg',
    sectionTitleMain: 'Wiege das Geheimnis,',
    sectionTitleAccent: 'pack die Überraschung aus!',
    sectionSubtitle1:
      'Standard oder Premium? 1 kg oder 10 kg? Du entscheidest.',
    sectionSubtitle2:
      'Jede Box rettet Pakete, die sonst entsorgt würden: weniger Müll, weniger CO₂ und mehr Wert aus dem, was schon da ist.',
    bullet1: 'Gemischter Inhalt – Überraschung',
    bullet2: 'Nettogewicht (Toleranz ±3 %)',
    bullet3: 'Siegel mit Posten-ID und Datum',
    badgeStd: 'Perfekt zum Start',
    badgePrm: 'Für alle, die mehr wollen',
  },
};

const WEIGHTS: Kg[] = [1, 2, 3, 5, 10];

/** prezzi indicativi come avevamo prima */
function priceForKg(weight: number, tier: TabTier) {
  if (tier === 'prm') {
    const perKg = weight <= 3 ? 25.99 : 20.99;
    return { perKg, total: +(perKg * weight).toFixed(2) };
  }
  const perKg = weight <= 3 ? 19.9 : 17.99;
  return { perKg, total: +(perKg * weight).toFixed(2) };
}

/** CO₂ indicativa evitata per kg (stima), per lingua */
const co2ByKg: Record<Lang, Record<Kg, string>> = {
  it: {
    1: '≈0,25 kg di CO₂ evitati',
    2: '≈0,5 kg di CO₂ evitati',
    3: '≈0,75 kg di CO₂ evitati',
    5: '≈1,25 kg di CO₂ evitati',
    10: '≈2,5 kg di CO₂ evitati',
  },
  en: {
    1: '≈0.25 kg of CO₂ avoided',
    2: '≈0.5 kg of CO₂ avoided',
    3: '≈0.75 kg of CO₂ avoided',
    5: '≈1.25 kg of CO₂ avoided',
    10: '≈2.5 kg of CO₂ avoided',
  },
  es: {
    1: '≈0,25 kg de CO₂ evitados',
    2: '≈0,5 kg de CO₂ evitados',
    3: '≈0,75 kg de CO₂ evitados',
    5: '≈1,25 kg de CO₂ evitados',
    10: '≈2,5 kg de CO₂ evitados',
  },
  fr: {
    1: '≈0,25 kg de CO₂ évités',
    2: '≈0,5 kg de CO₂ évités',
    3: '≈0,75 kg de CO₂ évités',
    5: '≈1,25 kg de CO₂ évités',
    10: '≈2,5 kg de CO₂ évités',
  },
  de: {
    1: '≈0,25 kg CO₂ eingespart',
    2: '≈0,5 kg CO₂ eingespart',
    3: '≈0,75 kg CO₂ eingespart',
    5: '≈1,25 kg CO₂ eingespart',
    10: '≈2,5 kg CO₂ eingespart',
  },
};

const euro = (n: number) =>
  n.toLocaleString('it-IT', {
    style: 'currency',
    currency: 'EUR',
  });

export default function ProductsTabs({ lang = 'it' as Lang }) {
  const [tab, setTab] = useState<TabTier>('std');
  const { addItem } = useCart();

  const supported = ['it', 'en', 'es', 'fr', 'de'] as const;
  const normalized = String(lang).toLowerCase();
  const safeLang: Lang = (supported as readonly string[]).includes(
    normalized as any,
  )
    ? (normalized as Lang)
    : 'it';

  const L = LABELS[safeLang];

  // kind “umano” per UI
  const currentKind: 'Standard' | 'Premium' =
    tab === 'std' ? 'Standard' : 'Premium';

  function handleAddToCart(
    kind: 'Standard' | 'Premium',
    kg: Kg,
    perKg: number,
  ) {
    const tier: Tier = kind === 'Standard' ? 'standard' : 'premium';

    const shopifyId = SHOPIFY_VARIANTS[tier][kg];

    addItem({
      id: `${tier}-${kg}`, // id interno carrello
      title: `${kind} · ${kg} kg`,
      tier,
      weightKg: kg,
      pricePerKg: perKg,
      qty: 1,
      shopifyId,
    });
  }

  return (
    <section className="container py-10 space-y-6">
      {/* Titolo sezione */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-2">
          {L.sectionTitleMain}{' '}
          <span className="text-white/80">{L.sectionTitleAccent}</span>
        </h2>
        <p className="text-white/70">{L.sectionSubtitle1}</p>
        <p className="text-white/70 mt-2 text-sm md:text-base">
          {L.sectionSubtitle2}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-3">
        <button
          className={[
            'px-5 py-2 rounded-full font-semibold transition border',
            tab === 'std'
              ? 'bg-gradient-to-b from-white/80 to-white/60 text-[#0f1216] border-white/70 shadow-[0_10px_30px_rgba(180,200,190,.25)]'
              : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10',
          ].join(' ')}
          onClick={() => setTab('std')}
        >
          {L?.standard || 'Standard'}
        </button>
        <button
          className={[
            'px-5 py-2 rounded-full font-semibold transition border',
            tab === 'prm'
              ? 'bg-gradient-to-b from-[#f6e27a] to-[#d4af37] text-[#1a1a1a] border-yellow-100/70 shadow-[0_10px_30px_rgba(212,175,55,.35)]'
              : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10',
          ].join(' ')}
          onClick={() => setTab('prm')}
        >
          {L?.premium || 'Premium'}
        </button>
      </div>

      {/* Grid prodotti */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {WEIGHTS.map((w) => {
          const { perKg, total } = priceForKg(w, tab);
          const src = `/videos/packs/${
            tab === 'std' ? 'std' : 'prm'
          }-${w}.mp4`;
          const kg = w as Kg;
          const isStd = tab === 'std';

          const co2Text = co2ByKg[safeLang][kg];

          return (
            <article
              key={`${tab}-${w}`}
              id={tab === 'std' && w === 10 ? 'buy-standard-10' : undefined}
              className={`card ${
                isStd ? 'card--standard' : 'card--premium'
              }`}
            >
              {/* badge */}
              <div className="flex items-center justify-between mb-2 text-[0.7rem] uppercase tracking-[.15em] text-white/60">
                <span>
                  {isStd ? L.badgeStd : L.badgePrm}
                </span>
                <span
                  className={`pill ${
                    isStd ? 'pill--std' : 'pill--prm'
                  }`}
                >
                  {w} {L.kg} ·{' '}
                  {isStd ? L.standard : L.premium}
                </span>
              </div>

              {/* video stile products page */}
              <div
                className={`media-wrap ${
                  isStd ? 'media-wrap--std' : 'media-wrap--prm'
                }`}
              >
                <div className="ratio-16-9">
                  <video
                    className="media rounded-[12px] object-cover"
                    src={src}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                  />
                </div>
              </div>

              {/* testo + prezzo */}
              <div className="mt-4 flex items-start justify-between gap-4">
                <h3 className="product-title text-xl">
                  {isStd ? L.standard : L.premium}{' '}
                  <span className="dot" /> {w} {L.kg}
                </h3>

                <div className="text-right space-y-1">
                  <div
                    className={`price-figure ${
                      isStd
                        ? 'price-figure--std'
                        : 'price-figure--prm'
                    } text-3xl`}
                  >
                    {euro(total)}
                  </div>
                  <div className="price-perkg">
                    ({perKg.toFixed(2)} {L.perkg || '€/kg'})
                  </div>
                  {co2Text && (
                    <div className="text-[0.7rem] text-emerald-200/90">
                      ♻ {co2Text}
                    </div>
                  )}
                </div>
              </div>

              {/* bullets */}
              <ul className="bullets mt-3 space-y-1">
                <li>{L.bullet1}</li>
                <li>{L.bullet2}</li>
                <li>{L.bullet3}</li>
                <li>{co2Text}</li>
              </ul>

              {/* bottone */}
              <div className="mt-4">
                <button
                  className={`btn w-full ${
                    isStd ? 'btn-silver' : 'btn-gold'
                  }`}
                  onClick={() =>
                    handleAddToCart(
                      currentKind,
                      kg,
                      perKg,
                    )
                  }
                  type="button"
                >
                  {L?.add || 'Aggiungi al carrello'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
