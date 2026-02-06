"use client";

import {
  KMCartItem,
  gaAddToCart,
  gaBeginCheckout,
  gaEvent,
  gaRemoveFromCart,
  gaViewCart,
  gaViewItemList,
  getItemUnitPriceEUR,
} from "@/app/lib/ga";
import {
  AttributionData,
  getAttributionParams,
  initAttributionStorage,
} from "@/app/lib/attribution";

type MetaEvent = { event: string; payload: Record<string, any>; standard?: boolean };
type TikTokEvent = { type: "track" | "page"; event?: string; payload?: Record<string, any> };

const BRAND = "KiloMystery";
const CURRENCY = "EUR";

const fallbackMetaQueue: MetaEvent[] = [];
const fallbackTikTokQueue: TikTokEvent[] = [];

function getMetaQueue() {
  if (typeof window === "undefined") return fallbackMetaQueue;
  if (!window.__kmPendingMetaEvents) {
    window.__kmPendingMetaEvents = [];
  }
  return window.__kmPendingMetaEvents;
}

function getTikTokQueue() {
  if (typeof window === "undefined") return fallbackTikTokQueue;
  if (!window.__kmPendingTikTokEvents) {
    window.__kmPendingTikTokEvents = [];
  }
  return window.__kmPendingTikTokEvents;
}

function hasConsent() {
  if (typeof window === "undefined") return false;
  return window.__kmConsentChoice === "accept";
}

function metaEnabled() {
  return typeof window !== "undefined" && window.__metaConsentGranted;
}

function tikTokEnabled() {
  return typeof window !== "undefined" && window.__tiktokConsentGranted;
}

function cleanAttribution(): AttributionData {
  const attrs = getAttributionParams();
  const out: AttributionData = {};
  Object.entries(attrs).forEach(([key, value]) => {
    if (!value) return;
    out[key as keyof AttributionData] = value;
  });
  return out;
}

function buildPixelSummary(items: KMCartItem[], quantityOverride?: number) {
  let total = 0;
  let count = 0;
  const contents = items.map((item) => {
    const quantity = Math.max(1, Number(quantityOverride ?? item.qty ?? 1));
    const price = Number(getItemUnitPriceEUR(item).toFixed(2));
    const subtotal = Number((price * quantity).toFixed(2));
    total += subtotal;
    count += quantity;
    return {
      content_id: String(item.shopifyId || item.id || ""),
      content_name: String(item.title || ""),
      content_type: "product",
      price,
      quantity,
    };
  });

  return {
    contents,
    contentIds: contents.map((c) => c.content_id),
    totalValue: Number(total.toFixed(2)),
    totalQuantity: count,
  };
}

function dispatchMeta(event: string, payload: Record<string, any>, standard = true) {
  if (!metaEnabled()) return;
  const fbq = typeof window !== "undefined" ? window.fbq : undefined;
  if (!fbq) {
    getMetaQueue().push({ event, payload, standard });
    return;
  }

  try {
    fbq(standard ? "track" : "trackCustom", event, payload);
  } catch {
    getMetaQueue().push({ event, payload, standard });
  }
}

function dispatchTikTok(event: TikTokEvent) {
  if (!tikTokEnabled()) return;
  const ttq = typeof window !== "undefined" ? window.ttq : undefined;
  if (!ttq) {
    getTikTokQueue().push(event);
    return;
  }

  try {
    if (event.type === "page") {
      ttq.page?.();
    } else if (event.event) {
      ttq.track?.(event.event, event.payload);
    }
  } catch {
    getTikTokQueue().push(event);
  }
}

export function flushPendingMetaEvents() {
  if (!metaEnabled()) {
    getMetaQueue().length = 0;
    return;
  }
  const fbq = typeof window !== "undefined" ? window.fbq : undefined;
  if (!fbq) return;

  const queue = getMetaQueue();
  while (queue.length) {
    const evt = queue.shift();
    if (!evt) continue;
    try {
      fbq(evt.standard === false ? "trackCustom" : "track", evt.event, evt.payload);
    } catch {
      // ignore single failure but stop infinite loop
    }
  }
}

export function flushPendingTikTokEvents() {
  if (!tikTokEnabled()) {
    getTikTokQueue().length = 0;
    return;
  }
  const ttq = typeof window !== "undefined" ? window.ttq : undefined;
  if (!ttq) return;

  const queue = getTikTokQueue();
  while (queue.length) {
    const evt = queue.shift();
    if (!evt) continue;
    try {
      if (evt.type === "page") {
        ttq.page?.();
      } else if (evt.event) {
        ttq.track?.(evt.event, evt.payload);
      }
    } catch {
      // swallow single failure
    }
  }
}

export function trackPageView(pathname: string, search?: string) {
  if (!hasConsent()) return;
  const query = search ? `?${search}` : "";
  const pagePath = `${pathname}${query}`;
  const pageLocation =
    typeof window !== "undefined" ? `${window.location.origin}${pagePath}` : pagePath;

  gaEvent("page_view", {
    page_location: pageLocation,
    page_path: pagePath,
    ...cleanAttribution(),
  });

  dispatchMeta(
    "PageView",
    {
      page_location: pageLocation,
      page_path: pagePath,
      ...cleanAttribution(),
    },
    true
  );
  dispatchTikTok({ type: "page" });
}

export function trackViewItemList(listName: string, items: KMCartItem[]) {
  if (!hasConsent() || !items?.length) return;
  gaViewItemList(listName, items);

  const summary = buildPixelSummary(items, 1);
  const payloadBase = {
    content_ids: summary.contentIds,
    contents: summary.contents,
    content_type: "product_group",
    item_list_name: listName,
    value: summary.totalValue,
    currency: CURRENCY,
    num_items: summary.totalQuantity,
    ...cleanAttribution(),
  };
  dispatchMeta("ViewItemList", payloadBase, false);
  dispatchTikTok({
    type: "track",
    event: "ViewContent",
    payload: payloadBase,
  });
}

export function trackViewContent(item: KMCartItem) {
  if (!hasConsent()) return;
  const price = getItemUnitPriceEUR(item);
  gaEvent("view_item", {
    currency: CURRENCY,
    value: price,
    items: [
      {
        item_id: String(item.shopifyId || item.id || ""),
        item_name: String(item.title || ""),
        item_brand: BRAND,
        item_category: item.tier ? String(item.tier) : undefined,
        price,
        quantity: 1,
      },
    ],
    ...cleanAttribution(),
  });

  const payload = {
    contents: [
      {
        content_id: String(item.shopifyId || item.id || ""),
        content_name: String(item.title || ""),
        content_type: "product",
        price,
        quantity: 1,
      },
    ],
    content_type: "product",
    value: Number(price.toFixed(2)),
    currency: CURRENCY,
    ...cleanAttribution(),
  };
  dispatchMeta("ViewContent", payload);
  dispatchTikTok({ type: "track", event: "ViewContent", payload });
}

export function trackAddToCart(item: KMCartItem, qty = 1) {
  if (!hasConsent()) return;
  gaAddToCart(item, qty);
  const summary = buildPixelSummary([item], qty);
  const payload = {
    contents: summary.contents,
    content_type: "product",
    value: summary.totalValue,
    currency: CURRENCY,
    num_items: summary.totalQuantity,
    ...cleanAttribution(),
  };
  dispatchMeta("AddToCart", payload);
  dispatchTikTok({ type: "track", event: "AddToCart", payload });
}

export function trackRemoveFromCart(item: KMCartItem, qty = 1) {
  if (!hasConsent()) return;
  gaRemoveFromCart(item, qty);
  const summary = buildPixelSummary([item], qty);
  const payload = {
    contents: summary.contents,
    content_type: "product",
    value: summary.totalValue,
    currency: CURRENCY,
    num_items: summary.totalQuantity,
    ...cleanAttribution(),
  };
  dispatchMeta("RemoveFromCart", payload, false);
  dispatchTikTok({ type: "track", event: "RemoveFromCart", payload });
}

export function trackViewCart(items: KMCartItem[]) {
  if (!hasConsent() || !items?.length) return;
  gaViewCart(items);
  const summary = buildPixelSummary(items);
  const payload = {
    contents: summary.contents,
    content_type: "cart",
    value: summary.totalValue,
    currency: CURRENCY,
    num_items: summary.totalQuantity,
    ...cleanAttribution(),
  };
  dispatchMeta("ViewCart", payload, false);
  dispatchTikTok({ type: "track", event: "ViewContent", payload });
}

export function trackInitiateCheckout(items: KMCartItem[], extra?: Record<string, any>) {
  if (!hasConsent() || !items?.length) return;
  gaBeginCheckout(items, extra);
  const summary = buildPixelSummary(items);
  const payload = {
    contents: summary.contents,
    content_type: "checkout",
    value: summary.totalValue,
    currency: CURRENCY,
    num_items: summary.totalQuantity,
    ...cleanAttribution(),
    ...(extra || {}),
  };
  dispatchMeta("InitiateCheckout", payload);
  dispatchTikTok({ type: "track", event: "InitiateCheckout", payload });
}

export function trackPurchase(_order: {
  id?: string;
  items: KMCartItem[];
  value: number;
  currency?: string;
}) {
  // TODO: implement purchase tracking once the frontend has a dedicated thank-you page with order data.
}

export { initAttributionStorage };
