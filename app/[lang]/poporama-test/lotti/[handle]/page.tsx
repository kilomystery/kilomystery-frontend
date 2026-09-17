"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  downloadPoporamaLabelPdf,
  downloadPoporamaLabelsPdf,
} from "../../../../components/PoporamaLabelPdf";
import type {
  Grade,
  LabelData,
} from "../../../../components/PoporamaLabelPdf";

type Lotto = {
  id: string;
  handle: string;
  type: string;
  createdAt: string;
  updatedAt: string;

  codiceLotto: string;
  dataAcquisto: string;
  fornitore: string;
  provenienza: string;
  numeroPezzi: number;
  riferimentoAcquisto: string;

  costoMerce: number;
  costoTrasporto: number;
  altriCosti: number;
  costoTotale: number;

  note: string;
};

type Articolo = {
  id: string;
  handle: string;

  codicePP: string;
  lottoId: string;

  nomeProdotto: string;

  asin: string;
  ean: string;
  upc: string;
  fnsku: string;
  lpn: string;
  palletId: string;

  condizioneOriginale: string;

  categoria: string;
  sottocategoria: string;

  retail: number;
  costoManifest: number;

  grado: string;
  percentualePrezzo: number;
  prezzoPoporama: number;

  condizioneEstetica: string;
  accessoriMancanti: string;
  difettiDichiarati: string;
  noteTest: string;

  risultatiTest: string;

  testatoDa: string;
  dataTest: string;

  statoVendita: string;
  prezzoVendita: number;
  dataVendita: string;

  numeroSeriale: string;

  createdAt: string;
  updatedAt: string;
};

type StatisticheArticoli = {
  totale: number;
  testati: number;
  nonTestati: number;
  disponibili: number;
  venduti: number;

  gradi: {
    A: number;
    B: number;
    C: number;
    D: number;
    N: number;
  };
};

type LottiApiResponse = {
  ok: boolean;
  totale?: number;
  lotti?: Lotto[];
  error?: string;
};

type ArticoliApiResponse = {
  ok: boolean;

  lotto?: {
    id: string;
    handle: string;
    codiceLotto: string;
  };

  totale?: number;

  statistiche?: StatisticheArticoli;

  articoli?: Articolo[];

  error?: string;
};

type FiltroGrado =
  | "TUTTI"
  | "N"
  | "A"
  | "B"
  | "C"
  | "D";

type FiltroStato =
  | "TUTTI"
  | "DISPONIBILE"
  | "VENDUTO";

export default function LottoPage() {
  const params = useParams();

  const handle =
    typeof params.handle === "string"
      ? params.handle
      : "";

  const lang =
    typeof params.lang === "string"
      ? params.lang
      : "it";

  const [lotto, setLotto] =
    useState<Lotto | null>(null);

  const [articoli, setArticoli] =
    useState<Articolo[]>([]);

  const [statistiche, setStatistiche] =
    useState<StatisticheArticoli>({
      totale: 0,
      testati: 0,
      nonTestati: 0,
      disponibili: 0,
      venduti: 0,

      gradi: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        N: 0,
      },
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [ricerca, setRicerca] =
    useState("");

  const [filtroGrado, setFiltroGrado] =
    useState<FiltroGrado>("TUTTI");

  const [filtroStato, setFiltroStato] =
    useState<FiltroStato>("TUTTI");

  const [selezionati, setSelezionati] =
    useState<Set<string>>(
      new Set()
    );

  const [etichetteInCorso, setEtichetteInCorso] =
    useState(false);

  const [costoMerceInput, setCostoMerceInput] =
    useState("");

  const [costoTrasportoInput, setCostoTrasportoInput] =
    useState("");

  const [altriCostiInput, setAltriCostiInput] =
    useState("");

  const [salvataggioCosti, setSalvataggioCosti] =
    useState(false);

  const [messaggioCosti, setMessaggioCosti] =
    useState("");

  useEffect(() => {
    if (!handle) {
      return;
    }

    loadPage();
  }, [handle]);

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      /*
       * ======================================================
       * CARICHIAMO LOTTO + ARTICOLI IN PARALLELO
       * ======================================================
       */

      const [
        lottiResponse,
        articoliResponse,
      ] = await Promise.all([
        fetch(
          "/api/poporama/lotti",
          {
            method: "GET",
            cache: "no-store",
          }
        ),

        fetch(
          `/api/poporama/lotti/${encodeURIComponent(
            handle
          )}/articoli`,
          {
            method: "GET",
            cache: "no-store",
          }
        ),
      ]);

      const lottiData =
        (await lottiResponse.json()) as LottiApiResponse;

      const articoliData =
        (await articoliResponse.json()) as ArticoliApiResponse;

      if (
        !lottiResponse.ok ||
        !lottiData.ok
      ) {
        throw new Error(
          lottiData.error ||
            "Impossibile caricare il lotto."
        );
      }

      if (
        !articoliResponse.ok ||
        !articoliData.ok
      ) {
        throw new Error(
          articoliData.error ||
            "Impossibile caricare gli articoli del lotto."
        );
      }

      const trovato =
        (lottiData.lotti ?? []).find(
          (item) =>
            item.handle === handle
        ) ?? null;

      if (!trovato) {
        throw new Error(
          "Lotto non trovato nell'archivio POPORAMA."
        );
      }

      setLotto(trovato);

      setCostoMerceInput(
        formatMoneyInput(
          trovato.costoMerce
        )
      );

      setCostoTrasportoInput(
        formatMoneyInput(
          trovato.costoTrasporto
        )
      );

      setAltriCostiInput(
        formatMoneyInput(
          trovato.altriCosti
        )
      );

      setMessaggioCosti("");

      setArticoli(
        articoliData.articoli ?? []
      );

      if (
        articoliData.statistiche
      ) {
        setStatistiche(
          articoliData.statistiche
        );
      }

      /*
       * Quando ricarichiamo il lotto,
       * azzeriamo eventuali selezioni
       * precedenti.
       */

      setSelezionati(
        new Set()
      );
    } catch (err) {
      console.error(
        "Errore caricamento lotto POPORAMA:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Errore durante il caricamento del lotto."
      );
    } finally {
      setLoading(false);
    }
  }

  const costoTotaleInput =
    roundMoney(
      parseMoneyInput(costoMerceInput) +
        parseMoneyInput(costoTrasportoInput) +
        parseMoneyInput(altriCostiInput)
    );

  const retailTotaleLotto =
    roundMoney(
      articoli.reduce(
        (totale, articolo) =>
          totale +
          (
            Number.isFinite(articolo.retail)
              ? articolo.retail
              : 0
          ),
        0
      )
    );

  const percentualeCostoSuRetail =
    retailTotaleLotto > 0
      ? (
          costoTotaleInput /
          retailTotaleLotto
        ) * 100
      : 0;

  const margineTeoricoRetail =
    roundMoney(
      retailTotaleLotto -
        costoTotaleInput
    );

  async function salvaCostiLotto() {
    if (
      !lotto ||
      salvataggioCosti
    ) {
      return;
    }

    setError("");
    setMessaggioCosti("");

    const costoMerce =
      parseMoneyInput(costoMerceInput);

    const costoTrasporto =
      parseMoneyInput(costoTrasportoInput);

    const altriCosti =
      parseMoneyInput(altriCostiInput);

    if (
      costoMerce < 0 ||
      costoTrasporto < 0 ||
      altriCosti < 0
    ) {
      setError(
        "Gli importi dei costi non possono essere negativi."
      );
      return;
    }

    try {
      setSalvataggioCosti(true);

      const response = await fetch(
        "/api/poporama/lotti",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            handle: lotto.handle,
            costoMerce,
            costoTrasporto,
            altriCosti,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
            "Impossibile aggiornare i costi del lotto."
        );
      }

      const costoTotale =
        roundMoney(
          costoMerce +
            costoTrasporto +
            altriCosti
        );

      setLotto((current) =>
        current
          ? {
              ...current,
              costoMerce,
              costoTrasporto,
              altriCosti,
              costoTotale,
            }
          : current
      );

      setCostoMerceInput(
        formatMoneyInput(costoMerce)
      );
      setCostoTrasportoInput(
        formatMoneyInput(costoTrasporto)
      );
      setAltriCostiInput(
        formatMoneyInput(altriCosti)
      );

      setMessaggioCosti(
        "Costi salvati su Shopify."
      );
    } catch (err) {
      console.error(
        "Errore salvataggio costi lotto:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Errore durante il salvataggio dei costi."
      );
    } finally {
      setSalvataggioCosti(false);
    }
  }

  /*
   * ==========================================================
   * FILTRI ARTICOLI
   * ==========================================================
   */

  const articoliFiltrati =
    useMemo(() => {
      const query =
        ricerca
          .trim()
          .toLowerCase();

      return articoli.filter(
        (articolo) => {
          const grado =
            normalizeGrade(
              articolo.grado
            );

          const stato =
            normalizeSaleStatus(
              articolo.statoVendita
            );

          if (
            filtroGrado !==
              "TUTTI" &&
            grado !== filtroGrado
          ) {
            return false;
          }

          if (
            filtroStato !==
              "TUTTI" &&
            stato !== filtroStato
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const searchable =
            [
              articolo.codicePP,
              articolo.nomeProdotto,
              articolo.ean,
              articolo.upc,
              articolo.asin,
              articolo.fnsku,
              articolo.lpn,
              articolo.palletId,
              articolo.numeroSeriale,
              articolo.categoria,
              articolo.sottocategoria,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [
      articoli,
      ricerca,
      filtroGrado,
      filtroStato,
    ]);

  /*
   * ==========================================================
   * SELEZIONE
   * ==========================================================
   */

  const tuttiVisibiliSelezionati =
    articoliFiltrati.length >
      0 &&
    articoliFiltrati.every(
      (articolo) =>
        selezionati.has(
          articolo.id
        )
    );

  function toggleArticolo(
    id: string
  ) {
    setSelezionati(
      (current) => {
        const next =
          new Set(current);

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      }
    );
  }

  function toggleTuttiVisibili() {
    setSelezionati(
      (current) => {
        const next =
          new Set(current);

        if (
          tuttiVisibiliSelezionati
        ) {
          for (
            const articolo of articoliFiltrati
          ) {
            next.delete(
              articolo.id
            );
          }
        } else {
          for (
            const articolo of articoliFiltrati
          ) {
            next.add(
              articolo.id
            );
          }
        }

        return next;
      }
    );
  }

  function azzeraSelezione() {
    setSelezionati(
      new Set()
    );
  }

  const codiceLottoEtichette =
    lotto?.codiceLotto ||
    handle ||
    "LOTTO";

  async function generaEtichettaSingola(
    articolo: Articolo
  ) {
    if (etichetteInCorso) {
      return;
    }

    try {
      setEtichetteInCorso(true);

      await downloadPoporamaLabelPdf(
        articoloToLabelData(articolo)
      );
    } catch (err) {
      console.error(
        "Errore generazione etichetta POPORAMA:",
        err
      );

      window.alert(
        err instanceof Error
          ? err.message
          : "Impossibile generare l'etichetta."
      );
    } finally {
      setEtichetteInCorso(false);
    }
  }

  async function generaEtichetteSelezionate() {
    if (
      etichetteInCorso ||
      selezionati.size === 0
    ) {
      return;
    }

    const scelti = articoli.filter(
      (articolo) =>
        selezionati.has(articolo.id)
    );

    if (scelti.length === 0) {
      return;
    }

    try {
      setEtichetteInCorso(true);

      await downloadPoporamaLabelsPdf(
        scelti.map(articoloToLabelData),
        `POPORAMA_${codiceLottoEtichette}_SELEZIONATE.pdf`
      );
    } catch (err) {
      console.error(
        "Errore generazione etichette selezionate:",
        err
      );

      window.alert(
        err instanceof Error
          ? err.message
          : "Impossibile generare le etichette selezionate."
      );
    } finally {
      setEtichetteInCorso(false);
    }
  }

  async function generaTutteEtichette() {
    if (
      etichetteInCorso ||
      articoli.length === 0
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Generare ${articoli.length} etichette del lotto ${codiceLottoEtichette}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setEtichetteInCorso(true);

      await downloadPoporamaLabelsPdf(
        articoli.map(articoloToLabelData),
        `POPORAMA_${codiceLottoEtichette}_TUTTE.pdf`
      );
    } catch (err) {
      console.error(
        "Errore generazione di tutte le etichette:",
        err
      );

      window.alert(
        err instanceof Error
          ? err.message
          : "Impossibile generare tutte le etichette."
      );
    } finally {
      setEtichetteInCorso(false);
    }
  }

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8">
          <p className="font-black text-yellow-400">
            POPORAMA
          </p>

          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <div className="text-4xl">
              ⏳
            </div>

            <p className="mt-4 font-black">
              Caricamento lotto e
              articoli...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ==========================================================
   * ERRORE
   * ==========================================================
   */

  if (error || !lotto) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <a
            href={`/${lang}/poporama-test/lotti`}
            className="text-sm font-bold text-zinc-400 hover:text-white"
          >
            ← Lotti & Carichi
          </a>

          <div className="mt-8 rounded-3xl border border-red-800 bg-red-950/30 p-8">
            <h1 className="text-xl font-black text-red-300">
              Impossibile aprire
              il lotto
            </h1>

            <p className="mt-3 text-red-200">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ==========================================================
   * PAGINA
   * ==========================================================
   */

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-12">
        <a
          href={`/${lang}/poporama-test/lotti`}
          className="text-sm font-bold text-zinc-400 transition hover:text-white"
        >
          ← Lotti & Carichi
        </a>

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
              POPORAMA
            </p>

            <span className="rounded-full border border-yellow-500/40 bg-yellow-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-yellow-400">
              ATTIVO
            </span>
          </div>

          <h1 className="mt-3 break-words text-4xl font-black">
            {lotto.codiceLotto}
          </h1>

          <p className="mt-2 text-zinc-400">
            Gestione operativa del
            carico, test, etichette e
            vendite.
          </p>
        </header>

        {/* ===================================================
            STATISTICHE PRINCIPALI
        =================================================== */}

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <StatCard
            label="Pezzi dichiarati"
            value={String(
              lotto.numeroPezzi
            )}
          />

          <StatCard
            label="Prodotti censiti"
            value={String(
              statistiche.totale
            )}
          />

          <StatCard
            label="Da testare"
            value={String(
              statistiche.nonTestati
            )}
            accent="yellow"
          />

          <StatCard
            label="Testati"
            value={String(
              statistiche.testati
            )}
            accent="green"
          />

          <StatCard
            label="Disponibili"
            value={String(
              statistiche.disponibili
            )}
          />

          <StatCard
            label="Venduti"
            value={String(
              statistiche.venduti
            )}
            accent="blue"
          />
        </section>

        {/* ===================================================
            GRADI
        =================================================== */}

        <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <GradeStat
            grade="N"
            label="Non testati"
            value={
              statistiche.gradi.N
            }
          />

          <GradeStat
            grade="A"
            label="Grado A"
            value={
              statistiche.gradi.A
            }
          />

          <GradeStat
            grade="B"
            label="Grado B"
            value={
              statistiche.gradi.B
            }
          />

          <GradeStat
            grade="C"
            label="Grado C"
            value={
              statistiche.gradi.C
            }
          />

          <GradeStat
            grade="D"
            label="Grado D"
            value={
              statistiche.gradi.D
            }
          />
        </section>

        {/* ===================================================
            DATI LOTTO
        =================================================== */}

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                Lotto
              </p>

              <h2 className="mt-2 text-xl font-black">
                Dati del carico
              </h2>
            </div>

            <a
              href={`/${lang}/poporama-test/lotti/${handle}/importa`}
              className="rounded-xl bg-yellow-400 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-300"
            >
              + IMPORTA MANIFEST
            </a>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DataItem
              label="Fornitore"
              value={
                lotto.fornitore ||
                "—"
              }
            />

            <DataItem
              label="Provenienza"
              value={
                lotto.provenienza ||
                "—"
              }
            />

            <DataItem
              label="Data acquisto"
              value={formatDate(
                lotto.dataAcquisto
              )}
            />

            <DataItem
              label="Riferimento"
              value={
                lotto.riferimentoAcquisto ||
                "—"
              }
            />
          </div>
        </section>

        {/* ===================================================
            COSTI
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                Costi
              </p>

              <h2 className="mt-2 text-xl font-black">
                Investimento nel carico
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Puoi modificare gli importi anche dopo la creazione del lotto.
              </p>
            </div>

            <button
              type="button"
              onClick={salvaCostiLotto}
              disabled={salvataggioCosti}
              className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvataggioCosti
                ? "SALVATAGGIO..."
                : "SALVA COSTI"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CostInput
              label="Merce"
              value={costoMerceInput}
              onChange={setCostoMerceInput}
              disabled={salvataggioCosti}
            />

            <CostInput
              label="Trasporto"
              value={costoTrasportoInput}
              onChange={setCostoTrasportoInput}
              disabled={salvataggioCosti}
            />

            <CostInput
              label="Altri costi / Extra"
              value={altriCostiInput}
              onChange={setAltriCostiInput}
              disabled={salvataggioCosti}
            />

            <MoneyCard
              label="Totale automatico"
              value={costoTotaleInput}
              important
            />
          </div>

          {messaggioCosti ? (
            <div className="mt-4 rounded-xl border border-emerald-700 bg-emerald-950/30 px-4 py-3 text-sm font-bold text-emerald-300">
              {messaggioCosti}
            </div>
          ) : null}
        </section>

        <section className="mt-6 rounded-3xl border border-yellow-500/20 bg-zinc-900 p-6 sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
              Analisi acquisto
            </p>

            <h2 className="mt-2 text-xl font-black">
              Rapporto costo / Retail
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">
              Il Retail totale è la somma del valore Retail di tutti gli articoli presenti nel lotto.
              La percentuale indica quanto è costato il carico rispetto al suo Retail complessivo.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MoneyCard
              label="Retail totale"
              value={retailTotaleLotto}
            />

            <MoneyCard
              label="Costo lotto"
              value={costoTotaleInput}
            />

            <PercentageCard
              label="Costo / Retail"
              value={percentualeCostoSuRetail}
              important
            />

            <MoneyCard
              label="Differenza vs Retail"
              value={margineTeoricoRetail}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs font-black uppercase tracking-wider text-zinc-600">
              Lettura del dato
            </p>

            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Il lotto è stato acquistato a circa{" "}
              <span className="font-black text-yellow-400">
                {formatPercentage(percentualeCostoSuRetail)}
              </span>{" "}
              del Retail complessivo. Questo valore potrà essere confrontato con le percentuali
              POPORAMA assegnate ai gradi A, B, C e N per costruire la strategia prezzi.
            </p>
          </div>
        </section>

        {/* ===================================================
            ARTICOLI DEL LOTTO
        =================================================== */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-6 sm:p-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                  Inventario
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Articoli del lotto
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                  {articoliFiltrati.length}{" "}
                  visualizzati su{" "}
                  {articoli.length}{" "}
                  articoli.
                </p>
              </div>

              <button
                type="button"
                onClick={loadPage}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-black transition hover:border-zinc-500"
              >
                ↻ AGGIORNA
              </button>
            </div>

            {/* ===============================================
                RICERCA
            =============================================== */}

            <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_220px_220px]">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Cerca articolo
                </label>

                <input
                  type="text"
                  value={ricerca}
                  onChange={(event) =>
                    setRicerca(
                      event.target.value
                    )
                  }
                  placeholder="PP, EAN, ASIN, nome, FNSKU, LPN, seriale..."
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Grado
                </label>

                <select
                  value={filtroGrado}
                  onChange={(event) =>
                    setFiltroGrado(
                      event.target
                        .value as FiltroGrado
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none focus:border-yellow-400"
                >
                  <option value="TUTTI">
                    Tutti i gradi
                  </option>

                  <option value="N">
                    N — Non testato
                  </option>

                  <option value="A">
                    A
                  </option>

                  <option value="B">
                    B
                  </option>

                  <option value="C">
                    C
                  </option>

                  <option value="D">
                    D
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Stato vendita
                </label>

                <select
                  value={filtroStato}
                  onChange={(event) =>
                    setFiltroStato(
                      event.target
                        .value as FiltroStato
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none focus:border-yellow-400"
                >
                  <option value="TUTTI">
                    Tutti
                  </option>

                  <option value="DISPONIBILE">
                    Disponibili
                  </option>

                  <option value="VENDUTO">
                    Venduti
                  </option>
                </select>
              </div>
            </div>

            {/* ===============================================
                AZIONI MULTIPLE
            =============================================== */}

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={
                    toggleTuttiVisibili
                  }
                  disabled={
                    articoliFiltrati.length ===
                    0
                  }
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-black transition hover:border-zinc-500 disabled:opacity-40"
                >
                  {tuttiVisibiliSelezionati
                    ? "DESELEZIONA VISIBILI"
                    : "SELEZIONA VISIBILI"}
                </button>

                {selezionati.size >
                0 ? (
                  <button
                    type="button"
                    onClick={
                      azzeraSelezione
                    }
                    className="text-xs font-bold text-zinc-500 hover:text-white"
                  >
                    Azzera selezione
                  </button>
                ) : null}

                <span className="text-sm font-black text-yellow-400">
                  {
                    selezionati.size
                  }{" "}
                  selezionati
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={generaEtichetteSelezionate}
                  disabled={
                    selezionati.size === 0 ||
                    etichetteInCorso
                  }
                  className="rounded-xl border border-yellow-500/40 bg-yellow-400/10 px-5 py-3 text-xs font-black text-yellow-400 transition hover:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {etichetteInCorso
                    ? "GENERAZIONE..."
                    : "ETICHETTE SELEZIONATE"}
                </button>

                <button
                  type="button"
                  onClick={generaTutteEtichette}
                  disabled={
                    articoli.length === 0 ||
                    etichetteInCorso
                  }
                  className="rounded-xl bg-yellow-400 px-5 py-3 text-xs font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {etichetteInCorso
                    ? "GENERAZIONE..."
                    : "TUTTE LE ETICHETTE"}
                </button>
              </div>
            </div>
          </div>

          {/* ===============================================
              TABELLA DESKTOP
          =============================================== */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1250px] border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/70 text-left">
                  <th className="w-14 px-5 py-4">
                    <span className="sr-only">
                      Seleziona
                    </span>
                  </th>

                  <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-zinc-500">
                    PP
                  </th>

                  <th className="min-w-[360px] px-4 py-4 text-xs font-black uppercase tracking-wider text-zinc-500">
                    Articolo
                  </th>

                  <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-zinc-500">
                    Retail
                  </th>

                  <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-zinc-500">
                    Grado
                  </th>

                  <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-zinc-500">
                    Prezzo POPORAMA
                  </th>

                  <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-zinc-500">
                    Stato
                  </th>

                  <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-zinc-500">
                    Azioni
                  </th>
                </tr>
              </thead>

              <tbody>
                {articoliFiltrati.map(
                  (articolo) => (
                    <ArticoloRow
                      key={
                        articolo.id
                      }
                      articolo={
                        articolo
                      }
                      lang={lang}
                      lottoHandle={handle}
                      onLabel={() =>
                        generaEtichettaSingola(
                          articolo
                        )
                      }
                      selected={selezionati.has(
                        articolo.id
                      )}
                      onToggle={() =>
                        toggleArticolo(
                          articolo.id
                        )
                      }
                    />
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* ===============================================
              MOBILE / TABLET
          =============================================== */}

          <div className="grid gap-3 p-4 lg:hidden">
            {articoliFiltrati.map(
              (articolo) => (
                <ArticoloMobileCard
                  key={
                    articolo.id
                  }
                  articolo={
                    articolo
                  }
                  lang={lang}
                  lottoHandle={handle}
                  onLabel={() =>
                    generaEtichettaSingola(
                      articolo
                    )
                  }
                  selected={selezionati.has(
                    articolo.id
                  )}
                  onToggle={() =>
                    toggleArticolo(
                      articolo.id
                    )
                  }
                />
              )
            )}
          </div>

          {/* ===============================================
              NESSUN RISULTATO
          =============================================== */}

          {articoliFiltrati.length ===
          0 ? (
            <div className="border-t border-zinc-800 p-10 text-center">
              <p className="text-3xl">
                🔎
              </p>

              <h3 className="mt-4 font-black">
                Nessun articolo trovato
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Modifica la ricerca o
                i filtri.
              </p>
            </div>
          ) : null}
        </section>

        {/* ===================================================
            AGGIUNTA MERCE
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
            Carico
          </p>

          <h2 className="mt-2 text-xl font-black">
            Aggiungi merce al lotto
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <a
              href={`/${lang}/poporama-test/lotti/${handle}/importa`}
              className="rounded-2xl border border-yellow-500/40 bg-zinc-950 p-6 transition hover:border-yellow-400"
            >
              <div className="text-3xl">
                📄
              </div>

              <h3 className="mt-3 font-black">
                Importa manifest
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                Importazione massiva
                CSV del carico.
              </p>
            </a>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 opacity-60">
              <div className="text-3xl">
                📦
              </div>

              <h3 className="mt-3 font-black">
                Inserimento manuale
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                EAN, barcode o
                inserimento manuale.
                Lo attiveremo
                successivamente.
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            NOTE
        =================================================== */}

        {lotto.note ? (
          <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
            <h2 className="text-xl font-black">
              Note
            </h2>

            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-zinc-300">
              {lotto.note}
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}

/*
 * ============================================================
 * RIGA ARTICOLO DESKTOP
 * ============================================================
 */

function ArticoloRow({
  articolo,
  lang,
  lottoHandle,
  onLabel,
  selected,
  onToggle,
}: {
  articolo: Articolo;
  lang: string;
  lottoHandle: string;
  onLabel: () => void;
  selected: boolean;
  onToggle: () => void;
}) {
  const grado =
    normalizeGrade(
      articolo.grado
    );

  const stato =
    normalizeSaleStatus(
      articolo.statoVendita
    );

  return (
    <tr
      className={`border-b border-zinc-800/70 transition ${
        selected
          ? "bg-yellow-400/5"
          : "hover:bg-zinc-800/30"
      }`}
    >
      <td className="px-5 py-4 align-top">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-5 w-5 cursor-pointer accent-yellow-400"
        />
      </td>

      <td className="px-4 py-4 align-top">
        <p className="whitespace-nowrap font-black text-yellow-400">
          {articolo.codicePP}
        </p>

        {articolo.ean ? (
          <p className="mt-1 whitespace-nowrap text-[11px] text-zinc-600">
            EAN {articolo.ean}
          </p>
        ) : null}
      </td>

      <td className="px-4 py-4 align-top">
        <p className="max-w-[460px] font-bold leading-5 text-zinc-100">
          {articolo.nomeProdotto ||
            "Articolo POPORAMA"}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-500">
          {articolo.asin ? (
            <span>
              ASIN{" "}
              {articolo.asin}
            </span>
          ) : null}

          {articolo.sottocategoria ? (
            <span>
              {
                articolo.sottocategoria
              }
            </span>
          ) : null}

          {articolo.palletId ? (
            <span>
              Pallet{" "}
              {articolo.palletId}
            </span>
          ) : null}
        </div>
      </td>

      <td className="px-4 py-4 align-top font-bold text-zinc-400">
        {formatCurrency(
          articolo.retail
        )}
      </td>

      <td className="px-4 py-4 align-top">
        <GradeBadge
          grade={grado}
        />
      </td>

      <td className="px-4 py-4 align-top">
        <p className="font-black text-white">
          {formatCurrency(
            articolo.prezzoPoporama
          )}
        </p>

        <p className="mt-1 text-[11px] text-zinc-600">
          {
            articolo.percentualePrezzo
          }
          %
        </p>
      </td>

      <td className="px-4 py-4 align-top">
        <SaleBadge
          status={stato}
        />
      </td>

      <td className="px-4 py-4 align-top">
        <div className="flex min-w-[210px] flex-wrap gap-2">
          <a
            href={`/${lang}/poporama-test/articoli/${encodeURIComponent(
              articolo.codicePP
            )}`}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-black transition hover:border-zinc-500"
          >
            APRI
          </a>

          {stato !== "VENDUTO" ? (
            <a
              href={`/${lang}/poporama-test/articoli/${encodeURIComponent(
                articolo.codicePP
              )}/test?lotto=${encodeURIComponent(
                lottoHandle
              )}`}
              className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-black transition hover:bg-yellow-300"
            >
              {grado === "N"
                ? "TEST"
                : "MODIFICA TEST"}
            </a>
          ) : null}

          <button
            type="button"
            onClick={onLabel}
            className="rounded-lg border border-yellow-500/40 px-3 py-2 text-xs font-black text-yellow-400 transition hover:border-yellow-400"
          >
            ETICHETTA
          </button>
        </div>
      </td>
    </tr>
  );
}

/*
 * ============================================================
 * CARD ARTICOLO MOBILE
 * ============================================================
 */

function ArticoloMobileCard({
  articolo,
  lang,
  lottoHandle,
  onLabel,
  selected,
  onToggle,
}: {
  articolo: Articolo;
  lang: string;
  lottoHandle: string;
  onLabel: () => void;
  selected: boolean;
  onToggle: () => void;
}) {
  const grado =
    normalizeGrade(
      articolo.grado
    );

  const stato =
    normalizeSaleStatus(
      articolo.statoVendita
    );

  return (
    <article
      className={`rounded-2xl border p-4 ${
        selected
          ? "border-yellow-500/50 bg-yellow-400/5"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1 h-5 w-5 shrink-0 accent-yellow-400"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-black text-yellow-400">
              {articolo.codicePP}
            </p>

            <GradeBadge
              grade={grado}
            />

            <SaleBadge
              status={stato}
            />
          </div>

          <h3 className="mt-3 font-bold leading-5">
            {articolo.nomeProdotto ||
              "Articolo POPORAMA"}
          </h3>

          {articolo.ean ? (
            <p className="mt-2 break-all text-xs text-zinc-500">
              EAN:{" "}
              {articolo.ean}
            </p>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-600">
                Retail
              </p>

              <p className="mt-1 text-sm font-bold text-zinc-400">
                {formatCurrency(
                  articolo.retail
                )}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase text-zinc-600">
                POPORAMA
              </p>

              <p className="mt-1 font-black">
                {formatCurrency(
                  articolo.prezzoPoporama
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`/${lang}/poporama-test/articoli/${encodeURIComponent(
                articolo.codicePP
              )}`}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-black"
            >
              APRI
            </a>

            {stato !== "VENDUTO" ? (
              <a
                href={`/${lang}/poporama-test/articoli/${encodeURIComponent(
                  articolo.codicePP
                )}/test?lotto=${encodeURIComponent(
                  lottoHandle
                )}`}
                className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-black transition hover:bg-yellow-300"
              >
                {grado === "N"
                  ? "TEST"
                  : "MODIFICA TEST"}
              </a>
            ) : null}

            <button
              type="button"
              onClick={onLabel}
              className="rounded-lg border border-yellow-500/40 px-3 py-2 text-xs font-black text-yellow-400 transition hover:border-yellow-400"
            >
              ETICHETTA
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/*
 * ============================================================
 * STAT CARD
 * ============================================================
 */

function StatCard({
  label,
  value,
  accent = "default",
}: {
  label: string;
  value: string;
  accent?:
    | "default"
    | "yellow"
    | "green"
    | "blue";
}) {
  let valueClass =
    "text-white";

  if (
    accent === "yellow"
  ) {
    valueClass =
      "text-yellow-400";
  }

  if (
    accent === "green"
  ) {
    valueClass =
      "text-emerald-400";
  }

  if (
    accent === "blue"
  ) {
    valueClass =
      "text-sky-400";
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-black ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * GRADE STAT
 * ============================================================
 */

function GradeStat({
  grade,
  label,
  value,
}: {
  grade: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between gap-3">
        <GradeBadge
          grade={grade}
        />

        <span className="text-2xl font-black">
          {value}
        </span>
      </div>

      <p className="mt-3 text-xs font-bold text-zinc-500">
        {label}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * GRADE BADGE
 * ============================================================
 */

function GradeBadge({
  grade,
}: {
  grade: string;
}) {
  const normalized =
    normalizeGrade(
      grade
    );

  let classes =
    "border-zinc-600 bg-zinc-800 text-zinc-200";

  if (
    normalized === "A"
  ) {
    classes =
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  }

  if (
    normalized === "B"
  ) {
    classes =
      "border-sky-500/40 bg-sky-500/10 text-sky-300";
  }

  if (
    normalized === "C"
  ) {
    classes =
      "border-orange-500/40 bg-orange-500/10 text-orange-300";
  }

  if (
    normalized === "D"
  ) {
    classes =
      "border-red-500/40 bg-red-500/10 text-red-300";
  }

  if (
    normalized === "N"
  ) {
    classes =
      "border-yellow-500/40 bg-yellow-400/10 text-yellow-400";
  }

  return (
    <span
      className={`inline-flex min-w-9 items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-black ${classes}`}
    >
      {normalized}
    </span>
  );
}

/*
 * ============================================================
 * SALE BADGE
 * ============================================================
 */

function SaleBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    normalizeSaleStatus(
      status
    );

  if (
    normalized === "VENDUTO"
  ) {
    return (
      <span className="inline-flex rounded-lg border border-sky-500/40 bg-sky-500/10 px-2.5 py-1 text-[11px] font-black text-sky-300">
        VENDUTO
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black text-emerald-300">
      DISPONIBILE
    </span>
  );
}

/*
 * ============================================================
 * DATA ITEM
 * ============================================================
 */

function DataItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-2 font-bold text-zinc-200">
        {value}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * MONEY CARD
 * ============================================================
 */

function CostInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-xs font-black uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span className="font-black text-zinc-500">
          €
        </span>

        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          disabled={disabled}
          className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-lg font-black text-white outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
}

function PercentageCard({
  label,
  value,
  important = false,
}: {
  label: string;
  value: number;
  important?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-xs font-black uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-black ${
          important
            ? "text-yellow-400"
            : "text-white"
        }`}
      >
        {formatPercentage(value)}
      </p>
    </div>
  );
}

function MoneyCard({
  label,
  value,
  important = false,
}: {
  label: string;
  value: number;
  important?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-black ${
          important
            ? "text-yellow-400"
            : "text-white"
        }`}
      >
        {formatCurrency(
          value
        )}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function articoloToLabelData(
  articolo: Articolo
): LabelData {
  const grade =
    normalizeGrade(
      articolo.grado
    ) as Grade;

  return {
    code: articolo.codicePP,
    brand: "",
    model:
      articolo.nomeProdotto ||
      articolo.codicePP,
    productType:
      articolo.sottocategoria ||
      articolo.categoria ||
      "Articolo POPORAMA",
    serial:
      articolo.numeroSeriale ||
      undefined,
    originCondition:
      articolo.condizioneOriginale ||
      undefined,
    cosmeticCondition:
      articolo.condizioneEstetica ||
      undefined,
    missingAccessories:
      articolo.accessoriMancanti ||
      undefined,
    defects:
      articolo.difettiDichiarati ||
      undefined,
    referencePrice:
      Number.isFinite(
        Number(articolo.retail)
      )
        ? Number(
            articolo.retail
          ).toFixed(2)
        : undefined,
    poporamaPrice:
      Number.isFinite(
        Number(
          articolo.prezzoPoporama
        )
      )
        ? Number(
            articolo.prezzoPoporama
          ).toFixed(2)
        : undefined,
    grade,
    testDate: formatLabelDate(
      articolo.dataTest ||
      articolo.createdAt
    ),
  };
}

function formatLabelDate(
  value: string
) {
  if (!value) {
    return new Intl.DateTimeFormat(
      "it-IT"
    ).format(new Date());
  }

  const date = new Date(value);

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

function normalizeGrade(
  value: string
) {
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

  return "N";
}

function normalizeSaleStatus(
  value: string
) {
  const status =
    String(value || "")
      .trim()
      .toUpperCase();

  if (
    status === "VENDUTO"
  ) {
    return "VENDUTO";
  }

  return "DISPONIBILE";
}

function parseMoneyInput(
  value: string
) {
  const normalized =
    String(value || "")
      .trim()
      .replace(",", ".");

  if (!normalized) {
    return 0;
  }

  const number =
    Number(normalized);

  return Number.isFinite(number)
    ? number
    : 0;
}

function roundMoney(
  value: number
) {
  return (
    Math.round(
      (
        value +
        Number.EPSILON
      ) * 100
    ) / 100
  );
}

function formatMoneyInput(
  value: number
) {
  return (
    Number.isFinite(value)
      ? value
      : 0
  ).toFixed(2);
}

function formatPercentage(
  value: number
) {
  return `${new Intl.NumberFormat(
    "it-IT",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(
    Number.isFinite(value)
      ? value
      : 0
  )}%`;
}

function formatCurrency(
  value: number
) {
  const number =
    Number(value);

  return new Intl.NumberFormat(
    "it-IT",
    {
      style: "currency",
      currency: "EUR",
    }
  ).format(
    Number.isFinite(number)
      ? number
      : 0
  );
}

function formatDate(
  value: string
) {
  if (!value) {
    return "—";
  }

  const parts =
    value.split("-");

  if (
    parts.length !== 3
  ) {
    return value;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}