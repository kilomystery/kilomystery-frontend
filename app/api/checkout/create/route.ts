// app/api/checkout/create/route.ts
import { NextRequest, NextResponse } from "next/server";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; // es: kilomystery.myshopify.com
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  try {
    // 🔎 Controllo variabili ambiente
    if (!STORE_DOMAIN || !STOREFRONT_TOKEN) {
      console.error("[checkout] Missing env vars", {
        hasDomain: !!STORE_DOMAIN,
        hasToken: !!STOREFRONT_TOKEN,
      });

      return NextResponse.json(
        {
          error: "Missing Shopify configuration",
          code: "NO_ENV",
          details: {
            hasDomain: !!STORE_DOMAIN,
            hasToken: !!STOREFRONT_TOKEN,
          },
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { items, totalKg, returnUrl } = body;

    console.log("[checkout] Incoming payload", {
      items,
      totalKg,
      returnUrl,
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing items", code: "NO_ITEMS" },
        { status: 400 }
      );
    }

    // 🔧 Costruiamo le linee per Cart API
    const lines = items.map((i: any) => ({
      quantity: Number(i.qty) || 1,
      merchandiseId: `gid://shopify/ProductVariant/${i.shopifyId}`,
      attributes: [
        { key: "tier", value: String(i.tier ?? "") },
        { key: "weightKg", value: String(i.weightKg ?? "") },
      ],
    }));

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
        attributes: [
          {
            key: "spinEligible",
            value: Number(totalKg) >= 10 ? "true" : "false",
          },
          { key: "orderedKg", value: String(totalKg) },
          { key: "returnUrl", value: String(returnUrl || "") },
        ],
      },
    };

    console.log("[checkout] Sending to Shopify Storefront", {
      domain: STORE_DOMAIN,
      hasToken: !!STOREFRONT_TOKEN,
      lines,
      attributes: variables.input.attributes,
    });

    const response = await fetch(
      `https://${STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    const text = await response.text();
    let data: any = null;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("[checkout] Non-JSON response from Shopify", text);
      return NextResponse.json(
        {
          error: "Invalid response from Shopify",
          raw: text,
        },
        { status: 502 }
      );
    }

    console.log("[checkout] Shopify response JSON", JSON.stringify(data, null, 2));

    // ❗ Errori GraphQL top-level
    if (data.errors && data.errors.length) {
      console.error("[checkout] GraphQL top-level errors", data.errors);
      return NextResponse.json(
        {
          error: "Checkout error",
          message: "Shopify ha risposto con errori",
          shopifyErrors: data.errors,
          shopifyRaw: data,
        },
        { status: 500 }
      );
    }

    const cartNode = data?.data?.cartCreate?.cart;
    const userErrors = data?.data?.cartCreate?.userErrors ?? [];

    // ❗ Nessuna checkoutUrl = errore nella mutation
    if (!cartNode?.checkoutUrl) {
      console.error("[checkout] cartCreate.userErrors", userErrors);
      return NextResponse.json(
        {
          error: "Checkout error",
          message: "Shopify non ha creato il checkout",
          shopifyUserErrors: userErrors,
          shopifyRaw: data,
        },
        { status: 500 }
      );
    }

    // ✅ Tutto ok
    return NextResponse.json({
      ok: true,
      url: cartNode.checkoutUrl,
      cartId: cartNode.id,
    });
  } catch (err: any) {
    console.error("[checkout] Unexpected error", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
