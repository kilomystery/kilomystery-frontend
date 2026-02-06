const ATTR_KEY = "km-attribution";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type AttributionData = Partial<Record<(typeof UTM_KEYS)[number] | "referrer" | "landing_page", string>>;

export function initAttributionStorage() {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(ATTR_KEY)) return;

    const params = new URLSearchParams(window.location.search);
    const data: AttributionData = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) data[key] = value;
    }
    if (!data.utm_source && document.referrer) {
      data.referrer = document.referrer;
    } else if (document.referrer) {
      data.referrer = document.referrer;
    }
    data.landing_page = window.location.href;

    sessionStorage.setItem(ATTR_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function getAttributionParams(): AttributionData {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(ATTR_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as AttributionData;
    return parsed || {};
  } catch {
    return {};
  }
}
