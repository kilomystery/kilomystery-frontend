import { NextRequest, NextResponse } from "next/server";

const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-07";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const rawOrderId: string = body.orderId || "";
    const orderedKg: number = Number(body.orderedKg || 0);
    const bonusKg: number = Number(body.bonusKg || 0);
    const lang: string = body.lang || "it";

    if (!rawOrderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    // Se l'ID non è già un GID, lo trasformiamo.
    const orderId = rawOrderId.startsWith("gid://")
      ? rawOrderId
      : `gid://shopify/Order/${rawOrderId}`;

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
       1) RECUPERIAMO L'ORDINE PER ID (GraphQL)
    --------------------------------------------------------- */

    const getOrderRes = await fetch(
      `https://${domain}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify({
          query: `
            query GetOrder($id: ID!) {
              order(id: $id) {
                id
                name
                note
                email
                customer { email }
              }
            }
          `,
          variables: { id: orderId },
        }),
      }
    );

    if (!getOrderRes.ok) {
      const txt = await getOrderRes.text().catch(() => "");
      console.error("GetOrder HTTP error", getOrderRes.status, txt);
      return NextResponse.json(
        { error: "Shopify order fetch failed" },
        { status: 502 }
      );
    }

    const getOrderJson = await getOrderRes.json();
    const orderNode = getOrderJson?.data?.order ?? null;

    if (!orderNode) {
      console.error("Order not found for orderId", orderId, getOrderJson);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    /* ---------------------------------------------------------
       2) NOTA INTERNA NELL'ORDINE
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
    lines.push(`- Lingua spin: ${lang}`);
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
              orderUpdate(input: { id: $id, note: $note }) {
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
       3) TIMELINE COMMENT + EMAIL AL CLIENTE (opzionale)
    --------------------------------------------------------- */

    const customerEmail: string =
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
