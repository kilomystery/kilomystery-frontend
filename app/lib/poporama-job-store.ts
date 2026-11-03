import { randomUUID } from "crypto";
import { byHandle, field, graphql, page, NODE_FIELDS, type MetaNode } from "./poporama-shopify";
export const JOB_TYPE = "poporama_import_job";
export const CHUNK_TYPE = "poporama_import_chunk";
export const CACHE_TYPE = "poporama_translation_cache";
export const CHUNK_SIZE = 100;
export function decode<T>(node: MetaNode): T { return JSON.parse(field(node, "data")); }
export async function read<T>(type: string, handle: string): Promise<T | null> { const node = await byHandle(type, handle); return node ? decode<T>(node) : null; }
export async function put(type: string, handle: string, value: unknown) {
  const raw = JSON.stringify(value);
  if (Buffer.byteLength(raw) > 800000) throw new Error("Blocco troppo grande per Shopify.");
  const data = await graphql(`mutation PoporamaStore($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) { metaobjectUpsert(handle:$handle, metaobject:$metaobject) { metaobject { id } userErrors { message code } } }`, { handle: { type, handle }, metaobject: { fields: [{ key: "data", value: raw }] } });
  if (data.metaobjectUpsert.userErrors?.length) throw new Error(data.metaobjectUpsert.userErrors.map((e: { message: string }) => e.message).join("; "));
}
let ready = false;
export async function ensureJobSchema() {
  if (ready) return;
  for (const [type, name] of [[JOB_TYPE, "POPORAMA lavori importazione"], [CHUNK_TYPE, "POPORAMA blocchi importazione"], [CACHE_TYPE, "POPORAMA memoria traduzioni"]]) {
    const existing = await graphql(`query PoporamaDefinition($type: String!) { metaobjectDefinitionByType(type:$type) { id access { storefront } fieldDefinitions { key type { name } } } }`, { type });
    if (existing.metaobjectDefinitionByType) {
      if (existing.metaobjectDefinitionByType.access?.storefront !== "NONE") throw new Error(`Schema ${type} non privato: configurazione interrotta senza modificare dati esistenti.`);
      if (!existing.metaobjectDefinitionByType.fieldDefinitions.some((f: { key: string; type: { name: string } }) => f.key === "data" && f.type.name === "json")) throw new Error(`Schema ${type} incompatibile: nessun dato è stato modificato.`);
      continue;
    }
    const data = await graphql(`mutation PoporamaDefinitionCreate($definition: MetaobjectDefinitionCreateInput!) { metaobjectDefinitionCreate(definition:$definition) { metaobjectDefinition { id } userErrors { message code } } }`, {
      definition: { type, name, access: { storefront: "NONE", admin: "MERCHANT_READ_WRITE" }, fieldDefinitions: [{ key: "data", name: "Dati interni", type: "json", required: true }] },
    });
    if (data.metaobjectDefinitionCreate.userErrors?.length) {
      const concurrent = await graphql(`query PoporamaDefinition($type: String!) { metaobjectDefinitionByType(type:$type) { id } }`, { type });
      if (!concurrent.metaobjectDefinitionByType) throw new Error("Servono i permessi Shopify read/write_metaobject_definitions per inizializzare la coda. Nessun articolo è stato cancellato.");
    }
  }
  ready = true;
}
// A unique Shopify handle arbitrates workers. No product is ever upserted.
export async function lease(): Promise<null | (() => Promise<void>)> {
  const handle = "worker-lease";
  const old = await byHandle(JOB_TYPE, handle);
  if (old) {
    const data = decode<{ expires: number }>(old);
    if (data.expires > Date.now()) return null;
    await graphql(`mutation PoporamaLeaseDelete($id: ID!) { metaobjectDelete(id:$id) { deletedId userErrors { message } } }`, { id: old.id });
  }
  const data = await graphql(`mutation PoporamaLease($metaobject: MetaobjectCreateInput!) { metaobjectCreate(metaobject:$metaobject) { metaobject { ${NODE_FIELDS} } userErrors { code message } } }`, {
    metaobject: { type: JOB_TYPE, handle, fields: [{ key: "data", value: JSON.stringify({ owner: randomUUID(), expires: Date.now() + 120000 }) }] },
  });
  const node = data.metaobjectCreate.metaobject;
  if (!node) return null;
  return async () => { await graphql(`mutation PoporamaLeaseRelease($id: ID!) { metaobjectDelete(id:$id) { deletedId userErrors { message } } }`, { id: node.id }); };
}
export async function listJobNodes(after: string | null = null) { return page(JOB_TYPE, after, 100, "handle:job-*"); }
