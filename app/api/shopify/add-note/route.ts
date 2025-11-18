import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { orderId, note } = await req.json();

  await fetch(
    `https://yourshopify.myshopify.com/admin/api/2024-01/orders/${orderId}.json`,
    {
      method: "PUT",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order: {
          id: orderId,
          note,
        },
      }),
    }
  );

  return NextResponse.json({ ok: true });
}

