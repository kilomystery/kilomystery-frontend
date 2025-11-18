import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const API_VERSION = "2024-01";
const SECRET = process.env.SPIN_SECRET || "dev-secret-change-me";

type SpinState = {
  orderId: string;
  customerId: string;
  kg: number;
  exp: number;
  jti: string;
  spinCount: number;
  multiplier: number;
  pendingSpins: number;
};

const b64u = (s: Buffer | string) =>
  Buffer.from(s).toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");

function sign(payload: string) {
  return b64u(createHmac("sha256", SECRET).update(payload).digest());
}

function encode(state: SpinState) {
  const p = b64u(JSON.stringify(state));
  return `${p}.${sign(p)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const checkoutId = body.checkoutId;
    const orderedKg = Number(body.orderedKg || 0);
    const lang = body.lang || "it";

    if (!checkoutId) {
      return NextResponse.json({ error: "Missing checkoutId" }, { status: 400 });
    }

    const domain = process.env.SHOPIFY_STORE_DOMAIN!;
    const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;

    // 1 - Trova ordine
    const res = await fetch(
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
                    email
                    customer { id email }
                  }
                }
              }
            }
          `,
          variables: { query: `checkout_token:${checkoutId}` },
        }),
      }
    );

    const json = await res.json();
    const node = json?.data?.orders?.edges?.[0]?.node;

    if (!node) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2 - Genera token spin
    const state: SpinState = {
      orderId: node.id,
      customerId: node.customer?.id ?? "",
      kg: orderedKg,
      exp: Math.floor(Date.now()/1000) + 3600,
      jti: crypto.randomUUID(),
      spinCount: 0,
      multiplier: 1,
      pendingSpins: 1,
    };

    const signedToken = encode(state);

    return NextResponse.json({ token: signedToken });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
