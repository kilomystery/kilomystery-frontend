export {};

type KMConsentChoice = "accept" | "reject";

type MetaQueueEntry = { event: string; payload: Record<string, any>; standard?: boolean };
type TikTokQueueEntry = { type: "page" | "track"; event?: string; payload?: Record<string, any> };

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: ((...args: any[]) => void) & { queue?: any[] };
    _fbq?: typeof window.fbq;
    ttq?: {
      track?: (event: string, payload?: Record<string, any>) => void;
      page?: () => void;
      enableCookie?: () => void;
      disableCookie?: () => void;
    };
    kmApplyConsent?: (choice?: KMConsentChoice) => void;
    __kmPendingConsentChoice?: KMConsentChoice;
    __kmConsentChoice?: KMConsentChoice;
    __kmMetaLoaded?: boolean;
    __kmTikTokLoaded?: boolean;
    __kmGaLoaded?: boolean;
    __metaConsentGranted?: boolean;
    __tiktokConsentGranted?: boolean;
    __gaConsentGranted?: boolean;
    __kmLastTrackedPath?: string;
    __kmMetaQueue?: MetaQueueEntry[];
    __kmTikTokQueue?: TikTokQueueEntry[];
  }
}
