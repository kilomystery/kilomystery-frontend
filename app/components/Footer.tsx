// app/components/Footer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "./NewsletterForm";

type Lang = "it" | "en" | "es" | "fr" | "de";

type Labels = {
  menu: string;
  seoHub: string;
  legal: string;

  products: string;
  how: string;
  about: string;
  contact: string;

  faq: string;
  blog: string;
  press: string;
  events: string;

  mysteryBox: string;
  lostParcels: string;
  lostParcelsSale?: string;

  privacy: string;
  terms: string;
  returns: string;
  shipping: string;

  newsletterTitle: string;
  rights: (year: number) => string;
};

const COMPANY_INFO = {
  name: "Kilo Mystery SRLS",
  vat: "P.IVA / C.F. 027945505745",
  address: "Sede legale: Piazza Alessandro Romano 11, 72023 Mesagne (BR) – Italia",
};

/* =========================
   LABELS
========================= */

const FOOTER_LABELS: Record<Lang, Labels> = {
  it: {
    menu: "Menu",
    seoHub: "Guide & Risorse Premium",
    legal: "Legale",

    products: "Prodotti",
    how: "Come funziona",
    about: "Chi siamo",
    contact: "Contatti",

    faq: "FAQ",
    blog: "Blog",
    press: "Press",
    events: "Eventi",

    mysteryBox: "Guida Mystery Box",
    lostParcels: "Pacchi Smarriti",
    lostParcelsSale: "Vendita Pacchi Smarriti",

    privacy: "Privacy",
    terms: "Termini",
    returns: "Resi",
    shipping: "Spedizioni",

    newsletterTitle: "Accedi alle offerte riservate",
    rights: (y) => `© ${y} KiloMystery — Tutti i diritti riservati`,
  },

  en: {
    menu: "Menu",
    seoHub: "Premium Guides",
    legal: "Legal",

    products: "Products",
    how: "How it works",
    about: "About us",
    contact: "Contact",

    faq: "FAQ",
    blog: "Blog",
    press: "Press",
    events: "Events",

    mysteryBox: "Mystery Box Guide",
    lostParcels: "Lost Parcels",

    privacy: "Privacy",
    terms: "Terms",
    returns: "Returns",
    shipping: "Shipping",

    newsletterTitle: "Access exclusive offers",
    rights: (y) => `© ${y} KiloMystery — All rights reserved`,
  },

  es: {
    menu: "Menú",
    seoHub: "Guías Premium",
    legal: "Legal",

    products: "Productos",
    how: "Cómo funciona",
    about: "Quiénes somos",
    contact: "Contacto",

    faq: "FAQ",
    blog: "Blog",
    press: "Prensa",
    events: "Eventos",

    mysteryBox: "Guía Mystery Box",
    lostParcels: "Paquetes perdidos",

    privacy: "Privacidad",
    terms: "Términos",
    returns: "Devoluciones",
    shipping: "Envíos",

    newsletterTitle: "Accede a ofertas exclusivas",
    rights: (y) => `© ${y} KiloMystery — Todos los derechos reservados`,
  },

  fr: {
    menu: "Menu",
    seoHub: "Guides Premium",
    legal: "Mentions légales",

    products: "Produits",
    how: "Comment ça marche",
    about: "À propos",
    contact: "Contact",

    faq: "FAQ",
    blog: "Blog",
    press: "Presse",
    events: "Événements",

    mysteryBox: "Guide Mystery Box",
    lostParcels: "Colis perdus",

    privacy: "Confidentialité",
    terms: "Conditions",
    returns: "Retours",
    shipping: "Livraisons",

    newsletterTitle: "Accès aux offres exclusives",
    rights: (y) => `© ${y} KiloMystery — Tous droits réservés`,
  },

  de: {
    menu: "Menü",
    seoHub: "Premium Guides",
    legal: "Rechtliches",

    products: "Produkte",
    how: "So funktioniert’s",
    about: "Über uns",
    contact: "Kontakt",

    faq: "FAQ",
    blog: "Blog",
    press: "Presse",
    events: "Events",

    mysteryBox: "Mystery Box Guide",
    lostParcels: "Verlorene Pakete",

    privacy: "Datenschutz",
    terms: "AGB",
    returns: "Rückgaben",
    shipping: "Versand",

    newsletterTitle: "Exklusive Angebote erhalten",
    rights: (y) => `© ${y} KiloMystery — Alle Rechte vorbehalten`,
  },
};

function safePath(lang: Lang, slug: string) {
  const clean = slug.startsWith("/") ? slug : `/${slug}`;
  return `/${lang}${clean}`.replace(/\/{2,}/g, "/");
}

/* =========================
   COMPONENT
========================= */

export default function Footer({
  lang = "it" as Lang,
  labels,
}: {
  lang?: Lang;
  labels?: Partial<Labels>;
}) {
  const baseLabels = FOOTER_LABELS[lang] ?? FOOTER_LABELS.it;
  const L: Labels = { ...baseLabels, ...(labels || {}) };
  const base = `/${lang}`;
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-white/10 bg-gradient-to-b from-[#05070b] via-[#05070b] to-[#020308]">

      {/* TOP GLOW */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#7A20FF] via-emerald-300/80 to-[#20D27A]" />

      <div className="container py-12 relative z-10">

        {/* BRAND */}
        <div className="flex items-center gap-3 mb-8">
          <Link href={base} prefetch={false} className="inline-flex items-center group">

            <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7A20FF] via-[#4c1d95] to-[#20D27A] p-[1px] shadow-[0_0_30px_rgba(122,32,255,0.5)]">

              <div className="h-full w-full rounded-2xl bg-[#05070b] flex items-center justify-center">
                <Image
                  src="/logo.svg"
                  alt="KiloMystery"
                  width={140}
                  height={40}
                  className="h-6 w-auto"
                  priority
                />
              </div>

            </div>

            <span className="ml-2 text-sm font-semibold tracking-[0.22em] uppercase text-white/60 group-hover:text-white transition">
              KILOMYSTERY
            </span>

          </Link>
        </div>

        {/* NEWSLETTER */}
        <section className="mb-12 rounded-2xl border border-white/10 bg-gradient-to-tr from-white/[0.04] via-[#111827]/70 to-white/[0.06] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)]">

          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
              {L.newsletterTitle}
            </span>
          </h3>

          <div className="mt-4">
            <NewsletterForm lang={lang} />
          </div>

        </section>

        {/* LINKS GRID */}
        <div className="grid gap-10 md:grid-cols-3">

          {/* MENU */}
          <nav aria-label="Menu">
            <h4 className="footer-heading">{L.menu}</h4>

            <ul className="space-y-2">
              {[
                ["/products", L.products],
                ["/how-it-works", L.how],
                ["/faq", L.faq],
                ["/blog", L.blog],
                ["/press", L.press],
                ["/events", L.events],
                ["/about", L.about],
                ["/contact", L.contact],
              ].map(([url, label]) => (
                <li key={url}>
                  <Link href={safePath(lang, url)} prefetch={false} className="footer-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* SEO HUB */}
          <nav aria-label="SEO hub">
            <h4 className="footer-heading">{L.seoHub}</h4>

            <ul className="space-y-2">

              <li>
                <Link href={safePath(lang, "/mystery-box")} className="footer-link">
                  {L.mysteryBox}
                </Link>
              </li>

              <li>
                <Link href={safePath(lang, "/pacchi-smarriti")} className="footer-link">
                  {L.lostParcels}
                </Link>
              </li>

              {lang === "it" && (
                <li>
                  <Link href={safePath(lang, "/pacchi-smarriti")} className="footer-link">
                    {L.lostParcelsSale}
                  </Link>
                </li>
              )}

              {/* POSTE */}
              <li>
                <Link href={safePath(lang, "/pacchi-smarriti-poste")} className="footer-link">
                  {lang === "it"
                    ? "Pacchi Smarriti Poste"
                    : lang === "en"
                    ? "Lost Postal Parcels"
                    : lang === "es"
                    ? "Paquetes perdidos correos"
                    : lang === "fr"
                    ? "Colis perdus poste"
                    : "Verlorene Postpakete"}
                </Link>
              </li>

              {/* AMAZON */}
              <li>
                <Link href={safePath(lang, "/pacchi-smarriti-amazon")} className="footer-link">
                  {lang === "it"
                    ? "Pacchi Smarriti Amazon"
                    : lang === "en"
                    ? "Amazon Return Parcels"
                    : lang === "es"
                    ? "Paquetes Amazon devueltos"
                    : lang === "fr"
                    ? "Retours Amazon"
                    : "Amazon Rücksendungen"}
                </Link>
              </li>

              <li>
                <Link href={safePath(lang, "/products#buy-standard-10")} className="footer-link">
                  Standard 10 kg
                </Link>
              </li>

              <li>
                <Link href={safePath(lang, "/products#buy-premium-10")} className="footer-link">
                  Premium 10 kg
                </Link>
              </li>

            </ul>
          </nav>

          {/* LEGAL */}
          <nav aria-label="Legal">
            <h4 className="footer-heading">{L.legal}</h4>

            <ul className="space-y-2">
              {[
                ["/policy/privacy", L.privacy],
                ["/policy/terms", L.terms],
                ["/policy/returns", L.returns],
                ["/policy/shipping", L.shipping],
              ].map(([url, label]) => (
                <li key={url}>
                  <Link href={safePath(lang, url)} className="footer-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

        </div>

        {/* FOOTER BOTTOM */}
        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-white/60">
          <p>{L.rights(year)}</p>

          <div className="mt-2 text-xs text-white/45 space-y-1">
            <p>{COMPANY_INFO.name}</p>
            <p>{COMPANY_INFO.vat}</p>
            <p>{COMPANY_INFO.address}</p>
          </div>
        </div>

      </div>

      {/* STYLES */}
      <style jsx>{`
        .footer-heading {
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          position: relative;
        }

        .footer-heading::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -0.3rem;
          width: 36%;
          height: 2px;
          background: linear-gradient(90deg, #7a20ff, #fff, #20d27a);
          opacity: 0.7;
          border-radius: 999px;
        }

        .footer-link {
          color: rgba(255,255,255,0.78);
          font-size: 0.9rem;
          position: relative;
          transition: all .18s ease;
        }

        .footer-link:hover {
          color: #fff;
          transform: translateX(2px);
          text-shadow: 0 0 14px rgba(255,255,255,0.2);
        }
      `}</style>

    </footer>
  );
}
