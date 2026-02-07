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

  // SEO pages
  mysteryBox: string;
  lostParcels: string;
  lostParcelsSale?: string; // IT-only extra label

  // Legal
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

const FOOTER_LABELS: Record<Lang, Labels> = {
  it: {
    menu: "Menu",
    seoHub: "Risorse & Guide",
    legal: "Legale",

    products: "Prodotti",
    how: "Come funziona",
    about: "Chi siamo",
    contact: "Contatti",

    faq: "FAQ",
    blog: "Blog",
    press: "Press",
    events: "Eventi",

    // SEO pages
    mysteryBox: "Mystery Box (guida)",
    lostParcels: "Pacchi Smarriti",
    lostParcelsSale: "Vendita Pacchi Smarriti",

    privacy: "Privacy",
    terms: "Termini",
    returns: "Resi",
    shipping: "Spedizioni",

    newsletterTitle: "Iscriviti alla nostra newsletter",
    rights: (y) => `© ${y} KiloMystery — Tutti i diritti riservati`,
  },

  en: {
    menu: "Menu",
    seoHub: "Guides",
    legal: "Legal",

    products: "Products",
    how: "How it works",
    about: "About us",
    contact: "Contact",

    faq: "FAQ",
    blog: "Blog",
    press: "Press",
    events: "Events",

    mysteryBox: "Mystery Box (guide)",
    lostParcels: "Lost Parcels",

    privacy: "Privacy",
    terms: "Terms",
    returns: "Returns",
    shipping: "Shipping",

    newsletterTitle: "Sign up to our newsletter",
    rights: (y) => `© ${y} KiloMystery — All rights reserved`,
  },

  es: {
    menu: "Menú",
    seoHub: "Guías",
    legal: "Legal",

    products: "Productos",
    how: "Cómo funciona",
    about: "Quiénes somos",
    contact: "Contacto",

    faq: "FAQ",
    blog: "Blog",
    press: "Prensa",
    events: "Eventos",

    mysteryBox: "Mystery Box (guía)",
    lostParcels: "Paquetes perdidos",

    privacy: "Privacidad",
    terms: "Términos",
    returns: "Devoluciones",
    shipping: "Envíos",

    newsletterTitle: "Suscríbete a nuestra newsletter",
    rights: (y) => `© ${y} KiloMystery — Todos los derechos reservados`,
  },

  fr: {
    menu: "Menu",
    seoHub: "Guides",
    legal: "Mentions légales",

    products: "Produits",
    how: "Comment ça marche",
    about: "À propos",
    contact: "Contact",

    faq: "FAQ",
    blog: "Blog",
    press: "Presse",
    events: "Événements",

    mysteryBox: "Mystery Box (guide)",
    lostParcels: "Colis perdus",

    privacy: "Confidentialité",
    terms: "Conditions",
    returns: "Retours",
    shipping: "Livraisons",

    newsletterTitle: "Inscris-toi à notre newsletter",
    rights: (y) => `© ${y} KiloMystery — Tous droits réservés`,
  },

  de: {
    menu: "Menü",
    seoHub: "Guides",
    legal: "Rechtliches",

    products: "Produkte",
    how: "So funktioniert’s",
    about: "Über uns",
    contact: "Kontakt",

    faq: "FAQ",
    blog: "Blog",
    press: "Presse",
    events: "Events",

    mysteryBox: "Mystery Box (Guide)",
    lostParcels: "Verlorene Pakete",

    privacy: "Datenschutz",
    terms: "AGB",
    returns: "Rückgaben",
    shipping: "Versand",

    newsletterTitle: "Melde dich zu unserem Newsletter an",
    rights: (y) => `© ${y} KiloMystery — Alle Rechte vorbehalten`,
  },
};

function safePath(lang: Lang, slug: string) {
  const clean = slug.startsWith("/") ? slug : `/${slug}`;
  return `/${lang}${clean}`.replace(/\/{2,}/g, "/");
}

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
    <footer className="relative mt-16 border-t border-white/10 bg-gradient-to-b from-[#05070b] via-[#05070b] to-[#020308]">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#7A20FF] via-emerald-300/80 to-[#20D27A]" />

      <div className="container py-10 relative z-10">
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={base} prefetch={false} className="inline-flex items-center group">
            <div className="relative h-9 w-9 rounded-2xl bg-gradient-to-br from-[#7A20FF] via-[#4c1d95] to-[#20D27A] p-[1px] shadow-[0_0_25px_rgba(122,32,255,0.45)]">
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
            <span className="ml-2 text-sm font-semibold tracking-[0.18em] uppercase text-white/60 group-hover:text-white transition">
              KILOMYSTERY
            </span>
          </Link>
        </div>

        {/* NEWSLETTER */}
        <section className="mb-10 rounded-2xl border border-white/10 bg-gradient-to-tr from-white/[0.03] via-[#111827]/60 to-white/[0.06] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.75)]">
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
              {L.newsletterTitle}
            </span>
          </h3>

          <div className="mt-4">
            <NewsletterForm lang={lang} />
          </div>
        </section>

        {/* COLONNE LINK */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Menu */}
          <nav aria-label="Menu">
            <h4 className="footer-heading mb-3 text-lg font-extrabold tracking-tight text-white">
              {L.menu}
            </h4>

            <ul className="space-y-2">
              <li>
                <Link href={safePath(lang, "/products")} prefetch={false} className="footer-link">
                  {L.products}
                </Link>
              </li>
              <li>
                <Link href={safePath(lang, "/how-it-works")} prefetch={false} className="footer-link">
                  {L.how}
                </Link>
              </li>
              <li>
                <Link href={safePath(lang, "/faq")} prefetch={false} className="footer-link">
                  {L.faq}
                </Link>
              </li>
              <li>
                <Link href={safePath(lang, "/blog")} prefetch={false} className="footer-link">
                  {L.blog}
                </Link>
              </li>
              <li>
                <Link href={safePath(lang, "/press")} prefetch={false} className="footer-link">
                  {L.press}
                </Link>
              </li>
              <li>
                <Link href={safePath(lang, "/events")} prefetch={false} className="footer-link">
                  {L.events}
                </Link>
              </li>
              <li>
                <Link href={safePath(lang, "/about")} prefetch={false} className="footer-link">
                  {L.about}
                </Link>
              </li>
              <li>
                <Link href={safePath(lang, "/contact")} prefetch={false} className="footer-link">
                  {L.contact}
                </Link>
              </li>
            </ul>
          </nav>

          {/* SEO HUB: link contestuali (sitewide) */}
          <nav aria-label="SEO hub">
            <h4 className="footer-heading mb-3 text-lg font-extrabold tracking-tight text-white">
              {L.seoHub}
            </h4>

            <ul className="space-y-2">
              <li>
                <Link href={safePath(lang, "/mystery-box")} prefetch={false} className="footer-link">
                  {L.mysteryBox}
                </Link>
              </li>

              {/* ✅ Pacchi smarriti: doppio anchor-text in IT per spingere “vendita” senza cambiare URL */}
              <li>
                <Link href={safePath(lang, "/pacchi-smarriti")} prefetch={false} className="footer-link">
                  {L.lostParcels}
                </Link>
              </li>

              {lang === "it" ? (
                <li>
                  <Link href={safePath(lang, "/pacchi-smarriti")} prefetch={false} className="footer-link">
                    {L.lostParcelsSale || "Vendita Pacchi Smarriti"}
                  </Link>
                </li>
              ) : null}

              {/* ✅ Deep links conversione (ottimi per crawl + UX) */}
              <li>
                <Link href={safePath(lang, "/products#buy-standard-10")} prefetch={false} className="footer-link">
                  {lang === "it"
                    ? "Standard 10 kg (più richiesto)"
                    : lang === "en"
                    ? "Standard 10 kg (most popular)"
                    : lang === "es"
                    ? "Standard 10 kg (más popular)"
                    : lang === "fr"
                    ? "Standard 10 kg (le plus populaire)"
                    : "Standard 10 kg (beliebt)"}
                </Link>
              </li>

              <li>
                <Link href={safePath(lang, "/products#buy-premium-10")} prefetch={false} className="footer-link">
                  {lang === "it"
                    ? "Premium 10 kg (top)"
                    : lang === "en"
                    ? "Premium 10 kg (top)"
                    : lang === "es"
                    ? "Premium 10 kg (top)"
                    : lang === "fr"
                    ? "Premium 10 kg (top)"
                    : "Premium 10 kg (top)"}
                </Link>
              </li>

              <li>
                <Link href={safePath(lang, "/policy/shipping")} prefetch={false} className="footer-link">
                  {L.shipping}
                </Link>
              </li>
              <li>
                <Link href={safePath(lang, "/policy/returns")} prefetch={false} className="footer-link">
                  {L.returns}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legale */}
          <nav aria-label="Legale">
            <h4 className="footer-heading mb-3 text-lg font-extrabold tracking-tight text-white">
              {L.legal}
            </h4>

            <ul className="space-y-2">
              <li>
                <Link href={safePath(lang, "/policy/privacy")} prefetch={false} className="footer-link">
                  {L.privacy}
                </Link>
              </li>
              <li>
                <Link href={safePath(lang, "/policy/terms")} prefetch={false} className="footer-link">
                  {L.terms}
                </Link>
              </li>
              <li>
                <Link href={safePath(lang, "/policy/returns")} prefetch={false} className="footer-link">
                  {L.returns}
                </Link>
              </li>
              <li>
                <Link href={safePath(lang, "/policy/shipping")} prefetch={false} className="footer-link">
                  {L.shipping}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* LINEA FINALE */}
        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60 flex flex-wrap items-center gap-2">
          <span>{L.rights(year)}</span>
        </div>

        <div className="mt-3 space-y-1 text-xs text-white/50">
          <p>{COMPANY_INFO.name}</p>
          <p>{COMPANY_INFO.vat}</p>
          <p>{COMPANY_INFO.address}</p>
        </div>
      </div>

      <style jsx>{`
        .footer-heading {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .footer-heading::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -0.25rem;
          width: 42%;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, #7a20ff, #ffffff, #20d27a);
          opacity: 0.7;
        }

        .footer-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          color: rgba(255, 255, 255, 0.78);
          font-size: 0.9rem;
          position: relative;
          transition: color 0.15s ease, transform 0.15s ease, text-shadow 0.15s ease;
        }
        .footer-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -0.18rem;
          width: 0;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, #7a20ff, #ffffff, #20d27a);
          opacity: 0;
          transition: width 0.18s ease, opacity 0.18s ease;
        }
        .footer-link:hover {
          color: #ffffff;
          transform: translateX(2px);
          text-shadow: 0 0 12px rgba(255, 255, 255, 0.18);
        }
        .footer-link:hover::after {
          opacity: 1;
          width: 100%;
        }
      `}</style>
    </footer>
  );
}
