/* app/lib/ga.ts
   GA4 Ecommerce helpers (adattati al tuo cart schema)
*/

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export type KMCartItem = {
  id: string;
  title: string;
  tier?: "Standard" | "Premium" | string;
  weightKg?: number;
  pricePerKg?: number;
  qty?: number;
  image?: string;
  shopifyId?: string; // variant id (meglio per GA)
};

function getGtag() {
  if (typeof window === "undefined") return null;
  if (!window.gtag) return null;
  return window.gtag;
}

/** Rimuove chiavi con value undefined/null/"" (opzionale ma pulito) */
function cleanParams<T extends Record<string, any>>(obj: T): T {
  const out: any = {};
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out as T;
}

export function gaEvent(name: string, params: Record<string, any> = {}) {
  const gtag = getGtag();
  if (!gtag) return;

  // Se vuoi forzare DebugView: aggiungi ?ga_debug=1 all'URL
  const debugMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("ga_debug") === "1";

  gtag("event", name, cleanParams({ ...params, debug_mode: debugMode || undefined }));
}

function itemUnitPriceEUR(i: KMCartItem) {
  const pricePerKg = Number(i.pricePerKg || 0);
  const weightKg = Number(i.weightKg || 0);
  const unit = pricePerKg * weightKg;
  return Number.isFinite(unit) ? unit : 0;
}

function mapGAItem(
  i: KMCartItem,
  qtyOverride?: number,
  index?: number,
  listName?: string
) {
  const quantity = Math.max(1, Number(qtyOverride ?? i.qty ?? 1));
  const price = itemUnitPriceEUR(i);

  const weightKg = Number(i.weightKg || 0);
  const variant = weightKg > 0 ? `${weightKg}kg` : undefined;

  return cleanParams({
    item_id: String(i.shopifyId || i.id || ""),
    item_name: String(i.title || ""),
    item_brand: "KiloMystery",

    // categorie utili nei report
    item_category: i.tier ? String(i.tier) : undefined,
    item_variant: variant,

    price,
    quantity,

    // utili per report GA4 (item list)
    item_list_name: listName,
    index: typeof index === "number" ? index + 1 : undefined,
  });
}

function cartValueEUR(items: KMCartItem[]) {
  return items.reduce((sum, i) => {
    const q = Math.max(0, Number(i.qty || 0));
    return sum + itemUnitPriceEUR(i) * q;
  }, 0);
}

/* =========================
   Ecommerce events
========================= */

export function gaViewItemList(listName: string, items: KMCartItem[]) {
  if (!items?.length) return;

  gaEvent("view_item_list", {
    item_list_name: listName,
    items: items.map((i, idx) => mapGAItem(i, 1, idx, listName)),
  });
}

export function gaViewCart(items: KMCartItem[]) {
  if (!items?.length) return;

  gaEvent("view_cart", {
    currency: "EUR",
    value: cartValueEUR(items),
    items: items.map((i, idx) => mapGAItem(i, i.qty, idx)),
  });
}

export function gaAddToCart(item: KMCartItem, qtyAdded = 1) {
  const q = Math.max(1, Number(qtyAdded || 1));

  gaEvent("add_to_cart", {
    currency: "EUR",
    value: itemUnitPriceEUR(item) * q,
    items: [mapGAItem(item, q)],
  });
}

export function gaRemoveFromCart(item: KMCartItem, qtyRemoved = 1) {
  const q = Math.max(1, Number(qtyRemoved || 1));

  gaEvent("remove_from_cart", {
    currency: "EUR",
    value: itemUnitPriceEUR(item) * q,
    items: [mapGAItem(item, q)],
  });
}

export function gaBeginCheckout(items: KMCartItem[], extra?: Record<string, any>) {
  if (!items?.length) return;

  gaEvent("begin_checkout", {
    currency: "EUR",
    value: cartValueEUR(items),
    items: items.map((i, idx) => mapGAItem(i, i.qty, idx)),
    ...(extra || {}),
  });
}
