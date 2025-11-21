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

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="site-header sticky top-0 z-40 border-b border-white/10 bg-gradient-to-b from-[#080b11]/95 via-[#05070b]/95 to-[#05070b]/90 backdrop-blur-xl">
      {/* barra glow sottile */}
      <div className="h-[1px] w-full bg-gradient-to-r from-[#7A20FF] via-emerald-400/70 to-[#20D27A]" />

      <div className="container h-16 flex items-center justify-between gap-3">
        {/* LOGO */}
        <Link
          href={`/${currentLang}`}
          className="flex items-center gap-3 group"
        >
          <div className="relative h-9 w-9 rounded-2xl bg-gradient-to-br from-[#7A20FF] via-[#4c1d95] to-[#20D27A] p-[1px] shadow-[0_0_25px_rgba(122,32,255,0.45)]">
            <div className="h-full w-full rounded-2xl bg-[#05070b] flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="Kilomistery"
                width={80}
                height={80}
                className="h-6 w-auto"
                priority
              />
            </div>
          </div>
          <span className="hidden sm:block text-sm font-semibold tracking-[0.18em] uppercase text-white/70 group-hover:text-white transition">
            KILOMYSTERY
          </span>
        </Link>

        {/* NAV DESKTOP */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href={`/${currentLang}/products`}
            className={`nav-btn relative text-sm font-semibold px-3 py-1.5 rounded-full transition ${
              isActive(`/${currentLang}/products`)
                ? "text-white bg-white/10"
                : "text-white/75 hover:text-white hover:bg-white/5"
            }`}
          >
            {labels.navProducts}
          </Link>
          <Link
            href={`/${currentLang}/how-it-works`}
            className={`nav-btn relative text-sm font-semibold px-3 py-1.5 rounded-full transition ${
              isActive(`/${currentLang}/how-it-works`)
                ? "text-white bg-white/10"
                : "text-white/75 hover:text-white hover:bg-white/5"
            }`}
          >
            {labels.navHow}
          </Link>
          <Link
            href={`/${currentLang}/about`}
            className={`nav-btn relative text-sm font-semibold px-3 py-1.5 rounded-full transition ${
              isActive(`/${currentLang}/about`)
                ? "text-white bg-white/10"
                : "text-white/75 hover:text-white hover:bg-white/5"
            }`}
          >
            {labels.navAbout}
          </Link>
          <Link
            href={`/${currentLang}/events`}
            className={`nav-btn relative text-sm font-semibold px-3 py-1.5 rounded-full transition ${
              isActive(`/${currentLang}/events`)
                ? "text-white bg-white/10"
                : "text-white/75 hover:text-white hover:bg-white/5"
            }`}
          >
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
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/40 transition shadow-[0_0_18px_rgba(15,23,42,0.8)]"
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/40 transition shadow-[0_0_18px_rgba(15,23,42,0.8)]"
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
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 hover:border-white/40 transition shadow-[0_0_18px_rgba(15,23,42,0.8)]"
              onClick={() => setOpenLang(!openLang)}
              aria-haspopup="listbox"
              aria-expanded={openLang}
            >
              <span>{LANGS.find((l) => l.code === currentLang)?.flag}</span>
              <span className="font-semibold">
                {currentLang.toUpperCase()}
              </span>
              <span className="text-[10px] opacity-70">▾</span>
            </button>

            {openLang && (
              <ul
                role="listbox"
                className="dropdown-menu right open absolute top-full mt-2 right-0 z-50 min-w-[150px] rounded-2xl border border-white/15 bg-[#05070b]/95 shadow-[0_18px_45px_rgba(0,0,0,.75)] py-1 backdrop-blur-xl"
              >
                {LANGS.map((l) => (
                  <li key={l.code}>
                    <Link
                      role="option"
                      aria-selected={l.code === currentLang}
                      href={langLinks[l.code]}
                      className={`dropdown-item w-full flex items-center gap-2 px-3 py-1.5 text-sm ${
                        l.code === currentLang
                          ? "bg-white/10 text-white"
                          : "text-white/75 hover:bg-white/5 hover:text-white"
                      }`}
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
            className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition shadow-[0_0_18px_rgba(0,0,0,0.7)]"
          />

          {/* HAMBURGER */}
          <button
            aria-label={labels.ariaOpenMenu}
            className="rounded-xl border border-white/20 bg-white/5 p-2 hover:bg-white/10 hover:border-white/40 transition shadow-[0_0_18px_rgba(0,0,0,0.7)]"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="text-xl leading-none text-white">≡</span>
          </button>
        </div>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-gradient-to-b from-[#05070b] to-[#020308]">
          <div className="container py-3 flex flex-col gap-3">
            <Link
              href={`/${currentLang}/products`}
              className="dropdown-item text-sm rounded-lg px-3 py-2 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition"
              onClick={() => setOpen(false)}
            >
              {labels.navProducts}
            </Link>
            <Link
              href={`/${currentLang}/how-it-works`}
              className="dropdown-item text-sm rounded-lg px-3 py-2 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition"
              onClick={() => setOpen(false)}
            >
              {labels.navHow}
            </Link>
            <Link
              href={`/${currentLang}/about`}
              className="dropdown-item text-sm rounded-lg px-3 py-2 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition"
              onClick={() => setOpen(false)}
            >
              {labels.navAbout}
            </Link>
            <Link
              href={`/${currentLang}/events`}
              className="dropdown-item text-sm rounded-lg px-3 py-2 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition"
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
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition"
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
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition"
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
                  className={`dropdown-item flex items-center justify-center gap-1 rounded-lg px-2 py-1 text-xs ${
                    l.code === currentLang
                      ? "bg-white/10 text-white"
                      : "text-white/75 hover:bg-white/5 hover:text-white"
                  }`}
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
