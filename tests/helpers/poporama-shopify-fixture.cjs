// Used only by the isolated UI test server. Never connects to a real Shopify store.
if (process.env.POPORAMA_UI_FIXTURE !== '1' || process.env.SHOPIFY_SHOP !== 'poporama-ui-fixture') {
  throw new Error('The UI fixture requires its dedicated test environment.');
}
const originalFetch = global.fetch;
const money = n => JSON.stringify({ amount: n.toFixed(2), currency_code: 'EUR' });
const fields = values => Object.entries(values).map(([key, value]) => ({ key, value }));
const lot = {
  id: 'gid://shopify/Metaobject/900', handle: 'ui-fixture', type: 'poporama_lotto',
  fields: fields({ codice_lotto: 'UI fixture', percentuale_nuovo: '60', percentuale_grado_a: '55', percentuale_grado_b: '45', percentuale_grado_c: '35', percentuale_grado_n: '50' }),
};
const article = {
  id: 'gid://shopify/Metaobject/901', handle: 'pp-000001', type: 'poporama_articolo',
  createdAt: '2025-01-01T12:00:00Z', updatedAt: '2025-01-01T12:00:00Z',
  fields: fields({ codice_pp: 'PP-000001', lotto: lot.id, nome_prodotto: 'Prodotto storico prova interfaccia', asin: 'ASIN-UI-TEST',
    grado: 'A', stato_vendita: 'DISPONIBILE', retail: money(400), costo_manifest: money(100), prezzo_poporama: money(220),
    percentuale_prezzo: '55', condizione_originale: 'Customer Damage', data_test: '2025-01-01T12:00:00', numero_seriale: 'UI-001',
    risultati_test: JSON.stringify({ accensione: { result: 'OK', note: 'Test storico conservato' } }),
  }),
};
global.fetch = async (input, options = {}) => {
  const url = String(input instanceof Request ? input.url : input);
  if (!url.includes('.myshopify.com/')) return originalFetch(input, options);
  if (!url.startsWith('https://poporama-ui-fixture.myshopify.com/')) throw new Error('Live Shopify access blocked by UI fixture.');
  if (url.endsWith('/oauth/access_token')) return Response.json({ access_token: 'offline-ui-fixture', expires_in: 3600 });
  const { query, variables = {} } = JSON.parse(options.body);
  if (query.includes('metaobjectUpdate(')) {
    if (variables.id !== article.id) throw new Error('Unexpected fixture update');
    for (const next of variables.metaobject.fields) {
      const old = article.fields.find(f => f.key === next.key);
      if (old) old.value = next.value; else article.fields.push({ ...next });
    }
    article.updatedAt = new Date().toISOString();
    return Response.json({ data: { metaobjectUpdate: { metaobject: article, userErrors: [] } } });
  }
  if (query.includes('metaobjectByHandle(')) return Response.json({ data: { metaobjectByHandle: variables.handle === article.handle ? article : null } });
  if (query.includes('metaobject(id:')) return Response.json({ data: { metaobject: lot } });
  if (query.includes('metaobjects(') && query.includes('poporama_lotto')) {
    const aliases = { id: lot.id, handle: lot.handle, type: lot.type };
    const properties = { codiceLotto: 'codice_lotto', percentualeNuovo: 'percentuale_nuovo', percentualeGradoA: 'percentuale_grado_a', percentualeGradoB: 'percentuale_grado_b', percentualeGradoC: 'percentuale_grado_c', percentualeGradoN: 'percentuale_grado_n' };
    for (const [alias, key] of Object.entries(properties)) aliases[alias] = { value: lot.fields.find(f => f.key === key).value };
    return Response.json({ data: { metaobjects: { nodes: [aliases], pageInfo: { hasNextPage: false } } } });
  }
  if (query.includes('metaobjects(')) return Response.json({ data: { metaobjects: { edges: [{ node: article, cursor: article.id }], pageInfo: { hasNextPage: false } } } });
  throw new Error('Unhandled Shopify UI fixture query');
};
