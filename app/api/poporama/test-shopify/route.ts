 import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const shop = process.env.SHOPIFY_SHOP;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

    if (!shop || !clientId || !clientSecret) {
      return NextResponse.json(
        {
          ok: false,
          error: "Variabili Shopify POPORAMA mancanti in .env.local",
        },
        { status: 500 }
      );
    }

    // 1. Otteniamo un access token Shopify
    const tokenResponse = await fetch(
      `https://${shop}.myshopify.com/admin/oauth/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
        cache: "no-store",
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return NextResponse.json(
        {
          ok: false,
          step: "authentication",
          status: tokenResponse.status,
          error: tokenData,
        },
        { status: 500 }
      );
    }

    // 2. Interroghiamo Shopify Admin GraphQL
    // senza creare o modificare nulla.
    const graphqlResponse = await fetch(
      `https://${shop}.myshopify.com/admin/api/2026-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": tokenData.access_token,
        },
        body: JSON.stringify({
          query: `
            query PoporamaConnectionTest {
              metaobjects(type: "poporama_lotto", first: 5) {
                nodes {
                  id
                  handle
                  type
                  updatedAt
                }
              }
            }
          `,
        }),
        cache: "no-store",
      }
    );

    const graphqlData = await graphqlResponse.json();

    if (!graphqlResponse.ok || graphqlData.errors) {
      return NextResponse.json(
        {
          ok: false,
          step: "graphql",
          status: graphqlResponse.status,
          error: graphqlData.errors ?? graphqlData,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "POPORAMA collegato correttamente a Shopify",
      metaobjectType: "poporama_lotto",
      lottiTrovati: graphqlData.data?.metaobjects?.nodes?.length ?? 0,
      lotti: graphqlData.data?.metaobjects?.nodes ?? [],
    });
  } catch (error) {
    console.error("POPORAMA Shopify test error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Errore sconosciuto durante il test Shopify",
      },
      { status: 500 }
    );
  }
}