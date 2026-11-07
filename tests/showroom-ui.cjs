// Run against a local production server: npm run start -- --port 3100
// No orders or payments: catalog failures/price changes are browser-only fixtures.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const WebSocket = require('next/dist/compiled/ws');
const origin = process.env.SHOWROOM_ORIGIN || 'http://127.0.0.1:3100';
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'km-showroom-'));
const pause = ms => new Promise(r => setTimeout(r, ms));
async function until(check, message) { const end = Date.now() + 25000; while (Date.now() < end) { if (await check()) return; await pause(100); } throw Error(message); }
(async () => {
  const chrome = spawn(process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-extensions', `--user-data-dir=${path.join(temp, 'chrome')}`, '--remote-debugging-port=9334', 'about:blank'], { stdio: 'ignore' });
  let socket;
  try {
    let target;
    await until(async () => { try { target = (await (await fetch('http://127.0.0.1:9334/json/list')).json()).find(p => p.type === 'page'); return !!target; } catch { return false; } }, 'Chrome unavailable');
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r, j) => { socket.once('open', r); socket.once('error', j); });
    let id = 0; const pending = new Map(); const errors = []; let catalogMode = 'live'; let fixture = []; let checkoutRequest;
    const send = (method, params = {}) => new Promise((resolve, reject) => { const seq = ++id; const timeout = setTimeout(() => { pending.delete(seq); reject(Error('CDP timeout: ' + method)); }, 30000); pending.set(seq, { resolve: value => { clearTimeout(timeout); resolve(value); }, reject: error => { clearTimeout(timeout); reject(error); } }); socket.send(JSON.stringify({ id: seq, method, params })); });
    socket.on('message', async raw => {
      const data = JSON.parse(raw);
      if (data.id) { const p = pending.get(data.id); pending.delete(data.id); data.error ? p.reject(Error(JSON.stringify(data.error))) : p.resolve(data.result); return; }
      if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.text);
      if (data.method === 'Fetch.requestPaused') {
        const { requestId, request } = data.params;
        if (request.url.includes('/api/checkout/create')) { checkoutRequest = JSON.parse(request.postData); await send('Fetch.fulfillRequest', { requestId, responseCode: 200, body: Buffer.from(JSON.stringify({ url: `${origin}/checkout-test-intercepted` })).toString('base64'), responseHeaders: [{ name: 'Content-Type', value: 'application/json' }] }); }
        else if (catalogMode === 'live') await send('Fetch.continueRequest', { requestId });
        else await send('Fetch.fulfillRequest', { requestId, responseCode: catalogMode === 'error' ? 503 : 200, body: Buffer.from(JSON.stringify(catalogMode === 'error' ? { error: 'Catalog unavailable' } : { variants: fixture })).toString('base64'), responseHeaders: [{ name: 'Content-Type', value: 'application/json' }] });
      }
    });
    const evaluate = async expression => { const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails)); return result.result.value; };
    await send('Page.enable'); await send('Runtime.enable');
    await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/showroom/catalog*' }, { urlPattern: '*/api/checkout/create*' }] });
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('km-newsletter-dismissed','1');localStorage.setItem('km-cookie-consent','reject');` });
    const click = text => evaluate(`Array.from(document.querySelectorAll('#prodotti button')).find(b => b.textContent.trim() === ${JSON.stringify(text)}).click()`);
    const ready = () => until(() => evaluate(`Array.from(document.querySelectorAll('#prodotti button')).some(b => b.textContent.includes('Aggiungi al carrello') && !b.disabled)`), 'Catalog did not load');
    const shot = async name => { const screenshot = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(temp, name), Buffer.from(screenshot.data, 'base64')); };
    const viewport = async (width, height, mobile) => { await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile }); await send('Emulation.setTouchEmulationEnabled', { enabled: mobile }); };
    await viewport(1440, 1050, false);
    await send('Page.navigate', { url: `${origin}/it` }); await ready();
    assert.equal(await evaluate(`document.querySelectorAll('h1').length`), 1);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
    const live = await (await fetch(`${origin}/api/showroom/catalog`)).json(); fixture = live.variants;
    const initial = fixture.find(v => v.tier === 'standard' && v.kg === 1);
    assert.equal(await evaluate(`document.querySelector('[data-testid="showroom-price"]').textContent`), new Intl.NumberFormat('it', { style: 'currency', currency: 'EUR' }).format(initial.price));
    await shot('desktop-hero.png');
    await evaluate(`document.querySelector('#prodotti').scrollIntoView({block:'start'})`); await pause(400);
    const sceneWheel = async deltaY => {
      const p = await evaluate(`(()=>{const r=document.querySelector('#prodotti [role="group"]').getBoundingClientRect();return {x:r.x+r.width*.7,y:r.y+r.height*.5}})()`);
      await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x:p.x, y:p.y, deltaX:0, deltaY });
      await pause(120);
    };
    const openState = () => evaluate(`document.querySelector('#prodotti button[aria-expanded]').getAttribute('aria-expanded')`);
    const selectedTier = name => evaluate(`Array.from(document.querySelectorAll('#prodotti button')).find(b=>b.textContent.trim()===${JSON.stringify(name + '↗')}).getAttribute('aria-pressed') === 'true'`);
    const sceneScroll = await evaluate('scrollY');
    await sceneWheel(95); await until(async () => await openState() === 'true', 'Wheel did not open Standard');
    assert.equal(await selectedTier('Standard'), true);
    await sceneWheel(95); assert.equal(await selectedTier('Standard'), true, 'Trackpad inertia skipped a step');
    await pause(700); await sceneWheel(95);
    await until(() => selectedTier('Premium'), 'Wheel did not change Standard to Premium');
    assert.equal(await openState(), 'false');
    await pause(700); await sceneWheel(95); await until(async () => await openState() === 'true', 'Wheel did not open Premium');
    await shot('desktop-showroom.png');
    await pause(700); await sceneWheel(95);
    await until(() => evaluate(`scrollY > ${sceneScroll + 10}`), 'Wheel trapped page at final step');
    await evaluate(`document.querySelector('#prodotti').scrollIntoView({block:'start'})`); await pause(400);
    await sceneWheel(-95); await until(async () => await openState() === 'false', 'Reverse wheel did not close Premium');
    await pause(700); await sceneWheel(-95); await until(() => selectedTier('Standard'), 'Reverse wheel did not return to Standard');
    assert.equal(await openState(), 'true');
    console.log('PASS wheel: opening, both tiers, reverse scrolling, inertia guard and page-scroll release.');
    await click('Standard↗'); await pause(350);
    const soldWeight = fixture.find(v => v.tier === 'standard' && !v.available);
    if (soldWeight) assert.equal(await evaluate(`document.querySelector('#prodotti button[aria-label="${soldWeight.kg} kg — Non disponibile"]').disabled`), true);
    await evaluate(`document.querySelector('#prodotti button[aria-label="3 kg"]').click()`);
    const chosen = fixture.find(v => v.tier === 'standard' && v.kg === 3);
    assert.equal(await evaluate(`document.querySelector('[data-testid="showroom-price"]').textContent`), new Intl.NumberFormat('it', { style: 'currency', currency: 'EUR' }).format(chosen.price));
    await click('Scopri la box ＋');
    assert.equal(await evaluate(`document.querySelector('#prodotti button[aria-expanded]').getAttribute('aria-expanded')`), 'true');
    await click('Aggiungi al carrello↗');
    await until(() => evaluate(`document.querySelector('#prodotti [role="status"]').textContent.includes('Aggiunta al carrello')`), 'Add failed');
    const cart = await evaluate(`JSON.parse(localStorage.getItem('km-cart-v1'))`);
    const line = cart.find(v => v.shopifyId === chosen.id); assert.ok(line); assert.equal(line.weightKg, 3); assert.equal(line.pricePerKg * 3, chosen.price);
    console.log('PASS desktop: live prices, sold-out weights, opening, real variant ID and price in existing cart.');
    await send('Page.navigate', { url: `${origin}/it/cart` });
    await until(() => evaluate(`document.body.textContent.includes('Vai al checkout')`), 'Existing cart did not render');
    await evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Vai al checkout')).click()`);
    await until(() => !!checkoutRequest, 'Checkout request missing');
    assert.ok(checkoutRequest.items.some(i => i.shopifyId === chosen.id));
    console.log('PASS existing cart forwards selected Shopify variant to checkout endpoint (request intercepted; no order).');
    await until(() => evaluate(`location.pathname.includes('checkout-test-intercepted')`), 'Intercepted checkout navigation missing');
    await viewport(390, 844, true); await send('Page.navigate', { url: `${origin}/it` }); await ready();
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
    await shot('mobile-hero.png');
    await evaluate(`document.querySelector('#prodotti').scrollIntoView({block:'start'})`); await pause(350); await shot('mobile-showroom.png');
    const point = await evaluate(`(()=>{const r=document.querySelector('#prodotti [aria-label="LA COLLEZIONE"]').getBoundingClientRect();return {x:r.x+r.width*.7,y:r.y+r.height*.5}})()`);
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: point.x, y: point.y }] });
    await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x - 100, y: point.y }] });
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await pause(350);
    assert.equal(await evaluate(`Array.from(document.querySelectorAll('#prodotti button')).find(b=>b.textContent.trim()==='Premium↗').getAttribute('aria-pressed')`), 'true');
    assert.equal(await openState(), 'true', 'Swipe must open the incoming box');
    await evaluate(`Array.from(document.querySelectorAll('#prodotti button')).find(b=>b.textContent.trim()==='Standard↗').focus()`);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await until(() => evaluate(`Array.from(document.querySelectorAll('#prodotti button')).find(b=>b.textContent.trim()==='Standard↗').getAttribute('aria-pressed') === 'true'`), 'Keyboard selection did not update');
    await evaluate(`document.querySelector('#prodotti [aria-busy]').scrollIntoView({block:'start'})`); await pause(350); await shot('mobile-details.png');
    console.log('PASS mobile: 390 px layout, touch swipe and keyboard selection change the selected box.');
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[class*="heroBoxFront"]')).animationName`), 'none');
    catalogMode = 'error'; await send('Page.reload');
    await until(() => evaluate(`document.querySelector('#prodotti [role="status"]').textContent.includes('catalogo non è disponibile')`), 'Error state missing');
    assert.equal(await evaluate(`document.querySelector('[data-testid="showroom-price"]').textContent`), '—');
    catalogMode = 'fixture'; await click('Riprova ↻'); await ready();
    fixture = fixture.map(v => ({ ...v, price: v.price + 1 }));
    const countBefore = await evaluate(`JSON.parse(localStorage.getItem('km-cart-v1')).reduce((s,v)=>s+v.qty,0)`);
    await click('Aggiungi al carrello↗');
    await until(() => evaluate(`document.querySelector('#prodotti [role="status"]').textContent.includes('Prezzo o disponibilità aggiornati')`), 'Stale-price check missing');
    assert.equal(await evaluate(`JSON.parse(localStorage.getItem('km-cart-v1')).reduce((s,v)=>s+v.qty,0)`), countBefore);
    console.log('PASS reduced motion, unavailable-catalog retry and price-change protection.');
    for (const width of [360, 430, 768, 1024]) { await viewport(width, 900, width < 768); assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `Horizontal overflow at ${width}`); }
    assert.deepEqual(errors, []);
    for (const [lang, title] of [['en', 'Your next'], ['es', 'Tu próximo'], ['fr', 'Votre prochain'], ['de', 'Deine nächste']]) {
      const response = await fetch(`${origin}/${lang}`); assert.equal(response.status, 200);
      assert.ok((await response.text()).includes(title), `Missing ${lang} homepage copy`);
    }
    console.log('PASS translated homepage routes: EN, ES, FR, DE.');
    catalogMode = 'live';
    await viewport(390, 844, true);
    const publicRoutes = ['products', 'about', 'contact', 'faq', 'events', 'how-it-works', 'blog', 'press', 'policy/shipping', 'policy/returns', 'policy/privacy', 'policy/terms', 'pacchi-smarriti', 'mystery-box', 'pacchi-non-reclamati', 'resi-ecommerce', 'giacenze-ecommerce', 'pacchi-smarriti-poste', 'pacchi-smarriti-amazon'];
    for (const route of publicRoutes) {
      await send('Page.navigate', { url: `${origin}/it/${route}` });
      await until(() => evaluate(`location.pathname === '/it/${route}' && !!document.querySelector('.km-storefront main') && document.readyState === 'complete'`), `Route did not render: ${route}`);
      await evaluate(`window.scrollTo(0,0)`); await pause(150);
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('.km-storefront')).backgroundColor`), 'rgb(16, 16, 20)', route);
      assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `Mobile overflow: ${route}`);
      assert.equal(await evaluate(`!!document.querySelector('.km-footer') && !!document.querySelector('header button[aria-controls="site-explore"]')`), true, `Shared theme missing: ${route}`);
      if (route === 'faq') {
        await evaluate(`document.querySelector('#faq summary').click()`);
        assert.equal(await evaluate(`document.querySelector('#faq details').open`), true);
      }
      if (route === 'contact') assert.equal(await evaluate(`document.querySelector('main form').checkValidity()`), false);
      if (['products', 'about', 'faq', 'contact', 'policy/shipping'].includes(route)) await shot(`mobile-${route.replace('/', '-')}.png`);
    }
    await send('Page.navigate', { url: `${origin}/it/about` });
    await until(() => evaluate(`!!document.querySelector('[data-storefront-page="about"]')`), 'About not ready');
    await evaluate(`document.querySelector('header button[aria-controls="site-explore"]').click()`);
    assert.equal(await evaluate(`!!document.querySelector('#site-explore a[href="/it/products"]')`), true);
    await send('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
    await until(() => evaluate(`!document.querySelector('#site-explore')`), 'Escape did not close menu');
    await evaluate(`document.querySelector('header button[aria-label="Language"]').click()`);
    assert.equal(await evaluate(`!!document.querySelector('#site-languages a[href="/en/about"]')`), true);
    console.log('PASS shared premium design on 19 public routes; mobile menu, Escape and route-preserving language links.');
    await viewport(1440, 1050, false);
    for (const route of ['products', 'about', 'cart', 'events', 'blog', 'contact', 'policy/shipping']) {
      await send('Page.navigate', { url:`${origin}/it/${route}` });
      await until(() => evaluate(`location.pathname === '/it/${route}' && document.readyState === 'complete' && !!document.querySelector('main')`), route);
      assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `Desktop overflow: ${route}`);
      await evaluate(`window.scrollTo(0,0)`); await pause(150);
      await shot(`desktop-${route.replace('/', '-')}.png`);
    }
    await send('Page.navigate', { url: `${origin}/it/products#buy-premium-10` }); await ready();
    await until(() => selectedTier('Premium'), 'Legacy product anchor did not select Premium');
    assert.equal(await evaluate(`document.querySelector('#prodotti button[aria-label="10 kg"]').getAttribute('aria-pressed')`), 'true');
    await send('Page.navigate', { url: `${origin}/it/blog` });
    await until(() => evaluate(`!!document.querySelector('main article a[href*="/blog/"]')`), 'Blog list missing');
    const article = await evaluate(`document.querySelector('main article a[href*="/blog/"]').href`);
    await send('Page.navigate', { url: article });
    await until(() => evaluate(`document.readyState === 'complete' && !!document.querySelector('.km-storefront main')`), 'Article missing');
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
    console.log('PASS desktop pages, article layout and existing 10 kg product anchors.');
    assert.deepEqual(errors, []);
    console.log(`Screenshots: ${temp}`);
  } finally { socket?.close(); chrome.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
