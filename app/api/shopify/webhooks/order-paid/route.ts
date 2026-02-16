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

function todayYMD(d = new Date()) {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

/**
 * STD-1KG -> STD1KG
 * PRM-5KG -> PRM5KG
 * EXP-15KG -> EXP15KG
 * UP-PRM-1KG -> UPPRM1KG
 */
function parseSkuToCode(skuRaw: string) {
  const sku = (skuRaw || "").trim().toUpperCase();
  if (!sku) return null;
  const cleaned = sku.replace(/\s+/g, "-").replace(/[^A-Z0-9]/g, "");
  return cleaned || null;
}

function rand4() {
  return crypto.randomBytes(2).toString("hex").toUpperCase(); // 4 chars
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
  const orderNumber: number | undefined = order?.order_number; // es 1057
  const createdAtRaw: string | undefined = order?.created_at;

  if (!orderGid || !orderNumber) {
    return NextResponse.json({ error: "Missing orderGid/orderNumber" }, { status: 400 });
  }

  const createdAt = createdAtRaw ? new Date(createdAtRaw) : new Date();
  const ymd = todayYMD(createdAt);
  const orderSeq = String(orderNumber); // ✅ niente 000000

  const lineItems = Array.isArray(order?.line_items) ? order.line_items : [];
  if (!lineItems.length) {
    return NextResponse.json({ error: "No line_items" }, { status: 400 });
  }

  const lots: Array<{ lotId: string; title: string; sku: string; qtyIndex: number }> = [];

  for (const li of lineItems) {
    const title = String(li?.title || "").trim();
    const skuRaw = String(li?.sku || "").trim();
    const qty = Math.max(1, Number(li?.quantity || 1));

    const code = parseSkuToCode(skuRaw) || "UNKNOWN";

    for (let i = 1; i <= qty; i++) {
      // ✅ FORMATO RICHIESTO:
      // KM-20260216-STD1KG-1057-A4F9
      const lotId = `KM-${ymd}-${code}-${orderSeq}-${rand4()}`;

      lots.push({
        lotId,
        title,
        sku: skuRaw,
        qtyIndex: i,
      });
    }
  }

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
          createdAt: createdAt.toISOString(),
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
