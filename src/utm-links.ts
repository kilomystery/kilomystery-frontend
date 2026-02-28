// utm-links.ts
export type UTMConfig = {
  source: string;
  medium: string;
  campaign: string;
  // se vuoi mandare a una pagina specifica invece che /{lang}
  // es: "/{lang}/prodotti" oppure "/{lang}/mystery-box"
  path?: string;
};

/**
 * Chiave = slug (quello che vuoi in URL pulito)
 * Esempio: /susy, /ari, /tiktok, /instagram
 */
export const UTM_LINKS: Record<string, UTMConfig> = {
  // Influencer
  susy: { source: "susy", medium: "influencer", campaign: "collab_marzo" },
  ari: { source: "ari", medium: "influencer", campaign: "collab_marzo" },

  // Bio
  tiktok: { source: "tiktok", medium: "social", campaign: "bio" },
  instagram: { source: "instagram", medium: "social", campaign: "bio" },
};