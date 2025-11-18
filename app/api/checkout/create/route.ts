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

    // Shopify lineItems: { variantId, quantity }
    const lineItems = items.map((i: any) => ({
      variantId: i.shopifyId,
      quantity: i.qty,
    }));

    // Shopify automatically replaces {checkout.id}
    const finalReturnUrl = returnUrl.replace(
      "REPLACE_CHECKOUT_ID",
      "{checkout.id}"
    );

    // GraphQL mutation
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
          { key: "orderedKg", value: String(totalKg) },
        ],
        returnUrl: finalReturnUrl,
      },
    };

    // ---- DEBUG LOG ----
    console.log("➡️ SENDING TO SHOPIFY", {
      domain: process.env.SHOPIFY_STORE_DOMAIN,
      tokenPresent: !!STOREFRONT_TOKEN,
      lineItems,
      finalReturnUrl,
    });

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
    });

    // ---- RAW TEXT DEBUG ----
    const rawText = await res.text();
    console.log("⬅️ RAW SHOPIFY RESPONSE:", rawText);

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      return NextResponse.json(
        {
          error: "Invalid JSON from Shopify",
          rawText,
        },
        { status: 500 }
      );
    }

    const checkout = data?.data?.checkoutCreate?.checkout;

    if (!checkout?.webUrl) {
      console.log("❌ CHECKOUT ERROR:", data);
      return NextResponse.json(
        { error: "Checkout error", details: data },
        { status: 500 }
      );
    }

    // SUCCESS
    return NextResponse.json({
      url: checkout.webUrl,
      checkoutId: checkout.id,
    });

  } catch (error: any) {
    console.log("🔥 SERVER ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
