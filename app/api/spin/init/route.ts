// app/api/spin/init/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_VERSION = "2024-01";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const checkoutId: string = body.checkoutId || "";
    const orderedKg: number = Number(body.orderedKg || 0);
    const bonusKg: number = Number(body.bonusKg || 0);
    const lang: string = body.lang || "it";

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Missing checkoutId" },
        { status: 400 }
      );
    }

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !token) {
      console.error("SHOPIFY env vars missing", {
        hasDomain: !!domain,
        hasToken: !!token,
      });
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    /* ---------------------------------------------------------
       1) TROVIAMO L'ORDINE TRAMITE checkout_token
    --------------------------------------------------------- */
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
                    customer { email }
                    email
                  }
                }
              }
            }
          `,
          variables: { query: `checkout_token:${checkoutId}` },
        }),
      }
    );

    const findJson = await findOrderRes.json();
    const orderNode = findJson?.data?.orders?.edges?.[0]?.node ?? null;

    if (!orderNode) {
      console.error("Order not found for checkoutId", checkoutId, findJson);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    /* ---------------------------------------------------------
       2) NOTA INTERNA NELL'ORDINE (PER VOI)
    --------------------------------------------------------- */
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
    const newNote = baseNote ? `${baseNote}\n\n${extra}` : extra;

    const updateNoteRes = await fetch(
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
                order { id }
                userErrors { field message }
              }
            }
          `,
          variables: { id: orderNode.id, note: newNote },
        }),
      }
    );

    const updateNoteJson = await updateNoteRes.json();
    if (updateNoteJson?.data?.orderUpdate?.userErrors?.length) {
      console.error(
        "orderUpdate errors",
        updateNoteJson.data.orderUpdate.userErrors
      );
    }

    /* ---------------------------------------------------------
       3) TIMELINE COMMENT + EMAIL AL CLIENTE
    --------------------------------------------------------- */
    const customerEmail =
      orderNode.customer?.email || orderNode.email || "";

    if (customerEmail) {
      const message =
        bonusKg > 0
          ? `Hai vinto ${bonusKg.toFixed(
              2
            )} kg bonus sulla Ruota Mistery Kilo! 🎉`
          : `Purtroppo questa volta la Ruota Mistery Kilo non ha aggiunto kg extra. 😅`;

      const notifyRes = await fetch(
        `https://${domain}/admin/api/${API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": token,
          },
          body: JSON.stringify({
            query: `
              mutation AddTimelineComment($id: ID!, $message: String!) {
                orderTimelineCommentCreate(
                  orderId: $id,
                  message: $message,
                  notifyCustomer: true
                ) {
                  timelineComment { id }
                  userErrors { field message }
                }
              }
            `,
            variables: {
              id: orderNode.id,
              message,
            },
          }),
        }
      );

      const notifyJson = await notifyRes.json();
      if (
        notifyJson?.data?.orderTimelineCommentCreate?.userErrors?.length
      ) {
        console.error(
          "timelineComment errors",
          notifyJson.data.orderTimelineCommentCreate.userErrors
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("spin init error", e);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
