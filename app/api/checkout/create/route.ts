import { NextRequest, NextResponse } from "next/server";

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const lines = items.map((i: any) => ({
      quantity: i.qty,
      merchandiseId: `gid://shopify/ProductVariant/${i.shopifyId}`,
    }));

    const query = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
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
        lines
      }
    };

    const res = await fetch(`https://${DOMAIN}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    const checkoutUrl = json?.data?.cartCreate?.cart?.checkoutUrl;
    const userErrors = json?.data?.cartCreate?.userErrors;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Shopify error", userErrors, raw: json },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
