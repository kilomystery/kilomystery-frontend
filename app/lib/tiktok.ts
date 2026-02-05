// lib/tiktok.ts
"use client";

declare global {
  interface Window {
    ttq?: any;
    __tiktokConsentGranted?: boolean;
  }
}

export type TikTokContent = {
  content_id: string;
  content_type: "product" | "product_group";
  content_name?: string;
  price?: number;
  num_items?: number;
};

function canFire() {
  return typeof window !== "undefined" && window.__tiktokConsentGranted && window.ttq;
}

export function ttqTrack(event: string, payload: any) {
  if (!canFire()) return;
  window.ttq.track(event, payload);
}

export function ttqPage() {
  if (!canFire()) return;
  window.ttq.page();
}

/**
 * Advanced Matching / Identify:
 * - usalo SOLO se hai email/phone e SOLO dopo consenso ad_storage/ad_personalization (marketing)
 * - valori DEVONO essere SHA-256 (lowercase + trim prima di hashare)
 */
export function ttqIdentify(hashed: { email?: string; phone_number?: string; external_id?: string }) {
  if (!canFire()) return;
  window.ttq.identify(hashed);
}
