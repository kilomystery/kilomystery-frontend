// app/api/order-by-sid/route.ts
import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-01";

export async function GET(req: NextRequest) {
  try {
    const sid = req.nextUrl.searchParams.get("sid");

    if (!sid) {
      return NextResponse.json(
        { ok: false, error: "Missing sid" },
        { status: 400 }
      );
    }

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing Shopify admin configuration",
          details: {
            hasDomain: !!SHOPIFY_STORE_DOMAIN,
            hasAdminToken: !!SHOPIFY_ADMIN_ACCESS_TOKEN,
          },
        },
        { status: 500 }
      );
    }

    // Cerchiamo ordini recenti con la nota che contiene SID:...
    const query = `
      query OrdersBySid($query: String!) {
        orders(first: 10, sortKey: CREATED_AT, reverse: true, query: $query) {
          edges {
            node {
              id
              name
              note
              createdAt
              currentTotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              displayFinancialStatus
              displayFulfillmentStatus
              lineItems(first: 20) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      query: `note:SID:${sid}`,
    };

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (data?.errors?.length) {
      return NextResponse.json(
        { ok: false, error: "Shopify GraphQL error", details: data.errors },
        { status: 500 }
      );
    }

    const edges = data?.data?.orders?.edges ?? [];
    const order = edges[0]?.node;

    if (!order) {
      return NextResponse.json({ ok: true, found: false });
    }

    const amount = Number(order?.currentTotalPriceSet?.shopMoney?.amount || 0);
    const currency =
      order?.currentTotalPriceSet?.shopMoney?.currencyCode || "EUR";

    const items =
      order?.lineItems?.edges?.map((edge: any) => ({
        title: edge?.node?.title || "",
        quantity: Number(edge?.node?.quantity || 1),
        variantId: edge?.node?.variant?.id || null,
      })) || [];

    return NextResponse.json({
      ok: true,
      found: true,
      order: {
        id: order.id,
        name: order.name,
        note: order.note,
        createdAt: order.createdAt,
        financialStatus: order.displayFinancialStatus,
        fulfillmentStatus: order.displayFulfillmentStatus,
        value: amount,
        currency,
        items,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
        message: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}