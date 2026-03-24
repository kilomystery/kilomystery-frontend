import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendMetaPurchase } from "@/app/lib/meta-capi";

export const runtime = "nodejs";

function verifyShopifyHmac(rawBody: string, hmacHeader: string | null) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret || !hmacHeader) {
    console.error("[ORDER-PAID] missing HMAC inputs", {
      hasSecret: !!secret,
      hasHeader: !!hmacHeader,
    });
    return false;
  }

  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(hmacHeader)
    );

    if (!isValid) {
      console.error("[ORDER-PAID] invalid HMAC", {
        expectedPrefix: digest.slice(0, 8),
        receivedPrefix: hmacHeader.slice(0, 8),
        sameLength: digest.length === hmacHeader.length,
      });
    }

    return isValid;
  } catch (err) {
    console.error("[ORDER-PAID] HMAC compare failed", err);
    return false;
  }
}

function todayYMD(d = new Date()) {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function parseSkuToCode(skuRaw: string) {
  const sku = (skuRaw || "").trim().toUpperCase();
  if (!sku) return null;
  const cleaned = sku.replace(/\s+/g, "-").replace(/[^A-Z0-9]/g, "");
  return cleaned || null;
}

function rand4() {
  return crypto.randomBytes(2).toString("hex").toUpperCase();
}

function extractSidFromNote(note?: string | null) {
  if (!note) return "";
  const match = note.match(/SID:([A-Za-z0-9_\-:.]+)/);
  return match?.[1] || "";
}

function getOrderAttribute(order: any, key: string) {
  const attrs = order?.note_attributes || order?.noteAttributes || [];
  const found = attrs.find((a: any) => a?.name === key || a?.key === key);
  return found?.value || "";
}

async function shopifyGraphQL(query: string, variables: any) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !token) {
    console.error("[ORDER-PAID] missing Shopify admin env", {
      hasDomain: !!domain,
      hasToken: !!token,
    });
    throw new Error("Missing SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_ACCESS_TOKEN");
  }

  const res = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    console.error("[ORDER-PAID] shopifyGraphQL error", {
      status: res.status,
      json,
    });
    throw new Error(JSON.stringify(json.errors || json));
  }

  return json.data;
}

export async function POST(req: Request) {
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  const rawBody = await req.text();

  if (!verifyShopifyHmac(rawBody, hmac)) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
  }

  try {
    const order = JSON.parse(rawBody);

    console.log("[ORDER-PAID] webhook received", {
      id: order?.id,
      admin_graphql_api_id: order?.admin_graphql_api_id,
      order_number: order?.order_number,
      name: order?.name,
      line_items_count: Array.isArray(order?.line_items)
        ? order.line_items.length
        : 0,
      note: order?.note || null,
    });

    const orderGid: string | undefined = order?.admin_graphql_api_id;
    const orderNumber: number | undefined = order?.order_number;
    const createdAtRaw: string | undefined = order?.created_at;

    if (!orderGid || !orderNumber) {
      console.error("[ORDER-PAID] missing order identifiers", {
        orderGid,
        orderNumber,
      });

      return NextResponse.json(
        {
          ok: false,
          error: "Missing orderGid/orderNumber",
        },
        { status: 400 }
      );
    }

    const createdAt = createdAtRaw ? new Date(createdAtRaw) : new Date();
    const ymd = todayYMD(createdAt);
    const orderSeq = String(orderNumber);

    const lineItems = Array.isArray(order?.line_items) ? order.line_items : [];

    if (!lineItems.length) {
      console.error("[ORDER-PAID] no line_items");

      return NextResponse.json(
        {
          ok: false,
          error: "No line_items",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // 1) COSTRUZIONE LOTS
    // -----------------------------
    const lots: Array<{
      lotId: string;
      title: string;
      sku: string;
      qtyIndex: number;
    }> = [];

    for (const li of lineItems) {
      const title = String(li?.title || "").trim();
      const skuRaw = String(li?.sku || "").trim();
      const qty = Math.max(1, Number(li?.quantity || 1));
      const code = parseSkuToCode(skuRaw) || "UNKNOWN";

      for (let i = 1; i <= qty; i++) {
        const lotId = `KM-${ymd}-${code}-${orderSeq}-${rand4()}`;

        lots.push({
          lotId,
          title,
          sku: skuRaw,
          qtyIndex: i,
        });
      }
    }

    // -----------------------------
    // 2) SALVATAGGIO LOTS SU ORDER METAFIELD
    //    NON DEVE ROMPERE IL WEBHOOK
    // -----------------------------
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

    let metafieldErrors: any[] = [];

    try {
      const data = await shopifyGraphQL(mutation, variables);
      metafieldErrors = data?.metafieldsSet?.userErrors || [];

      if (metafieldErrors.length) {
        console.error("[ORDER-PAID] metafieldsSet userErrors", metafieldErrors);
      } else {
        console.log("[ORDER-PAID] lots metafield saved", {
          orderNumber,
          lotsCount: lots.length,
        });
      }
    } catch (err: any) {
      console.error("[ORDER-PAID] metafieldsSet failed but continuing", {
        message: err?.message || "Unknown error",
      });
    }

    // -----------------------------
    // 3) META CAPI PURCHASE
    // -----------------------------
    const sid = extractSidFromNote(order?.note) || getOrderAttribute(order, "sid");

    let metaResult: any = null;
    let metaSkippedReason = "";

    if (!sid) {
      metaSkippedReason = "Missing SID";
      console.warn("[ORDER-PAID] Meta skipped: missing SID");
    } else {
      const currency = order?.currency || "EUR";
      const value = Number(order?.total_price || 0);

      const contents: Array<{
        id: string;
        quantity: number;
        item_price: number;
      }> = lineItems.map((item: any) => ({
        id: String(
          item?.variant_id || item?.product_id || item?.sku || item?.title || ""
        ),
        quantity: Number(item?.quantity || 1),
        item_price: Number(item?.price || 0),
      }));

      const contentIds: string[] = contents
        .map((c) => c.id)
        .filter((id): id is string => Boolean(id));

      const fbp =
        getOrderAttribute(order, "_fbp") ||
        getOrderAttribute(order, "fbp");

      const fbc =
        getOrderAttribute(order, "_fbc") ||
        getOrderAttribute(order, "fbc");

      const eventSourceUrl =
        getOrderAttribute(order, "returnUrl") ||
        process.env.SITE_URL ||
        "https://www.kilomystery.com";

      const userAgent =
        getOrderAttribute(order, "clientUserAgent") || "";

      try {
        metaResult = await sendMetaPurchase({
          eventId: sid,
          eventTime: order?.processed_at
            ? Math.floor(new Date(order.processed_at).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          eventSourceUrl,
          value,
          currency,
          orderId: order?.name || String(order?.id || ""),
          contentIds,
          contents,
          userData: {
            em: order?.email,
            ph: order?.phone,
            fn: order?.customer?.first_name || order?.billing_address?.first_name,
            ln: order?.customer?.last_name || order?.billing_address?.last_name,
            ct: order?.billing_address?.city,
            st:
              order?.billing_address?.province_code ||
              order?.billing_address?.province,
            zp: order?.billing_address?.zip,
            country:
              order?.billing_address?.country_code ||
              order?.billing_address?.country,
            external_id: String(order?.customer?.id || order?.id || sid),
            client_user_agent: userAgent,
            fbp,
            fbc,
          },
        });

        console.log("[ORDER-PAID] Meta purchase sent", {
          sid,
          orderId: order?.name || String(order?.id || ""),
        });
      } catch (err: any) {
        metaSkippedReason = err?.message || "Meta send failed";
        console.error("[ORDER-PAID] Meta send failed", {
          message: err?.message || "Unknown error",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      orderNumber,
      lotsCount: lots.length,
      lots,
      lotsMeta: {
        saved: metafieldErrors.length === 0,
        errors: metafieldErrors,
      },
      meta: {
        sent: !!metaResult,
        skippedReason: metaSkippedReason || null,
        sid: sid || null,
        response: metaResult,
      },
    });
  } catch (err: any) {
    console.error("[ORDER-PAID] webhook processing failed", {
      message: err?.message || "Unknown error",
      stack: err?.stack || null,
    });

    return NextResponse.json(
      {
        ok: false,
        error: "Webhook processing failed",
        message: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}