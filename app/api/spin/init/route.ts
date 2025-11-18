// app/api/spin/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_VERSION = "2024-01";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const checkoutId: string = body.checkoutId || "";
    const orderedKg: number = Number(body.orderedKg || 0);
    const bonusKg: number = Number(body.bonusKg || 0);

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Missing checkoutId" },
        { status: 400 }
      );
    }

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !token) {
      console.error("SHOPIFY env vars missing");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    // 1) Trova l'ordine collegato al checkout
    const findOrderRes = await fetch(
      `https://${domain}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify({
          query: `
            query OrderByCheckout($query: String!) {
              orders(first: 1, query: $query) {
                edges {
                  node {
                    id
                    name
                    note
                  }
                }
              }
            }
          `,
          // 👇 da adattare se il campo non è "checkout_token"
          variables: { query: `checkout_token:${checkoutId}` },
        }),
      }
    );

    const findJson = await findOrderRes.json();
    const orderNode =
      findJson?.data?.orders?.edges?.[0]?.node ?? null;

    if (!orderNode) {
      console.error("Order not found for checkoutId", checkoutId);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const baseNote: string = orderNode.note || "";

    const lines: string[] = [];
    lines.push("🎡 Ruota Mistery Kilo:");
    if (orderedKg) lines.push(`- Kg ordinati: ${orderedKg.toFixed(2)} kg`);
    lines.push(`- Kg bonus vinti: ${bonusKg.toFixed(2)} kg`);
    if (orderedKg) {
      lines.push(
        `- Totale teorico: ${(orderedKg + bonusKg).toFixed(2)} kg`
      );
    }
    lines.push(`- Data spin: ${new Date().toISOString()}`);

    const extra = lines.join("\n");
    const newNote = baseNote
      ? `${baseNote}\n\n${extra}`
      : extra;

    // 2) Aggiorna la nota ordine
    const updateRes = await fetch(
      `https://${domain}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateNote($id: ID!, $note: String) {
              orderUpdate(id: $id, input: { note: $note }) {
                order { id note }
                userErrors { field message }
              }
            }
          `,
          variables: {
            id: orderNode.id,
            note: newNote,
          },
        }),
      }
    );

    const updateJson = await updateRes.json();
    const errors =
      updateJson?.data?.orderUpdate?.userErrors || [];

    if (errors.length) {
      console.error("orderUpdate errors", errors);
      return NextResponse.json(
        { error: "orderUpdate failed", details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("spin route error", e);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
