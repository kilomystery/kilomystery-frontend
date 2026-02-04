// app/api/checkout/create/route.ts
import { NextRequest, NextResponse } from "next/server";

const STOREFRONT_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; // es: kilomystery.myshopify.com
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-01";

const LOCALE_MAP: Record<string, string> = {
  it: "it",
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
};

const PASS_THROUGH_KEYS = [
  "_gl",
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_term",
  "utm_content",
] as const;

type PassKey = (typeof PASS_THROUGH_KEYS)[number];

type IncomingItem = {
  shopifyId: string | number;
  qty?: number;
  weightKg?: number;
  kg?: number;
  tier?: string;
};

function clampStr(v: string, max = 500) {
  const s = String(v ?? "");
  return s.length > max ? s.slice(0, max) : s;
}

function jsonError(status: number, payload: any) {
  return NextResponse.json(payload, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const itemsRaw = body?.items;
    const clientTotalKg = body?.totalKg;
    const returnUrl = body?.returnUrl;

    const bodyLang = typeof body?.lang === "string" ? body.lang : "it";
    const shopifyLocale = LOCALE_MAP[bodyLang] ?? "it";

    const originQuery = typeof body?.originQuery === "string" ? body.originQuery : "";
    const orderNote = typeof body?.orderNote === "string" ? body.orderNote : "";

    if (!STOREFRONT_DOMAIN || !STOREFRONT_TOKEN) {
      return jsonError(500, {
        error: "Missing Shopify configuration",
        code: "NO_ENV",
        details: {
          hasDomain: !!STOREFRONT_DOMAIN,
          hasToken: !!STOREFRONT_TOKEN,
        },
      });
    }

    if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
      return jsonError(400, { error: "Missing items", code: "NO_ITEMS" });
    }

    // ✅ normalizzazione + validazione items
    const items: IncomingItem[] = itemsRaw
      .map((i: any) => {
        const shopifyId = i?.shopifyId;
        const qty = Number(i?.qty ?? 1) || 1;
        const weightKg = Number(i?.weightKg ?? i?.kg ?? 0) || 0;
        const tier = typeof i?.tier === "string" ? i.tier : undefined;

        return { shopifyId, qty, weightKg, tier } as IncomingItem;
      })
      .filter((i: IncomingItem) => !!i.shopifyId && Number(i.qty || 0) >= 1);

    if (items.length === 0) {
      return jsonError(400, {
        error: "All items invalid (missing shopifyId/qty)",
        code: "INVALID_ITEMS",
        debug: { itemsRaw },
      });
    }

    const totalKg =
      typeof clientTotalKg === "number" && !Number.isNaN(clientTotalKg)
        ? clientTotalKg
        : items.reduce((sum: number, i: IncomingItem) => {
            const w = Number(i.weightKg || 0);
            const q = Number(i.qty || 1);
            return sum + w * q;
          }, 0);

    const lines = items.map((i: IncomingItem) => {
      const qty = Number(i.qty ?? 1) || 1;
      const weight = Number(i.weightKg ?? 0) || 0;

      const attributes: { key: string; value: string }[] = [];
      if (i.tier) attributes.push({ key: "tier", value: clampStr(i.tier, 40) });
      if (weight > 0) attributes.push({ key: "weightKg", value: String(weight) });

      const line: any = {
        quantity: qty,
        merchandiseId: `gid://shopify/ProductVariant/${i.shopifyId}`,
      };

      if (attributes.length > 0) line.attributes = attributes;
      return line;
    });

    // ✅ cart attributes LEGGERI (non mettiamo _gl/utm qui)
    const cartAttributes: { key: string; value: string }[] = [
      { key: "spinEligible", value: totalKg >= 10 ? "true" : "false" },
      { key: "orderedKg", value: String(totalKg) },
      { key: "locale", value: shopifyLocale },
    ];

    if (returnUrl) cartAttributes.push({ key: "returnUrl", value: clampStr(String(returnUrl), 220) });
    if (orderNote) cartAttributes.push({ key: "orderNote", value: clampStr(orderNote, 220) });

    const query = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart { id checkoutUrl }
          userErrors { field message }
        }
      }
    `;

    const variables = { input: { lines, attributes: cartAttributes } };

    const response = await fetch(`https://${STOREFRONT_DOMAIN}/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    const graphqlErrors = data?.errors ?? [];
    const cart = data?.data?.cartCreate?.cart;
    const userErrors = data?.data?.cartCreate?.userErrors ?? [];

    // ✅ DEBUG: in caso di failure ritorniamo TUTTO quello che serve
    if (!response.ok || graphqlErrors.length || userErrors.length) {
      return jsonError(500, {
        error: "Checkout error",
        code: "SHOPIFY_CARTCREATE_FAILED",
        message: "Shopify cartCreate failed",
        debug: {
          httpStatus: response.status,
          graphqlErrors,
          userErrors,
          // utile per capire se merchandiseId o altro è sbagliato
          sent: { lines, cartAttributes, shopifyLocale, totalKg },
          raw: data,
        },
      });
    }

    if (!cart?.checkoutUrl) {
      return jsonError(500, {
        error: "Checkout error",
        code: "NO_CHECKOUT_URL",
        message: "Missing checkoutUrl",
        debug: { raw: data },
      });
    }

    const url = new URL(cart.checkoutUrl as string);
    url.searchParams.set("locale", shopifyLocale);

    // ✅ marketing params SOLO nel checkoutUrl
    if (originQuery) {
      const qp = new URLSearchParams(originQuery.startsWith("?") ? originQuery : `?${originQuery}`);
      for (const key of PASS_THROUGH_KEYS) {
        const v = qp.get(key as PassKey);
        if (v) url.searchParams.set(String(key), clampStr(v, 500));
      }
    }

    // ✅ nota ruota anche su URL (se Shopify la supporta)
    if (orderNote) {
      url.searchParams.set("note", clampStr(orderNote, 220));
    }

    return NextResponse.json({ url: url.toString() });
  } catch (err: any) {
    return jsonError(500, {
      error: "Internal server error",
      code: "SERVER_ERROR",
      message: err?.message || "Unknown error",
    });
  }
}
