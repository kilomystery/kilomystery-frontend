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
    <footer className="mt-16 border-t border-[var(--border)] bg-[#0b0f14]">
      <div className="container py-10">
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={base}
            prefetch={false}
            className="inline-flex items-center"
          >
            <Image
              src="/logo.svg"
              alt="KiloMistery"
              width={140}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* NEWSLETTER */}
        <section className="mb-10 rounded-2xl border border-white/10 bg-gradient-to-tr from-white/[0.02] to-white/[0.04] p-5 shadow-inner">
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
            {L.newsletterTitle}
          </h3>

          <div className="mt-4">
            <NewsletterForm lang={lang} />
          </div>
        </section>

        {/* COLONNE LINK */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Menu */}
          <nav aria-label="Menu">
            <h4 className="mb-3 text-lg font-extrabold tracking-tight">
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
            <h4 className="mb-3 text-lg font-extrabold tracking-tight">
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
        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60">
          {L.rights(year)}
        </div>
      </div>

      <style jsx>{`
        .footer-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          color: rgba(255, 255, 255, 0.8);
          transition: color 0.15s ease, transform 0.15s ease,
            text-shadow 0.15s ease;
        }
        .footer-link:hover {
          color: #fff;
          text-decoration: underline;
          text-underline-offset: 3px;
          transform: translateX(1px);
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </footer>
  );
}
