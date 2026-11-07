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
    <footer className="km-footer">

      <div className="container py-12 relative z-10">
        <Link href={base} prefetch={false} className="km-footer-brand">
          <Image src="/logo.svg" alt="" width={65} height={40} />
          <span>KiloMystery</span>
        </Link>

        <section className="km-footer-newsletter">
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
            <span className="text-inherit">
              {L.newsletterTitle}
            </span>
          </h3>

          <div className="mt-4">
            <NewsletterForm lang={lang} />
          </div>
        </section>

        <div className="grid gap-10 md:grid-cols-3">
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

              <li>
                <Link href={safePath(lang, "/pacchi-non-reclamati")} className="footer-link">
                  {lang === "it"
                    ? "Pacchi Non Reclamati"
                    : lang === "en"
                    ? "Unclaimed Parcels"
                    : lang === "es"
                    ? "Paquetes no reclamados"
                    : lang === "fr"
                    ? "Colis non réclamés"
                    : "Nicht abgeholte Pakete"}
                </Link>
              </li>

              <li>
                <Link href={safePath(lang, "/resi-ecommerce")} className="footer-link">
                  {lang === "it"
                    ? "Resi Ecommerce"
                    : lang === "en"
                    ? "Ecommerce Returns"
                    : lang === "es"
                    ? "Devoluciones ecommerce"
                    : lang === "fr"
                    ? "Retours ecommerce"
                    : "E-Commerce-Retouren"}
                </Link>
              </li>

              <li>
                <Link href={safePath(lang, "/giacenze-ecommerce")} className="footer-link">
                  {lang === "it"
                    ? "Giacenze Ecommerce"
                    : lang === "en"
                    ? "Ecommerce Overstock"
                    : lang === "es"
                    ? "Stock ecommerce"
                    : lang === "fr"
                    ? "Stocks ecommerce"
                    : "E-Commerce-Lagerbestände"}
                </Link>
              </li>

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

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-white/60">
          <p>{L.rights(year)}</p>

          <div className="mt-2 text-xs text-white/45 space-y-1">
            <p>{COMPANY_INFO.name}</p>
            <p>{COMPANY_INFO.vat}</p>
            <p>{COMPANY_INFO.address}</p>
          </div>
        </div>
      </div>


    </footer>
  );
}