import { accessToken, graphql, tokenStatus } from "./poporama-shopify";
import { QUEUE_SCOPES, effectiveScopes, missingScopes, safeShopifyText } from "./poporama-shopify-scopes";
const INSTALLATION_QUERY = `query PoporamaInstallationDiagnosis {
  shop { name myshopifyDomain }
  currentAppInstallation {
    id accessScopes { handle }
    app { id title apiKey requestedAccessScopes { handle } optionalAccessScopes { handle } }
  }
}`;
const DEFINITIONS_QUERY = `query PoporamaQueueDiagnosis {
  job: metaobjectDefinitionByType(type:"poporama_import_job") { id type access { admin storefront } fieldDefinitions { key type { name } } }
  chunk: metaobjectDefinitionByType(type:"poporama_import_chunk") { id type access { admin storefront } fieldDefinitions { key type { name } } }
  cache: metaobjectDefinitionByType(type:"poporama_translation_cache") { id type access { admin storefront } fieldDefinitions { key type { name } } }
  __type(name:"MetaobjectUserErrorCode") { enumValues { name description } }
}`;
type Installation = { shop: { name: string; myshopifyDomain: string }; currentAppInstallation: {
  id: string; accessScopes: { handle: string }[]; app: { id: string; title: string; apiKey: string; requestedAccessScopes?: { handle: string }[]; optionalAccessScopes?: { handle: string }[] };
} };
export async function shopifyDiagnostics({ refresh = false }: { refresh?: boolean } = {}) {
  // This is the same token cache/client used by import jobs. No schema initialization or mutations.
  await accessToken();
  const beforeToken = tokenStatus();
  const before = await graphql(INSTALLATION_QUERY) as Installation;
  if (!before.currentAppInstallation) throw new Error("Installazione corrente non disponibile.");
  const beforeScopes = before.currentAppInstallation.accessScopes.map(scope => scope.handle).sort();
  const oauthMissing = beforeToken.oauthScopes !== null ? missingScopes(beforeToken.oauthScopes) : [];
  const reason = refresh ? "requested" : missingScopes(beforeScopes).length || oauthMissing.length ? "missing_scopes" : null;
  let installation = before;
  if (reason) { await accessToken(undefined, { forceRefresh: true }); installation = await graphql(INSTALLATION_QUERY) as Installation; }
  const current = installation.currentAppInstallation;
  const grantedScopes = current.accessScopes.map(scope => scope.handle).sort();
  const missing = missingScopes(grantedScopes);
  const app = current.app;
  const clientIdMatches = app.apiKey === process.env.SHOPIFY_CLIENT_ID;
  const expectedTitle = "POPORAMA Test Center";
  const expectedAppMatches = app.title.trim().toLowerCase() === expectedTitle.toLowerCase();
  let definitions: Record<string, { exists: boolean; compatible: boolean | null; id?: string; storefront?: string }> | null = null;
  let definitionReadError: string | null = null;
  let adminAccessRule: string | null = null;
  if (!missing.includes("read_metaobject_definitions")) {
    try {
      const data = await graphql(DEFINITIONS_QUERY);
      definitions = {};
      for (const [alias, type] of [["job", "poporama_import_job"], ["chunk", "poporama_import_chunk"], ["cache", "poporama_translation_cache"]]) {
        const definition = data[alias];
        definitions[type] = definition ? { exists: true, id: definition.id, storefront: definition.access?.storefront,
          compatible: definition.access?.storefront === "NONE" && definition.fieldDefinitions?.some((f: { key: string; type: { name: string } }) => f.key === "data" && f.type.name === "json") } : { exists: false, compatible: null };
      }
      adminAccessRule = data.__type?.enumValues?.find((e: { name: string }) => e.name === "ADMIN_ACCESS_INPUT_NOT_ALLOWED")?.description || null;
    } catch (error) { definitionReadError = safeShopifyText(error instanceof Error ? error.message : "Verifica definizioni non disponibile"); }
  }
  const declared = [...new Set([...(app.requestedAccessScopes || []), ...(app.optionalAccessScopes || [])].map(scope => scope.handle))].sort();
  return {
    diagnosticVersion: 2,
    environment: { vercel: process.env.VERCEL === "1", target: process.env.VERCEL_ENV || "local", deploymentHost: process.env.VERCEL_URL || null, commit: process.env.VERCEL_GIT_COMMIT_SHA || null },
    configuredShop: process.env.SHOPIFY_SHOP, shop: installation.shop,
    app: { id: app.id, title: app.title, installationId: current.id, clientIdMatchesTokenApp: clientIdMatches, expectedTitle, expectedAppMatches },
    token: { ...tokenStatus(), staticAdminTokenUsedByImport: false },
    renewal: { performed: !!reason || tokenStatus().obtainedAt !== beforeToken.obtainedAt, reason,
      grantedScopesBefore: beforeScopes, grantedScopesChanged: effectiveScopes(beforeScopes).join(",") !== effectiveScopes(grantedScopes).join(",") },
    requiredScopes: [...QUEUE_SCOPES], grantedScopes, effectiveGrantedScopes: effectiveScopes(grantedScopes), missingScopes: missing,
    declaredScopes: declared, requiredScopesNotDeclared: missingScopes(declared),
    installationApprovalNeededForQueue: missing.length > 0,
    definitions, definitionReadError, adminAccessRule,
    schemaCreation: { merchantOwned: true, accessAdminSent: false, storefront: "NONE" },
    readyForSchemaInitialization: clientIdMatches && expectedAppMatches && missing.length === 0 && !definitionReadError && !Object.values(definitions || {}).some(d => d.compatible === false),
  };
}
