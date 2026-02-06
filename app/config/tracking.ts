export const TRACKING_IDS = {
  GA: process.env.NEXT_PUBLIC_GA_ID || "",
  META: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  TIKTOK: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
};

export function hasTrackingIds() {
  return Boolean(TRACKING_IDS.GA || TRACKING_IDS.META || TRACKING_IDS.TIKTOK);
}
