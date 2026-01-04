"use client";

/* eslint-disable react/no-unescaped-entities */

import { useMemo } from "react";
import type { Lang } from "@/i18n/lang";

type QA = { q: string; a: React.ReactNode; aText: string }; // aText serve per JSON-LD pulito

const FAQ_COPY: Record<Lang, { title: string; items: QA[] }> = {
  it: {
    title: "FAQ — Mystery Box KiloMystery",
    items: [
      {
        q: "Cos’è una mystery box?",
        a: (
          <>
            Una <b>mystery box</b> è una scatola sorpresa: scegli il peso (1–10 kg) e la
            fascia (<b>Standard</b> o <b>Premium</b>) e ricevi un mix di prodotti non
            rivelati in anticipo. Se vuoi vedere tutte le opzioni, vai alla pagina{" "}
            <a className="underline" href="/it/products">Prodotti</a>.
          </>
        ),
        aText:
          "Una mystery box è una scatola sorpresa: scegli peso (1–10 kg) e fascia (Standard o Premium) e ricevi un mix di prodotti non rivelati in anticipo. Opzioni su /it/products.",
      },
      {
        q: "Cosa c’è dentro le mystery box?",
        a: (
          <>
            Contenuto <b>misto</b> proveniente da lotti reali (stock / resi / recupero),
            selezionato e sigillato. Il contenuto è una sorpresa:{" "}
            <b>non possiamo garantire prodotti o categorie specifiche</b>.
          </>
        ),
        aText:
          "Contenuto misto da lotti reali (stock/resi/recupero), selezionato e sigillato. Il contenuto è una sorpresa: non garantiamo prodotti o categorie specifiche.",
      },
      {
        q: "Posso scegliere la categoria dei prodotti?",
        a: (
          <>
            No: per mantenere il prezzo competitivo e l’effetto sorpresa, la selezione è
            casuale. La <b>Premium</b> ha una selezione mediamente più “spinta” rispetto
            alla Standard (non è una garanzia di singoli articoli).
          </>
        ),
        aText:
          "No: la selezione è casuale per mantenere prezzo e sorpresa. Premium è mediamente più spinta della Standard (non garantisce singoli articoli).",
      },
      {
        q: "Quali sono tempi e costi di spedizione?",
        a: (
          <>
            Spediamo con tracking. In genere consegna <b>48–72h</b> (UE, variabile in base
            alla destinazione). I dettagli completi sono nella{" "}
            <a className="underline" href="/it/policy/shipping">policy spedizioni</a>.
          </>
        ),
        aText:
          "Spediamo con tracking. In genere 48–72h (UE, variabile). Dettagli su /it/policy/shipping.",
      },
      {
        q: "Resi e rimborsi: come funziona?",
        a: (
          <>
            Le box sono vendute come <b>mystery</b> sigillate: il reso non è previsto per
            semplice cambio idea/mancato gradimento. Se il pacco arriva danneggiato,
            contattaci entro <b>48h</b> con foto. Dettagli nella{" "}
            <a className="underline" href="/it/policy/returns">policy resi</a>.
          </>
        ),
        aText:
          "Le box mystery sigillate non prevedono reso per cambio idea. Se pacco danneggiato, contattaci entro 48h con foto. Dettagli su /it/policy/returns.",
      },
      {
        q: "Standard vs Premium: qual è la differenza?",
        a: (
          <>
            Sono due fasce di selezione: <b>Standard</b> è ideale per iniziare,{" "}
            <b>Premium</b> è pensata per chi vuole un mix più ricercato. Puoi confrontarle
            direttamente in{" "}
            <a className="underline" href="/it/products">Prodotti</a>.
          </>
        ),
        aText:
          "Standard è ideale per iniziare, Premium è più ricercata. Confronto su /it/products.",
      },
    ],
  },

  en: {
    title: "FAQ — KiloMystery Mystery Boxes",
    items: [
      {
        q: "What is a mystery box?",
        a: (
          <>
            A <b>mystery box</b> is a surprise box: choose the weight (1–10 kg) and tier
            (<b>Standard</b> or <b>Premium</b>), and receive a mixed selection of items
            revealed only when you unbox. See options on{" "}
            <a className="underline" href="/en/products">Products</a>.
          </>
        ),
        aText:
          "A mystery box is a surprise box: choose weight (1–10 kg) and tier (Standard/Premium) and receive items revealed at unboxing. Options on /en/products.",
      },
      {
        q: "What’s inside the boxes?",
        a: (
          <>
            A <b>mixed</b> selection from real lots (stock / returns / recovery), picked
            and sealed. It’s a surprise:{" "}
            <b>we don’t guarantee specific items or categories</b>.
          </>
        ),
        aText:
          "Mixed selection from real lots (stock/returns/recovery), picked and sealed. No guarantee of specific items or categories.",
      },
      {
        q: "Can I choose the category?",
        a: (
          <>
            No — randomness keeps pricing competitive and preserves the surprise.{" "}
            <b>Premium</b> is generally more “curated” than Standard (not a guarantee of
            specific items).
          </>
        ),
        aText:
          "No — selection is random. Premium is generally more curated than Standard (no guarantee of specific items).",
      },
      {
        q: "Shipping times and costs?",
        a: (
          <>
            Tracked shipping across Europe. Typical delivery <b>48–72h</b> (varies by
            destination). Full details in the{" "}
            <a className="underline" href="/en/policy/shipping">shipping policy</a>.
          </>
        ),
        aText:
          "Tracked shipping across Europe. Typical 48–72h (varies). Details on /en/policy/shipping.",
      },
      {
        q: "Returns and refunds?",
        a: (
          <>
            Boxes are sealed <b>mystery</b> products: returns aren’t available for “change
            of mind”. If the parcel arrives damaged, contact us within <b>48h</b> with
            photos. See{" "}
            <a className="underline" href="/en/policy/returns">returns policy</a>.
          </>
        ),
        aText:
          "Sealed mystery products: no returns for change of mind. Damaged parcel: contact within 48h with photos. Details on /en/policy/returns.",
      },
    ],
  },

  // Versioni brevi per ES/FR/DE (puoi espanderle uguale a IT/EN)
  es: {
    title: "FAQ — Mystery Boxes KiloMystery",
    items: [
      {
        q: "¿Qué es una mystery box?",
        a: (
          <>
            Una caja sorpresa: eliges peso (1–10 kg) y nivel (Standard o Premium). Más
            info en <a className="underline" href="/es/products">Productos</a>.
          </>
        ),
        aText:
          "Caja sorpresa: eliges peso (1–10 kg) y nivel (Standard/Premium). Más info en /es/products.",
      },
      {
        q: "¿Qué contiene?",
        a: (
          <>
            Contenido mixto de lotes reales, sellado. Es una sorpresa:{" "}
            <b>no garantizamos artículos específicos</b>.
          </>
        ),
        aText:
          "Contenido mixto de lotes reales, sellado. No garantizamos artículos específicos.",
      },
    ],
  },

  fr: {
    title: "FAQ — Mystery Boxes KiloMystery",
    items: [
      {
        q: "Qu’est-ce qu’une mystery box ?",
        a: (
          <>
            Une boîte surprise : choisis le poids (1–10 kg) et la gamme (Standard/Premium).
            Voir <a className="underline" href="/fr/products">Produits</a>.
          </>
        ),
        aText:
          "Boîte surprise : poids (1–10 kg) et gamme (Standard/Premium). Voir /fr/products.",
      },
      {
        q: "Que contient-elle ?",
        a: (
          <>
            Contenu mixte de lots réels, scellé. Surprise :{" "}
            <b>aucune garantie d’articles précis</b>.
          </>
        ),
        aText:
          "Contenu mixte de lots réels, scellé. Aucune garantie d’articles précis.",
      },
    ],
  },

  de: {
    title: "FAQ — KiloMystery Mystery Boxen",
    items: [
      {
        q: "Was ist eine Mystery Box?",
        a: (
          <>
            Eine Überraschungsbox: Gewicht (1–10 kg) + Standard/Premium. Mehr auf{" "}
            <a className="underline" href="/de/products">Produkte</a>.
          </>
        ),
        aText:
          "Überraschungsbox: Gewicht (1–10 kg) + Standard/Premium. Mehr auf /de/products.",
      },
      {
        q: "Was ist drin?",
        a: (
          <>
            Gemischter Inhalt aus echten Posten, versiegelt. Überraschung:{" "}
            <b>keine Garantie für konkrete Artikel</b>.
          </>
        ),
        aText:
          "Gemischter Inhalt aus echten Posten, versiegelt. Keine Garantie für konkrete Artikel.",
      },
    ],
  },
};

export default function FAQ({
  lang = "it",
}: {
  lang?: Lang;
}) {
  const L = (FAQ_COPY[lang] ?? FAQ_COPY.it);

  // ✅ FAQPage JSON-LD
  const faqJsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: L.items.map((x) => ({
        "@type": "Question",
        name: x.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: x.aText,
        },
      })),
    };
  }, [L.items]);

  return (
    <section id="faq" className="container py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{L.title}</h2>

      <div className="space-y-3">
        {L.items.map((item, idx) => (
          <details className="card" key={idx}>
            <summary className="cursor-pointer text-lg font-bold">
              {item.q}
            </summary>
            <div className="mt-3 text-white/80 leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
