import Image from 'next/image';
import Link from 'next/link';
import type { Lang } from '@/i18n/lang';
import CartIcon from '@/app/components/cart/CartIcon';
import { MysteryPackage } from './MysteryShowroom';
import { SHOWROOM_COPY } from './copy';
import styles from './home.module.css';

export function PremiumHomeHeader({ lang }: { lang: Lang }) {
  const t = SHOWROOM_COPY[lang];
  return (
<header className={styles.header}>
      <Link href={`/${lang}`} className={styles.logo} aria-label="KiloMystery"><Image src="/logo.svg" alt="" width={56} height={40} priority /><span>KILO<span>MYSTERY</span><small>EXPECT THE UNEXPECTED</small></span></Link>
      <nav aria-label="Menu" className={styles.nav}><a href="#prodotti">Mystery Box</a><a href="#come-funziona">{t.how}</a><Link href={`/${lang}/unboxing-experience`}>{t.unboxing} ↗</Link></nav>
      <div className={styles.headerActions}><details className={styles.language}><summary aria-label="Language">{lang.toUpperCase()} ⌄</summary><div>{(['it', 'en', 'es', 'fr', 'de'] as Lang[]).map(l => <Link href={`/${l}`} key={l} hrefLang={l} lang={l} aria-current={l === lang ? 'page' : undefined}>{({ it: 'Italiano', en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch' })[l]}</Link>)}</div></details><CartIcon lang={lang} className={styles.cart} /></div>
    </header>
  );
}

export default function PremiumHomeIntro({ lang }: { lang: Lang }) {
  const t = SHOWROOM_COPY[lang];
  return (
<section className={styles.hero} aria-labelledby="premium-home-title">
      <div className={styles.heroGrid} aria-hidden="true" />
      <div className={styles.heroCopy}><p className={styles.eyebrow}><span className={styles.liveDot} /> {t.eyebrow}</p><h1 id="premium-home-title">{t.title}<br /><em>{t.accent}</em></h1><p className={styles.heroSubtitle}>{t.subtitle}</p><div className={styles.heroCtas}><a href="#prodotti" className={styles.primary}>{t.explore}<span>↗</span></a><a href="#come-funziona" className={styles.secondary}>{t.how} <span>↓</span></a></div><div className={styles.heroFoot}><span>01 — 10 KG</span><span>STANDARD / PREMIUM</span></div></div>
      <div className={styles.heroVisual} aria-hidden="true"><span className={styles.heroRing} /><span className={styles.heroBoxBack}><MysteryPackage tier="standard" /></span><span className={styles.heroBoxFront}><MysteryPackage tier="premium" /></span><span className={styles.heroCaption}>SEALED WITH A QUESTION.<br /><b>OPENED WITH POSSIBILITY.</b></span><span className={styles.coordinate}>KM° / COLLECTION 01</span></div>
      <div className={styles.heroBottom}><span>{t.brand}</span><a href="#prodotti">{t.collection} ↓</a></div>
    </section>
  );
}
