"use client";

const CONSENT_DENIED = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  functionality_storage: "denied",
  personalization_storage: "denied",
  security_storage: "granted",
};

type MetaQueueEntry = { event: string; payload: Record<string, any>; standard?: boolean };
type TikTokQueueEntry = { type: "page" | "track"; event?: string; payload?: Record<string, any> };

function getMetaQueue() {
  if (typeof window === "undefined") return [] as MetaQueueEntry[];
  if (!window.__kmMetaQueue) {
    window.__kmMetaQueue = [];
  }
  return window.__kmMetaQueue;
}

function getTikTokQueue() {
  if (typeof window === "undefined") return [] as TikTokQueueEntry[];
  if (!window.__kmTikTokQueue) {
    window.__kmTikTokQueue = [];
  }
  return window.__kmTikTokQueue;
}

export function initGa(gaId: string) {
  if (!gaId || typeof window === "undefined") return;
  if (window.__kmGaLoaded) return;
  window.__kmGaLoaded = true;

  window.dataLayer = window.dataLayer || [];
  function gtag(this: any) {
    window.dataLayer?.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  window.gtag("consent", "default", CONSENT_DENIED);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", gaId, {
    send_page_view: false,
    linker: {
      domains: [
        "www.kilomystery.com",
        "kilomystery.com",
        "shop.kilomystery.com",
        "account.kilomystery.com",
      ],
      accept_incoming: true,
    },
  });
}

export function updateGaConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (!gtag) return;

  gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
    functionality_storage: granted ? "granted" : "denied",
    personalization_storage: granted ? "granted" : "denied",
    security_storage: "granted",
  });
}

export function initMetaPixel(pixelId: string) {
  if (!pixelId || typeof window === "undefined") return;
  if (window.__kmMetaLoaded) {
    flushMetaQueue();
    return;
  }
  window.__kmMetaLoaded = true;

  if (process.env.NODE_ENV !== "production") {
    console.info("[KM Tracking] loading Meta Pixel");
  }

  if (typeof window.fbq === "function") {
    window.fbq("init", pixelId);
    flushMetaQueue();
    return;
  }

  const fbq: any = function (...args: any[]) {
    fbq.callMethod ? fbq.callMethod.apply(fbq, args) : fbq.queue.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  script.onload = () => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[KM_TRACK] meta loaded=", true);
    }
    flushMetaQueue();
  };
  document.head.appendChild(script);

  const fbqInstance = window.fbq;
  if (fbqInstance) {
    fbqInstance("init", pixelId);
  }
}

export function queueMetaEvent(event: string, payload: Record<string, any>, standard = true) {
  if (typeof window === "undefined") return;
  const fbq = window.fbq;
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

export function flushMetaQueue() {
  if (typeof window === "undefined") return;
  const fbq = window.fbq;
  if (!fbq) return;

  const queue = getMetaQueue();
  while (queue.length) {
    const evt = queue.shift();
    if (!evt) continue;
    try {
      fbq(evt.standard === false ? "trackCustom" : "track", evt.event, evt.payload);
    } catch {
      // ignore single failure
    }
  }
}

export function initTikTokPixel(pixelId: string) {
  if (!pixelId || typeof window === "undefined") return;
  if (window.__kmTikTokLoaded) {
    flushTikTokQueue();
    return;
  }
  window.__kmTikTokLoaded = true;

  if (process.env.NODE_ENV !== "production") {
    console.info("[KM Tracking] loading TikTok Pixel");
  }

  (function (w: any, d: any, t: any, id: string) {
    w.TiktokAnalyticsObject = t;
    const ttq = (w.ttq = w.ttq || []);
    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
    ];
    ttq.setAndDefer = function (_t: any, e: any) {
      _t[e] = function () {
        _t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.load = function (pixel: string) {
      const s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${pixel}&lib=${t}`;
      s.onload = () => {
        if (process.env.NODE_ENV !== "production") {
          console.log("[KM_TRACK] tiktok loaded=", true);
        }
        flushTikTokQueue();
      };
      const n = document.getElementsByTagName("script")[0];
      n?.parentNode?.insertBefore(s, n);
    };
    ttq.load(id);
  })(window as any, document, "ttq", pixelId);
}

export function queueTikTok(event: TikTokQueueEntry) {
  if (typeof window === "undefined") return;
  const ttq = window.ttq;
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

export function flushTikTokQueue() {
  if (typeof window === "undefined") return;
  const ttq = window.ttq;
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
      // ignore
    }
  }
}
