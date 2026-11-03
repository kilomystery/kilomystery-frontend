import { createHash } from "crypto";
import { effectiveScopes, missingScopes, parseScopes, safeShopifyText, ShopifyScopeError } from "./poporama-shopify-scopes";
import { retryDelay } from "./poporama-retry";
import { AsyncLocalStorage } from "async_hooks";
export type MetaNode = { id: string; handle: string; type: string; createdAt?: string; updatedAt?: string; fields: { key: string; value: string | null }[] };
export const NODE_FIELDS = "id handle type createdAt updatedAt fields { key value }";
export const field = (node: MetaNode, key: string) => node.fields.find(f => f.key === key)?.value || "";
const budget = new AsyncLocalStorage<AbortSignal>();
export const withShopifyBudget = <T>(signal: AbortSignal, work: () => Promise<T>) => budget.run(signal, work);
type CachedToken = { value: string; until: number; obtainedAt: number; key: string; scopes: string[] | null };
let token: CachedToken | undefined;
let refreshing: { key: string; promise: Promise<string> } | undefined;
function tokenConfiguration() {
  const { SHOPIFY_SHOP: shop, SHOPIFY_CLIENT_ID: clientId, SHOPIFY_CLIENT_SECRET: secret } = process.env;
  if (!shop || !clientId || !secret) throw new Error("Configurazione Shopify mancante.");
  return { shop, clientId, secret, key: createHash("sha256").update(JSON.stringify([shop, clientId, secret])).digest("hex") };
}
export function tokenStatus() {
  const config = tokenConfiguration();
  const current = token?.key === config.key ? token : undefined;
  return { grant: "client_credentials", cached: !!current, obtainedAt: current ? new Date(current.obtainedAt).toISOString() : null,
    expiresAt: current ? new Date(current.until).toISOString() : null, oauthScopes: current?.scopes ?? null,
    effectiveOAuthScopes: current?.scopes ? effectiveScopes(current.scopes) : null,
    clientIdFingerprint: createHash("sha256").update(config.clientId).digest("hex").slice(0, 12) };
}
export async function accessToken(signal?: AbortSignal, options: { forceRefresh?: boolean } = {}) {
  const config = tokenConfiguration();
  if (refreshing?.key === config.key) return refreshing.promise;
  if (!options.forceRefresh && token?.key === config.key && token.until > Date.now() + 60000) return token.value;
  const promise = (async () => {
    const response = await fetch(`https://${config.shop}.myshopify.com/admin/oauth/access_token`, { method: "POST", cache: "no-store", signal: signal ?? budget.getStore() ?? AbortSignal.timeout(12000),
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grant_type: "client_credentials", client_id: config.clientId, client_secret: config.secret }) });
    const data = await response.json();
    if (!response.ok || typeof data.access_token !== "string" || !data.access_token) {
      const code = typeof data.error === "string" && /^[a-z_]+$/i.test(data.error) ? data.error : "authentication_failed";
      throw new Error(`Autenticazione Shopify non riuscita (HTTP ${response.status}, ${code}). Verifica la coppia Client ID/Client Secret dell’app installata sul negozio configurato.`);
    }
    const expires = Number(data.expires_in);
    const obtainedAt = Date.now();
    token = { value: data.access_token, until: obtainedAt + (Number.isFinite(expires) && expires > 0 ? expires : 3600) * 1000,
      obtainedAt, key: config.key, scopes: parseScopes(data.scope) };
    return token.value;
  })();
  const flight = { key: config.key, promise }; refreshing = flight;
  try { return await promise; } finally { if (refreshing === flight) refreshing = undefined; }
}
export async function ensureAccessScopes(required: readonly string[]) {
  await accessToken();
  if (token!.scopes === null || !missingScopes(token!.scopes, required).length) return;
  // A previously cached token can predate the installation's updated permissions.
  await accessToken(undefined, { forceRefresh: true });
  const data = await graphql(`query PoporamaGrantedScopes { currentAppInstallation { accessScopes { handle } } }`);
  const scopes = data.currentAppInstallation?.accessScopes?.map((s: { handle: string }) => s.handle);
  if (!Array.isArray(scopes)) throw new Error("Shopify non ha restituito gli scope dell’installazione corrente.");
  const missing = missingScopes(scopes, required);
  if (missing.length) throw new ShopifyScopeError(missing);
}
export class RetryLater extends Error {
  constructor(message: string, public delayMs = 3000) { super(message); }
}
export async function graphql(query: string, variables: Record<string, unknown> = {}, signal?: AbortSignal) {
  signal ??= budget.getStore() ?? AbortSignal.timeout(12000);
  for (let attempt = 0; attempt < 2; attempt++) {
    const usedToken = await accessToken(signal);
    const response = await fetch(`https://${process.env.SHOPIFY_SHOP}.myshopify.com/admin/api/2026-07/graphql.json`, {
      method: "POST", cache: "no-store", signal, headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": usedToken }, body: JSON.stringify({ query, variables }),
    });
    if (response.status === 429 || response.status >= 500) throw new RetryLater("Shopify temporaneamente non disponibile", Math.min(30000, retryDelay(response.headers.get("Retry-After"), 3000)));
    const result = await response.json();
    if (result.errors?.some((e: { extensions?: { code?: string } }) => e.extensions?.code === "THROTTLED")) throw new RetryLater("Limite Shopify raggiunto", 3000);
    const denied = response.status === 401 || response.status === 403 || result.errors?.some((e: { extensions?: { code?: string } }) => e.extensions?.code === "ACCESS_DENIED");
    const partialData = result.data && Object.values(result.data).some(value => value !== null && value !== undefined);
    // Never replay a partially executed operation. An authentication rejection has no writes.
    if (denied && !partialData && attempt === 0) {
      if (token?.value === usedToken) await accessToken(signal, { forceRefresh: true });
      continue;
    }
    if (!response.ok || result.errors?.length) throw new Error(safeShopifyText(result.errors?.map((e: { message: string }) => e.message).join("; ") || `Errore Shopify (HTTP ${response.status})`));
    return result.data;
  }
  throw new Error("Autenticazione Shopify non disponibile dopo il rinnovo del token.");
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
