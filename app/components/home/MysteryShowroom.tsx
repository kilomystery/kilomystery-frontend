'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'framer-motion';
import { useCart } from '@/app/components/cart/CartProvider';
import { trackAddToCart, trackViewItemList } from '@/app/lib/tracking';
import type { Lang } from '@/i18n/lang';
import type { Kg, Tier } from '@/app/config/shopifyProducts';
import type { ShowroomVariant } from './types';
import { SHOWROOM_COPY } from './copy';
import styles from './home.module.css';

const TIERS: Tier[] = ['standard', 'premium'];
const WEIGHTS: Kg[] = [1, 2, 3, 5, 10];

export function MysteryPackage({ tier, open = false }: { tier: Tier; open?: boolean }) {
  return <span className={`${styles.package} ${tier === 'premium' ? styles.gold : ''} ${open ? styles.open : ''}`} aria-hidden="true">
    <span className={styles.packageBody}>
      <span className={styles.front}>
        <span className={styles.packageSerial}>KM / {tier === 'premium' ? '02' : '01'}</span>
        <Image src="/logo.svg" alt="" width={120} height={70} className={styles.packageLogo} />
        <span className={styles.question}>?</span>
        <span className={styles.packageTier}>{tier}</span>
        <span className={styles.packageRule} /><span className={styles.packageSmall}>THE UNEXPECTED INSIDE.</span>
      </span>
      <span className={styles.side}><span>KILO<br />MYSTERY</span></span>
      <span className={styles.lid}><span>KILOMYSTERY / {tier.toUpperCase()}</span></span>
      <span className={styles.light} />
    </span>
  </span>;
}

async function fetchCatalog(): Promise<ShowroomVariant[]> {
  const response = await fetch('/api/showroom/catalog', { cache: 'no-store', signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('Catalog unavailable');
  const data = await response.json();
  if (!Array.isArray(data.variants)) throw new Error('Catalog unavailable');
  return data.variants;
}

export default function MysteryShowroom({ lang }: { lang: Lang }) {
  const t = SHOWROOM_COPY[lang];
  const reduce = useReducedMotion();
  const { addItem } = useCart();
  const [tier, setTier] = useState<Tier>('standard');
  const [kg, setKg] = useState<Kg>(1);
  const [opened, setOpened] = useState(false);
  const [variants, setVariants] = useState<ShowroomVariant[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const touch = useRef<{ x: number; y: number } | null>(null);
  const mounted = useRef(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelGesture = useRef({ delta: 0, lastStep: 0 });
  const scrollStep = TIERS.indexOf(tier) * 2 + Number(opened);

  // Wheel handling is local to the product scene. Boundaries release the page;
  // a short gesture lock absorbs trackpad inertia without skipping every step.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || busy) return;
      const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!raw) return;
      const direction = Math.sign(raw);
      const next = scrollStep + direction;
      const now = performance.now();
      if (next < 0 || next > 3) {
        wheelGesture.current.delta = 0;
        if (now - wheelGesture.current.lastStep < 550) event.preventDefault();
        return;
      }
      event.preventDefault();
      if (now - wheelGesture.current.lastStep < 650) return;
      const delta = raw * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1);
      if (Math.sign(wheelGesture.current.delta) !== direction) wheelGesture.current.delta = 0;
      wheelGesture.current.delta += delta;
      if (Math.abs(wheelGesture.current.delta) < 55) return;
      wheelGesture.current = { delta: 0, lastStep: now };
      setTier(next < 2 ? 'standard' : 'premium');
      setOpened(next % 2 === 1);
      setNotice('');
    };
    stage.addEventListener('wheel', wheel, { passive: false });
    return () => stage.removeEventListener('wheel', wheel);
  }, [busy, scrollStep]);

  useEffect(() => {
    const followVariantLink = () => {
      const match = window.location.hash.match(/^#buy-(standard|premium)-(1|2|3|5|10)$/);
      if (!match) return;
      setTier(match[1] as Tier);
      setKg(Number(match[2]) as Kg);
      setOpened(false);
    };
    followVariantLink();
    window.addEventListener('hashchange', followVariantLink);
    return () => window.removeEventListener('hashchange', followVariantLink);
  }, []);
  const variant = variants.find(v => v.tier === tier && v.kg === kg);
  const money = (price: number) => new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(price);

  async function load() {
    setState('loading');
    try {
      const data = await fetchCatalog();
      if (!mounted.current) return;
      setVariants(data); setState('ready');
      trackViewItemList('HomepageShowroom', data.map(v => ({ id: `${v.tier === 'standard' ? 'Standard' : 'Premium'}-${v.kg}`, shopifyId: v.id, title: v.title, tier: v.tier === 'standard' ? 'Standard' : 'Premium', weightKg: v.kg, pricePerKg: v.price / v.kg, qty: 1 })));
    } catch { if (mounted.current) setState('error'); }
  }
  useEffect(() => {
    mounted.current = true;
    void load();
    const refresh = () => { void load(); };
    window.addEventListener('focus', refresh);
    return () => { mounted.current = false; window.removeEventListener('focus', refresh); };
    // Loading is independent of the selected weight and tier.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(next: Tier, reveal = false) {
    if (busy) return;
    setTier(next); setOpened(reveal); setNotice('');
    wheelGesture.current.delta = 0;
  }
  function sceneKey(event: KeyboardEvent<HTMLDivElement>) {
    if (busy || !['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      select(tier === 'standard' ? 'premium' : 'standard', true);
    } else {
      const next = Math.max(0, Math.min(3, scrollStep + (event.key === 'ArrowDown' ? 1 : -1)));
      select(next < 2 ? 'standard' : 'premium', next % 2 === 1);
    }
  }
  function tilt(event: PointerEvent<HTMLSpanElement>) {
    if (reduce || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--tilt-x', `${-((event.clientY - rect.top) / rect.height - .5) * 8}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 10}deg`);
  }
  async function add() {
    if (!variant?.available || state !== 'ready' || busy) return;
    setBusy(true); setNotice('');
    try {
      const latest = await fetchCatalog();
      setVariants(latest);
      const fresh = latest.find(v => v.id === variant.id);
      if (!fresh?.available || fresh.price !== variant.price) { setNotice(t.changed); return; }
      const kind = tier === 'standard' ? 'Standard' as const : 'Premium' as const;
      const item = { id: `${kind}-${kg}`, title: fresh.title, tier: kind, weightKg: kg, pricePerKg: fresh.price / kg, qty: 1, shopifyId: fresh.id };
      addItem(item); trackAddToCart(item, 1); setNotice(t.added);
    } catch { setState('error'); setNotice(t.error); }
    finally { setBusy(false); }
  }

  return <MotionConfig reducedMotion="user"><section id="prodotti" className={styles.showroom} aria-labelledby="showroom-title">
    <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{t.collection} <span> / 01</span></p><h2 id="showroom-title">{t.select}</h2></div><p className={styles.micro}>{t.edition}</p></div>
    {TIERS.flatMap(kind => WEIGHTS.map(weight => <span key={`${kind}-${weight}`} id={`buy-${kind}-${weight}`} className={styles.variantAnchor} aria-hidden="true" />))}
    <div className={styles.showroomLayout}>
      <div className={styles.stageWrap}>
        <div ref={stageRef} className={styles.stage} role="group" aria-label={t.collection} aria-describedby="showroom-gesture-hint" onKeyDown={sceneKey}
          onTouchStart={e => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={e => { if (!touch.current) return; const dx = e.changedTouches[0].clientX - touch.current.x; const dy = e.changedTouches[0].clientY - touch.current.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) select(tier === 'premium' ? 'standard' : 'premium', true); else if (Math.abs(dy) > 45 && !busy) setOpened(true); touch.current = null; }}>
          <span className={styles.stageOrbit} /><span className={styles.stageWord} aria-hidden="true">MYSTERY</span>
          {TIERS.map(kind => { const selected = kind === tier; return <motion.button key={kind} type="button" aria-pressed={selected} aria-label={`${kind === 'standard' ? 'Standard' : 'Premium'} — ${t.explore}`} className={`${styles.boxButton} ${selected ? styles.selectedBox : ''}`} onClick={() => select(kind, true)} disabled={busy}
            initial={false} animate={reduce ? { x: selected ? '12%' : '-72%', y: selected ? 0 : -28, scale: selected ? 1 : .64, opacity: selected ? 1 : .48 } : { x: selected ? '12%' : '-72%', y: selected ? 0 : -28, scale: selected ? 1 : .64, opacity: selected ? 1 : .48, rotate: selected ? -3 : -10 }} transition={{ type: 'spring', stiffness: 105, damping: 22 }} style={{ zIndex: selected ? 3 : 1 }}>
            <span className={styles.tilt} onPointerMove={tilt} onPointerLeave={e => { e.currentTarget.style.setProperty('--tilt-x', '0deg'); e.currentTarget.style.setProperty('--tilt-y', '0deg'); }}><MysteryPackage tier={kind} open={selected && opened} /></span>
          </motion.button>; })}
          <div className={styles.floor} /><div className={styles.scrollProgress} aria-hidden="true">{[0, 1, 2, 3].map(step => <span key={step} data-active={step === scrollStep} />)}</div><span className={styles.stageIndex}>0{tier === 'standard' ? '1' : '2'} <span>/ 02</span></span>
        </div>
        <div className={styles.stageControls}><button type="button" disabled={busy} onClick={() => select(tier === 'premium' ? 'standard' : 'premium', true)} aria-label={t.back}>←</button><span id="showroom-gesture-hint">{t.hint}</span><button type="button" disabled={busy} onClick={() => select(tier === 'premium' ? 'standard' : 'premium', true)} aria-label={t.next}>→</button></div>
        <p className={styles.packagingNote}>{t.note}</p>
      </div>
      <div className={styles.productPanel} aria-busy={busy}>
        <div className={styles.tierTabs} role="group" aria-label={t.collection}>{TIERS.map(kind => <button type="button" key={kind} disabled={busy} onClick={() => select(kind)} aria-pressed={tier === kind}>{kind === 'standard' ? 'Standard' : 'Premium'}<span>↗</span></button>)}</div>
        <AnimatePresence mode="wait" initial={false}><motion.div key={tier} initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -8 }} transition={{ duration: .18 }}>
          <p className={styles.panelKicker}>{t.detail}</p><h3>{variant?.title.split(/\s*-/)[0].trim() || `${tier === 'standard' ? 'Standard' : 'Premium'} Box`}</h3>
          <p className={styles.tagline}>{tier === 'standard' ? t.standard : t.premium}</p>
          {variant?.description && <p tabIndex={0} className={styles.description} aria-label={t.detail}>{variant.description}</p>}
        </motion.div></AnimatePresence>
        <fieldset disabled={busy || state !== 'ready'} className={styles.weights}><legend>{t.weight}</legend><div>{WEIGHTS.map(weight => { const option = variants.find(v => v.tier === tier && v.kg === weight); return <button type="button" key={weight} disabled={!option?.available} aria-pressed={kg === weight} onClick={() => { setKg(weight); setNotice(''); }} aria-label={`${weight} kg${!option?.available ? ` — ${t.sold}` : ''}`}>{weight}<small> kg</small></button>; })}</div></fieldset>
        <div className={styles.priceRow}><strong data-testid="showroom-price">{state === 'ready' && variant ? money(variant.price) : '—'}</strong><span>{state === 'ready' && variant ? `${money(variant.price / kg)} / kg` : ''}</span><span className={styles.availability}>{state === 'ready' ? variant?.available ? `● ${t.available}` : t.sold : ''}</span></div>
        <button type="button" className={styles.buy} disabled={busy || state !== 'ready' || !variant?.available} onClick={add}>{busy ? t.checking : state === 'loading' ? t.loading : state === 'error' ? t.sold : variant?.available ? t.add : t.sold}<span>↗</span></button>
        <div className={styles.status} role="status">{notice || (state === 'error' ? t.error : '')}{state === 'error' && <button type="button" onClick={() => void load()}>{t.retry} ↻</button>}{notice === t.added && <Link href={`/${lang}/cart`}>{t.cart} →</Link>}</div>
        <div className={styles.panelLinks}><button type="button" aria-expanded={opened} onClick={() => setOpened(!opened)}>{opened ? t.close : t.discover} <span>＋</span></button><Link href={`/${lang}/policy/shipping`}>{t.shipping} ↗</Link></div>
        {opened && <p className={styles.reveal}>{t.reveal}</p>}
      </div>
    </div>
  </section></MotionConfig>;
}
