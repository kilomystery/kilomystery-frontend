import { retryDelay } from "./poporama-retry";
import { AsyncLocalStorage } from "async_hooks";
export type MetaNode = { id: string; handle: string; type: string; createdAt?: string; updatedAt?: string; fields: { key: string; value: string | null }[] };
export const NODE_FIELDS = "id handle type createdAt updatedAt fields { key value }";
export const field = (node: MetaNode, key: string) => node.fields.find(f => f.key === key)?.value || "";
const budget = new AsyncLocalStorage<AbortSignal>();
export const withShopifyBudget = <T>(signal: AbortSignal, work: () => Promise<T>) => budget.run(signal, work);
let token: { value: string; until: number } | undefined;
export async function accessToken(signal?: AbortSignal) {
  if (token && token.until > Date.now() + 60000) return token.value;
  const { SHOPIFY_SHOP: shop, SHOPIFY_CLIENT_ID: clientId, SHOPIFY_CLIENT_SECRET: secret } = process.env;
  if (!shop || !clientId || !secret) throw new Error("Configurazione Shopify mancante.");
  const response = await fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, { method: "POST", cache: "no-store", signal,
    headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grant_type: "client_credentials", client_id: clientId, client_secret: secret }) });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error("Autenticazione Shopify non riuscita.");
  token = { value: data.access_token, until: Date.now() + (data.expires_in || 3600) * 1000 };
  return token.value;
}
export class RetryLater extends Error {
  constructor(message: string, public delayMs = 3000) { super(message); }
}
export async function graphql(query: string, variables: Record<string, unknown> = {}, signal?: AbortSignal) {
  signal ??= budget.getStore() ?? AbortSignal.timeout(12000);
  const response = await fetch(`https://${process.env.SHOPIFY_SHOP}.myshopify.com/admin/api/2026-07/graphql.json`, {
    method: "POST", cache: "no-store", signal, headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": await accessToken(signal) }, body: JSON.stringify({ query, variables }),
  });
  if (response.status === 429 || response.status >= 500) throw new RetryLater("Shopify temporaneamente non disponibile", Math.min(30000, retryDelay(response.headers.get("Retry-After"), 3000)));
  const result = await response.json();
  if (result.errors?.some((e: { extensions?: { code?: string } }) => e.extensions?.code === "THROTTLED")) throw new RetryLater("Limite Shopify raggiunto", 3000);
  if (!response.ok || result.errors?.length) throw new Error(result.errors?.map((e: { message: string }) => e.message).join("; ") || "Errore Shopify");
  return result.data;
}
export async function byHandle(type: string, handle: string): Promise<MetaNode | null> {
  const data = await graphql(`query PoporamaNode($handle: MetaobjectHandleInput!) { metaobjectByHandle(handle: $handle) { ${NODE_FIELDS} } }`, { handle: { type, handle } });
  return data.metaobjectByHandle;
}
export async function byId(id: string): Promise<MetaNode | null> {
  const data = await graphql(`query PoporamaNodeId($id: ID!) { metaobject(id: $id) { ${NODE_FIELDS} } }`, { id });
  return data.metaobject;
}
export async function manyHandles(type: string, handles: string[]): Promise<(MetaNode | null)[]> {
  if (!handles.length) return [];
  if (handles.length > 50) throw new Error("Blocco Shopify troppo grande.");
  const query = handles.map((handle, i) => `n${i}: metaobjectByHandle(handle: {type: ${JSON.stringify(type)}, handle: ${JSON.stringify(handle)}}) { ${NODE_FIELDS} }`).join("\n");
  const data = await graphql(`query PoporamaNodes { ${query} }`);
  return handles.map((_, i) => data[`n${i}`]);
}
export async function page(type: string, after: string | null = null, first = 100, query = "") {
  const data = await graphql(`query PoporamaPage($type: String!, $after: String, $first: Int!, $query: String) { metaobjects(type:$type, after:$after, first:$first, query:$query) { nodes { ${NODE_FIELDS} } pageInfo { hasNextPage endCursor } } }`, { type, after, first, query });
  if (!Array.isArray(data.metaobjects?.nodes)) throw new Error("Paginazione Shopify incompleta.");
  return data.metaobjects as { nodes: MetaNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
}
export async function updateNode(id: string, fields: { key: string; value: string }[]): Promise<MetaNode> {
  const data = await graphql(`mutation PoporamaUpdate($id: ID!, $metaobject: MetaobjectUpdateInput!) { metaobjectUpdate(id:$id, metaobject:$metaobject) { metaobject { ${NODE_FIELDS} } userErrors { message code } } }`, { id, metaobject: { fields } });
  const result = data.metaobjectUpdate;
  if (result.userErrors?.length || !result.metaobject) throw new Error(result.userErrors?.map((e: { message: string }) => e.message).join("; ") || "Aggiornamento non confermato");
  return result.metaobject;
}

export async function articleByPP(code: string): Promise<MetaNode | null> {
  const direct = await byHandle("poporama_articolo", code.toLowerCase());
  if (direct && field(direct, "codice_pp").toUpperCase() === code) return direct;
  let cursor: string | null = null;
  do {
    const result = await page("poporama_articolo", cursor, 250);
    const node = result.nodes.find(n => field(n, "codice_pp").toUpperCase() === code);
    if (node) return node;
    if (!result.pageInfo.hasNextPage) break;
    if (!result.pageInfo.endCursor || cursor === result.pageInfo.endCursor) throw new Error("Paginazione articoli non valida");
    cursor = result.pageInfo.endCursor;
  } while (cursor);
  return null;
}
