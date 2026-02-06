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
  initAttributionStorage,
  getAttributionParams,
} from "@/app/lib/attribution";
import {
  queueMetaEvent,
  queueTikTok,
} from "@/app/lib/tracking/loaders";
import { TRACKING_IDS } from "@/app/config/tracking";

const CURRENCY = "EUR";

function hasConsent() {
  if (typeof window === "undefined") return false;
  return window.__kmConsentChoice === "accept";
}

function cleanAttribution() {
  const attrs = getAttributionParams();
  const out: Record<string, string> = {};
  Object.entries(attrs).forEach(([key, value]) => {
    if (!value) return;
    out[key] = value;
  });
  return out;
}

function buildPixelSummary(items: KMCartItem[], qtyOverride?: number) {
  let total = 0;
  let quantityTotal = 0;
  const contents = items.map((item) => {
    const quantity = Math.max(1, Number(qtyOverride ?? item.qty ?? 1));
    const price = Number(getItemUnitPriceEUR(item).toFixed(2));
    const subtotal = Number((price * quantity).toFixed(2));
    total += subtotal;
    quantityTotal += quantity;
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
    totalQuantity: quantityTotal,
  };
}

export function trackPageView(pathname: string, search?: string) {
  if (!hasConsent()) return;
  const query = search ? `?${search}` : "";
  const pagePath = `${pathname}${query}`;
  const pageLocation =
    typeof window !== "undefined"
      ? `${window.location.origin}${pagePath}`
      : pagePath;

  gaEvent("page_view", {
    page_path: pagePath,
    page_location: pageLocation,
    ...cleanAttribution(),
  });

  if (TRACKING_IDS.META) {
    queueMetaEvent(
      "PageView",
      {
        page_path: pagePath,
        page_location: pageLocation,
        ...cleanAttribution(),
      },
      true
    );
  }
  if (TRACKING_IDS.TIKTOK) {
    queueTikTok({ type: "page" });
  }
}

export function trackViewItemList(listName: string, items: KMCartItem[]) {
  if (!hasConsent() || !items?.length) return;
  gaViewItemList(listName, items);

  const summary = buildPixelSummary(items, 1);
  const payload = {
    content_ids: summary.contentIds,
    contents: summary.contents,
    content_type: "product_group",
    item_list_name: listName,
    value: summary.totalValue,
    currency: CURRENCY,
    num_items: summary.totalQuantity,
    ...cleanAttribution(),
  };

  if (TRACKING_IDS.META) {
    queueMetaEvent("ViewItemList", payload, false);
  }
  if (TRACKING_IDS.TIKTOK) {
    queueTikTok({ type: "track", event: "ViewContent", payload });
  }
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
        item_brand: "KiloMystery",
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
    value: Number(price.toFixed(2)),
    currency: CURRENCY,
    content_type: "product",
    ...cleanAttribution(),
  };

  if (TRACKING_IDS.META) {
    queueMetaEvent("ViewContent", payload, true);
  }
  if (TRACKING_IDS.TIKTOK) {
    queueTikTok({ type: "track", event: "ViewContent", payload });
  }
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
  if (TRACKING_IDS.META) {
    queueMetaEvent("AddToCart", payload, true);
  }
  if (TRACKING_IDS.TIKTOK) {
    queueTikTok({ type: "track", event: "AddToCart", payload });
  }
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
  if (TRACKING_IDS.META) {
    queueMetaEvent("RemoveFromCart", payload, false);
  }
  if (TRACKING_IDS.TIKTOK) {
    queueTikTok({ type: "track", event: "RemoveFromCart", payload });
  }
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
  if (TRACKING_IDS.META) {
    queueMetaEvent("ViewCart", payload, false);
  }
  if (TRACKING_IDS.TIKTOK) {
    queueTikTok({ type: "track", event: "ViewContent", payload });
  }
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
  if (TRACKING_IDS.META) {
    queueMetaEvent("InitiateCheckout", payload, true);
  }
  if (TRACKING_IDS.TIKTOK) {
    queueTikTok({ type: "track", event: "InitiateCheckout", payload });
  }
}

export { initAttributionStorage };
