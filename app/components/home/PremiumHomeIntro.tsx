import type { Lang } from '@/i18n/lang';
import Header from '@/app/components/Header';
import { MysteryPackage } from './MysteryShowroom';
import { SHOWROOM_COPY } from './copy';
import styles from './home.module.css';

export function PremiumHomeHeader({ lang }: { lang: Lang }) {
  return <Header lang={lang} />;
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
