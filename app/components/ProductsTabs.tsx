'use client';

import { useState } from 'react';

type Lang = 'it' | 'en' | 'es' | 'fr' | 'de';
type Kg = 1 | 2 | 3 | 5 | 10;
type Tier = 'std' | 'prm';

const LABELS: Record<Lang, any> = {
  it: { standard: 'Standard', premium: 'Premium', add: 'Aggiungi al carrello', kg: 'kg', perkg: '€/kg' },
  en: { standard: 'Standard', premium: 'Premium', add: 'Add to cart', kg: 'kg', perkg: '€/kg' },
  es: { standard: 'Standard', premium: 'Premium', add: 'Añadir al carrito', kg: 'kg', perkg: '€/kg' },
  fr: { standard: 'Standard', premium: 'Premium', add: 'Ajouter au panier', kg: 'kg', perkg: '€/kg' },
  de: { standard: 'Standard', premium: 'Premium', add: 'In den Warenkorb', kg: 'kg', perkg: '€/kg' },
};

const WEIGHTS = [1, 2, 3, 5, 10] as const;

/** prezzi indicativi come avevamo prima */
function priceForKg(weight: number, tier: Tier) {
  if (tier === 'prm') {
    const perKg = weight <= 3 ? 25.99 : 20.99;
    return { perKg, total: +(perKg * weight).toFixed(2) };
  }
  const perKg = weight <= 3 ? 19.9 : 17.99;
  return { perKg, total: +(perKg * weight).toFixed(2) };
}

/** CO₂ indicativa evitata per kg (stima) */
const co2ByKg: Record<Kg, string> = {
  1: '≈0,25 kg di CO₂ evitati',
  2: '≈0,5 kg di CO₂ evitati',
  3: '≈0,75 kg di CO₂ evitati',
  5: '≈1,25 kg di CO₂ evitati',
  10: '≈2,5 kg di CO₂ evitati',
};

/**
 * Link diretti al carrello Shopify per ogni combinazione
 * Standard/Premium + peso.
 */
const shopifyCartUrlMap: Record<'Standard' | 'Premium', Record<Kg, string>> = {
  Standard: {
    1: 'https://kilomystery.myshopify.com/cart/52045370360146:1',
    2: 'https://kilomystery.myshopify.com/cart/52045370392914:1',
    3: 'https://kilomystery.myshopify.com/cart/52045370425682:1',
    5: 'https://kilomystery.myshopify.com/cart/52045370458450:1',
    10: 'https://kilomystery.myshopify.com/cart/52045370491218:1',
  },
  Premium: {
    1: 'https://kilomystery.myshopify.com/cart/52045402571090:1',
    2: 'https://kilomystery.myshopify.com/cart/52045402603858:1',
    3: 'https://kilomystery.myshopify.com/cart/52045402636626:1',
    5: 'https://kilomystery.myshopify.com/cart/52045402669394:1',
    10: 'https://kilomystery.myshopify.com/cart/52045402702162:1',
  },
};

/** Gradients coerenti con background verde/midnight */
const silverCards = [
  'from-[#e3e8ea]/90 to-[#b7c0c6]/90', // argento chiaro
  'from-[#d7dde2]/90 to-[#a9b1b7]/90', // metal freddo
  'from-[#e6e6e6]/90 to-[#bfbfbf]/90', // neutro
];

const goldCards = [
  'from-[#f6e27a]/90 to-[#d4af37]/90', // gold
  'from-[#f9e79f]/90 to-[#c9a14b]/90', // champagne
  'from-[#f7d774]/90 to-[#d4b35a]/90', // caldo
];

/** Bottoni */
const silverBtn =
  'bg-gradient-to-r from-[#f0f2f5] to-[#c9d0d6] text-[#0f1216] font-extrabold rounded-xl px-5 py-3 shadow-[0_10px_30px_rgba(180,190,200,.25)] ring-1 ring-white/40 hover:shadow-[0_16px_40px_rgba(180,190,200,.35)] transition';
const goldBtn =
  'bg-gradient-to-r from-[#f6e27a] to-[#d4af37] text-[#1a1a1a] font-extrabold rounded-xl px-5 py-3 shadow-[0_10px_30px_rgba(212,175,55,.25)] ring-1 ring-yellow-100/60 hover:shadow-[0_16px_40px_rgba(212,175,55,.35)] transition';

export default function ProductsTabs({ lang = 'it' as Lang }) {
  const [tab, setTab] = useState<Tier>('std');

  const supported = ['it', 'en', 'es', 'fr', 'de'] as const;
  const normalized = String(lang).toLowerCase();
  const safeLang: Lang = (supported as readonly string[]).includes(normalized as any)
    ? (normalized as Lang)
    : 'it';

  const L = LABELS[safeLang];

  const currentKind: 'Standard' | 'Premium' = tab === 'std' ? 'Standard' : 'Premium';

  return (
    <section className="container py-10 space-y-6">
      {/* Titolo sezione */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-2">
          Pesa il mistero, <span className="text-white/80">spacchetta la sorpresa!</span>
        </h2>
        <p className="text-white/70">
          Standard o Premium? 1 kg o 10 kg? Scegli tu — e il bonus della ruota può aggiungere
          ancora più kg.
        </p>
        <p className="text-white/70 mt-2 text-sm md:text-base">
          Ogni box recupera pacchi che altrimenti finirebbero nello smaltimento: meno rifiuti,
          meno CO₂, più valore estratto da ciò che esiste già.
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
        {WEIGHTS.map((w, i) => {
          const { perKg, total } = priceForKg(w, tab);
          const src = `/videos/packs/${tab === 'std' ? 'std' : 'prm'}-${w}.mp4`;
          const gradient =
            tab === 'std'
              ? `bg-gradient-to-br ${silverCards[i % silverCards.length]}`
              : `bg-gradient-to-br ${goldCards[i % goldCards.length]}`;

          const kg = w as Kg;
          const cartUrl = shopifyCartUrlMap[currentKind][kg];

          return (
            <article
              key={`${tab}-${w}`}
              className={[
                'relative rounded-2xl border',
                'border-white/10',
                gradient,
                // layer di “glass” per far vibrare meno i gradient e integrarsi col bg
                'before:absolute before:inset-0 before:bg-[#0f1216]/40 before:rounded-2xl before:pointer-events-none',
                // glow + hover
                'shadow-[0_20px_60px_rgba(0,0,0,.25)] hover:shadow-[0_30px_80px_rgba(0,0,0,.35)]',
                'transition-transform duration-200 hover:-translate-y-0.5',
                'p-4',
              ].join(' ')}
            >
              {/* badge 10kg */}
              {w === 10 && (
                <div className="absolute -top-3 right-3 z-20">
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold text-[#0f1216] bg-gradient-to-r from-purple-300 to-emerald-300 ring-1 ring-white/60 shadow-md">
                    🎡 1 giro incluso
                  </span>
                </div>
              )}

              {/* video */}
              <div className="relative rounded-xl overflow-hidden border border-white/20 bg-black">
                <video
                  className="block w-full h-full object-cover aspect-[16/9] drop-shadow-[0_24px_40px_rgba(0,0,0,.45)]"
                  src={src}
                  muted
                  autoPlay
                  loop
                  playsInline
                />
                {/* cornice glow sottile */}
                <div className="pointer-events-none absolute inset-0 ring-1 ring-white/15 rounded-xl" />
              </div>

              {/* testo + prezzo */}
              <div className="mt-4 relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className={[
                      'text-lg font-extrabold tracking-tight',
                      tab === 'prm'
                        ? 'text-[#1a1a1a] drop-shadow-[0_1px_0_rgba(255,255,255,.35)]'
                        : 'text-[#0f1216]',
                    ].join(' ')}
                  >
                    {tab === 'std' ? L?.standard || 'Standard' : L?.premium || 'Premium'} · {w}{' '}
                    {L?.kg || 'kg'}
                  </h3>

                  <div className="text-right">
                    <div
                      className={[
                        'text-2xl md:text-3xl font-extrabold',
                        tab === 'prm' ? 'text-[#1a1a1a]' : 'text-[#0f1216]',
                      ].join(' ')}
                    >
                      {total.toFixed(2)} €
                    </div>
                    <div className="text-black/60 text-sm">
                      ({perKg.toFixed(2)} {L?.perkg || '€/kg'})
                    </div>
                  </div>
                </div>

                <ul className="mt-3 text-black/70 text-sm space-y-1">
                  <li>Contenuto misto – sorpresa</li>
                  <li>Peso netto (toll. ±3%)</li>
                  <li>Sigillo con ID lotto e data</li>
                  <li>{co2ByKg[kg]}</li>
                  {w === 10 && (
                    <li className="font-semibold">
                      🎡 Include 1 giro: bonus fino a <b>+2 kg</b>
                    </li>
                  )}
                </ul>

                <div className="mt-4">
                  <a href={cartUrl} rel="noreferrer">
                    <button className={tab === 'prm' ? goldBtn : silverBtn}>
                      {L?.add || 'Aggiungi al carrello'}
                    </button>
                  </a>
                </div>
              </div>
            </article>
          );
        })}

        {/* Card promo ruota */}
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-200/30 to-purple-200/30 p-5 shadow-[0_20px_60px_rgba(0,0,0,.25)] hover:shadow-[0_30px_80px_rgba(0,0,0,.35)] transition">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="rounded-xl overflow-hidden border border-white/20 bg-black/60">
              <img
                src="/wheel/wheel.svg"
                alt="Ruota della fortuna"
                width={420}
                height={210}
                className="block"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-white">Ruota della fortuna</h3>
              <p className="text-white/80">
                Con un ordine da <b>10 kg</b> ottieni <b>1 giro immediato</b> nella pagina di
                conferma ordine. Finestra di utilizzo: <b>30 minuti</b>. Premi fino a <b>+2 kg</b>.
              </p>
            </div>
            <a
              href={`/${safeLang}/products#buy-standard-10`}
              className="rounded-xl px-4 py-2 font-bold bg-gradient-to-r from-purple-300 to-emerald-300 text-[#0f1216] ring-1 ring-white/60 shadow-md"
            >
              Acquista 10 kg
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
