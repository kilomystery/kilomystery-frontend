// app/api/checkout/create/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const { items, totalKg, returnUrl } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: "Missing items" }, { status: 400 });
    }

    // lineItems Shopify
    const lineItems = items.map((i: any) => ({
      variantId: i.shopifyId,
      quantity: i.qty,
    }));

    // Shopify will replace {checkout.id}
    const finalReturnUrl = returnUrl.replace(
      "REPLACE_CHECKOUT_ID",
      "{checkout.id}"
    );

    const query = `
      mutation checkoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lineItems,
        customAttributes: [
          { key: "spinEligible", value: totalKg >= 10 ? "true" : "false" },
          { key: "orderedKg", value: String(totalKg) }
        ],
        returnUrl: finalReturnUrl
      },
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await res.json();
    const checkout = data?.data?.checkoutCreate?.checkout;

    if (!checkout?.webUrl) {
      return NextResponse.json(
        { error: "Checkout error", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: checkout.webUrl,
      checkoutId: checkout.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
