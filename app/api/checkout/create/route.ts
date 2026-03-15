// app/api/checkout/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const STOREFRONT_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; // es: kilomystery.myshopify.com
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-01";

const LOCALE_MAP: Record<string, string> = {
  it: "it",
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
};

// ✅ whitelist parametri da propagare al checkout
const PASS_THROUGH_KEYS = [
  "_gl",
  "gclid",
  "gbraid",
  "wbraid",
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const itemsRaw = body?.items;
    const clientTotalKg = body?.totalKg;
    const returnUrl = body?.returnUrl;

    // ✅ lingua dal client
    const bodyLang = typeof body?.lang === "string" ? body.lang : "it";
    const shopifyLocale = LOCALE_MAP[bodyLang] ?? "it";

    // ✅ query string del browser passata dal client
    const originQuery =
      typeof body?.originQuery === "string" ? body.originQuery : "";

    // ✅ nota ordine opzionale (es: live ticket / bonus ruota ecc.)
    const orderNote = typeof body?.orderNote === "string" ? body.orderNote : "";

    // ✅ LIVE REGISTRATION (oggetto con dati)
    const live = body?.liveRegistration;

    // ✅ nuovo SID unico per collegare checkout -> ordine -> reward
    const sid = buildSid();

    // 🔐 Controllo env
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

    // ✅ normalizzazione + validazione items
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

    // 🧮 totale kg ricalcolato lato server (fallback se clientTotalKg non valido)
    const totalKg =
      typeof clientTotalKg === "number" && !Number.isNaN(clientTotalKg)
        ? clientTotalKg
        : items.reduce((sum: number, i: IncomingItem) => {
            const w = Number(i.weightKg || 0);
            const q = Number(i.qty || 1);
            return sum + w * q;
          }, 0);

    // 🧱 linee carrello per Storefront API
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

    // ✅ attributi sul carrello (visibili in Shopify come cart attributes)
    const cartAttributes: { key: string; value: string }[] = [
      { key: "spinEligible", value: totalKg >= 10 ? "true" : "false" },
      { key: "orderedKg", value: String(totalKg) },
      { key: "locale", value: shopifyLocale },
      { key: "sid", value: sid }, // ✅ nuovo
    ];

    if (returnUrl) cartAttributes.push({ key: "returnUrl", value: String(returnUrl) });

    // ✅ salva anche orderNote tra gli attributes (utile per debug/backoffice)
    if (orderNote) cartAttributes.push({ key: "orderNote", value: orderNote });

    // ✅ LIVE REGISTRATION (aggiunta: non rompe nulla se assente)
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

    // (debug utile: salva anche i params marketing dentro Shopify come attributes)
    if (originQuery) {
      const qp = new URLSearchParams(
        originQuery.startsWith("?") ? originQuery : `?${originQuery}`
      );
      for (const key of PASS_THROUGH_KEYS) {
        const v = qp.get(key as PassKey);
        if (v) cartAttributes.push({ key: String(key), value: v });
      }
    }

    /**
     * ✅ IMPORTANTISSIMO PER MAKE:
     * Make (Watch Orders) legge quasi sempre SOLO Order.note.
     * Quindi scriviamo una nota "ufficiale" nel carrello/checkout.
     * ✅ aggiungiamo anche SID nella note per poter ritrovare l'ordine dopo
     */
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
        note: finalOrderNote, // ✅ qui!
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

    // 🔗 checkoutUrl finale: locale + pass-through params (_gl/utm/gclid…)
    const url = new URL(cart.checkoutUrl as string);
    url.searchParams.set("locale", shopifyLocale);
    url.searchParams.set("sid", sid); // ✅ nuovo

    // ✅ aggiungiamo sid anche al returnUrl se presente
    if (returnUrl) {
      try {
        const ret = new URL(String(returnUrl));
        ret.searchParams.set("sid", sid);
        url.searchParams.set("return_url", ret.toString());
      } catch {
        // se returnUrl non è parseabile lasciamo stare
      }
    }

    if (originQuery) {
      const qp = new URLSearchParams(
        originQuery.startsWith("?") ? originQuery : `?${originQuery}`
      );

      for (const key of PASS_THROUGH_KEYS) {
        const v = qp.get(key as PassKey);
        if (v) url.searchParams.set(String(key), v);
      }
    }

    // ✅ fallback: forza la nota anche via query param (non fa male)
    if (finalOrderNote) {
      url.searchParams.set("note", finalOrderNote);
    }

    return NextResponse.json({
      url: url.toString(),
      sid, // ✅ utile anche lato debug
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