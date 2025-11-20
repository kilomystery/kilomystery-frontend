// app/api/checkout/create/route.ts
import { NextRequest, NextResponse } from "next/server";

const STOREFRONT_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = "2024-01";

const SUPPORTED = ["it", "en", "es", "fr", "de"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body?.items || [];
    const clientTotalKg = body?.totalKg;
    const returnUrl = body?.returnUrl;

    if (!STOREFRONT_DOMAIN || !STOREFRONT_TOKEN) {
      return NextResponse.json(
        {
          error: "Missing Shopify configuration",
          code: "NO_ENV",
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing items" }, { status: 400 });
    }

    // 🟦 Detect lingua dal REFERER (URL della pagina da cui parte il checkout)
    let locale = "it";
    try {
      const ref = new URL(req.headers.get("referer") || "");
      const seg = ref.pathname.split("/")[1];
      if (SUPPORTED.includes(seg)) locale = seg;
    } catch {
      locale = "it";
    }

    // Totale KG dal server
    const totalKg =
      typeof clientTotalKg === "number" && !isNaN(clientTotalKg)
        ? clientTotalKg
        : items.reduce(
            (sum: number, i: any) =>
              sum +
              (Number(i.weightKg ?? i.kg ?? 0) || 0) * (Number(i.qty ?? 1) || 1),
            0
          );

    const lines = items.map((i: any) => {
      const qty = Number(i.qty ?? 1) || 1;
      const weight = Number(i.weightKg ?? i.kg ?? 0) || 0;

      const attributes: { key: string; value: string }[] = [];

      if (i.tier) {
        attributes.push({ key: "tier", value: String(i.tier) });
      }
      if (weight > 0) {
        attributes.push({ key: "weightKg", value: String(weight) });
      }

      return {
        quantity: qty,
        merchandiseId: `gid://shopify/ProductVariant/${i.shopifyId}`,
        ...(attributes.length > 0 ? { attributes } : {}),
      };
    });

    const cartAttributes: { key: string; value: string }[] = [
      { key: "spinEligible", value: totalKg >= 10 ? "true" : "false" },
      { key: "orderedKg", value: totalKg.toString() },
      { key: "locale", value: locale },
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
    const userErrors = data?.data?.cartCreate?.userErrors;
    const cart = data?.data?.cartCreate?.cart;

    if (graphqlErrors?.length || userErrors?.length) {
      return NextResponse.json(
        {
          error: "Checkout error",
          shopify: { graphqlErrors, userErrors, raw: data },
        },
        { status: 500 }
      );
    }

    if (!cart?.checkoutUrl) {
      return NextResponse.json(
        {
          error: "Checkout error",
          message: "Shopify missing checkoutUrl",
          shopify: { raw: data },
        },
        { status: 500 }
      );
    }

    // 🟦 Shopify checkout locale = aggiungiamo &locale=xx
    const checkoutUrlWithLocale =
      cart.checkoutUrl.includes("?")
        ? `${cart.checkoutUrl}&locale=${locale}`
        : `${cart.checkoutUrl}?locale=${locale}`;

    return NextResponse.json({ url: checkoutUrlWithLocale });
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
