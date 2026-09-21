"use client";

import {
  useEffect,
  useMemo,
  useRef,
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

  percentualeNuovo: number;
  percentualeGradoA: number;
  percentualeGradoB: number;
  percentualeGradoC: number;
  percentualeGradoN: number;

  note: string;
};

// D è mantenuto esclusivamente per i record legacy.
type GradoArticolo = "NEW" | "A" | "B" | "C" | "D" | "N";

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

  grado: GradoArticolo;
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
  nuovi: number;
  classificati: number;
  testati: number;
  nonTestati: number;
  disponibili: number;
  venduti: number;

  gradi: {
    NEW: number;
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

type EconomiaLotto = {
  investimentoTotale: number;
  incassoReale: number;
  percentualeVenduta: number;
  percentualeRecuperata: number | null;
  residuoDaRecuperare: number;
  sopraBreakEven: number;
  valorePoporamaDisponibile: number;
  potenzialeTotale: number;
  risultatoPotenziale: number;
  gradiDisponibili: Record<GradoArticolo, number>;
  iva: {
    aliquota: number | null;
    incassoLordo: number;
    imponibile: number | null;
    importo: number | null;
    incassoNetto: number | null;
  };
};

type VenditaLotto = Pick<Articolo,
  "id" | "codicePP" | "nomeProdotto" | "grado" |
  "prezzoPoporama" | "prezzoVendita" | "dataVendita"
>;

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
  economia?: EconomiaLotto;
  vendite?: VenditaLotto[];

  error?: string;
};

type FiltroGrado = "TUTTI" | GradoArticolo;

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

  const [economia, setEconomia] = useState<EconomiaLotto | null>(null);
  const [vendite, setVendite] = useState<VenditaLotto[]>([]);

  const [articoli, setArticoli] =
    useState<Articolo[]>([]);

  const [statistiche, setStatistiche] =
    useState<StatisticheArticoli>({
      totale: 0,
      nuovi: 0,
      classificati: 0,
      testati: 0,
      nonTestati: 0,
      disponibili: 0,
      venduti: 0,

      gradi: {
        NEW: 0,
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

  const [percentualeNuovoInput, setPercentualeNuovoInput] = useState("");
  const [percentualeGradoAInput, setPercentualeGradoAInput] = useState("");
  const [percentualeGradoBInput, setPercentualeGradoBInput] = useState("");
  const [percentualeGradoCInput, setPercentualeGradoCInput] = useState("");
  const [percentualeGradoNInput, setPercentualeGradoNInput] = useState("");
  const [salvataggioListino, setSalvataggioListino] = useState(false);
  const [messaggioListino, setMessaggioListino] = useState("");
  const [erroreListino, setErroreListino] = useState("");

  const [venditaDaAnnullare, setVenditaDaAnnullare] = useState<VenditaLotto | null>(null);
  const [annullamentoInCorso, setAnnullamentoInCorso] = useState(false);
  const [annullamentoIncerto, setAnnullamentoIncerto] = useState(false);
  const [erroreAnnullamento, setErroreAnnullamento] = useState("");
  const [messaggioAnnullamento, setMessaggioAnnullamento] = useState("");
  const annullamentoBusyRef = useRef(false);
  const annullamentoDialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (venditaDaAnnullare) annullamentoDialogRef.current?.showModal();
  }, [venditaDaAnnullare]);

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
      setEconomia(articoliData.economia ?? null);
      setVendite(articoliData.vendite ?? []);

      setPercentualeNuovoInput(String(trovato.percentualeNuovo));
      setPercentualeGradoAInput(String(trovato.percentualeGradoA));
      setPercentualeGradoBInput(String(trovato.percentualeGradoB));
      setPercentualeGradoCInput(String(trovato.percentualeGradoC));
      setPercentualeGradoNInput(String(trovato.percentualeGradoN));
      setMessaggioListino("");
      setErroreListino("");

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

  function preparaAnnullamento(vendita: VenditaLotto) {
    if (annullamentoBusyRef.current) return;
    setVenditaDaAnnullare(vendita);
    setErroreAnnullamento("");
    setMessaggioAnnullamento("");
    setAnnullamentoIncerto(false);
  }

  async function aggiornaDopoAnnullamento(code: string) {
    for (const delay of [0, 250, 750, 1000]) {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      const response = await fetch(`/api/poporama/lotti/${encodeURIComponent(handle)}/articoli`, { cache: "no-store" });
      const data = await response.json() as ArticoliApiResponse;
      if (!response.ok || !data.ok) throw new Error(data.error || "Aggiornamento cruscotto non riuscito.");
      const updated = data.articoli?.find((item) => item.codicePP === code);
      if (updated?.statoVendita.trim().toUpperCase() !== "DISPONIBILE") continue;
      // Tutti i totali vengono ricalcolati dall'API del lotto, mai modificati qui.
      setArticoli(data.articoli ?? []);
      setVendite(data.vendite ?? []);
      setEconomia(data.economia ?? null);
      if (data.statistiche) setStatistiche(data.statistiche);
      return;
    }
    throw new Error("Il cruscotto non riflette ancora l'annullamento. Premi AGGIORNA tra qualche istante.");
  }

  async function confermaAnnullamento() {
    if (!venditaDaAnnullare || annullamentoBusyRef.current || annullamentoIncerto) return;
    annullamentoBusyRef.current = true;
    setAnnullamentoInCorso(true);
    setErroreAnnullamento("");
    let requestSent = false;
    let responseReceived = false;
    try {
      requestSent = true;
      const response = await fetch("/api/poporama/cassa", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancelSale", code: venditaDaAnnullare.codicePP,
          prezzoVenditaAtteso: venditaDaAnnullare.prezzoVendita, dataVenditaAttesa: venditaDaAnnullare.dataVendita }),
      });
      const data = await response.json();
      responseReceived = true;
      if (response.status === 401) {
        throw new Error("Sessione POPORAMA scaduta. Accedi nuovamente; annullamento non eseguito.");
      }
      if (!response.ok || !data.ok) {
        setAnnullamentoIncerto(Boolean(data.esitoIncerto));
        throw new Error(data.error || "Annullamento non riuscito.");
      }
      setVenditaDaAnnullare(null);
      setMessaggioAnnullamento(`${venditaDaAnnullare.codicePP}: VENDITA ANNULLATA. Articolo DISPONIBILE.`);
      try {
        await aggiornaDopoAnnullamento(venditaDaAnnullare.codicePP);
      } catch (error) {
        setMessaggioAnnullamento(`${venditaDaAnnullare.codicePP}: vendita annullata. ${error instanceof Error ? error.message : "Aggiorna il cruscotto."}`);
      }
    } catch (error) {
      if (requestSent && !responseReceived) {
        setAnnullamentoIncerto(true);
        setErroreAnnullamento("Esito annullamento incerto. Chiudi e aggiorna il lotto prima di riprovare.");
      } else setErroreAnnullamento(error instanceof Error ? error.message : "Annullamento non riuscito.");
    } finally {
      annullamentoBusyRef.current = false;
      setAnnullamentoInCorso(false);
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

      // Rilegge anche il cruscotto calcolato sul costo appena salvato.
      await loadPage();
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

  async function salvaListinoLotto() {
    if (!lotto || salvataggioListino) return;

    setMessaggioListino("");
    setErroreListino("");

    try {
      const percentuali = {
        percentualeNuovo: parseListinoPercentage(percentualeNuovoInput, "NUOVO"),
        percentualeGradoA: parseListinoPercentage(percentualeGradoAInput, "A"),
        percentualeGradoB: parseListinoPercentage(percentualeGradoBInput, "B"),
        percentualeGradoC: parseListinoPercentage(percentualeGradoCInput, "C"),
        percentualeGradoN: parseListinoPercentage(percentualeGradoNInput, "N"),
      };

      setSalvataggioListino(true);

      const response = await fetch("/api/poporama/lotti", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: lotto.handle, ...percentuali }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Impossibile salvare il listino del lotto.");
      }

      setLotto((current) =>
        current && current.handle === lotto.handle
          ? { ...current, ...percentuali }
          : current
      );
      setMessaggioListino("LISTINO SALVATO");
    } catch (err) {
      setErroreListino(
        err instanceof Error
          ? err.message
          : "Errore durante il salvataggio del listino."
      );
    } finally {
      setSalvataggioListino(false);
    }
  }

  /*
   * ==========================================================
   * FILTRI ARTICOLI
   * ==========================================================
   */

  const hasLegacyD = articoli.some(
    (articolo) => normalizeGrade(articolo.grado) === "D"
  );

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

        {messaggioAnnullamento ? <p role="status" className="mt-6 rounded-xl border border-emerald-700 bg-emerald-950/30 p-4 text-emerald-300">{messaggioAnnullamento}</p> : null}
        {venditaDaAnnullare ? (
          <dialog ref={annullamentoDialogRef} aria-labelledby="annulla-vendita-title"
            onCancel={(event) => { event.preventDefault(); if (!annullamentoBusyRef.current) setVenditaDaAnnullare(null); }}
            className="w-[calc(100%_-_2rem)] max-w-lg rounded-3xl border border-zinc-700 bg-zinc-900 p-6 text-white backdrop:bg-black/80 sm:p-8">
            <h2 id="annulla-vendita-title" className="text-xl font-black text-yellow-400">ANNULLA VENDITA?</h2>
            <p className="mt-5 font-black">{venditaDaAnnullare.codicePP}</p>
            <p className="mt-2 break-words">{venditaDaAnnullare.nomeProdotto || "Articolo POPORAMA"}</p>
            <p className="mt-4">Prezzo vendita: {formatCurrency(venditaDaAnnullare.prezzoVendita)}</p>
            <p className="mt-2">Data vendita: {formatSaleDate(venditaDaAnnullare.dataVendita)}</p>
            <p className="mt-4 text-amber-300">Questa operazione rimuoverà la vendita dal cruscotto.</p>
            {erroreAnnullamento ? <p role="alert" className="mt-4 text-red-300">{erroreAnnullamento}</p> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" autoFocus disabled={annullamentoInCorso} onClick={() => setVenditaDaAnnullare(null)}
                className="flex-1 rounded-xl border border-zinc-600 px-5 py-4 font-black disabled:opacity-50">ANNULLA</button>
              <button type="button" disabled={annullamentoInCorso || annullamentoIncerto} onClick={confermaAnnullamento}
                className="flex-1 rounded-xl bg-yellow-400 px-5 py-4 font-black text-black disabled:opacity-50">
                {annullamentoInCorso ? "ANNULLAMENTO..." : "CONFERMA"}
              </button>
            </div>
          </dialog>
        ) : null}

        <section aria-labelledby="andamento-vendite" className="mt-8 rounded-3xl border border-yellow-500/40 bg-zinc-900 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="andamento-vendite" className="text-xl font-black text-yellow-400">ANDAMENTO VENDITE</h2>
              <p className="mt-2 text-sm text-zinc-400">Dati del lotto aggiornati da articoli e vendite registrate. Gli incassi usano il prezzo di vendita reale.</p>
            </div>
            <button type="button" onClick={loadPage} className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-black transition hover:border-yellow-400">
              ↻ AGGIORNA
            </button>
          </div>
          {economia ? (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MoneyCard label="INVESTIMENTO TOTALE" value={economia.investimentoTotale} />
                <StatCard label="PEZZI TOTALI" value={String(statistiche.totale)} />
                <StatCard label="PEZZI VENDUTI" value={String(statistiche.venduti)} accent="green" />
                <StatCard label="PEZZI DISPONIBILI" value={String(statistiche.disponibili)} />
                <PercentageCard label="% ARTICOLI VENDUTI" value={economia.percentualeVenduta} />
                <MoneyCard label="INCASSO REALE" value={economia.incassoReale} important />
                <StatCard label="% INVESTIMENTO RECUPERATO" value={economia.percentualeRecuperata === null ? "—" : formatPercentage(economia.percentualeRecuperata)} accent="yellow" />
                <MoneyCard label="RESIDUO DA RECUPERARE" value={economia.residuoDaRecuperare} />
                <MoneyCard label="SUPERATO BREAK-EVEN" value={economia.sopraBreakEven} />
              </div>
              {economia.percentualeRecuperata === null ? <p className="mt-3 text-sm text-zinc-400">Percentuale recuperata non calcolabile con investimento pari a zero.</p> : null}
              <p className="mt-4 text-sm text-zinc-400">Il recupero investimento confronta l’incasso lordo con il costo del lotto; non rappresenta un utile netto.</p>

              <h3 className="mt-8 font-black">IVA SULLE VENDITE</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MoneyCard label="INCASSO LORDO IVA INCLUSA" value={economia.iva.incassoLordo} />
                {[
                  { label: "IMPONIBILE", value: economia.iva.imponibile },
                  { label: "IVA", value: economia.iva.importo },
                  { label: "INCASSO NETTO IVA", value: economia.iva.incassoNetto },
                ].map(({ label, value }) => <StatCard key={label} label={label} value={value === null ? "—" : formatCurrency(value)} />)}
              </div>
              {economia.iva.aliquota === null ? <p className="mt-3 text-sm text-zinc-400">Aliquota IVA da configurare: imponibile, IVA e incasso netto IVA non ancora calcolati.</p> : null}

              <h3 className="mt-8 font-black">STOCK E RISULTATI POTENZIALI</h3>
              <p className="mt-2 text-sm text-zinc-400">Valori teorici dello stock non venduto, non incassi o utili già realizzati.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MoneyCard label="VALORE POPORAMA DISPONIBILE" value={economia.valorePoporamaDisponibile} />
                <MoneyCard label="POTENZIALE TOTALE LOTTO" value={economia.potenzialeTotale} />
                <MoneyCard label="RISULTATO POTENZIALE" value={economia.risultatoPotenziale} />
              </div>
              <h3 className="mt-8 font-black">CLASSIFICAZIONI DISPONIBILI</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(["NEW", "A", "B", "C", "N", ...(hasLegacyD ? ["D"] : [])] as GradoArticolo[]).map((grade) => (
                  <GradeStat key={grade} grade={grade} label={grade === "N" ? "Non testati disponibili" : "Pezzi disponibili"} value={economia.gradiDisponibili[grade]} />
                ))}
              </div>
            </>
          ) : <p className="mt-4 text-zinc-400">Dati economici non disponibili. Aggiorna il lotto.</p>}
        </section>

        <section aria-labelledby="vendite-lotto" className="mt-6 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
          <div className="p-6 sm:p-8">
            <h2 id="vendite-lotto" className="text-xl font-black">VENDITE DEL LOTTO</h2>
            <p className="mt-2 text-sm text-zinc-400">Dalla vendita più recente. Orari Europe/Rome; vendite senza data valida in fondo.</p>
          </div>
          {vendite.length === 0 ? (
            <p className="px-6 pb-8 text-zinc-400 sm:px-8">Nessuna vendita registrata per questo lotto.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-zinc-950 text-xs uppercase text-zinc-400">
                  <tr>{["Codice PP", "Nome prodotto", "Grado", "Prezzo POPORAMA previsto", "Prezzo vendita reale", "Data/ora vendita", "Azioni"].map((label) => <th key={label} scope="col" className="px-5 py-4">{label}</th>)}</tr>
                </thead>
                <tbody>
                  {vendite.map((vendita) => (
                    <tr key={vendita.id} className="border-t border-zinc-800">
                      <td className="whitespace-nowrap px-5 py-4 font-black text-yellow-400">{vendita.codicePP}</td>
                      <td className="px-5 py-4">{vendita.nomeProdotto || "Articolo POPORAMA"}</td>
                      <td className="px-5 py-4"><GradeBadge grade={vendita.grado} /></td>
                      <td className="whitespace-nowrap px-5 py-4 text-zinc-400">{formatCurrency(vendita.prezzoPoporama)}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-black text-emerald-400">{formatCurrency(vendita.prezzoVendita)}</td>
                      <td className="whitespace-nowrap px-5 py-4">{formatSaleDate(vendita.dataVendita)}</td>
                      <td className="px-5 py-4">
                        <button type="button" onClick={() => preparaAnnullamento(vendita)} disabled={annullamentoInCorso}
                          className="rounded-xl border border-yellow-500/50 px-4 py-3 text-xs font-black text-yellow-400 disabled:opacity-50">
                          RIPORTA A DISPONIBILE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ===================================================
            STATISTICHE PRINCIPALI
        =================================================== */}

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            label="Non testati"
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
            label="NUOVO"
            value={String(statistiche.nuovi)}
            accent="blue"
          />

          <StatCard
            label="Classificati"
            value={String(statistiche.classificati)}
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

        <p className="mt-4 text-sm text-zinc-400">
          Classificati: NUOVO + A + B + C + D (LEGACY). Testati: A + B + C + D (LEGACY).
          N indica esclusivamente gli articoli non testati.
        </p>

        <section className={`mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 ${hasLegacyD ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}>
          <GradeStat
            grade="NEW"
            label="Prodotto nuovo"
            value={statistiche.gradi.NEW}
          />
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

          {hasLegacyD ? (
            <GradeStat
              grade="D"
              label="Classificazione legacy"
              value={statistiche.gradi.D}
            />
          ) : null}
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

        <section
          aria-labelledby="listino-lotto-title"
          aria-busy={salvataggioListino}
          className="mt-6 rounded-3xl border border-yellow-500/40 bg-zinc-900 p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="listino-lotto-title" className="text-xl font-black text-yellow-400">
                LISTINO DEL LOTTO
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Percentuale del retail utilizzata per calcolare il prezzo POPORAMA
              </p>
            </div>
            <button
              type="button"
              onClick={salvaListinoLotto}
              disabled={salvataggioListino}
              className="shrink-0 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvataggioListino ? "SALVATAGGIO..." : "SALVA LISTINO"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "NUOVO", value: percentualeNuovoInput, setValue: setPercentualeNuovoInput },
              { label: "A", value: percentualeGradoAInput, setValue: setPercentualeGradoAInput },
              { label: "B", value: percentualeGradoBInput, setValue: setPercentualeGradoBInput },
              { label: "C", value: percentualeGradoCInput, setValue: setPercentualeGradoCInput },
              { label: "N", value: percentualeGradoNInput, setValue: setPercentualeGradoNInput },
            ].map(({ label, value, setValue }) => (
              <label key={label} className="block min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  {label}
                </span>
                <span className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={value}
                    disabled={salvataggioListino}
                    aria-describedby="listino-lotto-help"
                    onChange={(event) => {
                      setValue(event.target.value);
                      setMessaggioListino("");
                      setErroreListino("");
                    }}
                    className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-3 text-lg font-black text-white outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="font-black text-yellow-400">%</span>
                </span>
              </label>
            ))}
          </div>

          <p id="listino-lotto-help" className="mt-4 text-xs text-zinc-400">
            Valori obbligatori da 0 a 100, con massimo 2 decimali. Puoi usare la virgola o il punto.
          </p>
          <div className="mt-4 space-y-1 text-sm text-zinc-400">
            <p>NUOVO = prodotto nuovo</p>
            <p>A = migliore condizione tra i resi testati</p>
            <p>B = funzionante con incompletezze</p>
            <p>C = testato e NON FUNZIONANTE</p>
            <p>N = non testato</p>
          </div>

          {erroreListino ? (
            <p role="alert" className="mt-4 rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm font-bold text-red-200">
              {erroreListino}
            </p>
          ) : null}
          {messaggioListino ? (
            <p role="status" className="mt-4 rounded-xl border border-emerald-700 bg-emerald-950/30 px-4 py-3 text-sm font-bold text-emerald-300">
              {messaggioListino}
            </p>
          ) : null}
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

                  <option value="NEW">
                    NUOVO
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
                    C — NON FUNZIONANTE
                  </option>

                  {hasLegacyD ? (
                    <option value="D">
                      D (LEGACY)
                    </option>
                  ) : null}
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

  if (normalized === "NEW") {
    classes = "border-violet-500/40 bg-violet-500/10 text-violet-300";
  }

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
      {normalized === "NEW" ? "NUOVO" : normalized === "D" ? "D (LEGACY)" : normalized === "C" ? "C — NON FUNZIONANTE" : normalized}
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
): GradoArticolo {
  const grade =
    String(value || "")
      .trim()
      .toUpperCase();

  if (
    grade === "NEW" ||
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

function parseListinoPercentage(value: string, label: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) {
    throw new Error(`Inserisci la percentuale per ${label}.`);
  }

  const number = Number(normalized);
  if (
    !/^\d+(?:\.\d{1,2})?$/.test(normalized) ||
    !Number.isFinite(number) ||
    number < 0 ||
    number > 100
  ) {
    throw new Error(`${label}: inserisci una percentuale tra 0 e 100 con massimo 2 decimali.`);
  }

  return number;
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

function formatSaleDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${formatDate(value)} (orario non registrato)`;
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Data non disponibile";
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short", timeStyle: "short", timeZone: "Europe/Rome",
  }).format(date);
}
