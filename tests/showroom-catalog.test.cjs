const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const originalLoad = Module._load;
Module._load = function(name, parent, main) {
  if (name === 'server-only') return {};
  if (name.startsWith('@/')) name = path.join(root, name.slice(2));
  return originalLoad.call(this, name, parent, main);
};
const { GET } = require('../app/api/showroom/catalog/route.ts');
const { SHOPIFY_VARIANTS } = require('../app/config/shopifyProducts.ts');
const originalFetch = global.fetch;

test('Showroom live-catalog boundary: real IDs, availability, currency and safe failures', async t => {
  process.env.SHOPIFY_STORE_DOMAIN = 'showroom-fixture.myshopify.com';
  process.env.SHOPIFY_STOREFRONT_TOKEN = 'private-fixture-token';
  let mode = 'normal'; let calls = 0;
  global.fetch = async (url, options) => {
    calls++;
    assert.match(url, /^https:\/\/showroom-fixture\.myshopify\.com\/api\//);
    assert.equal(options.method, 'POST');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.headers['X-Shopify-Storefront-Access-Token'], 'private-fixture-token');
    const { query, variables } = JSON.parse(options.body);
    assert.ok(!query.includes('mutation'));
    assert.match(query, /availableForSale/);
    assert.deepEqual(variables.ids, Object.values(SHOPIFY_VARIANTS).flatMap(v => Object.values(v)).map(id => `gid://shopify/ProductVariant/${id}`));
    if (mode === 'network') throw new Error('Secret private-fixture-token must never leak');
    if (mode === 'graphql') return Response.json({ data: { nodes: [] }, errors: [{ message: 'private-fixture-token' }] });
    if (mode === 'http') return Response.json({}, { status: 401 });
    return Response.json({ data: { nodes: variables.ids.map((id, i) => i === 2 ? null : ({ id, availableForSale: i !== 1, price: { amount: i === 3 ? 'invalid' : '31.73', currencyCode: i === 4 ? 'USD' : 'EUR' }, product: { title: 'Real catalog title', description: 'Real description' } })) } });
  };
  try {
    await t.test('Only published valid EUR variants are exposed, including sold-out state and live prices', async () => {
      const response = await GET(); assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.variants.length, 7);
      assert.equal(body.variants[0].price, 31.73);
      assert.equal(body.variants[0].id, SHOPIFY_VARIANTS.standard[1]);
      assert.equal(body.variants[0].title, 'Real catalog title');
      assert.equal(body.variants[1].available, false);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.ok(!JSON.stringify(body).includes('private-fixture-token'));
    });
    for (const failure of ['network', 'graphql', 'http']) await t.test(`${failure} failure returns 503 without secrets or static prices`, async () => {
      mode = failure; const response = await GET(); assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { error: 'Catalog unavailable' });
    });
    await t.test('Missing credentials fail closed without an external request', async () => {
      delete process.env.SHOPIFY_STOREFRONT_TOKEN; const before = calls;
      assert.equal((await GET()).status, 503); assert.equal(calls, before);
    });
  } finally { global.fetch = originalFetch; }
});
