// lib/products.ts
export type Product = {
  sku: string;
  title: string;
  price: number; // EUR
  kg: number;
  tier: 'standard' | 'premium';
  video: string;     // path MP4 2:1
  badge?: string;
  highlight?: boolean;
  note?: string;
  shopifyId: string; // 👉 aggiunto!
};

// Prezzi
const S = { 1: 19.90, 2: 39.80, 3: 59.90, 5: 89.90, 10: 179.90 };
const P = { 1: 24.90, 2: 49.80, 3: 74.90, 5: 112.90, 10: 224.90 };

// 👉 Shopify Variant IDs
const VARIANT_IDS = {
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

export const products: Product[] = [
  // STANDARD
  { sku: 'STD-1',  title: 'Standard · 1 kg',  price: S[1],  kg: 1,  tier: 'standard', video: '/videos/packs/std-1.mp4',  badge: 'Entry', shopifyId: VARIANT_IDS.Standard[1] },
  { sku: 'STD-2',  title: 'Standard · 2 kg',  price: S[2],  kg: 2,  tier: 'standard', video: '/videos/packs/std-2.mp4', shopifyId: VARIANT_IDS.Standard[2] },
  { sku: 'STD-3',  title: 'Standard · 3 kg',  price: S[3],  kg: 3,  tier: 'standard', video: '/videos/packs/std-3.mp4',  badge: 'Ottimo inizio', shopifyId: VARIANT_IDS.Standard[3] },
  { sku: 'STD-5',  title: 'Standard · 5 kg',  price: S[5],  kg: 5,  tier: 'standard', video: '/videos/packs/std-5.mp4',  badge: 'Più venduto', highlight: true, shopifyId: VARIANT_IDS.Standard[5] },
  { sku: 'STD-10', title: 'Standard · 10 kg', price: S[10], kg: 10, tier: 'standard', video: '/videos/packs/std-10.mp4', badge: 'Miglior valore', shopifyId: VARIANT_IDS.Standard[10] },

  // PREMIUM
  { sku: 'PRM-1',  title: 'Premium · 1 kg',   price: P[1],  kg: 1,  tier: 'premium',  video: '/videos/packs/prm-1.mp4',  badge: 'Selezione', shopifyId: VARIANT_IDS.Premium[1] },
  { sku: 'PRM-2',  title: 'Premium · 2 kg',   price: P[2],  kg: 2,  tier: 'premium',  video: '/videos/packs/prm-2.mp4', shopifyId: VARIANT_IDS.Premium[2] },
  { sku: 'PRM-3',  title: 'Premium · 3 kg',   price: P[3],  kg: 3,  tier: 'premium',  video: '/videos/packs/prm-3.mp4',  badge: 'Consigliato', highlight: true, shopifyId: VARIANT_IDS.Premium[3] },
  { sku: 'PRM-5',  title: 'Premium · 5 kg',   price: P[5],  kg: 5,  tier: 'premium',  video: '/videos/packs/prm-5.mp4', shopifyId: VARIANT_IDS.Premium[5] },
  { sku: 'PRM-10', title: 'Premium · 10 kg',  price: P[10], kg: 10, tier: 'premium',  video: '/videos/packs/prm-10.mp4', badge: 'Max esperienza', shopifyId: VARIANT_IDS.Premium[10] }
];
