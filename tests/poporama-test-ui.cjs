// Runs the actual built Test page in an isolated Chrome profile against real API handlers
// backed by an in-memory Shopify fixture. Requires npm run build and local Chrome.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const WebSocket = require('next/dist/compiled/ws');
const { PDFDocument, PDFRawStream, decodePDFRawStream } = require('pdf-lib');
const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'poporama-test-ui-'));
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const port = () => new Promise(resolve => { const server = net.createServer(); server.listen(0, '127.0.0.1', () => { const value = server.address().port; server.close(() => resolve(value)); }); });
async function until(check, message, timeout = 30000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { try { const result = await check(); if (result) return result; } catch {} await pause(100); }
  throw new Error(message);
}
(async () => {
  assert.ok(fs.existsSync(chromePath), 'Set CHROME_PATH to a Chrome executable.');
  const appPort = await port(), chromePort = await port();
  const origin = `http://127.0.0.1:${appPort}`;
  const log = fs.openSync(path.join(temp, 'server.log'), 'w');
  const server = spawn(process.execPath, ['-r', path.join(__dirname, 'helpers/poporama-shopify-fixture.cjs'), path.join(root, 'node_modules/next/dist/bin/next'), 'start', '-p', String(appPort)], {
    cwd: root, stdio: ['ignore', log, log], env: { ...process.env, POPORAMA_UI_FIXTURE: '1', SHOPIFY_SHOP: 'poporama-ui-fixture', SHOPIFY_CLIENT_ID: 'fixture', SHOPIFY_CLIENT_SECRET: 'fixture', POPORAMA_ACCESS_PIN: 'fixture-pin', POPORAMA_SESSION_SECRET: 'isolated-ui-fixture-secret-at-least-32-characters' },
  });
  let chrome, socket;
  try {
    await until(async () => (await fetch(`${origin}/api/poporama/session`)).status === 401, 'Test server did not start');
    const login = await fetch(`${origin}/api/poporama/session`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: 'fixture-pin' }) });
    assert.equal(login.status, 200); const cookie = login.headers.get('set-cookie').match(/poporama_session=([^;]+)/)[1];
    chrome = spawn(chromePath, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-extensions', '--disable-sync', `--user-data-dir=${path.join(temp, 'chrome')}`, `--remote-debugging-port=${chromePort}`, 'about:blank'], { stdio: 'ignore' });
    const target = await until(async () => { const pages = await (await fetch(`http://127.0.0.1:${chromePort}/json/list`)).json(); return pages.find(p => p.type === 'page'); }, 'Chrome did not start');
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
    let id = 0; const pending = new Map();
    socket.on('message', raw => { const result = JSON.parse(raw); if (!result.id) return; const callback = pending.get(result.id); pending.delete(result.id); if (result.error) callback.reject(new Error(JSON.stringify(result.error))); else callback.resolve(result.result); });
    const send = (method, params = {}) => new Promise((resolve, reject) => { const seq = ++id; pending.set(seq, { resolve, reject }); socket.send(JSON.stringify({ id: seq, method, params })); });
    const evaluate = async expression => { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; };
    await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1365, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send('Network.setCookie', { name: 'poporama_session', value: cookie, url: origin, httpOnly: true });
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `const originalCreateURL = URL.createObjectURL; URL.createObjectURL = function(blob) { if (blob.type === 'application/pdf') window.__labelPdf = blob; return originalCreateURL.call(this, blob); };` });
    const testUrl = `${origin}/it/poporama-test/articoli/PP-000001/test`;
    await send('Page.navigate', { url: testUrl });
    const waitField = () => until(() => evaluate(`!!document.querySelector('#prezzo-poporama-euro') && !document.querySelector('#prezzo-poporama-euro').disabled`), 'Editable Test price input did not render');
    await waitField();
    const visible = await evaluate(`(() => { const f = document.querySelector('#prezzo-poporama-euro'); f.scrollIntoView({block:'center'}); const r = f.getBoundingClientRect(); const p = document.querySelector('[aria-label="Percentuale prezzo"]'); return { value: f.value, readOnly: f.readOnly, mode: f.inputMode, label: document.querySelector('label[for="prezzo-poporama-euro"]').textContent.trim(), sameSection: f.closest('section') === p.closest('section'), visible: r.width > 0 && r.height > 0, percentage: p.value, percentRequired: p.required }; })()`);
    assert.equal(visible.label, 'Prezzo Poporama (€)'); assert.equal(visible.readOnly, false); assert.equal(visible.mode, 'decimal'); assert.equal(visible.sameSection, true); assert.equal(visible.visible, true); assert.equal(visible.percentRequired, false); assert.equal(Number(visible.value.replace(',', '.')), 220);
    console.log('PASS: actual Test route renders the editable euro field next to the percentage for a legacy product.');
    const inputPrice = value => evaluate(`(() => { const f = document.querySelector('#prezzo-poporama-euro'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(f, ${JSON.stringify(value)}); f.dispatchEvent(new Event('input', {bubbles:true})); })()`);
    const clickSave = () => evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'SALVA TEST').click()`);
    const savedArticle = () => evaluate(`fetch('/api/poporama/articoli/PP-000001/test').then(r => r.json()).then(r => r.articolo)`);
    async function savePrice(value) {
      await inputPrice(value); await clickSave();
      await until(async () => (await savedArticle()).prezzoManuale === Number(value.replace(',', '.')), 'Manual price was not persisted by the real API');
      assert.equal(await evaluate(`document.querySelector('[aria-label="Percentuale prezzo"]').value`), visible.percentage);
    }
    await savePrice('149,90');
    await send('Page.reload', { ignoreCache: true }); await waitField();
    assert.equal(Number((await evaluate(`document.querySelector('#prezzo-poporama-euro').value`)).replace(',', '.')), 149.9);
    await savePrice('159,95');
    const saved = await savedArticle(); assert.equal(saved.prezzoPoporama, 159.95); assert.equal(saved.retail, 400); assert.equal(saved.condizioneOriginale, 'Customer Damage');
    console.log('PASS: comma input, save, reload and second edit persist through real Shopify API handlers; Retail and percentage unchanged.');
    await until(() => evaluate(`Array.from(document.querySelectorAll('button')).some(b => b.textContent.trim() === 'SCARICA ETICHETTA')`), 'PDF button missing after save');
    await evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'SCARICA ETICHETTA').click()`);
    await until(() => evaluate(`!!window.__labelPdf`), 'PDF was not generated');
    const encoded = await evaluate(`window.__labelPdf.arrayBuffer().then(b => { let s=''; for (const n of new Uint8Array(b)) s += String.fromCharCode(n); return btoa(s); })`);
    const bytes = Buffer.from(encoded, 'base64'); fs.writeFileSync(path.join(temp, 'label-manual.pdf'), bytes);
    const pdf = await PDFDocument.load(bytes); const content = [];
    for (const [, object] of pdf.context.enumerateIndirectObjects()) if (object instanceof PDFRawStream) {
      try { const decoded = Buffer.from(decodePDFRawStream(object).decode()).toString('latin1'); for (const match of decoded.matchAll(/<([a-f0-9]+)>\s*Tj/gi)) content.push(Buffer.from(match[1], 'hex').toString('latin1')); } catch {}
    }
    const pdfText = content.join('\n'); for (const expected of ['159,95', '400,00', 'Prezzo uscita Amazon', 'Prezzo Poporama']) assert.ok(pdfText.includes(expected), `PDF missing ${expected}`);
    assert.ok(!pdfText.includes('Customer Damage'));
    console.log('PASS: actual PDF download contains the manually saved price and original Retail, without Amazon condition.');
    await evaluate(`document.querySelector('#prezzo-poporama-euro').scrollIntoView({block:'center'})`);
    const screenshot = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(temp, 'test-price-desktop.png'), Buffer.from(screenshot.data, 'base64'));
    await send('Page.navigate', { url: `${origin}/it/poporama-test/listino` });
    await until(() => evaluate(`document.querySelector('tbody')?.textContent.includes('159,95')`), 'Listino did not render persisted manual price');
    console.log('PASS: Listino displays the persisted manual price.');
    await send('Page.navigate', { url: testUrl }); await waitField();
    await evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Ripristina prezzo automatico').click()`);
    assert.equal(Number((await evaluate(`document.querySelector('#prezzo-poporama-euro').value`)).replace(',', '.')), 220);
    await clickSave();
    await until(async () => { const a = await savedArticle(); return a.prezzoManuale === null && a.prezzoPoporama === 220; }, 'Automatic reset was not persisted');
    await send('Page.reload', { ignoreCache: true }); await waitField();
    assert.equal(Number((await evaluate(`document.querySelector('#prezzo-poporama-euro').value`)).replace(',', '.')), 220);
    console.log('PASS: restore automatic price recalculates the grade rule and persists after reload.');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    assert.ok(await evaluate(`(() => {const f=document.querySelector('#prezzo-poporama-euro'); f.scrollIntoView({block:'center'}); const r=f.getBoundingClientRect(); return r.width>0 && r.left>=0 && r.right<=innerWidth;})()`));
    console.log(`PASS: field remains visible on mobile. Evidence: ${temp}`);
  } finally { if (socket) socket.close(); if (chrome) chrome.kill(); server.kill(); fs.closeSync(log); }
})().catch(error => { console.error(error); console.error(`UI test logs: ${temp}`); process.exitCode = 1; });
