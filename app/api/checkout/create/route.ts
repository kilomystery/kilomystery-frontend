import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const STOREFRONT_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-01";

const LOCALE_MAP: Record<string, string> = {
  it: "it",
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
};

const PASS_THROUGH_KEYS = [
  "_gl",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "_fbp",
  "_fbc",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_term",
  "utm_content",
] as const;

type PassKey = (typeof PASS_THROUGH_KEYS)[number];

type IncomingItem = {
  shopifyId: string | number;
  qty?: number;
  weightKg?: number;
  kg?: number;
  tier?: string;
};

function buildSid() {
  try {
    return randomUUID();
  } catch {
    return `km_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const itemsRaw = body?.items;
    const clientTotalKg = body?.totalKg;
    const returnUrl = body?.returnUrl;

    const bodyLang = typeof body?.lang === "string" ? body.lang : "it";
    const shopifyLocale = LOCALE_MAP[bodyLang] ?? "it";

    const originQuery =
      typeof body?.originQuery === "string" ? body.originQuery : "";

    const orderNote =
      typeof body?.orderNote === "string" ? body.orderNote : "";

    const live = body?.liveRegistration;

    const clientFbp =
      typeof body?.fbp === "string" ? body.fbp.trim() : "";
    const clientFbc =
      typeof body?.fbc === "string" ? body.fbc.trim() : "";
    const clientUserAgent =
      typeof body?.clientUserAgent === "string"
        ? body.clientUserAgent.trim()
        : req.headers.get("user-agent") || "";

    const clientIp =
      typeof body?.clientIp === "string"
        ? body.clientIp.trim()
        : getClientIp(req);

    const sid = buildSid();

    if (!STOREFRONT_DOMAIN || !STOREFRONT_TOKEN) {
      return NextResponse.json(
        {
          error: "Missing Shopify configuration",
          code: "NO_ENV",
          details: {
            hasDomain: !!STOREFRONT_DOMAIN,
            hasToken: !!STOREFRONT_TOKEN,
          },
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
      return NextResponse.json(
        { error: "Missing items", code: "NO_ITEMS" },
        { status: 400 }
      );
    }

    const items: IncomingItem[] = itemsRaw
      .map((i: any) => {
        const shopifyId = i?.shopifyId;
        const qty = Number(i?.qty ?? 1) || 1;
        const weightKg = Number(i?.weightKg ?? i?.kg ?? 0) || 0;
        const tier = typeof i?.tier === "string" ? i.tier : undefined;

        return {
          shopifyId,
          qty,
          weightKg,
          tier,
        } as IncomingItem;
      })
      .filter((i: IncomingItem) => {
        return !!i.shopifyId && Number(i.qty || 0) >= 1;
      });

    if (items.length === 0) {
      return NextResponse.json(
        {
          error: "All items invalid (missing shopifyId/qty)",
          code: "INVALID_ITEMS",
        },
        { status: 400 }
      );
    }

    const totalKg =
      typeof clientTotalKg === "number" && !Number.isNaN(clientTotalKg)
        ? clientTotalKg
        : items.reduce((sum: number, i: IncomingItem) => {
            const w = Number(i.weightKg || 0);
            const q = Number(i.qty || 1);
            return sum + w * q;
          }, 0);

    const lines = items.map((i: IncomingItem) => {
      const qty = Number(i.qty ?? 1) || 1;
      const weight = Number(i.weightKg ?? 0) || 0;

      const attributes: { key: string; value: string }[] = [];

      if (i.tier) attributes.push({ key: "tier", value: String(i.tier) });
      if (weight > 0) attributes.push({ key: "weightKg", value: String(weight) });

      const line: any = {
        quantity: qty,
        merchandiseId: `gid://shopify/ProductVariant/${i.shopifyId}`,
      };

      if (attributes.length > 0) line.attributes = attributes;
      return line;
    });

    const cartAttributes: { key: string; value: string }[] = [
      { key: "spinEligible", value: totalKg >= 10 ? "true" : "false" },
      { key: "orderedKg", value: String(totalKg) },
      { key: "locale", value: shopifyLocale },
      { key: "sid", value: sid },
    ];

    if (returnUrl) {
      cartAttributes.push({ key: "returnUrl", value: String(returnUrl) });
    }

    if (orderNote) {
      cartAttributes.push({ key: "orderNote", value: orderNote });
    }

    if (clientFbp) {
      cartAttributes.push({ key: "_fbp", value: clientFbp });
    }

    if (clientFbc) {
      cartAttributes.push({ key: "_fbc", value: clientFbc });
    }

    if (clientUserAgent) {
      cartAttributes.push({ key: "clientUserAgent", value: clientUserAgent });
    }

    if (clientIp) {
      cartAttributes.push({ key: "clientIp", value: clientIp });
    }

    if (live && typeof live === "object") {
      const map: Record<string, any> = {
        liveType: "tiktok_live_mystery_weight",
        rules: "deposit_20_balance_24h",
        depositEur: "20",
        shippingUpTo5kgEur: "6",
        shippingFreeOverKg: "5",
        tiktokUsername: live.tiktokUsername,
        firstName: live.firstName,
        lastName: live.lastName,
        email: live.email,
        phone: live.phone,
        address1: live.address1,
        address2: live.address2,
        zip: live.zip,
        city: live.city,
        province: live.province,
        country: live.country,
      };

      for (const [k, v] of Object.entries(map)) {
        if (typeof v === "string" && v.trim()) {
          cartAttributes.push({ key: k, value: v.trim() });
        }
      }
    }

    if (originQuery) {
      const qp = new URLSearchParams(
        originQuery.startsWith("?") ? originQuery : `?${originQuery}`
      );

      for (const key of PASS_THROUGH_KEYS) {
        const v = qp.get(key as PassKey);
        if (v) {
          cartAttributes.push({ key: String(key), value: v });
        }
      }
    }

    const baseOrderNote =
      (orderNote && orderNote.trim()) ||
      (live?.tiktokUsername
        ? `LIVE_TIKTOK_TICKET | ${String(live.tiktokUsername).trim()}`
        : "LIVE_TIKTOK_TICKET");

    const finalOrderNote = `${baseOrderNote} | SID:${sid}`;

    const query = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
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
        lines,
        attributes: cartAttributes,
        note: finalOrderNote,
      },
    };

    const response = await fetch(
      `https://${STOREFRONT_DOMAIN}/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    const data = await response.json();

    const graphqlErrors = data?.errors;
    const cart = data?.data?.cartCreate?.cart;
    const userErrors = data?.data?.cartCreate?.userErrors;

    if (graphqlErrors?.length || userErrors?.length) {
      return NextResponse.json(
        {
          error: "Checkout error",
          code: "SHOPIFY_CARTCREATE_FAILED",
          message: "Shopify non ha creato il checkout",
          shopify: {
            graphqlErrors: graphqlErrors ?? [],
            userErrors: userErrors ?? [],
          },
        },
        { status: 500 }
      );
    }

    if (!cart?.checkoutUrl) {
      return NextResponse.json(
        {
          error: "Checkout error",
          code: "NO_CHECKOUT_URL",
          message: "Shopify non ha restituito checkoutUrl",
        },
        { status: 500 }
      );
    }

    const url = new URL(cart.checkoutUrl as string);
    url.searchParams.set("locale", shopifyLocale);
    url.searchParams.set("sid", sid);

    if (returnUrl) {
      try {
        const ret = new URL(String(returnUrl));
        ret.searchParams.set("sid", sid);
        url.searchParams.set("return_url", ret.toString());
      } catch {}
    }

    if (originQuery) {
      const qp = new URLSearchParams(
        originQuery.startsWith("?") ? originQuery : `?${originQuery}`
      );

      for (const key of PASS_THROUGH_KEYS) {
        const v = qp.get(key as PassKey);
        if (v) {
          url.searchParams.set(String(key), v);
        }
      }
    }

    if (finalOrderNote) {
      url.searchParams.set("note", finalOrderNote);
    }

    return NextResponse.json({
      url: url.toString(),
      sid,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "SERVER_ERROR",
        message: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}