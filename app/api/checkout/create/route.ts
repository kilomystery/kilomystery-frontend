import { NextRequest, NextResponse } from "next/server";

const STOREFRONT_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; 
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  try {
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
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN!,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    const data = await response.json();

    console.log("🔍 RAW SHOPIFY RESPONSE (server):", JSON.stringify(data, null, 2));

    const cart = data?.data?.cartCreate?.cart;
    const errors = data?.data?.cartCreate?.userErrors;

    if (!cart?.checkoutUrl) {
      return NextResponse.json(
        {
          error: "Checkout error",
          message: "Shopify non ha creato il checkout",
          shopify: data,
          errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: cart.checkoutUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
