// app/config/shopifyProducts.ts
export type Kg = 1 | 2 | 3 | 5 | 10;
export type Tier = "standard" | "premium";

export const SHOPIFY_DOMAIN = "https://kilomystery.myshopify.com";

export const SHOPIFY_VARIANTS: Record<Tier, Record<Kg, string>> = {
  standard: {
    1: "52045370360146",
    2: "52045370392914",
    3: "52045370425682",
    5: "52045370458450",
    10: "52045370491218",
  },
  premium: {
    1: "52045402571090",
    2: "52045402603858",
    3: "52045402636626",
    5: "52045402669394",
    10: "52045402702162",
  },
};
