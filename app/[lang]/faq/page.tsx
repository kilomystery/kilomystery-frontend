"use client";

/* eslint-disable react/no-unescaped-entities */

import { use } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import FAQ from "../../components/FAQ";
import type { Lang } from "@/i18n/lang";
import { normalizeLang } from "@/i18n/lang";

type Copy = {
  title: string;
  subtitle: string;
  intro1: string;
  intro2: string;
  ctaProducts: string;
  ctaHow: string;
  ctaContact: string;
};

const COPY: Record<Lang, Copy> = {
  it: {
    title: "FAQ — Mystery Box KiloMystery",
    subtitle: "Risposte chiare alle domande più comuni su mystery box, spedizioni e resi.",
    intro1:
      "Qui trovi tutte le risposte su come funzionano le nostre mystery box (Standard e Premium), i pesi disponibili e cosa aspettarti dall’esperienza di unboxing.",
    intro2:
      "Se cerchi “mystery box” o “scatola sorpresa” e vuoi capire bene prima di acquistare, questa pagina è fatta apposta per te.",
    ctaProducts: "Vai ai prodotti",
    ctaHow: "Come funziona",
    ctaContact: "Contattaci",
  },
  en: {
    title: "FAQ — KiloMystery Mystery Boxes",
    subtitle: "Clear answers about mystery boxes, shipping and returns.",
    intro1:
      "Here you’ll find everything you need to know about our mystery boxes (Standard & Premium), available weights and the unboxing experience.",
    intro2:
      "If you searched for “mystery box” or “surprise box” and want to understand everything before buying, this page is for you.",
    ctaProducts: "See products",
    ctaHow: "How it works",
    ctaContact: "Contact us",
  },
  es: {
    title: "FAQ — Mystery Boxes KiloMystery",
    subtitle: "Respuestas claras sobre mystery boxes, envíos y devoluciones.",
    intro1:
      "Aquí encuentras información sobre nuestras mystery boxes (Standard y Premium), pesos disponibles y la experiencia de unboxing.",
    intro2:
      "Si buscabas “mystery box” o “caja sorpresa”, esta página te ayuda a decidir antes de comprar.",
    ctaProducts: "Ver productos",
    ctaHow: "Cómo funciona",
    ctaContact: "Contacto",
  },
  fr: {
    title: "FAQ — Mystery Boxes KiloMystery",
    subtitle: "Réponses claires sur les mystery boxes, la livraison et les retours.",
    intro1:
      "Tout ce qu’il faut savoir sur nos mystery boxes (Standard & Premium), les poids disponibles et l’expérience d’unboxing.",
    intro2:
      "Si vous avez recherché “mystery box” ou “boîte surprise”, cette page vous aide avant d’acheter.",
    ctaProducts: "Voir les produits",
    ctaHow: "Comment ça marche",
    ctaContact: "Contact",
  },
  de: {
    title: "FAQ — KiloMystery Mystery Boxen",
    subtitle: "Klare Antworten zu Mystery Boxen, Versand und Rückgabe.",
    intro1:
      "Hier findest du Infos zu unseren Mystery Boxen (Standard & Premium), Gewichten und dem Unboxing-Erlebnis.",
    intro2:
      "Wenn du nach “Mystery Box” gesucht hast und erst alles verstehen willst: Diese Seite ist für dich.",
    ctaProducts: "Zu den Produkten",
    ctaHow: "So funktioniert’s",
    ctaContact: "Kontakt",
  },
};

function hrefFor(lang: Lang, path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${p}`.replace(/\/{2,}/g, "/");
}

export default function FAQPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolved = use(params);
  const lang: Lang = normalizeLang(resolved?.lang);
  const t = COPY[lang] ?? COPY.it;

  // ✅ SEO base: titolo in H1 (metadata dinamico lo possiamo fare dopo con generateMetadata)
  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 mb-16 space-y-10">
        {/* HERO / INTRO */}
        <section className="card p-6 md:p-8 space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold">{t.title}</h1>
          <p className="text-white/70">{t.subtitle}</p>

          <div className="pt-2 space-y-2 text-white/75">
            <p>{t.intro1}</p>
            <p>{t.intro2}</p>
          </div>

          {/* CTA interni (linking SEO) */}
          <div className="pt-3 flex flex-col sm:flex-row gap-2">
            <a className="btn btn-brand px-6" href={hrefFor(lang, "/products")}>
              {t.ctaProducts}
            </a>
            <a className="btn btn-ghost px-6" href={hrefFor(lang, "/how-it-works")}>
              {t.ctaHow}
            </a>
            <a className="btn btn-ghost px-6" href={hrefFor(lang, "/contact")}>
              {t.ctaContact}
            </a>
          </div>
        </section>

        {/* FAQ (con JSON-LD dentro il componente) */}
        <FAQ lang={lang} />

        {/* Sezione finale “SEO booster” */}
        <section className="card p-6 md:p-8">
          <h2 className="text-2xl font-extrabold mb-2">
            {lang === "it"
              ? "Cerchi una mystery box?"
              : lang === "en"
              ? "Looking for a mystery box?"
              : lang === "es"
              ? "¿Buscas una mystery box?"
              : lang === "fr"
              ? "Vous cherchez une mystery box ?"
              : "Suchst du eine Mystery Box?"}
          </h2>

          <p className="text-white/70">
            {lang === "it"
              ? "Scegli Standard o Premium e il peso che preferisci: 1 kg, 2 kg, 3 kg, 5 kg o 10 kg."
              : lang === "en"
              ? "Choose Standard or Premium and your preferred weight: 1 kg, 2 kg, 3 kg, 5 kg or 10 kg."
              : lang === "es"
              ? "Elige Standard o Premium y el peso: 1 kg, 2 kg, 3 kg, 5 kg o 10 kg."
              : lang === "fr"
              ? "Choisis Standard ou Premium et le poids : 1 kg, 2 kg, 3 kg, 5 kg ou 10 kg."
              : "Wähle Standard oder Premium und dein Gewicht: 1 kg, 2 kg, 3 kg, 5 kg oder 10 kg."}
          </p>

          <div className="mt-4">
            <a className="btn btn-silver px-6" href={hrefFor(lang, "/products")}>
              {lang === "it"
                ? "Scopri le mystery box"
                : lang === "en"
                ? "Explore mystery boxes"
                : lang === "es"
                ? "Ver mystery boxes"
                : lang === "fr"
                ? "Voir les mystery boxes"
                : "Mystery Boxen ansehen"}
            </a>
          </div>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
