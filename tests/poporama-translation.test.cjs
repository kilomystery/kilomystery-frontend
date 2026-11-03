const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const XLSX = require('xlsx');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename);
const originalLoad = Module._load;
Module._load = function(name, parent, main) {
  if (name === '@/app/lib/poporama-auth') return { requirePoporamaSession: async () => null };
  if (name.startsWith('@/')) name = path.join(root, name.slice(2));
  return originalLoad.call(this, name, parent, main);
};
process.env.SHOPIFY_SHOP = 'translation-fixture'; process.env.SHOPIFY_CLIENT_ID = 'fixture'; process.env.SHOPIFY_CLIENT_SECRET = 'fixture'; process.env.POPORAMA_SESSION_SECRET = 'translation-fixture-secret-32-characters'; process.env.POPORAMA_ACCESS_PIN = 'fixture'; process.env.DEEPL_API_KEY = 'fixture';
const { parseManifest } = require('../app/lib/poporama-manifest.ts');
const { titleInfo, needsTranslation, withTitle } = require('../app/lib/poporama-titles.ts');
const { protectTitle, validateTranslation, translateCached, titleKey } = require('../app/lib/poporama-translation.ts');
const { createJob, uploadChunk, advanceJob } = require('../app/lib/poporama-import-jobs.ts');
const { JOB_TYPE, CACHE_TYPE, CHUNK_TYPE, read } = require('../app/lib/poporama-job-store.ts');
const { field } = require('../app/lib/poporama-shopify.ts');
const articleRoute = require('../app/api/poporama/articoli/route.ts');
const manualTitleRoute = require('../app/api/poporama/articoli/[code]/titolo/route.ts');
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
  if (url.startsWith('https://api.deepl.com/')) {
    providerCalls++; const body = JSON.parse(options.body); providerTexts += body.text.length;
    assert.ok(body.text.length <= 20); assert.ok(Buffer.byteLength(options.body) < 128 * 1024); assert.equal(body.target_lang, 'IT');
    if (providerStatus !== 200) return Response.json({}, { status: providerStatus, headers: { 'Retry-After': '0' } });
    return Response.json({ translations: body.text.map(text => ({ text: text.replace('Wireless Headphones', 'Cuffie wireless').replace('Cordless Drill', 'Trapano a batteria') })) });
  }
  assert.match(url, /^https:\/\/translation-fixture\.myshopify\.com\//);
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
    const type = v.type || 'poporama_articolo';
    if (type === 'poporama_articolo') stockPages++;
    let list = [...nodes.values()].filter(n => n.type === type);
    if (v.query?.includes('handle:job-')) list = list.filter(n => n.handle.startsWith('job-'));
    const start = v.after ? Number(v.after) : 0, first = v.first || 250;
    const slice = list.slice(start, start + first), more = start + first < list.length;
    data = { metaobjects: { nodes: clone(slice), edges: slice.map(node => ({ node: clone(node), cursor: String(start + first) })), pageInfo: { hasNextPage: more, endCursor: more ? String(start + first) : null } } };
  } else throw new Error('Unhandled fixture query: ' + query.slice(0, 120));
  return Response.json({ data });
};
const row = i => ({ nomeProdotto: `Sony Wireless Headphones WH-1000XM5 32 GB SKU-${i % 100}`, retail: 400, costoManifest: 100, asin: 'SAME-ASIN', ean: `000${i}`, upc: '', fnsku: '', lpn: `LPN-LONG-FULL-${i}-1234567890`, palletId: '', condizioneOriginale: 'Customer Damage', categoria: '', sottocategoria: '' });
async function finish(handle, max = 2000) {
  for (let i = 0; i < max; i++) { const job = await advanceJob(handle); if (job?.phase === 'completed') return job; assert.notEqual(job?.phase, 'failed', job?.error); }
  throw new Error('Job did not complete');
}
test('automatic manifest translation and durable large imports', async t => {
  await t.test('CSV, XLS and XLSX preserve row counts, identifiers, Retail and distinct COGS', () => {
    const csv = 'Item Desc;ASIN;EAN;LPN;Retail;COGS\r\n"Sony Wireless Headphones WH-1000XM5 32 GB";DUP;000012345;LPN123456789012345678;399,99;100,01\r\n"Sony Wireless Headphones WH-1000XM5 32 GB";DUP;000012346;LPN2;399,99;\r\n';
    const rows = parseManifest(Buffer.from(csv), 'manifest.csv');
    assert.equal(rows.length, 2); assert.equal(rows[0].ean, '000012345'); assert.equal(rows[0].retail, 399.99); assert.equal(rows[0].costoManifest, 100.01); assert.equal(rows[1].costoManifest, null);
    for (const bookType of ['xls', 'xlsx']) {
      const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet([{ 'Item Desc': row(0).nomeProdotto, Retail: 400, COST: 100, EAN: '0000123' }]), 'Amazon');
      const parsed = parseManifest(XLSX.write(book, { type: 'buffer', bookType }), `manifest.${bookType}`);
      assert.equal(parsed.length, 1); assert.equal(parsed[0].ean, '0000123'); assert.equal(parsed[0].costoManifest, 100);
    }
  });
  await t.test('large CSV and Excel parse all 5000 rows without dropping duplicate titles or leading zeros', () => {
    const records = Array.from({length:5000},(_,i)=>({'Item Desc':row(i).nomeProdotto, Retail:400, COGS:100, EAN:`000${i}`, LPN:row(i).lpn}));
    const csv = ['Item Desc;Retail;COGS;EAN;LPN', ...records.map(r=>[r['Item Desc'],r.Retail,r.COGS,r.EAN,r.LPN].join(';'))].join('\n');
    assert.equal(parseManifest(Buffer.from(csv),'large.csv').length,5000);
    const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(records),'Amazon');
    const parsed=parseManifest(XLSX.write(book,{type:'buffer',bookType:'xlsx'}),'large.xlsx');
    assert.equal(parsed.length,5000);assert.equal(parsed[4999].ean,'0004999');assert.equal(parsed[4999].lpn,row(4999).lpn);
  });
  await t.test('natural title translation protects model/brand/technical data and rejects changed numbers', () => {
    const original = 'Sony Wireless Headphones WH-1000XM5 32 GB';
    const marked = protectTitle(original); assert.ok(marked.includes('<keep>Sony</keep>')); assert.ok(marked.includes('<keep>WH-1000XM5</keep>')); assert.ok(marked.includes('<keep>32 GB</keep>'));
    assert.equal(validateTranslation(original, marked.replace('Wireless Headphones', 'Cuffie wireless')), 'Sony Cuffie wireless WH-1000XM5 32 GB');
    assert.throws(() => validateTranslation(original, marked.replace('32 GB', '64 GB')), /alterat/);
    assert.throws(() => validateTranslation(original, marked.replace('Sony', 'MARCHIO')), /alterat/);
  });
  await t.test('schema setup refuses an existing public type without altering products or definitions', async () => {
    definitions.set(JOB_TYPE,{id:'public-definition',access:{storefront:'PUBLIC_READ'},fieldDefinitions:[{key:'data',type:{name:'json'}}]});
    const count=nodes.size;
    await assert.rejects(()=>createJob({kind:'import',lottoHandle:'load-test',total:1,digest:'f'.repeat(64)}),/non privato/);
    assert.equal(nodes.size,count);assert.equal(definitions.get(JOB_TYPE).access.storefront,'PUBLIC_READ');
    definitions.delete(JOB_TYPE);
  });
  await t.test('5000 rows import automatically in bounded blocks with persistent cache and distinct PP for identical ASIN', async () => {
    const job = await createJob({ kind: 'import', lottoHandle: 'load-test', total: 5000, digest: 'a'.repeat(64), fileName: 'large.csv' });
    for (let i = 0; i < 50; i++) await uploadChunk(job.handle, i, Array.from({ length: 100 }, (_, j) => row(i * 100 + j)));
    const before = providerTexts, pageCount = stockPages;
    const result = await finish(job.handle);
    assert.equal(result.imported, 5000); assert.equal(result.translated, 5000); assert.equal(result.untranslated, 0);
    assert.equal(providerTexts - before, 100); assert.ok(stockPages - pageCount <= 2, 'must not scan all stock per article');
    const products = [...nodes.values()].filter(n => n.type === 'poporama_articolo');
    assert.equal(products.length, 5000); assert.equal(new Set(products.map(n => field(n, 'codice_pp'))).size, 5000);
    for (const product of products) {
      assert.ok(titleInfo(product.fields).nomeProdotto.includes('Cuffie wireless')); assert.ok(field(product, 'nome_prodotto').includes('Wireless Headphones'));
      assert.equal(JSON.parse(field(product, 'retail')).amount, '400.00'); assert.equal(JSON.parse(field(product, 'costo_manifest')).amount, '100.00');
      assert.equal(field(product, 'condizione_originale'), 'Customer Damage');
    }
    const duplicate = await createJob({ kind: 'import', lottoHandle: 'load-test', total: 5000, digest: 'a'.repeat(64) });
    assert.equal(duplicate.handle, job.handle); assert.equal(duplicate.phase, 'completed');
  });
  await t.test('checkpoint failure after product creation resumes without duplicate or lost products', async () => {
    const job = await createJob({ kind: 'import', lottoHandle: 'load-test', total: 2, digest: 'b'.repeat(64) });
    await uploadChunk(job.handle, 0, [row(8000), row(8001)]);
    while ((await read(JOB_TYPE, job.handle)).phase === 'allocating') await advanceJob(job.handle);
    const countBefore = [...nodes.values()].filter(n => n.type === 'poporama_articolo').length;
    failJobWrites = 2;
    await assert.rejects(() => advanceJob(job.handle));
    assert.equal([...nodes.values()].filter(n => n.type === 'poporama_articolo').length, countBefore + 1);
    const done = await finish(job.handle);
    assert.equal(done.imported, 2); assert.equal([...nodes.values()].filter(n => n.type === 'poporama_articolo').length, countBefore + 2);
  });
  await t.test('provider quota failure retains original and import completes; missing command retries and protects manual corrections', async () => {
    providerStatus = 456;
    const job = await createJob({ kind: 'import', lottoHandle: 'load-test', total: 2, digest: 'c'.repeat(64) });
    const custom = { ...row(9900), nomeProdotto: 'Bosch Cordless Drill GSR12V 12 V' };
    await uploadChunk(job.handle, 0, [custom, custom]);
    const completed = await finish(job.handle); assert.equal(completed.imported, 2); assert.equal(completed.untranslated, 2);
    const missing = [...nodes.values()].filter(n => n.type === 'poporama_articolo' && needsTranslation(n.fields)); assert.equal(missing.length, 2);
    const first = missing[0];
    const response = await manualTitleRoute.PATCH(new Request('http://localhost', { method: 'PATCH', body: JSON.stringify({ nomeItaliano: 'Bosch Trapano corretto manualmente GSR12V 12 V' }) }), { params: { code: field(first, 'codice_pp') } });
    assert.equal(response.status, 200);
    const manual = titleInfo(first.fields).nomeItaliano; providerStatus = 200;
    await new Promise(resolve => setTimeout(resolve, 2));
    const retry = await createJob({ kind: 'translate', lottoHandle: 'load-test' });
    const done = await finish(retry.handle); assert.equal(done.total, 1); assert.equal(done.translated, 1);
    assert.equal(titleInfo(first.fields).nomeItaliano, manual); assert.equal(titleInfo(first.fields).statoTraduzione, 'manual');
    assert.ok(titleInfo(missing[1].fields).nomeItaliano.includes('Trapano a batteria'));
    const list = await articleRoute.GET(new Request('http://localhost/api/poporama/articoli?details=1'));
    assert.equal((await list.json()).articoli.find(a => a.id === first.id).nomeProdotto, manual);
  });
  await t.test('XML-heavy titles are partitioned by UTF-8 request bytes and each success is cached', async () => {
    const originals=Array.from({length:10},(_,i)=>`BrandX${i} `+'A1 '.repeat(1000));
    const before=providerCalls;await translateCached(originals);assert.ok(providerCalls-before>1);
    const once=providerCalls;await translateCached(originals);assert.equal(providerCalls,once);
  });
  await t.test('signed pre-existing import plans resume their original PP without replacing saved prices', async () => {
    const lot=[...nodes.values()].find(n=>n.type==='poporama_lotto');
    const reservationResponse=await articleRoute.POST(new Request('http://localhost/api/poporama/articoli',{method:'POST',body:JSON.stringify({action:'reservePP',lottoId:lot.id,count:2})}));
    const reservation=await reservationResponse.json();assert.equal(reservationResponse.status,200);
    const original=row(9000);const code=`PP-${String(reservation.from).padStart(6,'0')}`;
    const oldResponse=await articleRoute.POST(new Request('http://localhost/api/poporama/articoli',{method:'POST',body:JSON.stringify({...original,lottoId:lot.id,codicePP:code,grado:'N',percentualePrezzo:50,ppReservation:reservation.ppReservation})}));
    assert.equal(oldResponse.status,200);const previous=nodes.get(key('poporama_articolo',code.toLowerCase()));
    previous.fields.find(f=>f.key==='prezzo_poporama').value=JSON.stringify({amount:'199.99',currency_code:'EUR'});
    const job=await createJob({kind:'import',lottoHandle:'load-test',total:2,digest:'d'.repeat(64),legacyPlan:{handle:'load-test',firstPPNumber:reservation.from,totalRows:2,ppReservation:reservation.ppReservation}});
    await uploadChunk(job.handle,0,[original,row(9001)]);const done=await finish(job.handle);
    assert.equal(done.imported,2);assert.equal(done.reservation.from,reservation.from);assert.equal(JSON.parse(field(previous,'prezzo_poporama')).amount,'199.99');
  });
  await t.test('missing provider credentials retain the source title without making any external request', async () => {
    const secret=process.env.DEEPL_API_KEY;delete process.env.DEEPL_API_KEY;
    try {
      const before=providerCalls;const title='BrandY Cordless Drill MODEL27 27 V';
      const result=(await translateCached([title])).get(titleKey(title));
      assert.equal(result.original,title);assert.equal(result.italian,'');assert.match(result.error,/non configurata/);assert.equal(providerCalls,before);
    } finally {process.env.DEEPL_API_KEY=secret;}
  });
  await t.test('429 retries are bounded; duplicate title failures are cached', async () => {
    providerStatus = 429; const before = providerCalls;
    const input = ['Apple Wireless Headphones MODEL900 64 GB'];
    const first = await translateCached(input); assert.ok(first.get(titleKey(input[0])).error); assert.equal(providerCalls - before, 3);
    await translateCached(input); assert.equal(providerCalls - before, 3);
    providerStatus = 200;
  });
  global.fetch = realFetch;
});
