import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

function verifyShopifyHmac(rawBody: string, hmacHeader: string | null) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !hmacHeader) return false;

  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}

function pad6(n: number) {
  return String(n).padStart(6, "0");
}
function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function todayYMD() {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function parseSkuToCode(skuRaw: string) {
  // accetta "PRM-5KG", "STD-1KG", "EXP-15KG", "GIFT-MIX-1KG"
  const sku = (skuRaw || "").trim().toUpperCase();
  if (!sku) return null;

  // se vuoi: normalizza un po’ gli SKU
  // es: "PRM 5KG" -> "PRM-5KG"
  const cleaned = sku.replace(/\s+/g, "-");
  return cleaned;
}

async function shopifyGraphQL(query: string, variables: any) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!domain || !token) throw new Error("Missing SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_TOKEN");

  const res = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors || json));
  return json.data;
}

export async function POST(req: Request) {
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  const rawBody = await req.text();

  if (!verifyShopifyHmac(rawBody, hmac)) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
  }

  const order = JSON.parse(rawBody);

  const orderGid: string | undefined = order?.admin_graphql_api_id;
  const orderNumber: number | undefined = order?.order_number;
  const createdAt: string | undefined = order?.created_at;

  if (!orderGid || !orderNumber) {
    return NextResponse.json({ error: "Missing orderGid/orderNumber" }, { status: 400 });
  }

  const ymd = todayYMD();
  const seqOrder = pad6(orderNumber);

  const lineItems = Array.isArray(order?.line_items) ? order.line_items : [];
  if (!lineItems.length) {
    return NextResponse.json({ error: "No line_items" }, { status: 400 });
  }

  // Genera 1 LOT per ogni riga e per quantità
  // Se qty=2, crea -01 e -02 per quella riga
  const lots: Array<{ lotId: string; title: string; sku: string; qtyIndex: number }> = [];

  let running = 0;

  for (const li of lineItems) {
    const title = String(li?.title || "").trim();
    const skuRaw = String(li?.sku || "").trim();
    const qty = Number(li?.quantity || 1);

    const codeFromSku = parseSkuToCode(skuRaw);
    const code = codeFromSku || "UNKNOWN";

    for (let i = 1; i <= Math.max(1, qty); i++) {
      running += 1;
      const itemSeq = pad2(running);

      const lotId = `KM-${ymd}-${code}-${seqOrder}-${itemSeq}`;

      lots.push({
        lotId,
        title,
        sku: skuRaw,
        qtyIndex: i,
      });
    }
  }

  // Salviamo in 2 modi:
  // 1) metafield JSON sull'ordine con tutta la lista
  // 2) (opzionale più avanti) metafield per riga
  const mutation = `
    mutation SetMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id namespace key value }
        userErrors { field message }
      }
    }
  `;

  const variables = {
    metafields: [
      {
        ownerId: orderGid,
        namespace: "kilomystery",
        key: "lots",
        type: "json",
        value: JSON.stringify({
          orderNumber,
          createdAt,
          lots,
        }),
      },
    ],
  };

  const data = await shopifyGraphQL(mutation, variables);
  const errors = data?.metafieldsSet?.userErrors || [];
  if (errors.length) {
    return NextResponse.json({ error: "Metafield error", details: errors }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orderNumber, lotsCount: lots.length, lots });
}
