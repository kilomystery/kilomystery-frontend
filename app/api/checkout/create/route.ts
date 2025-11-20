// app/api/checkout/create/route.ts
import { NextRequest, NextResponse } from "next/server";

const STOREFRONT_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; // es: kilomystery.myshopify.com
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = "2024-01";

// mappa lingua frontend -> locale Shopify
const SHOPIFY_LOCALE_MAP: Record<string, string> = {
  it: "it",
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body?.items || [];
    const clientTotalKg = body?.totalKg;
    const returnUrl = body?.returnUrl;
    const lang = body?.lang || "it"; // lingua dal frontend (es. "fr", "en", ...)

    const locale = SHOPIFY_LOCALE_MAP[lang] || "it";

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

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing items" },
        { status: 400 }
      );
    }

    // 🧮 totale kg ricalcolato lato server
    const totalKg =
      typeof clientTotalKg === "number" && !Number.isNaN(clientTotalKg)
        ? clientTotalKg
        : items.reduce(
            (sum: number, i: any) =>
              sum +
              (Number(i.weightKg ?? i.kg ?? 0) || 0) *
                (Number(i.qty ?? 1) || 1),
            0
          );

    // 🧱 linee carrello per Storefront API
    const lines = items.map((i: any) => {
      const qty = Number(i.qty ?? 1) || 1;
      const weight = Number(i.weightKg ?? i.kg ?? 0) || 0;

      const attributes: { key: string; value: string }[] = [];

      if (i.tier) {
        attributes.push({
          key: "tier",
          value: String(i.tier),
        });
      }

      if (weight > 0) {
        attributes.push({
          key: "weightKg",
          value: String(weight),
        });
      }

      const line: any = {
        quantity: qty,
        merchandiseId: `gid://shopify/ProductVariant/${i.shopifyId}`,
      };

      if (attributes.length > 0) {
        line.attributes = attributes;
      }

      return line;
    });

    // Attributi sul CARRELLO
    const cartAttributes: { key: string; value: string }[] = [
      { key: "spinEligible", value: totalKg >= 10 ? "true" : "false" },
      { key: "orderedKg", value: totalKg.toString() },
      { key: "lang", value: String(lang) }, // info comoda anche lato Shopify
    ];

    if (returnUrl) {
      cartAttributes.push({
        key: "returnUrl",
        value: String(returnUrl),
      });
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
          message: "Shopify non ha creato il checkout",
          shopify: {
            graphqlErrors,
            userErrors,
            raw: data,
          },
        },
        { status: 500 }
      );
    }

    if (!cart?.checkoutUrl) {
      return NextResponse.json(
        {
          error: "Checkout error",
          message: "Shopify non ha restituito checkoutUrl",
          shopify: { raw: data },
        },
        { status: 500 }
      );
    }

    // 👉 aggiungiamo il locale all'URL del checkout
    const checkoutUrl = new URL(cart.checkoutUrl);
    checkoutUrl.searchParams.set("locale", locale);

    return NextResponse.json({
      url: checkoutUrl.toString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
