// app/api/checkout/create/route.ts
import { NextRequest, NextResponse } from "next/server";

const STOREFRONT_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; // es: kilomystery.myshopify.com
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// Se vuoi cambiare versione, mettila in env SHOPIFY_API_VERSION
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-01";

const LOCALE_MAP: Record<string, string> = {
  it: "it",
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
};

// ✅ whitelist parametri da propagare al checkout
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const itemsRaw = body?.items;
    const clientTotalKg = body?.totalKg;
    const returnUrl = body?.returnUrl;

    // ✅ lingua dal client
    const bodyLang = typeof body?.lang === "string" ? body.lang : "it";
    const shopifyLocale = LOCALE_MAP[bodyLang] ?? "it";

    // ✅ query string del browser passata dal client
    const originQuery =
      typeof body?.originQuery === "string" ? body.originQuery : "";

    // ✅ nota ordine opzionale (se la vuoi passare)
    // Esempio: "🎁 Bonus ruota: 1.25 kg"
    const orderNote =
      typeof body?.orderNote === "string" ? body.orderNote : "";

    // 🔐 Controllo env
    if (!STOREFRONT_DOMAIN || !STOREFRONT_TOKEN) {
      return NextResponse.json(
        {
          error: "Missing Shopify configuration",
          code: "NO_ENV",
          details: {
            hasDomain: !!STOREFRONT_DOMAIN,
            hasToken: !!STOREFRONT_TOKEN,
          },
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
      return NextResponse.json(
        { error: "Missing items", code: "NO_ITEMS" },
        { status: 400 }
      );
    }

    // ✅ normalizzazione + validazione items
    const items: IncomingItem[] = itemsRaw
      .map((i: any) => {
        const shopifyId = i?.shopifyId;
        const qty = Number(i?.qty ?? 1) || 1;
        const weightKg = Number(i?.weightKg ?? i?.kg ?? 0) || 0;
        const tier = typeof i?.tier === "string" ? i.tier : undefined;

        return {
          shopifyId,
          qty,
          weightKg,
          tier,
        } as IncomingItem;
      })
      .filter((i: IncomingItem) => {
        // shopifyId deve esistere e qty >= 1
        return !!i.shopifyId && Number(i.qty || 0) >= 1;
      });

    if (items.length === 0) {
      return NextResponse.json(
        { error: "All items invalid (missing shopifyId/qty)", code: "INVALID_ITEMS" },
        { status: 400 }
      );
    }

    // 🧮 totale kg ricalcolato lato server (fallback se clientTotalKg non valido)
    const totalKg =
      typeof clientTotalKg === "number" && !Number.isNaN(clientTotalKg)
        ? clientTotalKg
        : items.reduce((sum: number, i: IncomingItem) => {
            const w = Number(i.weightKg || 0);
            const q = Number(i.qty || 1);
            return sum + w * q;
          }, 0);

    // 🧱 linee carrello per Storefront API
    const lines = items.map((i: IncomingItem) => {
      const qty = Number(i.qty ?? 1) || 1;
      const weight = Number(i.weightKg ?? 0) || 0;

      const attributes: { key: string; value: string }[] = [];

      if (i.tier) {
        attributes.push({ key: "tier", value: String(i.tier) });
      }
      if (weight > 0) {
        attributes.push({ key: "weightKg", value: String(weight) });
      }

      const line: any = {
        quantity: qty,
        merchandiseId: `gid://shopify/ProductVariant/${i.shopifyId}`,
      };

      if (attributes.length > 0) line.attributes = attributes;
      return line;
    });

    // ✅ attributi sul carrello (visibili in Shopify come cart attributes)
    const cartAttributes: { key: string; value: string }[] = [
      { key: "spinEligible", value: totalKg >= 10 ? "true" : "false" },
      { key: "orderedKg", value: String(totalKg) },
      { key: "locale", value: shopifyLocale },
    ];

    if (returnUrl) {
      cartAttributes.push({ key: "returnUrl", value: String(returnUrl) });
    }

    // ✅ se vuoi tenere traccia “bonus ruota” lato Shopify
    if (orderNote) {
      cartAttributes.push({ key: "orderNote", value: orderNote });
    }

    // (debug utile: salva anche i params marketing dentro Shopify)
    if (originQuery) {
      const qp = new URLSearchParams(
        originQuery.startsWith("?") ? originQuery : `?${originQuery}`
      );
      for (const key of PASS_THROUGH_KEYS) {
        const v = qp.get(key as PassKey);
        if (v) cartAttributes.push({ key: String(key), value: v });
      }
    }

    const query = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lines,
        attributes: cartAttributes,
      },
    };

    const response = await fetch(
      `https://${STOREFRONT_DOMAIN}/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN!,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    const data = await response.json();

    const graphqlErrors = data?.errors;
    const cart = data?.data?.cartCreate?.cart;
    const userErrors = data?.data?.cartCreate?.userErrors;

    if (graphqlErrors?.length || userErrors?.length) {
      return NextResponse.json(
        {
          error: "Checkout error",
          code: "SHOPIFY_CARTCREATE_FAILED",
          message: "Shopify non ha creato il checkout",
          shopify: {
            graphqlErrors: graphqlErrors ?? [],
            userErrors: userErrors ?? [],
          },
        },
        { status: 500 }
      );
    }

    if (!cart?.checkoutUrl) {
      return NextResponse.json(
        {
          error: "Checkout error",
          code: "NO_CHECKOUT_URL",
          message: "Shopify non ha restituito checkoutUrl",
        },
        { status: 500 }
      );
    }

    // 🔗 checkoutUrl finale: locale + pass-through params (_gl/utm/gclid…)
    const url = new URL(cart.checkoutUrl as string);
    url.searchParams.set("locale", shopifyLocale);

    if (originQuery) {
      const qp = new URLSearchParams(
        originQuery.startsWith("?") ? originQuery : `?${originQuery}`
      );

      for (const key of PASS_THROUGH_KEYS) {
        const v = qp.get(key as PassKey);
        if (v) url.searchParams.set(String(key), v);
      }
    }

    return NextResponse.json({ url: url.toString() });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "SERVER_ERROR",
        message: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
