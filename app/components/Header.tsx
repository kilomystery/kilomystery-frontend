// app/components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./storefront.module.css";
import CartIcon from "@/app/components/cart/CartIcon";

type Lang = "it" | "en" | "es" | "fr" | "de";
const SUPPORTED: Lang[] = ["it", "en", "es", "fr", "de"];

const INSTAGRAM_URL = "https://www.instagram.com/kilo.mystery/";
const TIKTOK_URL = "https://www.tiktok.com/@kilomystery";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61584042208386";

const LANGS = [
  { code: "it", label: "IT", flag: "🇮🇹" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "de", label: "DE", flag: "🇩🇪" },
] as const;

type Labels = {
  navProducts: string;
  navHow: string;
  navLostParcels: string;
  navLive: string;
  navAbout: string;
  navEvents: string;

  ariaInstagram: string;
  ariaTikTokDesktop: string;
  ariaTikTokMobile: string;
  ariaOpenMenu: string;
};

const HEADER_LABELS: Record<Lang, Labels> = {
  it: {
    navProducts: "Prodotti",
    navHow: "Come funziona",
    navLostParcels: "Pacchi Smarriti",
    navLive: "Live TikTok",
    navAbout: "Chi siamo",
    navEvents: "Eventi Pop-Up",
    ariaInstagram: "Instagram",
    ariaTikTokDesktop: "TikTok KiloMystery",
    ariaTikTokMobile: "TikTok",
    ariaOpenMenu: "Apri menu",
  },
  en: {
    navProducts: "Products",
    navHow: "How it works",
    navLostParcels: "Lost Parcels",
    navLive: "TikTok Live",
    navAbout: "About us",
    navEvents: "Pop-up events",
    ariaInstagram: "Instagram",
    ariaTikTokDesktop: "TikTok KiloMystery",
    ariaTikTokMobile: "TikTok",
    ariaOpenMenu: "Open menu",
  },
  es: {
    navProducts: "Productos",
    navHow: "Cómo funciona",
    navLostParcels: "Paquetes perdidos",
    navLive: "Live TikTok",
    navAbout: "Quiénes somos",
    navEvents: "Eventos pop-up",
    ariaInstagram: "Instagram",
    ariaTikTokDesktop: "TikTok KiloMystery",
    ariaTikTokMobile: "TikTok",
    ariaOpenMenu: "Abrir menú",
  },
  fr: {
    navProducts: "Produits",
    navHow: "Comment ça marche",
    navLostParcels: "Colis perdus",
    navLive: "Live TikTok",
    navAbout: "À propos",
    navEvents: "Événements pop-up",
    ariaInstagram: "Instagram",
    ariaTikTokDesktop: "TikTok KiloMystery",
    ariaTikTokMobile: "TikTok",
    ariaOpenMenu: "Ouvrir le menu",
  },
  de: {
    navProducts: "Produkte",
    navHow: "So funktioniert’s",
    navLostParcels: "Verlorene Pakete",
    navLive: "TikTok Live",
    navAbout: "Über uns",
    navEvents: "Pop-up-Events",
    ariaInstagram: "Instagram",
    ariaTikTokDesktop: "TikTok KiloMystery",
    ariaTikTokMobile: "TikTok",
    ariaOpenMenu: "Menü öffnen",
  },
};

function replaceLang(path: string, to: Lang) {
  if (!path || path === "/") return `/${to}`;
  const clean = ("/" + path).replace(/\/{2,}/g, "/");
  const parts = clean.split("/");
  if (!SUPPORTED.includes(parts[1] as Lang)) {
    return `/${to}${clean === "/" ? "" : clean}`;
  }
  parts[1] = to;
  return (
    parts
      .join("/")
      .replace(/\/{2,}/g, "/")
      .replace(/\/$/, "") || `/${to}`
  );
}

export default function Header({ lang = "it" as Lang }) {
  const pathname = usePathname() || `/${lang}`;
  const currentLang = SUPPORTED.includes(lang) ? lang : "it";
  const labels = HEADER_LABELS[currentLang];
  const [open, setOpen] = useState(false);
  const [openLang, setOpenLang] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const home = pathname === `/${currentLang}`;
  const langLinks = useMemo(() => Object.fromEntries(SUPPORTED.map(code => [code, replaceLang(pathname, code)])), [pathname]);
  const primary = [
    [home ? '#prodotti' : `/${currentLang}/products`, labels.navProducts],
    [home ? '#come-funziona' : `/${currentLang}/how-it-works`, labels.navHow],
    [`/${currentLang}/unboxing-experience`, 'Unboxing ↗'],
  ];
  const secondary = [
    [`/${currentLang}/pacchi-smarriti`, labels.navLostParcels],
    [`/${currentLang}/live-tiktok`, labels.navLive],
    [`/${currentLang}/about`, labels.navAbout],
    [`/${currentLang}/events`, labels.navEvents],
    [`/${currentLang}/blog`, 'Blog'],
    [`/${currentLang}/faq`, 'FAQ'],
    [`/${currentLang}/contact`, ({ it: 'Contatti', en: 'Contact', es: 'Contacto', fr: 'Contact', de: 'Kontakt' })[currentLang]],
  ];

  useEffect(() => { setOpen(false); setOpenLang(false); }, [pathname]);
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) { setOpen(false); setOpenLang(false); }
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); setOpenLang(false); menuButton.current?.focus(); }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, []);

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.headerInner}>
        <Link href={`/${currentLang}`} className={styles.logo} aria-label="KiloMystery">
          <Image src="/logo.svg" alt="" width={56} height={40} priority />
          <span>KILO<span>MYSTERY</span><small>EXPECT THE UNEXPECTED</small></span>
        </Link>
        <nav className={styles.primaryNav} aria-label="Menu">
          {primary.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>)}
        </nav>
        <div className={styles.actions}>
          <div className={styles.language}>
            <button type="button" aria-expanded={openLang} aria-controls="site-languages" aria-label="Language" onClick={() => { setOpenLang(!openLang); setOpen(false); }}>{currentLang.toUpperCase()} ⌄</button>
            {openLang && <nav id="site-languages" aria-label="Language" className={styles.languagePanel}>
              {LANGS.map(({ code }) => <Link key={code} href={langLinks[code]} hrefLang={code} lang={code} aria-current={code === currentLang ? 'page' : undefined} onClick={() => setOpenLang(false)}>{({ it: 'Italiano', en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch' })[code]}</Link>)}
            </nav>}
          </div>
          <CartIcon lang={currentLang} className={styles.cart} />
          <button ref={menuButton} type="button" className={styles.menuButton} aria-label={labels.ariaOpenMenu} aria-expanded={open} aria-controls="site-explore" onClick={() => { setOpen(!open); setOpenLang(false); }}><span aria-hidden="true">{open ? '×' : '☰'}</span></button>
        </div>
      </div>
      {open && <div id="site-explore" className={styles.explore}>
        <nav aria-label={labels.ariaOpenMenu}>
          {primary.map(([href, label]) => <Link className={styles.mobilePrimary} key={href} href={href} onClick={() => setOpen(false)}>{label}<span>↗</span></Link>)}
          {secondary.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}<span>↗</span></Link>)}
        </nav>
        <div className={styles.socials}>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram ↗</a>
          <a href={TIKTOK_URL} target="_blank" rel="noreferrer">TikTok ↗</a>
          <a href={FACEBOOK_URL} target="_blank" rel="noreferrer">Facebook ↗</a>
        </div>
      </div>}
    </header>
  );
}
