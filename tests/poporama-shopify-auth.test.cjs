const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename);
const load = Module._load; let unauthorized = null;
Module._load = function(name, parent, main) {
  if (name === '@/app/lib/poporama-auth') return { requirePoporamaSession: async () => unauthorized };
  if (name.startsWith('@/')) name = path.join(root, name.slice(2));
  return load.call(this, name, parent, main);
};
const { NextRequest } = require('next/server');
const { QUEUE_SCOPES, missingScopes, safeShopifyText } = require('../app/lib/poporama-shopify-scopes.ts');
const fullOAuthScopes = 'write_metaobjects,write_metaobject_definitions';
let state;
function setup() {
  process.env.SHOPIFY_SHOP = 'auth-fixture'; process.env.SHOPIFY_CLIENT_ID = 'inert-client-id'; process.env.SHOPIFY_CLIENT_SECRET = 'inert-client-secret';
  process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'shpat_inert_static_token_not_used';
  unauthorized = null;
  state = { oauthCalls: 0, graphCalls: [], scopes: [fullOAuthScopes], invalidFirst: false, alwaysInvalid: false, denied: false, partial: false,
    definitions: new Map(), definitionError: null, oauthError: false, appTitle: 'POPORAMA Test Center' };
  for (const file of ['poporama-shopify.ts', 'poporama-job-store.ts', 'poporama-shopify-diagnostics.ts']) delete require.cache[require.resolve('../app/lib/' + file)];
  delete require.cache[require.resolve('../app/api/poporama/test-shopify/route.ts')];
  return { client: require('../app/lib/poporama-shopify.ts'), store: require('../app/lib/poporama-job-store.ts'),
    diagnostic: require('../app/lib/poporama-shopify-diagnostics.ts'), route: require('../app/api/poporama/test-shopify/route.ts') };
}
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  assert.match(String(url), /^https:\/\/auth-fixture\.myshopify\.com\//);
  if (String(url).includes('/oauth/')) {
    const payload = JSON.parse(options.body); assert.equal(payload.grant_type, 'client_credentials');
    assert.equal(payload.client_id, process.env.SHOPIFY_CLIENT_ID); assert.equal(payload.client_secret, process.env.SHOPIFY_CLIENT_SECRET);
    assert.ok(!Object.hasOwn(payload, 'scope')); state.oauthCalls++;
    if (state.oauthError) return Response.json({ error: 'invalid_client', error_description: `Must not leak ${process.env.SHOPIFY_CLIENT_SECRET}` }, { status: 401 });
    await new Promise(resolve => setTimeout(resolve, 2));
    return Response.json({ access_token: `opaque-inert-token-${state.oauthCalls}`, scope: state.scopes[Math.min(state.oauthCalls - 1, state.scopes.length - 1)], expires_in: 86399 });
  }
  const { query, variables = {} } = JSON.parse(options.body);
  const token = options.headers['X-Shopify-Access-Token'];
  state.graphCalls.push({ query, variables, token });
  assert.ok(token.startsWith('opaque-inert-token-')); assert.notEqual(token, process.env.SHOPIFY_ADMIN_ACCESS_TOKEN);
  if (state.alwaysInvalid || (state.invalidFirst && token === 'opaque-inert-token-1')) return Response.json({ errors: [{ message: 'Invalid access token' }] }, { status: 401 });
  if (state.partial) return Response.json({ data: { first: { id: 'already-created' }, second: null }, errors: [{ message: 'Denied second operation', extensions: { code: 'ACCESS_DENIED' } }] });
  if (state.denied) return Response.json({ data: null, errors: [{ message: 'Access denied', extensions: { code: 'ACCESS_DENIED' } }] });
  if (query.includes('currentAppInstallation')) {
    const currentScopes = state.scopes[Math.min(state.oauthCalls - 1, state.scopes.length - 1)].split(',');
    const scopes = [...new Set(currentScopes.flatMap(s => s.startsWith('write_') ? [s, 'read_' + s.slice(6)] : [s]))];
    return Response.json({ data: { shop: { name: 'Fixture shop', myshopifyDomain: 'auth-fixture.myshopify.com' }, currentAppInstallation: { id: 'installation-1', accessScopes: scopes.map(handle => ({ handle })), app: {
      id: 'app-1', title: state.appTitle, apiKey: process.env.SHOPIFY_CLIENT_ID, requestedAccessScopes: QUEUE_SCOPES.map(handle => ({ handle })), optionalAccessScopes: [],
    } } } });
  }
  if (query.includes('PoporamaQueueDiagnosis')) return Response.json({ data: { job: null, chunk: null, cache: null, __type: { enumValues: [{ name: 'ADMIN_ACCESS_INPUT_NOT_ALLOWED', description: 'Admin access can only be specified on metaobject definitions that have an app-reserved type.' }] } } });
  if (query.includes('metaobjectDefinitionByType')) return Response.json({ data: { metaobjectDefinitionByType: state.definitions.get(variables.type) || null } });
  if (query.includes('metaobjectDefinitionCreate(')) {
    const definition = variables.definition;
    if (Object.hasOwn(definition.access || {}, 'admin')) return Response.json({ data: { metaobjectDefinitionCreate: { metaobjectDefinition: null, userErrors: [{ code: 'ADMIN_ACCESS_INPUT_NOT_ALLOWED', field: ['definition','access','admin'], message: 'Admin access can only be specified on metaobject definitions that have an app-reserved type.' }] } } });
    if (state.definitionError) return Response.json({ data: { metaobjectDefinitionCreate: { metaobjectDefinition: null, userErrors: [state.definitionError] } } });
    const node = { id: `definition-${definition.type}`, access: { storefront: 'NONE' }, fieldDefinitions: [{ key: 'data', type: { name: 'json' } }] };
    state.definitions.set(definition.type, node);
    return Response.json({ data: { metaobjectDefinitionCreate: { metaobjectDefinition: node, userErrors: [] } } });
  }
  return Response.json({ data: { shop: { name: 'Fixture shop' } } });
};

test('Shopify auth, real schema rules and safe same-client diagnostics', async t => {
  await t.test('OAuth write scopes include corresponding read scopes', () => {
    assert.deepEqual(missingScopes(fullOAuthScopes.split(',')), []);
    assert.deepEqual(missingScopes(['write_metaobjects']), ['read_metaobject_definitions', 'write_metaobject_definitions']);
  });
  await t.test('token is cached by credential pair, respects OAuth lifetime and coalesces concurrent renewal', async () => {
    const { client } = setup();
    const values = await Promise.all(Array.from({ length: 20 }, () => client.accessToken()));
    assert.equal(new Set(values).size, 1); assert.equal(state.oauthCalls, 1);
    assert.equal(await client.accessToken(), values[0]);
    const status = client.tokenStatus(); assert.equal(new Date(status.expiresAt) - new Date(status.obtainedAt), 86399000);
    process.env.SHOPIFY_CLIENT_ID = 'second-inert-client'; process.env.SHOPIFY_CLIENT_SECRET = 'second-inert-secret';
    assert.notEqual(await client.accessToken(), values[0]); assert.equal(state.oauthCalls, 2);
  });
  await t.test('cached pre-upgrade scope token is renewed once and granted scopes are verified on the renewed token', async () => {
    const { client } = setup(); state.scopes = ['write_metaobjects', fullOAuthScopes];
    await client.accessToken(); await client.ensureAccessScopes(QUEUE_SCOPES);
    assert.equal(state.oauthCalls, 2); assert.equal(state.graphCalls[0].token, 'opaque-inert-token-2');
    assert.ok(state.graphCalls[0].query.includes('currentAppInstallation'));
  });
  await t.test('actual missing permissions after renewal are reported before any definition mutation', async () => {
    const { store } = setup(); state.scopes = ['write_metaobjects'];
    await assert.rejects(() => store.ensureJobSchema(), error => {
      assert.equal(error.name, 'ShopifyScopeError'); assert.deepEqual(error.missingScopes, ['read_metaobject_definitions', 'write_metaobject_definitions']); return true;
    });
    assert.equal(state.oauthCalls, 2); assert.ok(state.graphCalls.every(call => !call.query.includes('mutation')));
  });
  await t.test('401 refreshes and retries once, with a hard upper bound', async () => {
    let { client } = setup(); state.invalidFirst = true;
    assert.equal((await client.graphql('query { shop { name } }')).shop.name, 'Fixture shop');
    assert.equal(state.oauthCalls, 2); assert.equal(state.graphCalls.length, 2);
    ({ client } = setup()); state.alwaysInvalid = true;
    await assert.rejects(() => client.graphql('query { shop { name } }'), /Invalid access token/);
    assert.equal(state.oauthCalls, 2); assert.equal(state.graphCalls.length, 2);
  });
  await t.test('ACCESS_DENIED refresh is bounded and partially executed operations are never replayed', async () => {
    let { client } = setup(); state.denied = true;
    await assert.rejects(() => client.graphql('mutation { createOne { id } }'), /Access denied/);
    assert.equal(state.oauthCalls, 2); assert.equal(state.graphCalls.length, 2);
    ({ client } = setup()); state.partial = true;
    await assert.rejects(() => client.graphql('mutation { first:createOne { id } second:createTwo { id } }'), /Denied second/);
    assert.equal(state.oauthCalls, 1); assert.equal(state.graphCalls.length, 1);
  });
  await t.test('all three merchant-owned definitions omit access.admin and stay private', async () => {
    const { store } = setup(); await store.ensureJobSchema();
    const creates = state.graphCalls.filter(call => call.query.includes('metaobjectDefinitionCreate('));
    assert.equal(creates.length, 3);
    for (const call of creates) { assert.deepEqual(call.variables.definition.access, { storefront: 'NONE' }); assert.ok(!call.variables.definition.type.startsWith('$app:')); }
  });
  await t.test('definition validation/quota errors retain code, field and reason without being mislabeled as scopes', async () => {
    for (const code of ['ADMIN_ACCESS_INPUT_NOT_ALLOWED', 'MAX_DEFINITIONS_EXCEEDED', 'INVALID_TYPE']) {
      const { store } = setup(); state.definitionError = { code, field: ['definition','access','admin'], message: `Exact Shopify reason: ${code}` };
      await assert.rejects(() => store.ensureJobSchema(), error => {
        assert.equal(error.name, 'ShopifyDefinitionError'); assert.equal(error.details[0].code, code); assert.deepEqual(error.details[0].field, state.definitionError.field);
        assert.ok(error.message.includes(code)); assert.ok(!error.message.includes('Servono i permessi')); return true;
      });
      assert.equal(state.oauthCalls, 1);
    }
  });
  await t.test('diagnostics query the same cached import token, reveal no credential and never mutate Shopify', async () => {
    const { client, diagnostic } = setup(); const usedByImport = await client.accessToken();
    const report = await diagnostic.shopifyDiagnostics();
    assert.equal(report.app.clientIdMatchesTokenApp, true); assert.equal(report.app.expectedAppMatches, true);
    assert.deepEqual(report.missingScopes, []); assert.equal(report.installationApprovalNeededForQueue, false);
    assert.equal(report.readyForSchemaInitialization, true); assert.equal(report.schemaCreation.accessAdminSent, false);
    assert.ok(state.graphCalls.every(call => call.token === usedByImport && !call.query.includes('mutation')));
    const json = JSON.stringify(report);
    for (const secret of [usedByImport, process.env.SHOPIFY_CLIENT_ID, process.env.SHOPIFY_CLIENT_SECRET, process.env.SHOPIFY_ADMIN_ACCESS_TOKEN]) assert.ok(!json.includes(secret));
    assert.equal(state.oauthCalls, 1);
  });
  await t.test('authenticated diagnostic refresh compares scopes before and after renewal', async () => {
    const { diagnostic } = setup(); state.scopes = ['write_metaobjects', fullOAuthScopes];
    const report = await diagnostic.shopifyDiagnostics({ refresh: true });
    assert.equal(report.renewal.performed, true); assert.equal(report.renewal.grantedScopesChanged, true); assert.deepEqual(report.missingScopes, []);
    assert.equal(state.oauthCalls, 2);
  });
  await t.test('diagnostic route requires a session and uses private no-store responses', async () => {
    let { route } = setup(); unauthorized = Response.json({ ok: false }, { status: 401 });
    assert.equal((await route.GET(new NextRequest('http://localhost/api/poporama/test-shopify'))).status, 401); assert.equal(state.oauthCalls, 0);
    ({ route } = setup());
    const response = await route.GET(new NextRequest('http://localhost/api/poporama/test-shopify?refresh=1'));
    assert.equal(response.status, 200); assert.match(response.headers.get('Cache-Control'), /private, no-store/);
    assert.equal((await response.json()).app.clientIdMatchesTokenApp, true);
  });
  await t.test('OAuth failure and detailed Shopify errors never include secrets', async () => {
    const { client } = setup(); state.oauthError = true;
    await assert.rejects(() => client.accessToken(), error => error.message.includes('invalid_client') && !error.message.includes(process.env.SHOPIFY_CLIENT_SECRET));
    assert.equal(safeShopifyText(`code ${process.env.SHOPIFY_CLIENT_SECRET}, ${process.env.SHOPIFY_CLIENT_ID}, shpat_inert_message_token`), 'code [redacted], [redacted], [redacted]');
  });
  global.fetch = originalFetch;
});
