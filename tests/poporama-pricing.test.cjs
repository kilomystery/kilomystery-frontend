const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
// Load repository TypeScript without adding a test dependency. No live Shopify calls.
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename);
let unauthorized = null;
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === '@/app/lib/poporama-auth') return { requirePoporamaSession: async () => unauthorized };
  if (request.startsWith('@/')) request = path.join(root, request.slice(2));
  return originalLoad.call(this, request, parent, isMain);
};
const { resolvePrice, moneyOrNull, parseManifestMoney, readPricing, pricingInfo, testDocument, simulateRevenue } = require('../app/lib/poporama-pricing.ts');
const { calculateTestPrice } = require('../app/lib/poporama-test-pricing.ts');
const route = require('../app/api/poporama/articoli/[code]/test/route.ts');
const articlesRoute = require('../app/api/poporama/articoli/route.ts');
const money = amount => JSON.stringify({ amount: String(amount), currency_code: 'EUR' });
const field = (node, key) => node.fields.find(f => f.key === key)?.value ?? '';
let nodes, mutations;
function fixture() {
  mutations = [];
  nodes = [1, 2].map(n => ({ id: `gid://shopify/Metaobject/${n}`, type: 'poporama_articolo', handle: `pp-00000${n}`, updatedAt: '2026-11-03T08:00:00Z', fields: Object.entries({
    codice_pp: `PP-00000${n}`, nome_prodotto: 'Prodotto', asin: 'STESSO-ASIN', lotto: 'lot-1', grado: 'N', stato_vendita: 'DISPONIBILE',
    retail: money('399.99'), costo_manifest: money('100.01'), prezzo_poporama: money('50.01'), percentuale_prezzo: '50',
    condizione_originale: 'Customer Damage', numero_seriale: `SER-${n}`, note_test: 'Conserva questa nota',
    risultati_test: JSON.stringify({ tests: [{ id: 'power', result: 'OK' }], extra: 'preservare', _poporamaPricing: { version: 1, manual: null, rule: null, valid: true } }),
  }).map(([key, value]) => ({ key, value })) }));
}
function setField(node, key, value) {
  const existing = node.fields.find(f => f.key === key);
  if (existing) existing.value = value; else node.fields.push({ key, value });
}
function request(body) { return new Request('http://localhost/api/poporama/articoli/PP-000001/test', { method: 'PATCH', body: JSON.stringify(body) }); }
async function patch(body, code = 'PP-000001') {
  const response = await route.PATCH(request(body), { params: { code } });
  return { status: response.status, ...await response.json() };
}
const originalFetch = global.fetch;
process.env.SHOPIFY_SHOP = 'offline-test'; process.env.SHOPIFY_CLIENT_ID = 'test'; process.env.SHOPIFY_CLIENT_SECRET = 'test';
global.fetch = async (url, options) => {
  assert.match(String(url), /^https:\/\/offline-test\.myshopify\.com\//);
  if (String(url).includes('/oauth/')) return Response.json({ access_token: 'fake-offline-token' });
  const { query, variables = {} } = JSON.parse(options.body);
  if (query.includes('metaobjectUpdate(')) {
    const node = nodes.find(n => n.id === variables.id); assert.ok(node);
    mutations.push(variables);
    for (const f of variables.metaobject.fields) setField(node, f.key, f.value);
    node.updatedAt = `2026-11-03T08:00:${String(mutations.length).padStart(2, '0')}Z`;
    return Response.json({ data: { metaobjectUpdate: { metaobject: node, userErrors: [] } } });
  }
  if (query.includes('metaobjectCreate(')) {
    mutations.push(variables);
    const node = { ...variables.metaobject, id: `created-${mutations.length}`, updatedAt: '2026-11-03T08:00:01Z' };
    nodes.push(node);
    return Response.json({ data: { metaobjectCreate: { metaobject: node, userErrors: [] } } });
  }
  if (query.includes('metaobjectByHandle(')) return Response.json({ data: { metaobjectByHandle: nodes.find(n => n.handle === variables.handle) ?? null } });
  if (query.includes('metaobjects(')) return Response.json({ data: { metaobjects: { edges: nodes.map(node => ({ node, cursor: node.id })), pageInfo: { hasNextPage: false, endCursor: null } } } });
  if (query.includes('metaobject(id:')) return Response.json({ data: { metaobject: { id: 'lot-1', type: 'poporama_lotto', fields: Object.entries({ percentuale_nuovo: '60', percentuale_grado_a: '55', percentuale_grado_b: '45', percentuale_grado_c: '35', percentuale_grado_n: '50' }).map(([key, value]) => ({ key, value })) } } });
  throw new Error('Unexpected Shopify query in offline test');
};

test('POPORAMA pricing and persistence regressions (offline)', async t => {
  await t.test('half-up cents, comma input, manual priority and grade defaults', () => {
    assert.equal(moneyOrNull('149,90'), 149.9);
    for (const raw of ['€ 1.234,56', '$1,234.56', '1234.56', '1234,56']) assert.equal(parseManifestMoney(raw), 1234.56);
    for (const raw of ['', 'N/A', '-20']) assert.equal(parseManifestMoney(raw), null);
    for (const invalid of ['', null, '-1', 'NaN', '10.001', {}, 'Infinity']) assert.equal(moneyOrNull(invalid), null);
    assert.equal(calculateTestPrice(100.01, 50), 50.01);
    assert.equal(calculateTestPrice(0.01, 50), 0.01);
    assert.equal(calculateTestPrice(149.9, 33.33), 49.96);
    const data = { manual: null, grade: 'N', cogs: '100.01', retail: '399.99' };
    assert.equal(resolvePrice(data).price, 50.01);
    assert.equal(resolvePrice({ ...data, manual: 149.9, rule: { base: 'RETAIL', percentage: 10 } }).price, 149.9);
    assert.equal(resolvePrice({ ...data, rule: { base: 'RETAIL', percentage: 40 } }).price, 160);
    assert.equal(resolvePrice({ ...data, cogs: null }).valid, false);
    assert.equal(resolvePrice({ ...data, cogs: 0 }).price, 0);
    assert.equal(resolvePrice({ ...data, grade: 'A', percentage: 55 }).price, 219.99);
  });
  await t.test('revenue simulation excludes missing prices, separates purchase costs and VAT', () => {
    assert.deepEqual(simulateRevenue([122, 122, null], 22, 100), { quantity: 3, gross: 244, net: 200, margin: 100, missing: 1 });
    assert.equal(simulateRevenue([0.03], 20, 0).net, 0.03); // 2.5 cents => 3
    assert.equal(simulateRevenue([149.9], 22, null).margin, null);
  });
  await t.test('manual price survives rules and does not alter Retail, COGS, Amazon condition or duplicate ASIN', async () => {
    fixture();
    let result = await patch({ pricingOnly: true, prezzoManuale: '149,90' });
    assert.equal(result.status, 200); assert.equal(result.articolo.prezzoPoporama, 149.9);
    assert.equal(result.articolo.prezzoManuale, 149.9);
    result = await patch({ pricingOnly: true, regolaPrezzo: { base: 'COGS', percentage: 30 } });
    assert.equal(result.skipped, true); assert.equal(mutations.length, 1);
    assert.equal(field(nodes[0], 'retail'), money('399.99'));
    assert.equal(field(nodes[0], 'costo_manifest'), money('100.01'));
    assert.equal(field(nodes[0], 'condizione_originale'), 'Customer Damage');
    assert.equal(field(nodes[1], 'prezzo_poporama'), money('50.01'));
  });
  await t.test('clear manual returns to persisted product rule; explicit overwrite persists', async () => {
    fixture();
    await patch({ pricingOnly: true, regolaPrezzo: { base: 'RETAIL', percentage: 40 } });
    await patch({ pricingOnly: true, prezzoManuale: '149.90' });
    let result = await patch({ pricingOnly: true, prezzoManuale: null });
    assert.equal(result.articolo.prezzoPoporama, 160);
    await patch({ pricingOnly: true, prezzoManuale: 149.9 });
    result = await patch({ pricingOnly: true, regolaPrezzo: { base: 'COGS', percentage: 60 }, sovrascriviManuale: true });
    assert.equal(result.articolo.prezzoPoporama, 60.01);
    assert.equal(result.articolo.prezzoManuale, null);
    assert.deepEqual(result.articolo.regolaPrezzo, { base: 'COGS', percentage: 60 });
  });
  await t.test('missing COGS flagged; pricing-only retains all technical test data', async () => {
    fixture(); setField(nodes[0], 'costo_manifest', '');
    const oldTests = testDocument(field(nodes[0], 'risultati_test'));
    const result = await patch({ pricingOnly: true, regolaPrezzo: { base: 'COGS', percentage: 50 } });
    assert.equal(result.articolo.prezzoValido, false); assert.equal(result.articolo.cogsDisponibile, false);
    const saved = testDocument(field(nodes[0], 'risultati_test'));
    assert.deepEqual(saved.tests, oldTests.tests); assert.equal(saved.extra, oldTests.extra);
    assert.equal(field(nodes[0], 'numero_seriale'), 'SER-1'); assert.equal(field(nodes[0], 'note_test'), 'Conserva questa nota');
    assert.equal(mutations[0].metaobject.fields.length, 2);
    assert.equal(field(nodes[0], "prezzo_poporama"), money("50.01")); // retained, marked invalid
  });
  await t.test('normal test save merges metadata and keeps manual price', async () => {
    fixture(); await patch({ pricingOnly: true, prezzoManuale: 149.9 });
    const result = await patch({ grado: 'A', percentualePrezzo: 55, risultatiTest: { tests: [{ id: 'power', result: 'OK' }] }, dataTest: '2026-11-03' });
    assert.equal(result.status, 200); assert.equal(result.articolo.prezzoPoporama, 149.9);
    assert.equal(result.articolo.risultatiTest.extra, 'preservare');
    assert.equal(readPricing(field(nodes[0], 'risultati_test')).manual, 149.9);
  });
  await t.test('invalid prices, stale previews, sold and unauthenticated changes rejected', async () => {
    fixture();
    assert.equal((await patch({ pricingOnly: true, prezzoManuale: '12,999' })).status, 400);
    assert.equal((await patch({ pricingOnly: true, regolaPrezzo: { base: 'COGS', percentage: 101 } })).status, 400);
    assert.equal((await patch({ pricingOnly: true, expectedUpdatedAt: 'old' })).status, 409);
    setField(nodes[0], 'stato_vendita', 'VENDUTO');
    assert.equal((await patch({ pricingOnly: true, prezzoManuale: 20 })).status, 409);
    unauthorized = Response.json({ ok: false }, { status: 401 });
    assert.equal((await patch({ pricingOnly: true, prezzoManuale: 20 })).status, 401);
    unauthorized = null; assert.equal(mutations.length, 0);
  });
  await t.test('historical price protected until explicit reset without changing legacy rows', async () => {
    fixture(); setField(nodes[0], 'risultati_test', JSON.stringify({ tests: ['legacy'] }));
    assert.equal(pricingInfo(nodes[0].fields).prezzoManuale, 50.01);
    let result = await patch({ pricingOnly: true, regolaPrezzo: { base: 'COGS', percentage: 30 } });
    assert.equal(result.skipped, true); assert.equal(mutations.length, 0);
    result = await patch({ pricingOnly: true, prezzoManuale: null });
    assert.equal(result.articolo.prezzoPoporama, 50.01); assert.equal(result.articolo.prezzoLegacy, false);
  });
  await t.test('manifest import calculates N from COGS, preserves Retail and stores missing COGS distinctly', async () => {
    fixture();
    for (const cogs of [100.01, null]) {
      const response = await articlesRoute.POST(new Request('http://localhost/api/poporama/articoli', { method: 'POST', body: JSON.stringify({ lottoId: 'lot-1', nomeProdotto: 'Manifest', asin: 'STESSO-ASIN', retail: 399.99, costoManifest: cogs, condizioneOriginale: 'Defective', grado: 'N' }) }));
      const result = await response.json(); assert.equal(response.status, 200, JSON.stringify(result));
      const created = nodes[nodes.length - 1];
      assert.equal(field(created, 'retail'), money('399.99'));
      assert.equal(field(created, 'condizione_originale'), 'Defective');
      assert.equal(pricingInfo(created.fields).prezzoValido, cogs !== null);
      assert.equal(pricingInfo(created.fields).cogsDisponibile, cogs !== null);
      if (cogs !== null) assert.equal(JSON.parse(field(created, 'prezzo_poporama')).amount, '50.01');
    }
    const response = await articlesRoute.GET(new Request('http://localhost/api/poporama/articoli?details=1'));
    const result = await response.json(); assert.equal(result.articoli.length, 4);
    assert.equal(new Set(result.articoli.map(a => a.codicePP)).size, 4);
  });
  await t.test('checkout rejects an unresolved price before any sale write', async () => {
    fixture(); setField(nodes[0], 'costo_manifest', '');
    await patch({ pricingOnly: true, regolaPrezzo: { base: 'COGS', percentage: 50 } });
    const count = mutations.length;
    const cassa = require('../app/api/poporama/cassa/route.ts');
    const response = await cassa.POST(new Request('http://localhost/api/poporama/cassa', {
      method: 'POST', body: JSON.stringify({ action: 'sell', code: 'PP-000001', prezzoVendita: 0 }),
    }));
    const result = await response.json();
    assert.equal(response.status, 409); assert.match(result.error, /prezzo da verificare/);
    assert.equal(mutations.length, count);
    assert.equal(field(nodes[0], 'stato_vendita'), 'DISPONIBILE');
  });
  await t.test('A6 multipage PDF retains identifiers and euro, never draws internal Amazon conditions', async () => {
    const { PDFDocument, PDFPage } = require('pdf-lib');
    const originalDraw = PDFPage.prototype.drawText;
    const drawn = []; let downloaded;
    PDFPage.prototype.drawText = function(value, options) { drawn.push({ value, y: options.y }); return originalDraw.call(this, value, options); };
    global.window = { location: { origin: 'http://localhost', pathname: '/it/poporama-test/listino' }, atob: v => Buffer.from(v, 'base64').toString('binary') };
    global.document = { createElement: () => ({ click() {} }), body: { appendChild() {}, removeChild() {} } };
    const originalCreate = URL.createObjectURL; const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = blob => { downloaded = blob; return 'blob:test'; }; URL.revokeObjectURL = () => {};
    try {
      const { downloadPoporamaLabelsPdf } = require('../app/components/PoporamaLabelPdf.ts');
      const label = { code: 'PP-000001', brand: '', model: 'Prodotto', productType: 'Elettronica', referencePrice: '399.99', poporamaPrice: '149.90', grade: 'N', testDate: '03/11/2026', originCondition: 'Customer Damage' };
      await downloadPoporamaLabelsPdf([label, { ...label, code: 'PP-000002', originCondition: 'Defective', priceValid: false }, { ...label, code: 'PP-000003', grade: 'C', serial: 'SER-3', defects: 'Difetto dichiarato '.repeat(15) }]);
      const doc = await PDFDocument.load(await downloaded.arrayBuffer()); assert.equal(doc.getPageCount(), 3);
      assert.ok(Math.abs(doc.getPage(0).getWidth() - 105 * 72 / 25.4) < 0.01);
      const text = drawn.map(d => d.value).join('\n');
      for (const expected of ['Prezzo uscita Amazon', 'Prezzo Poporama', 'PP-000001', 'PP-000002', 'Non testato', '149,90', '399,99', '€', 'da verificare']) assert.ok(text.includes(expected), expected);
      for (const forbidden of ['Customer Damage', 'Defective', 'Condizione:', 'PREZZO DI RIFERIMENTO']) assert.ok(!text.includes(forbidden), forbidden);
      assert.ok(drawn.every(d => d.y >= 0));
      assert.ok(drawn.filter(d => d.value.startsWith("Seriale:")).every(d => d.y >= 17));
    } finally { PDFPage.prototype.drawText = originalDraw; URL.createObjectURL = originalCreate; URL.revokeObjectURL = originalRevoke; delete global.window; delete global.document; }
  });
  global.fetch = originalFetch;
});
