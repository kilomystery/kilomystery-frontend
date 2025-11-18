// app/api/checkout/create/route.ts
import { NextRequest, NextResponse } from "next/server";

const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;            // shop.kilomystery.com
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;       // token admin REST

export async function POST(req: NextRequest) {
  try {
    const { items, totalKg, returnUrl } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: "Missing items" }, { status: 400 });
    }

    // Convert line items → Admin REST format
    const line_items = items.map((i: any) => ({
      variant_id: Number(i.shopifyId),
      quantity: i.qty,
    }));

    const payload = {
      checkout: {
        line_items,
        custom_attributes: [
          { name: "spinEligible", value: totalKg >= 10 ? "true" : "false" },
          { name: "orderedKg", value: String(totalKg) },
        ],
        // Shopify REST API accetta return_url qui
        return_url: returnUrl,
      },
    };

    const response = await fetch(
      `https://${SHOP_DOMAIN}/admin/api/2024-01/checkouts.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_TOKEN!,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    const checkout = data?.checkout;

    if (!checkout?.web_url) {
      return NextResponse.json(
        { error: "Checkout error", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: checkout.web_url,
      checkoutId: checkout.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
