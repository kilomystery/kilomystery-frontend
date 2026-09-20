import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import { NextResponse } from "next/server";
import { aggregateDashboard, type DashboardNode } from "@/app/lib/poporama-dashboard";

export const dynamic = "force-dynamic";
const SHOPIFY_API_VERSION = "2026-07";
const PAGE_SIZE = 250;
const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;
  try {
    const shop = process.env.SHOPIFY_SHOP;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
    if (!shop || !clientId || !clientSecret) throw new Error("Configurazione Shopify incompleta sul server.");
    const auth = await fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
      method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
      body: JSON.stringify({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
    });
    const token = await auth.json();
    if (!auth.ok || !token.access_token) throw new Error("Impossibile autenticarsi con Shopify.");
    const endpoint = `https://${shop}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
    // Due scansioni paginate, non una ricerca per ogni articolo o lotto.
    const lotti = await readAll(endpoint, token.access_token, "poporama_lotto");
    const articoli = await readAll(endpoint, token.access_token, "poporama_articolo");
    return NextResponse.json({ ok: true, ...aggregateDashboard(lotti, articoli) }, { headers: NO_STORE });
  } catch (error) {
    return NextResponse.json({ ok: false,
      error: error instanceof Error ? error.message : "Impossibile caricare la dashboard POPORAMA.",
    }, { status: 502, headers: NO_STORE });
  }
}

async function readAll(endpoint: string, token: string, type: "poporama_lotto" | "poporama_articolo") {
  const nodes = new Map<string, DashboardNode>();
  const cursors = new Set<string>();
  let after: string | null = null;
  const query = `query PoporamaDashboard($type: String!, $first: Int!, $after: String) {
    metaobjects(type: $type, first: $first, after: $after) {
      nodes { id handle createdAt fields { key value } }
      pageInfo { hasNextPage endCursor }
    }
  }`;
  while (true) {
    const data = await readPage(endpoint, token, query, { type, first: PAGE_SIZE, after });
    const connection = data.data?.metaobjects;
    if (!connection || !Array.isArray(connection.nodes) || typeof connection.pageInfo?.hasNextPage !== "boolean") {
      throw new Error(`Risposta Shopify incompleta per ${type}. Riprova l'aggiornamento.`);
    }
    for (const node of connection.nodes as DashboardNode[]) {
      if (!node?.id || !Array.isArray(node.fields)) throw new Error(`Record Shopify non valido per ${type}.`);
      nodes.set(node.id, node);
    }
    if (!connection.pageInfo.hasNextPage) return [...nodes.values()];
    const next = connection.pageInfo.endCursor;
    if (typeof next !== "string" || !next || cursors.has(next)) {
      throw new Error(`Paginazione Shopify non valida per ${type}: cursore mancante o ripetuto.`);
    }
    cursors.add(next);
    after = next;
  }
}

async function readPage(endpoint: string, token: string, query: string, variables: Record<string, unknown>) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(endpoint, {
      method: "POST", cache: "no-store",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({ query, variables }),
    });
    const data = await response.json();
    const throttled = response.status === 429 || data.errors?.some(
      (error: { extensions?: { code?: string } }) => error.extensions?.code === "THROTTLED"
    );
    if (throttled && attempt < 3) {
      const cost = data.extensions?.cost;
      const wait = cost?.throttleStatus?.restoreRate > 0
        ? Math.ceil((cost.requestedQueryCost - cost.throttleStatus.currentlyAvailable) / cost.throttleStatus.restoreRate * 1000)
        : 1000 * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, Math.max(250, Math.min(10000, wait || 1000))));
      continue;
    }
    if (!response.ok || data.errors?.length) throw new Error("Lettura Shopify non riuscita. Riprova AGGIORNA DASHBOARD.");
    return data;
  }
  throw new Error("Shopify temporaneamente occupato. Riprova tra qualche istante.");
}
