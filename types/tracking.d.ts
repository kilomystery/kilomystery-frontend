export {};

type KMConsentChoice = "accept" | "reject";

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
    kmApplyConsent?: (choice: KMConsentChoice) => void;
    __kmPendingConsentChoice?: KMConsentChoice;
    __kmConsentChoice?: KMConsentChoice;
    __kmTikTokLoaded?: boolean;
    __kmMetaLoaded?: boolean;
    __kmGoogleLoaded?: boolean;
    __metaConsentGranted?: boolean;
    __tiktokConsentGranted?: boolean;
    __gaConsentGranted?: boolean;
    __kmLastTrackedPath?: string;
    __kmPendingMetaEvents?: Array<{ event: string; payload: Record<string, any>; standard?: boolean }>;
    __kmPendingTikTokEvents?: Array<{ type: "page" | "track"; event?: string; payload?: Record<string, any> }>;
  }
}
