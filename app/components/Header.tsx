// app/components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CartIcon from "@/app/components/cart/CartIcon";

type Lang = "it" | "en" | "es" | "fr" | "de";
const SUPPORTED: Lang[] = ["it", "en", "es", "fr", "de"];

const INSTAGRAM_URL = "https://www.instagram.com/kilo.mystery/";
const TIKTOK_URL = "https://www.tiktok.com/@kilomystery";

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
  const [open, setOpen] = useState(false);
  const [openLang, setOpenLang] = useState(false);

  const currentLang: Lang = SUPPORTED.includes(lang) ? lang : "it";
  const labels = HEADER_LABELS[currentLang];

  const langLinks = useMemo(() => {
    const safePath = pathname || `/${currentLang}`;
    const out: Record<Lang, string> = {} as any;
    for (const l of SUPPORTED) out[l] = replaceLang(safePath, l);
    return out;
  }, [pathname, currentLang]);

  useEffect(() => {
    setOpen(false);
    setOpenLang(false);
  }, [pathname]);

  return (
    <header className="site-header sticky top-0 z-40 bg-[#0f1216cc] backdrop-blur border-b border-[var(--border)]">
      <div className="container h-16 flex items-center justify-between gap-3">
        {/* LOGO */}
        <Link href={`/${currentLang}`} className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Kilomistery"
            width={80}
            height={80}
            priority
          />
        </Link>

        {/* NAV DESKTOP */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href={`/${currentLang}/products`} className="nav-btn">
            {labels.navProducts}
          </Link>
          <Link href={`/${currentLang}/how-it-works`} className="nav-btn">
            {labels.navHow}
          </Link>
          <Link href={`/${currentLang}/about`} className="nav-btn">
            {labels.navAbout}
          </Link>
          <Link href={`/${currentLang}/events`} className="nav-btn">
            {labels.navEvents}
          </Link>

          {/* SOCIAL + CARRELLO DESKTOP */}
          <div className="flex items-center gap-3 pl-2">
            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={labels.ariaInstagram}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                />
                <path
                  d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={labels.ariaTikTokDesktop}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/5 hover:bg-white/10 transition"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 text-white"
              >
                <path
                  d="M15.5 5.2c.6.7 1.4 1.3 2.3 1.7.3.1.6.2.9.2v2.2a5.5 5.5 0 0 1-3.2-1.1v5.6A4.9 4.9 0 0 1 10.6 18 4.4 4.4 0 0 1 6 13.6 4.5 4.5 0 0 1 10.5 9h.3v2.3h-.3a2.2 2.2 0 1 0 2.2 2.2V4.5h2.8v.7Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            {/* CARRELLO DESKTOP */}
            <CartIcon lang={currentLang} />
          </div>

          {/* LANG DROPDOWN */}
          <div className="relative">
            <button
              className="lang-btn"
              onClick={() => setOpenLang(!openLang)}
              aria-haspopup="listbox"
              aria-expanded={openLang}
            >
              <span>{LANGS.find((l) => l.code === currentLang)?.flag}</span>
              <span className="font-semibold">
                {currentLang.toUpperCase()}
              </span>
              <span className="i-caret">▾</span>
            </button>

            {openLang && (
              <ul
                role="listbox"
                className="dropdown-menu right open absolute top-full mt-2 right-0 z-50 min-w-[140px] rounded-xl border border-white/15 bg-[#05070b] shadow-[0_18px_45px_rgba(0,0,0,.55)] py-1"
              >
                {LANGS.map((l) => (
                  <li key={l.code}>
                    <Link
                      role="option"
                      aria-selected={l.code === currentLang}
                      href={langLinks[l.code]}
                      className="dropdown-item w-full flex items-center gap-2 px-3 py-1.5"
                      onClick={() => setOpenLang(false)}
                    >
                      <span className="text-lg leading-none">{l.flag}</span>
                      <span className="font-semibold">{l.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        {/* DESTRA MOBILE: carrello + burger */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Carrello mobile SEMPRE visibile */}
          <CartIcon
            lang={currentLang}
            className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition"
          />

          {/* HAMBURGER */}
          <button
            aria-label={labels.ariaOpenMenu}
            className="rounded-xl border border-[var(--border)] p-2"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="text-xl leading-none">≡</span>
          </button>
        </div>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[#0f1216]">
          <div className="container py-3 flex flex-col gap-3">
            <Link
              href={`/${currentLang}/products`}
              className="dropdown-item"
              onClick={() => setOpen(false)}
            >
              {labels.navProducts}
            </Link>
            <Link
              href={`/${currentLang}/how-it-works`}
              className="dropdown-item"
              onClick={() => setOpen(false)}
            >
              {labels.navHow}
            </Link>
            <Link
              href={`/${currentLang}/about`}
              className="dropdown-item"
              onClick={() => setOpen(false)}
            >
              {labels.navAbout}
            </Link>
            <Link
              href={`/${currentLang}/events`}
              className="dropdown-item"
              onClick={() => setOpen(false)}
            >
              {labels.navEvents}
            </Link>

            {/* SOCIAL ICONS MOBILE */}
            <div className="flex items-center gap-4 mt-3 px-1">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={labels.ariaInstagram}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-white"
                  aria-hidden="true"
                >
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  />
                  <path
                    d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>

              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={labels.ariaTikTokMobile}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-white"
                  aria-hidden="true"
                >
                  <path
                    d="M12.5 3a5 5 0 0 0 5 5h1v3.5a8.5 8.5 0 1 1-8.5-8.5z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>

            {/* Lingue mobile */}
            <div className="mt-2 grid grid-cols-5 gap-1 px-1">
              {LANGS.map((l) => (
                <Link
                  key={l.code}
                  href={langLinks[l.code]}
                  className="dropdown-item flex items-center justify-center gap-1"
                  onClick={() => setOpen(false)}
                >
                  <span>{l.flag}</span>
                  <span className="font-semibold">{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
