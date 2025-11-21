// app/components/Footer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "./NewsletterForm";

type Lang = "it" | "en" | "es" | "fr" | "de";

type Labels = {
  menu: string;
  legal: string;
  products: string;
  how: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
  returns: string;
  shipping: string;
  newsletterTitle: string;
  rights: (year: number) => string;
};

const FOOTER_LABELS: Record<Lang, Labels> = {
  it: {
    menu: "Menu",
    legal: "Legale",
    products: "Prodotti",
    how: "Come funziona",
    about: "Chi siamo",
    contact: "Contatti",
    privacy: "Privacy",
    terms: "Termini",
    returns: "Resi",
    shipping: "Spedizioni",
    newsletterTitle: "Iscriviti alla nostra newsletter",
    rights: (y) => `© ${y} KiloMistery — Tutti i diritti riservati`,
  },
  en: {
    menu: "Menu",
    legal: "Legal",
    products: "Products",
    how: "How it works",
    about: "About us",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    returns: "Returns",
    shipping: "Shipping",
    newsletterTitle: "Sign up to our newsletter",
    rights: (y) => `© ${y} KiloMistery — All rights reserved`,
  },
  es: {
    menu: "Menú",
    legal: "Legal",
    products: "Productos",
    how: "Cómo funciona",
    about: "Quiénes somos",
    contact: "Contacto",
    privacy: "Privacidad",
    terms: "Términos",
    returns: "Devoluciones",
    shipping: "Envíos",
    newsletterTitle: "Suscríbete a nuestra newsletter",
    rights: (y) => `© ${y} KiloMistery — Todos los derechos reservados`,
  },
  fr: {
    menu: "Menu",
    legal: "Mentions légales",
    products: "Produits",
    how: "Comment ça marche",
    about: "À propos",
    contact: "Contact",
    privacy: "Confidentialité",
    terms: "Conditions",
    returns: "Retours",
    shipping: "Livraisons",
    newsletterTitle: "Inscris-toi à notre newsletter",
    rights: (y) =>
      `© ${y} KiloMistery — Tous droits réservés`,
  },
  de: {
    menu: "Menü",
    legal: "Rechtliches",
    products: "Produkte",
    how: "So funktioniert’s",
    about: "Über uns",
    contact: "Kontakt",
    privacy: "Datenschutz",
    terms: "AGB",
    returns: "Rückgaben",
    shipping: "Versand",
    newsletterTitle:
      "Melde dich zu unserem Newsletter an",
    rights: (y) =>
      `© ${y} KiloMistery — Alle Rechte vorbehalten`,
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
      {/* linea glow in alto */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#7A20FF] via-emerald-300/80 to-[#20D27A]" />

      <div className="container py-10 relative z-10">
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={base}
            prefetch={false}
            className="inline-flex items-center group"
          >
            <div className="relative h-9 w-9 rounded-2xl bg-gradient-to-br from-[#7A20FF] via-[#4c1d95] to-[#20D27A] p-[1px] shadow-[0_0_25px_rgba(122,32,255,0.45)]">
              <div className="h-full w-full rounded-2xl bg-[#05070b] flex items-center justify-center">
                <Image
                  src="/logo.svg"
                  alt="KiloMistery"
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
        <div className="grid gap-8 md:grid-cols-2">
          {/* Menu */}
          <nav aria-label="Menu">
            <h4 className="mb-3 text-lg font-extrabold tracking-tight text-white">
              {L.menu}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={safePath(lang, "/products")}
                  prefetch={false}
                  className="footer-link"
                >
                  {L.products}
                </Link>
              </li>
              <li>
                <Link
                  href={safePath(lang, "/how-it-works")}
                  prefetch={false}
                  className="footer-link"
                >
                  {L.how}
                </Link>
              </li>
              <li>
                <Link
                  href={safePath(lang, "/about")}
                  prefetch={false}
                  className="footer-link"
                >
                  {L.about}
                </Link>
              </li>
              <li>
                <Link
                  href={safePath(lang, "/contact")}
                  prefetch={false}
                  className="footer-link"
                >
                  {L.contact}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legale */}
          <nav aria-label="Legale">
            <h4 className="mb-3 text-lg font-extrabold tracking-tight text-white">
              {L.legal}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={safePath(lang, "/policy/privacy")}
                  prefetch={false}
                  className="footer-link"
                >
                  {L.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={safePath(lang, "/policy/terms")}
                  prefetch={false}
                  className="footer-link"
                >
                  {L.terms}
                </Link>
              </li>
              <li>
                <Link
                  href={safePath(lang, "/policy/returns")}
                  prefetch={false}
                  className="footer-link"
                >
                  {L.returns}
                </Link>
              </li>
              <li>
                <Link
                  href={safePath(lang, "/policy/shipping")}
                  prefetch={false}
                  className="footer-link"
                >
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
      </div>

      <style jsx>{`
        .footer-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          color: rgba(255, 255, 255, 0.78);
          font-size: 0.9rem;
          transition: color 0.15s ease, transform 0.15s ease,
            text-shadow 0.15s ease;
        }
        .footer-link::before {
          content: "";
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: radial-gradient(
            circle at center,
            rgba(122, 32, 255, 0.9),
            transparent
          );
          opacity: 0;
          transform: scale(0.6);
          transition: opacity 0.15s ease, transform 0.15s ease;
        }
        .footer-link:hover::before {
          opacity: 1;
          transform: scale(1);
        }
        .footer-link:hover {
          color: #fff;
          text-decoration: none;
          transform: translateX(2px);
          text-shadow: 0 0 12px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </footer>
  );
}
