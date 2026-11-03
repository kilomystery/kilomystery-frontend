export const QUEUE_SCOPES = ["read_metaobjects", "write_metaobjects", "read_metaobject_definitions", "write_metaobject_definitions"] as const;
export function parseScopes(value: unknown): string[] | null {
  if (typeof value !== "string") return null;
  return [...new Set(value.split(/[\s,]+/).filter(Boolean))].sort();
}
export function effectiveScopes(scopes: readonly string[]) {
  const effective = new Set(scopes);
  // Shopify's OAuth response can list only write_*; these include corresponding read_*.
  for (const scope of scopes) if (scope.startsWith("write_")) effective.add(`read_${scope.slice(6)}`);
  return [...effective].sort();
}
export function missingScopes(scopes: readonly string[], required: readonly string[] = QUEUE_SCOPES) {
  const granted = new Set(effectiveScopes(scopes));
  return required.filter(scope => !granted.has(scope));
}
export function safeShopifyText(value: string) {
  let text = value;
  for (const name of ["SHOPIFY_CLIENT_ID", "SHOPIFY_CLIENT_SECRET", "SHOPIFY_ADMIN_ACCESS_TOKEN", "SHOPIFY_STOREFRONT_TOKEN", "DEEPL_API_KEY", "POPORAMA_SESSION_SECRET", "POPORAMA_WORKER_SECRET"]) {
    const secret = process.env[name];
    if (secret && secret.length >= 4) text = text.split(secret).join("[redacted]");
  }
  return text.replace(/\b(?:shpat|shpca|shpss|shpua)_[A-Za-z0-9_-]+\b/g, "[redacted]")
    .replace(/Bearer\s+[^\s"'<>]+/gi, "Bearer [redacted]").slice(0, 2000);
}
export type SafeShopifyError = { code: string; field: string[]; message: string };
export function safeUserErrors(value: unknown): SafeShopifyError[] {
  if (!Array.isArray(value)) return [];
  return value.map(error => ({ code: typeof error?.code === "string" ? safeShopifyText(error.code) : "UNKNOWN",
    field: Array.isArray(error?.field) ? error.field.map((part: unknown) => safeShopifyText(String(part))) : [],
    message: safeShopifyText(typeof error?.message === "string" ? error.message : "Risposta Shopify incompleta") }));
}
export class ShopifyScopeError extends Error {
  readonly missingScopes: string[];
  constructor(scopes: string[]) {
    super(`Scope Shopify effettivamente mancanti: ${scopes.join(", ")}. Approva questi permessi nell’installazione dell’app configurata sul negozio e riprova; il token è già stato rinnovato una volta.`);
    this.name = "ShopifyScopeError"; this.missingScopes = scopes;
  }
}
export class ShopifyDefinitionError extends Error {
  constructor(public definitionType: string, public details: SafeShopifyError[]) {
    const descriptions = details.map(e => `${e.code}${e.field.length ? ` (${e.field.join(".")})` : ""}: ${e.message}`).join("; ");
    super(`Creazione definizione ${definitionType} fallita: ${descriptions || "Shopify non ha confermato la creazione"}`);
    this.name = "ShopifyDefinitionError";
  }
}
