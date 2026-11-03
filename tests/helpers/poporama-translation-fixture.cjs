// Offline-only fixture used by the real-browser translation/import test.
if (process.env.POPORAMA_UI_FIXTURE !== '1' || process.env.SHOPIFY_SHOP !== 'poporama-ui-fixture') throw new Error('Unsafe fixture environment');
const assert = require('node:assert/strict');
const JOB_TYPE = 'poporama_import_job';
let sequence = 1, providerCalls = 0, providerTexts = 0, providerStatus = 200, failJobWrites = 0, stockPages = 0, stealLease = false;
const nodes = new Map(), definitions = new Map();
const key = (type, handle) => `${type}:${handle}`;
const clone = o => JSON.parse(JSON.stringify(o));
function create(type, handle, fields) {
  const node = { id: `gid://shopify/Metaobject/${sequence++}`, handle, type, fields, updatedAt: new Date().toISOString() };
  nodes.set(key(type, handle), node); return node;
}
create('poporama_lotto', 'load-test', [{ key: 'percentuale_grado_n', value: '50' }]);
const realFetch = global.fetch;
global.fetch = async (input, options = {}) => {
  const url = String(input);
  if (/^https:\/\/api(?:-free)?\.deepl\.com\//.test(url)) {
    providerCalls++; const body = JSON.parse(options.body); providerTexts += body.text.length;
    assert.ok(body.text.length <= 20); assert.ok(Buffer.byteLength(options.body) < 128 * 1024); assert.equal(body.target_lang, 'IT');
    if (providerStatus !== 200) return Response.json({}, { status: providerStatus, headers: { 'Retry-After': '0' } });
    return Response.json({ translations: body.text.map(text => ({ text: text.replace('Wireless Headphones', 'Cuffie wireless').replace('Cordless Drill', 'Trapano a batteria') })) });
  }
  if (!url.includes(".myshopify.com/")) return realFetch(input, options);
  assert.match(url, /^https:\/\/poporama-ui-fixture\.myshopify\.com\//);
  if (url.includes('/oauth/')) return Response.json({ access_token: 'fixture', expires_in: 3600 });
  const { query, variables: v = {} } = JSON.parse(options.body);
  let data;
  if (query.includes('metaobjectDefinitionByType')) data = { metaobjectDefinitionByType: definitions.get(v.type) || null };
  else if (query.includes('metaobjectDefinitionCreate(')) {
    if (!v.definition.type.startsWith('$app:') && Object.hasOwn(v.definition.access || {}, 'admin')) return Response.json({data:{metaobjectDefinitionCreate:{metaobjectDefinition:null,userErrors:[{code:'ADMIN_ACCESS_INPUT_NOT_ALLOWED',field:['definition','access','admin'],message:'Admin access can only be specified on metaobject definitions that have an app-reserved type.'}]}}});
    definitions.set(v.definition.type, { id: `definition-${v.definition.type}`, access: { storefront: "NONE" }, fieldDefinitions: [{ key: 'data', type: { name: 'json' } }] });
    data = { metaobjectDefinitionCreate: { metaobjectDefinition: definitions.get(v.definition.type), userErrors: [] } };
  } else if (query.includes('metaobjectUpsert(')) {
    const type = v.handle.type, handle = v.handle.handle;
    if (type === JOB_TYPE && handle.startsWith('job-') && JSON.parse(v.metaobject.fields[0].value).position > 0 && failJobWrites > 0) { failJobWrites--; return Response.json({}, { status: 503 }); }
    let node = nodes.get(key(type, handle));
    if (!node) node = create(type, handle, v.metaobject.fields); else node.fields = v.metaobject.fields;
    data = { metaobjectUpsert: { metaobject: clone(node), userErrors: [] } };
  } else if (query.includes('metaobjectDelete(')) {
    const entry = [...nodes.entries()].find(([, n]) => n.id === v.id); if (entry) nodes.delete(entry[0]);
    data = { metaobjectDelete: { deletedId: v.id, userErrors: [] } };
  } else if (query.includes('metaobjectCreate(')) {
    const input = v.metaobject;
    if (nodes.has(key(input.type, input.handle))) data = { metaobjectCreate: { metaobject: null, userErrors: [{ code: 'TAKEN', message: 'Handle already exists' }] } };
    else data = { metaobjectCreate: { metaobject: clone(create(input.type, input.handle, input.fields)), userErrors: [] } };
  } else if (query.includes('metaobjectUpdate(')) {
    const node = [...nodes.values()].find(n => n.id === v.id); assert.ok(node);
    for (const f of v.metaobject.fields) { const old = node.fields.find(o => o.key === f.key); if (old) old.value = f.value; else node.fields.push(f); }
    data = { metaobjectUpdate: { metaobject: clone(node), userErrors: [] } };
  } else if (/n\d+: metaobjectByHandle/.test(query)) {
    data = {}; for (const m of query.matchAll(/n(\d+): metaobjectByHandle\(handle: \{type: ("[^"]+"), handle: ("[^"]+")\}/g)) data[`n${m[1]}`] = clone(nodes.get(key(JSON.parse(m[2]), JSON.parse(m[3]))) || null);
  } else if (query.includes('metaobjectByHandle(')) {
    const handle = typeof v.handle === 'string' ? { type: 'poporama_articolo', handle: v.handle } : v.handle;
    data = { metaobjectByHandle: clone(nodes.get(key(handle.type, handle.handle)) || null) };
  } else if (query.includes('metaobject(id:')) data = { metaobject: clone([...nodes.values()].find(n => n.id === v.id) || null) };
  else if (query.includes('metaobjects(')) {
    const type = v.type || (query.includes('poporama_lotto') ? 'poporama_lotto' : 'poporama_articolo');
    if (type === 'poporama_articolo') stockPages++;
    let list = [...nodes.values()].filter(n => n.type === type);
    if (v.query?.includes('handle:job-')) list = list.filter(n => n.handle.startsWith('job-'));
    const start = v.after ? Number(v.after) : 0, first = v.first || 250;
    let slice = list.slice(start, start + first); const more = start + first < list.length;
    if (type === 'poporama_lotto' && !v.type) slice = slice.map(node => ({ ...node,
      codiceLotto: { value: 'Load test' }, percentualeNuovo: { value: '60' }, percentualeGradoA: { value: '55' }, percentualeGradoB: { value: '45' }, percentualeGradoC: { value: '35' }, percentualeGradoN: { value: '50' }
    }));
    data = { metaobjects: { nodes: clone(slice), edges: slice.map(node => ({ node: clone(node), cursor: String(start + first) })), pageInfo: { hasNextPage: more, endCursor: more ? String(start + first) : null } } };
  } else throw new Error('Unhandled fixture query: ' + query.slice(0, 120));
  return Response.json({ data });
};

const lot = [...nodes.values()].find(n => n.type === 'poporama_lotto');
lot.fields.push(...Object.entries({percentuale_nuovo:'60',percentuale_grado_a:'55',percentuale_grado_b:'45',percentuale_grado_c:'35'}).map(([key,value])=>({key,value})));
const money = n => JSON.stringify({ amount: n.toFixed(2), currency_code: 'EUR' });
create('poporama_articolo', 'pp-000001', Object.entries({ codice_pp: 'PP-000001', lotto: lot.id, nome_prodotto: 'Prodotto storico prova interfaccia', grado: 'A', stato_vendita: 'DISPONIBILE', retail: money(400), costo_manifest: money(100), prezzo_poporama: money(220), percentuale_prezzo: '55', condizione_originale: 'Customer Damage', data_test: '2025-01-01T12:00:00', risultati_test: '{}' }).map(([key,value]) => ({key,value})));
