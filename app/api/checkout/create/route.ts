// app/api/checkout/create/route.ts
import { NextRequest, NextResponse } from "next/server";

const STOREFRONT_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;          // es: kilomystery.myshopify.com
const STOREFRONT_TOKEN  = process.env.SHOPIFY_STOREFRONT_TOKEN;      // ⚠️ stesso nome di Vercel

export async function POST(req: NextRequest) {
  try {
    // --- debug env ---
    const envStatus = {
      hasDomain: !!STOREFRONT_DOMAIN,
      hasToken: !!STOREFRONT_TOKEN,
      domain: STOREFRONT_DOMAIN,
    };
    console.log("[CHECKOUT] ENV STATUS:", envStatus);

    if (!STOREFRONT_DOMAIN || !STOREFRONT_TOKEN) {
      return NextResponse.json(
        {
          error: "Missing Shopify configuration",
          code: "NO_ENV",
          details: envStatus,
        },
        { status: 500 }
      );
    }
    // ------------------

    const { items, totalKg, returnUrl } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: "Missing items" }, { status: 400 });
    }

    const lines = items.map((i: any) => ({
      quantity: i.qty,
      merchandiseId: `gid://shopify/ProductVariant/${i.shopifyId}`,
      attributes: [
        { key: "tier", value: i.tier },
        { key: "weightKg", value: String(i.weightKg) },
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
          { key: "spinEligible", value: totalKg >= 10 ? "true" : "false" },
          { key: "orderedKg", value: String(totalKg) },
          { key: "returnUrl", value: returnUrl },
        ],
      },
    };

    const response = await fetch(
      `https://${STOREFRONT_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    const data = await response.json();

    console.log("[CHECKOUT] Shopify raw response:", JSON.stringify(data));

    const cart = data?.data?.cartCreate?.cart;
    const errors = data?.data?.cartCreate?.userErrors;

    if (!cart?.checkoutUrl) {
      return NextResponse.json(
        {
          error: "Checkout error",
          message: "Shopify non ha creato il checkout",
          shopify: { errors, raw: data },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: cart.checkoutUrl });
  } catch (err: any) {
    console.error("[CHECKOUT] Fatal error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
