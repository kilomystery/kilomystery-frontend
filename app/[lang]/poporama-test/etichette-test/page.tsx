"use client";

import { useState } from "react";
import {
  downloadPoporamaLabelsPdf,
  Grade,
  LabelData,
} from "../../../components/PoporamaLabelPdf";

type Articolo = {
  id: string;
  handle: string;

  codicePP: string;
  nomeProdotto: string;

  asin?: string;
  ean?: string;
  upc?: string;
  fnsku?: string;
  lpn?: string;
  palletId?: string;

  condizioneOriginale?: string;

  categoria?: string;
  sottocategoria?: string;

  retail?: number | string | null;
  costoManifest?: number | string | null;

  grado?: string;
  percentualePrezzo?: number | string | null;
  prezzoPoporama?: number | string | null;

  condizioneEstetica?: string;
  accessoriMancanti?: string;
  difettiDichiarati?: string;
  noteTest?: string;

  risultatiTest?: unknown;

  testatoDa?: string;
  dataTest?: string;

  statoVendita?: string;
  prezzoVendita?: number | string | null;
  dataVendita?: string;

  numeroSeriale?: string;

  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse = {
  ok: boolean;

  totaleArticoli?: number;

  intervallo?: {
    from: number;
    to: number;
    totaleEsistenti: number;
    codiciEsistenti: string[];
  } | null;

  totaleDettagli?: number;

  articoli?: Articolo[];

  error?: string;
};

/*
 * ============================================================
 * INTERVALLO REALE DEL PRIMO MANIFEST POPORAMA
 * ============================================================
 *
 * 599 articoli:
 *
 * PP-000002
 * ...
 * PP-000600
 *
 * PP-000001 non appartiene a questo manifest.
 * ============================================================
 */

const TEST_FROM = 2;
const TEST_TO = 600;

const TOTAL_LABELS =
  TEST_TO -
  TEST_FROM +
  1;

export default function EtichetteTestPage() {
  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * ==========================================================
   * GENERAZIONE ETICHETTE
   * ==========================================================
   */

  async function generaEtichette() {
    if (loading) {
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      /*
       * ======================================================
       * 1. RECUPERO I 599 ARTICOLI REALI DA SHOPIFY
       * ======================================================
       */

      const response = await fetch(
        `/api/poporama/articoli?from=${TEST_FROM}&to=${TEST_TO}&details=1`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            "Impossibile recuperare gli articoli POPORAMA."
        );
      }

      const articoli =
        data.articoli ?? [];

      /*
       * ======================================================
       * 2. CREIAMO L'ELENCO ESATTO DEI PP ATTESI
       * ======================================================
       *
       * PP-000002
       * PP-000003
       * ...
       * PP-000600
       *
       * Non ci affidiamo semplicemente all'ordine restituito
       * da Shopify.
       * ======================================================
       */

      const codiciAttesi =
        Array.from(
          {
            length:
              TOTAL_LABELS,
          },
          (_, index) =>
            formatPP(
              TEST_FROM +
                index
            )
        );

      /*
       * ======================================================
       * 3. INDICIZZIAMO GLI ARTICOLI PER CODICE PP
       * ======================================================
       */

      const articoliPerCodice =
        new Map<
          string,
          Articolo
        >();

      for (
        const articolo of articoli
      ) {
        if (
          articolo.codicePP
        ) {
          articoliPerCodice.set(
            articolo.codicePP,
            articolo
          );
        }
      }

      /*
       * ======================================================
       * 4. VERIFICA DI SICUREZZA
       * ======================================================
       *
       * Se manca anche UN SOLO PP, il PDF NON viene generato.
       *
       * Questo evita di stampare 598 etichette pensando
       * erroneamente di averne prodotte 599.
       * ======================================================
       */

      const codiciMancanti =
        codiciAttesi.filter(
          (codice) =>
            !articoliPerCodice.has(
              codice
            )
        );

      if (
        codiciMancanti.length >
        0
      ) {
        const anteprima =
          codiciMancanti
            .slice(0, 10)
            .join(", ");

        throw new Error(
          `Mancano ${codiciMancanti.length} articoli nell'intervallo. ` +
            `Primi codici mancanti: ${anteprima}`
        );
      }

      /*
       * ======================================================
       * 5. ORDINE ESATTO PP-000002 -> PP-000600
       * ======================================================
       */

      const articoliOrdinati =
        codiciAttesi.map(
          (codice) => {
            const articolo =
              articoliPerCodice.get(
                codice
              );

            if (!articolo) {
              /*
               * TypeScript safety.
               *
               * Questo caso è già intercettato
               * dalla verifica precedente.
               */
              throw new Error(
                `Articolo ${codice} non trovato.`
              );
            }

            return articolo;
          }
        );

      /*
       * ======================================================
       * 6. CONTROLLO NUMERO TOTALE
       * ======================================================
       */

      if (
        articoliOrdinati.length !==
        TOTAL_LABELS
      ) {
        throw new Error(
          `Numero articoli non corretto. Attesi ${TOTAL_LABELS}, trovati ${articoliOrdinati.length}.`
        );
      }

      /*
       * ======================================================
       * 7. CONVERSIONE SHOPIFY -> LABEL DATA
       * ======================================================
       */

      const labels: LabelData[] =
        articoliOrdinati.map(
          articoloToLabel
        );

      /*
       * ======================================================
       * 8. GENERAZIONE UNICO PDF MULTIPAGINA
       * ======================================================
       *
       * Il componente PoporamaLabelPdf:
       *
       * - crea una pagina A6 per articolo
       * - genera un QR diverso per ogni PP
       * - usa NEXT_PUBLIC_SITE_URL
       * - punta alla scheda articolo pubblica
       *
       * Esempio:
       *
       * https://kilomystery.com/it/poporama-test/articoli/PP-000002
       * ======================================================
       */

      await downloadPoporamaLabelsPdf(
        labels,
        "POPORAMA_599_ETICHETTE_PP-000002_PP-000600.pdf"
      );

      /*
       * ======================================================
       * 9. COMPLETATO
       * ======================================================
       */

      setMessage(
        `PDF generato correttamente: ${TOTAL_LABELS} etichette reali, da ${formatPP(
          TEST_FROM
        )} a ${formatPP(
          TEST_TO
        )}.`
      );
    } catch (err) {
      console.error(
        "Errore generazione etichette POPORAMA:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Errore durante la generazione delle etichette."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==========================================================
   * UI
   * ==========================================================
   */

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-400">
            POPORAMA TEST CENTER
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            ETICHETTE MANIFEST
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
            Generazione delle etichette
            POPORAMA del primo manifest.
            Tutti i dati vengono letti
            direttamente dall&apos;archivio
            Shopify.
          </p>
        </div>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              label="DA"
              value={formatPP(
                TEST_FROM
              )}
            />

            <InfoCard
              label="A"
              value={formatPP(
                TEST_TO
              )}
            />

            <InfoCard
              label="ETICHETTE"
              value={String(
                TOTAL_LABELS
              )}
            />

            <InfoCard
              label="FORMATO"
              value="A6"
            />
          </div>

          <div className="mt-8 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
              QR DEFINITIVO
            </p>

            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Ogni QR contiene
              l&apos;URL permanente
              della propria scheda
              articolo POPORAMA su
              kilomystery.com.
            </p>

            <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800 bg-black p-4 font-mono text-xs text-zinc-300">
              https://kilomystery.com/it/poporama-test/articoli/PP-000002
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              CONTROLLO AUTOMATICO
            </p>

            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Prima di creare il PDF
              vengono verificati tutti
              i codici da PP-000002 a
              PP-000600. Se manca anche
              un solo articolo, la
              generazione viene
              interrotta.
            </p>
          </div>

          <button
            type="button"
            onClick={
              generaEtichette
            }
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-yellow-400 px-6 py-5 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "GENERAZIONE 599 ETICHETTE IN CORSO..."
              : "GENERA 599 ETICHETTE"}
          </button>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
              <p className="text-sm font-bold text-yellow-300">
                Attendere. Shopify
                viene interrogato e il
                PDF multipagina viene
                costruito nel browser.
              </p>

              <p className="mt-2 text-xs leading-5 text-zinc-400">
                Non chiudere questa
                pagina durante la
                generazione.
              </p>
            </div>
          ) : null}

          {message ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-sm font-bold text-emerald-300">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm font-bold text-red-300">
              {error}
            </div>
          ) : null}
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
            LOTTO POPORAMA
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <MiniInfo
              label="ARTICOLI"
              value="599"
            />

            <MiniInfo
              label="PRIMO PP"
              value="PP-000002"
            />

            <MiniInfo
              label="ULTIMO PP"
              value="PP-000600"
            />
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
            PASSAGGIO SUCCESSIVO
          </p>

          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Dopo la generazione delle
            etichette passeremo al
            modulo operativo di test:
            scansione PP, risultati
            test, grado A/B/C/D,
            nuovo prezzo POPORAMA e
            rigenerazione della stessa
            etichetta mantenendo il
            medesimo codice PP.
          </p>
        </section>
      </div>
    </main>
  );
}

/*
 * ============================================================
 * SHOPIFY ARTICLE -> POPORAMA LABEL
 * ============================================================
 */

function articoloToLabel(
  articolo: Articolo
): LabelData {
  return {
    code:
      articolo.codicePP,

    /*
     * Il manifest non contiene brand e
     * modello separati in maniera
     * sufficientemente affidabile.
     *
     * Utilizziamo quindi la descrizione
     * completa presente su Shopify.
     */

    brand: "",

    model:
      articolo.nomeProdotto ||
      "ARTICOLO POPORAMA",

    productType:
      articolo.sottocategoria ||
      articolo.categoria ||
      "ARTICOLO",

    serial:
      articolo.numeroSeriale ||
      undefined,

    originCondition:
      articolo.condizioneOriginale ||
      "-",

    cosmeticCondition:
      articolo.condizioneEstetica ||
      "Non indicata",

    missingAccessories:
      articolo.accessoriMancanti ||
      undefined,

    defects:
      articolo.difettiDichiarati ||
      undefined,

    referencePrice:
      toPriceString(
        articolo.retail
      ),

    poporamaPrice:
      toPriceString(
        articolo.prezzoPoporama
      ),

    grade:
      normalizeGrade(
        articolo.grado
      ),

    testDate:
      formatLabelDate(
        articolo.dataTest ||
          articolo.createdAt
      ),
  };
}

/*
 * ============================================================
 * CODICE PP
 * ============================================================
 */

function formatPP(
  number: number
) {
  return `PP-${String(
    number
  ).padStart(6, "0")}`;
}

/*
 * ============================================================
 * GRADO
 * ============================================================
 */

function normalizeGrade(
  value?: string
): Grade {
  const grade =
    String(value || "")
      .trim()
      .toUpperCase();

  if (
    grade === "A" ||
    grade === "B" ||
    grade === "C" ||
    grade === "D" ||
    grade === "N"
  ) {
    return grade;
  }

  /*
   * Non attribuiamo mai
   * automaticamente un grado
   * funzionale A/B/C/D.
   *
   * Un valore sconosciuto viene
   * trattato come NON TESTATO.
   */

  return "N";
}

/*
 * ============================================================
 * PREZZO
 * ============================================================
 */

function toPriceString(
  value:
    | number
    | string
    | null
    | undefined
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return undefined;
  }

  const normalized =
    typeof value === "number"
      ? value
      : Number(
          String(value)
            .trim()
            .replace(",", ".")
        );

  if (
    !Number.isFinite(
      normalized
    )
  ) {
    return undefined;
  }

  return normalized.toFixed(
    2
  );
}

/*
 * ============================================================
 * DATA ETICHETTA
 * ============================================================
 */

function formatLabelDate(
  value?: string
) {
  if (!value) {
    return new Intl.DateTimeFormat(
      "it-IT"
    ).format(
      new Date()
    );
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "it-IT"
  ).format(date);
}

/*
 * ============================================================
 * INFO CARD
 * ============================================================
 */

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * MINI INFO
 * ============================================================
 */

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-black text-white">
        {value}
      </p>
    </div>
  );
}