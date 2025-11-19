import { NextRequest, NextResponse } from "next/server";

const API_VERSION = "2024-01";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const orderName: string = (body.orderName || "").trim(); // es. "#1001"
    const orderedKg: number = Number(body.orderedKg || 0);
    const bonusKg: number = Number(body.bonusKg || 0);
    const lang: string = body.lang || "it";

    if (!orderName) {
      return NextResponse.json(
        { error: "Missing orderName" },
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

    // ---------------------------------------------------------
    // 1) CERCHIAMO L'ORDINE PER NOME (es. "#1001")
    // ---------------------------------------------------------

    // Shopify vuole il name con il #, se manca lo aggiungiamo
    const nameForQuery = orderName.startsWith("#")
      ? orderName
      : `#${orderName}`;

    const restRes = await fetch(
      `https://${domain}/admin/api/${API_VERSION}/orders.json?name=${encodeURIComponent(
        nameForQuery
      )}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
      }
    );

    const restJson = await restRes.json().catch(() => null);
    const order = restJson?.orders?.[0];

    if (!order || !order.admin_graphql_api_id) {
      console.error("Order not found by name", nameForQuery, restJson);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const orderGid: string = order.admin_graphql_api_id;
    const baseNote: string = order.note || "";

    // ---------------------------------------------------------
    // 2) NOTA INTERNA NELL'ORDINE
    // ---------------------------------------------------------

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
              orderUpdate(id: $id, input: { note: $note }) {
                order { id }
                userErrors { field message }
              }
            }
          `,
          variables: { id: orderGid, note: newNote },
        }),
      }
    );

    const updateNoteJson = await updateNoteRes.json().catch(() => null);
    if (updateNoteJson?.data?.orderUpdate?.userErrors?.length) {
      console.error(
        "orderUpdate errors",
        updateNoteJson.data.orderUpdate.userErrors
      );
    }

    // ---------------------------------------------------------
    // 3) TIMELINE COMMENT + EMAIL AL CLIENTE (OPZIONALE)
    //    (se vuoi, possiamo anche toglierlo)
    // ---------------------------------------------------------

    const customerEmail =
      order.customer?.email || order.email || "";

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
              id: orderGid,
              message,
            },
          }),
        }
      );

      const notifyJson = await notifyRes.json().catch(() => null);
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
