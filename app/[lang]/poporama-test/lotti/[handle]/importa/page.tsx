"use client";

import {
  ChangeEvent,
  useMemo,
  useState,
} from "react";
import { formatPPCode as formatPP } from "@/app/lib/poporama-pp";
import { useParams } from "next/navigation";

type ManifestRow = Record<string, string>;

type ParsedManifest = {
  headers: string[];
  rows: ManifestRow[];
};

type NumberingResponse = {
  from?: number;
  to?: number;
  ppReservation?: string;
  ok: boolean;
  totaleArticoli?: number;
  ultimoNumeroPP?: number;
  prossimoNumeroPP?: number;
  prossimoCodicePP?: string;

  intervallo?: {
    from: number;
    to: number;
    totaleEsistenti: number;
    codiciEsistenti: string[];
  } | null;

  error?: string;
};

type ImportError = {
  row: number;
  codicePP: string;
  message: string;
};

type ImportStatus =
  | "idle"
  | "preparing"
  | "ready"
  | "importing"
  | "completed"
  | "error";

type SavedImportPlan = {
  ppReservation?: string;
  handle: string;
  fileName: string;
  fileSize: number;
  fileLastModified: number;

  firstPPNumber: number;
  totalRows: number;

  percentA: number;
  percentB: number;
  percentC: number;
  percentN: number;

  createdAt: string;
};

export default function ImportaManifestPage() {
  const params = useParams();

  const lang =
    typeof params.lang === "string"
      ? params.lang
      : "it";

  const handle =
    typeof params.handle === "string"
      ? params.handle
      : "";

  const [ppReservation, setPPReservation] = useState("");

  const [fileName, setFileName] =
    useState("");

  const [fileSize, setFileSize] =
    useState(0);

  const [
    fileLastModified,
    setFileLastModified,
  ] = useState(0);

  const [manifest, setManifest] =
    useState<ParsedManifest | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [percentA, setPercentA] =
    useState("55");

  const [percentB, setPercentB] =
    useState("45");

  const [percentC, setPercentC] =
    useState("35");

  const [percentN, setPercentN] =
    useState("30");

  const [
    importStatus,
    setImportStatus,
  ] =
    useState<ImportStatus>("idle");

  const [
    firstPPNumber,
    setFirstPPNumber,
  ] =
    useState<number | null>(null);

  const [
    firstPPCode,
    setFirstPPCode,
  ] =
    useState("");

  const [
    lastPPCode,
    setLastPPCode,
  ] =
    useState("");

  const [
    processedCount,
    setProcessedCount,
  ] =
    useState(0);

  const [
    createdCount,
    setCreatedCount,
  ] =
    useState(0);

  const [
    alreadyExistingCount,
    setAlreadyExistingCount,
  ] =
    useState(0);

  const [
    importErrors,
    setImportErrors,
  ] =
    useState<ImportError[]>([]);

  const [
    currentPP,
    setCurrentPP,
  ] =
    useState("");

  const [
    recoveryMessage,
    setRecoveryMessage,
  ] =
    useState("");

  /*
   * =========================================================
   * STATISTICHE MANIFEST
   * =========================================================
   */

  const stats = useMemo(() => {
    if (!manifest) {
      return {
        articoli: 0,
        pallet: 0,
        retail: 0,
        valoreN: 0,
        conEan: 0,
        senzaEan: 0,
      };
    }

    const palletSet =
      new Set<string>();

    let retail = 0;
    let conEan = 0;
    let senzaEan = 0;

    for (
      const row of manifest.rows
    ) {
      const pallet =
        getValue(row, [
          "Pallet ID",
          "PALLET ID",
          "Pallet",
          "PALLET",
        ]);

      if (pallet) {
        palletSet.add(pallet);
      }

      const ean =
        getValue(row, [
          "EAN",
          "ean",
        ]);

      if (ean) {
        conEan += 1;
      } else {
        senzaEan += 1;
      }

      const retailValue =
        getValue(row, [
          "UNIT RETAIL",
          "Unit Retail",
          "unit retail",
          "RETAIL",
          "Retail",
        ]);

      retail +=
        parseMoney(
          retailValue
        );
    }

    const n =
      parsePercentage(
        percentN
      );

    return {
      articoli:
        manifest.rows.length,

      pallet:
        palletSet.size,

      retail,

      valoreN:
        retail *
        (n / 100),

      conEan,

      senzaEan,
    };
  }, [
    manifest,
    percentN,
  ]);

  const progressPercentage =
    stats.articoli > 0
      ? Math.round(
          (
            processedCount /
            stats.articoli
          ) * 100
        )
      : 0;

  /*
   * =========================================================
   * CARICAMENTO CSV
   * =========================================================
   */

  async function handleFile(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setManifest(null);

    resetImportState();

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(
      file.name
    );

    setFileSize(
      file.size
    );

    setFileLastModified(
      file.lastModified
    );

    const lowerName =
      file.name.toLowerCase();

    if (
      !lowerName.endsWith(
        ".csv"
      )
    ) {
      setError(
        "Per questo primo test carica il manifest B-Stock in formato CSV. Il supporto Excel verrà aggiunto dopo aver verificato il CSV."
      );

      return;
    }

    try {
      const text =
        await file.text();

      const parsed =
        parseCsv(text);

      if (
        parsed.headers.length ===
        0
      ) {
        throw new Error(
          "Il file non contiene intestazioni leggibili."
        );
      }

      if (
        parsed.rows.length ===
        0
      ) {
        throw new Error(
          "Il file non contiene articoli."
        );
      }

      setManifest(parsed);

      /*
       * Se esiste un piano precedente
       * relativo ESATTAMENTE a questo
       * lotto + file, proviamo a
       * recuperarlo.
       */

      await tryRestoreImportPlan(
        parsed,
        file
      );
    } catch (err) {
      console.error(
        "Errore lettura manifest:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Impossibile leggere il manifest."
      );
    }
  }

  /*
   * =========================================================
   * RESET
   * =========================================================
   */

  function resetImportState() {
    setImportStatus("idle");

    setFirstPPNumber(null);
    setPPReservation("");

    setFirstPPCode("");

    setLastPPCode("");

    setProcessedCount(0);

    setCreatedCount(0);

    setAlreadyExistingCount(
      0
    );

    setImportErrors([]);

    setCurrentPP("");

    setRecoveryMessage("");
  }

  /*
   * =========================================================
   * LOCAL STORAGE
   * =========================================================
   */

  function storageKey(
    name: string,
    size: number,
    lastModified: number
  ) {
    return [
      "poporama-import",
      handle,
      name,
      size,
      lastModified,
    ].join(":");
  }

  function saveImportPlan(
    start: number,
    reservation: string
  ) {
    if (
      !manifest ||
      typeof window ===
        "undefined"
    ) {
      return;
    }

    const plan: SavedImportPlan =
      {
        handle,

        fileName,

        fileSize,

        fileLastModified,

        firstPPNumber:
          start,
        ppReservation: reservation,

        totalRows:
          manifest.rows.length,

        percentA:
          parsePercentage(
            percentA
          ),

        percentB:
          parsePercentage(
            percentB
          ),

        percentC:
          parsePercentage(
            percentC
          ),

        percentN:
          parsePercentage(
            percentN
          ),

        createdAt:
          new Date().toISOString(),
      };

    window.localStorage.setItem(
      storageKey(
        fileName,
        fileSize,
        fileLastModified
      ),

      JSON.stringify(plan)
    );
  }

  function removeSavedPlan() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    window.localStorage.removeItem(
      storageKey(
        fileName,
        fileSize,
        fileLastModified
      )
    );
  }

  /*
   * =========================================================
   * RECUPERO PIANO PRECEDENTE
   * =========================================================
   */

  async function tryRestoreImportPlan(
    parsed:
      ParsedManifest,
    file: File
  ) {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const key =
      storageKey(
        file.name,
        file.size,
        file.lastModified
      );

    const raw =
      window.localStorage.getItem(
        key
      );

    if (!raw) {
      return;
    }

    try {
      const plan =
        JSON.parse(
          raw
        ) as SavedImportPlan;

      if (
        plan.handle !==
          handle ||
        plan.fileName !==
          file.name ||
        plan.fileSize !==
          file.size ||
        plan.fileLastModified !==
          file.lastModified ||
        plan.totalRows !==
          parsed.rows.length
      ) {
        return;
      }

      const start =
        plan.firstPPNumber;
      if (!Number.isSafeInteger(start) || start < 1) throw new Error("Piano di import non valido.");
      setPPReservation(plan.ppReservation || "");

      const end =
        start +
        parsed.rows.length -
        1;

      setImportStatus(
        "preparing"
      );

      const response =
        await fetch(
          `/api/poporama/articoli?from=${start}&to=${end}&lottoHandle=${encodeURIComponent(handle)}`,
          {
            method: "GET",
            cache:
              "no-store",
          }
        );

      const data =
        (await response.json()) as
          NumberingResponse;

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
            "Impossibile verificare l'importazione precedente."
        );
      }

      const existing =
        new Set(
          data.intervallo
            ?.codiciEsistenti ??
            []
        );

      /*
       * Contiamo quanti PP consecutivi
       * dall'inizio risultano già
       * realmente presenti.
       */

      let contiguous = 0;

      for (
        let index = 0;
        index <
        parsed.rows.length;
        index += 1
      ) {
        const codice =
          formatPP(
            start + index
          );

        if (
          existing.has(
            codice
          )
        ) {
          contiguous += 1;
        } else {
          break;
        }
      }

      setFirstPPNumber(
        start
      );

      setFirstPPCode(
        formatPP(start)
      );

      setLastPPCode(
        formatPP(end)
      );

      setProcessedCount(
        contiguous
      );

      setCreatedCount(0);

      setAlreadyExistingCount(
        existing.size
      );

      setPercentA(
        String(
          plan.percentA
        )
      );

      setPercentB(
        String(
          plan.percentB
        )
      );

      setPercentC(
        String(
          plan.percentC
        )
      );

      setPercentN(
        String(
          plan.percentN
        )
      );

      setImportStatus("ready");
      setRecoveryMessage(`Piano recuperato: ${existing.size} codici presenti nell'intervallo. Alla ripresa ogni riga verrà confrontata con l'articolo esistente prima di essere considerata completata.`);
    } catch (err) {
      console.error(
        "Errore recupero import:",
        err
      );

      setImportStatus(
        "error"
      );

      setError(
        err instanceof Error
          ? err.message
          : "Impossibile recuperare l'importazione precedente."
      );
    }
  }

  /*
   * =========================================================
   * PREPARA NUOVO IMPORT
   * =========================================================
   */

  async function prepareImport() {
    if (!manifest) {
      return;
    }

    setError("");

    setRecoveryMessage(
      ""
    );

    setImportErrors([]);

    setImportStatus(
      "preparing"
    );

    try {
      const response =
        await fetch(
          "/api/poporama/articoli",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reservePP", lottoHandle: handle, count: manifest.rows.length }),
            cache:
              "no-store",
          }
        );

      const data =
        (await response.json()) as
          NumberingResponse;

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
            "Impossibile ottenere la numerazione PP."
        );
      }

      if (
        typeof data.from !== "number" || !data.ppReservation || data.to !== data.from + manifest.rows.length - 1
      ) {
        throw new Error(
          "Shopify non ha restituito il prossimo numero PP."
        );
      }

      const start =
        data.from;
      setPPReservation(data.ppReservation);

      const end =
        start +
        manifest.rows.length -
        1;

      setFirstPPNumber(
        start
      );

      setFirstPPCode(
        formatPP(start)
      );

      setLastPPCode(
        formatPP(end)
      );

      setProcessedCount(0);

      setCreatedCount(0);

      setAlreadyExistingCount(
        0
      );

      setCurrentPP("");

      setImportErrors([]);

      /*
       * Salviamo SUBITO il piano.
       *
       * In questo modo se browser,
       * rete o computer si interrompono,
       * al caricamento dello stesso file
       * possiamo ricostruire
       * l'intervallo originale.
       */

      saveImportPlan(
        start, data.ppReservation
      );

      setImportStatus(
        "ready"
      );
    } catch (err) {
      console.error(
        "Errore preparazione import:",
        err
      );

      setImportStatus(
        "error"
      );

      setError(
        err instanceof Error
          ? err.message
          : "Impossibile preparare l'importazione."
      );
    }
  }

  /*
   * =========================================================
   * IMPORT
   * =========================================================
   */

  async function startImport() {
    if (
      !manifest ||
      firstPPNumber === null
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Stai per importare ${manifest.rows.length} articoli POPORAMA.\n\nIntervallo:\n${firstPPCode} → ${lastPPCode}\n\nLe righe già presenti verranno verificate. Un codice occupato da un articolo diverso interrompe l’importazione.\n\nGrado iniziale: N\nPercentuale N: ${formatPercentage(
          parsePercentage(
            percentN
          )
        )}\n\nVuoi procedere?`
      );

    if (!confirmed) {
      return;
    }

    setError("");

    setImportErrors([]);

    setCreatedCount(0);

    setCurrentPP("");

    setRecoveryMessage(
      ""
    );

    setImportStatus(
      "importing"
    );

    const start =
      firstPPNumber;

    const end =
      start +
      manifest.rows.length -
      1;

    /*
     * Prima di creare QUALSIASI cosa
     * chiediamo a Shopify quali PP
     * dell'intervallo esistono già.
     */

    let existing =
      new Set<string>();

    try {
      const response =
        await fetch(
          `/api/poporama/articoli?from=${start}&to=${end}&lottoHandle=${encodeURIComponent(handle)}`,
          {
            method: "GET",
            cache:
              "no-store",
          }
        );

      const data =
        (await response.json()) as
          NumberingResponse;

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
            "Impossibile controllare gli articoli già presenti."
        );
      }

      existing =
        new Set(
          data.intervallo
            ?.codiciEsistenti ??
            []
        );

      setAlreadyExistingCount(
        existing.size
      );
    } catch (err) {
      setImportStatus(
        "error"
      );

      setError(
        err instanceof Error
          ? err.message
          : "Impossibile verificare Shopify."
      );

      return;
    }

    const n =
      parsePercentage(
        percentN
      );

    let created = 0;
    let processed = 0;

    for (
      let index = 0;
      index <
      manifest.rows.length;
      index += 1
    ) {
      const row =
        manifest.rows[index];

      const ppNumber =
        firstPPNumber +
        index;

      const codicePP =
        formatPP(
          ppNumber
        );

      setCurrentPP(
        codicePP
      );

      const retail =
        parseMoney(
          getValue(
            row,
            [
              "UNIT RETAIL",
              "Unit Retail",
              "unit retail",
              "RETAIL",
              "Retail",
            ]
          )
        );

      const costoManifest =
        parseMoney(
          getValue(
            row,
            [
              "COST",
              "Cost",
              "cost",
            ]
          )
        );

      const body = {
        lottoHandle:
          handle,

        codicePP,
        ...(ppReservation ? { ppReservation } : {}),

        nomeProdotto:
          getValue(
            row,
            [
              "Item Desc",
              "ITEM DESC",
              "Item Description",
              "Description",
            ]
          ),

        asin:
          getValue(
            row,
            [
              "ASIN",
              "asin",
            ]
          ),

        ean:
          getValue(
            row,
            [
              "EAN",
              "ean",
            ]
          ),

        upc:
          getValue(
            row,
            [
              "UPC",
              "upc",
            ]
          ),

        fnsku:
          getValue(
            row,
            [
              "FNSku",
              "FNSKU",
              "fnsku",
            ]
          ),

        lpn:
          getValue(
            row,
            [
              "LPN",
              "lpn",
            ]
          ),

        palletId:
          getValue(
            row,
            [
              "Pallet ID",
              "PALLET ID",
              "Pallet",
              "PALLET",
            ]
          ),

        condizioneOriginale:
          getValue(
            row,
            [
              "CONDITION",
              "Condition",
              "condition",
            ]
          ),

        categoria:
          getValue(
            row,
            [
              "CATEGORY",
              "Category",
              "category",
            ]
          ),

        sottocategoria:
          getValue(
            row,
            [
              "SUBCATEGORY",
              "Subcategory",
              "subcategory",
            ]
          ),

        retail,

        costoManifest,

        grado: "N",

        percentualePrezzo:
          n,
      };

      try {
        const response =
          await fetch(
            "/api/poporama/articoli",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  body
                ),
            }
          );

        const data =
          await response.json();

        // Un PP esistente è recuperabile solo se il server conferma stesso
        // lotto e dati originari della riga. Mai saltare collisioni diverse.
        if (
          response.status ===
            409 &&
          data.duplicate && data.matchesImportRow
        ) {
          existing.add(
            codicePP
          );

          processed += 1;

          setAlreadyExistingCount(
            existing.size
          );

          setProcessedCount(
            processed
          );

          continue;
        }

        if (
          !response.ok ||
          !data.ok
        ) {
          const details =
            Array.isArray(
              data.details
            )
              ? data.details
                  .map(
                    (item: {
                      message?: string;
                    }) =>
                      item.message ||
                      ""
                  )
                  .filter(
                    Boolean
                  )
                  .join(
                    " | "
                  )
              : "";

          throw new Error(
            details ||
              data.error ||
              "Shopify non ha creato l'articolo."
          );
        }

        created += 1;
        processed += 1;

        existing.add(
          codicePP
        );

        setCreatedCount(
          created
        );

        setAlreadyExistingCount(
          existing.size -
            created
        );

        setProcessedCount(
          processed
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Errore sconosciuto";

        const failure:
          ImportError = {
          row:
            index + 1,

          codicePP,

          message,
        };

        setImportErrors([
          failure,
        ]);

        /*
         * Ci fermiamo.
         *
         * Il piano rimane salvato.
         * Gli articoli già creati
         * rimangono su Shopify.
         *
         * Premendo RIPRENDI,
         * Shopify verrà interrogato
         * nuovamente e i PP già
         * presenti saranno saltati.
         */

        setCurrentPP(
          codicePP
        );

        setImportStatus(
          "error"
        );

        setError(
          `Importazione fermata alla riga ${
            index + 1
          } (${codicePP}). ${message}`
        );

        return;
      }
    }

    setCurrentPP("");

    setProcessedCount(
      manifest.rows.length
    );

    setImportStatus(
      "completed"
    );

    setRecoveryMessage(
      `Importazione completata. ${manifest.rows.length} articoli dell'intervallo ${firstPPCode} → ${lastPPCode} risultano processati.`
    );

    /*
     * Import terminato:
     * il piano di recupero non serve
     * più.
     */

    removeSavedPlan();
  }

  /*
   * =========================================================
   * ANNULLA PIANO
   * =========================================================
   */

  function cancelPreparedImport() {
    if (
      importStatus ===
      "importing"
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Vuoi annullare la preparazione di questo import? Gli articoli eventualmente già creati su Shopify NON verranno eliminati."
      );

    if (!confirmed) {
      return;
    }

    removeSavedPlan();

    resetImportState();
  }

  const previewRows =
    manifest?.rows.slice(
      0,
      12
    ) ?? [];

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <a
          href={`/${lang}/poporama-test/lotti/${handle}`}
          className="text-sm font-bold text-zinc-400 transition hover:text-white"
        >
          ← Torna al lotto
        </a>

        <header className="mt-6">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
            POPORAMA
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Importa manifest
          </h1>

          <p className="mt-2 text-zinc-400">
            Lotto:{" "}
            <span className="font-bold text-white">
              {handle}
            </span>
          </p>
        </header>

        {/* STEP 1 */}

        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                STEP 1
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Seleziona il manifest
              </h2>

              <p className="mt-2 max-w-2xl text-zinc-400">
                Carica il CSV B-Stock del lotto.
                Ogni riga del manifest diventerà
                un articolo POPORAMA.
              </p>
            </div>

            <label className="cursor-pointer rounded-2xl bg-yellow-400 px-6 py-4 text-center font-black text-black transition hover:bg-yellow-300">
              SELEZIONA CSV

              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFile}
                disabled={
                  importStatus ===
                  "importing"
                }
                className="hidden"
              />
            </label>
          </div>

          {fileName && (
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                File selezionato
              </p>

              <p className="mt-2 break-all font-bold text-white">
                {fileName}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 p-5">
              <p className="font-black text-red-400">
                ATTENZIONE
              </p>

              <p className="mt-2 text-sm text-red-200">
                {error}
              </p>
            </div>
          )}
        </section>

        {manifest && (
          <>
            {/* STATISTICHE */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard
                label="Articoli"
                value={String(
                  stats.articoli
                )}
                important
              />

              <StatCard
                label="Pallet"
                value={String(
                  stats.pallet
                )}
              />

              <StatCard
                label="Retail totale"
                value={formatCurrency(
                  stats.retail
                )}
              />

              <StatCard
                label="Valore Grado N"
                value={formatCurrency(
                  stats.valoreN
                )}
                important
              />

              <StatCard
                label="Con EAN"
                value={String(
                  stats.conEan
                )}
              />

              <StatCard
                label="Senza EAN"
                value={String(
                  stats.senzaEan
                )}
              />
            </section>

            {/* STEP 2 */}

            <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                STEP 2
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Percentuali prezzo del lotto
              </h2>

              <p className="mt-2 text-zinc-400">
                Gli articoli importati partono
                in Grado N. Le altre percentuali
                saranno utilizzate dopo il test.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <PercentageField
                  label="Grado A"
                  value={percentA}
                  onChange={
                    setPercentA
                  }
                  disabled={
                    importStatus ===
                    "importing"
                  }
                />

                <PercentageField
                  label="Grado B"
                  value={percentB}
                  onChange={
                    setPercentB
                  }
                  disabled={
                    importStatus ===
                    "importing"
                  }
                />

                <PercentageField
                  label="Grado C — NON FUNZIONANTE"
                  value={percentC}
                  onChange={
                    setPercentC
                  }
                  disabled={
                    importStatus ===
                    "importing"
                  }
                />

                <PercentageField
                  label="Grado N"
                  value={percentN}
                  onChange={
                    setPercentN
                  }
                  disabled={
                    importStatus ===
                    "importing"
                  }
                  important
                />
              </div>
            </section>

            {/* PREVIEW */}

            <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
              <div className="p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                  ANTEPRIMA
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Prime righe del manifest
                </h2>

                <p className="mt-2 text-zinc-400">
                  Visualizziamo le prime 12 righe
                  prima della creazione degli
                  articoli.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="border-y border-zinc-800 bg-zinc-950">
                    <tr>
                      <TableHead>
                        #
                      </TableHead>

                      <TableHead>
                        Pallet
                      </TableHead>

                      <TableHead>
                        ASIN
                      </TableHead>

                      <TableHead>
                        EAN
                      </TableHead>

                      <TableHead>
                        Prodotto
                      </TableHead>

                      <TableHead>
                        Condizione
                      </TableHead>

                      <TableHead right>
                        Retail
                      </TableHead>

                      <TableHead right>
                        Prezzo N
                      </TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {previewRows.map(
                      (
                        row,
                        index
                      ) => {
                        const retail =
                          parseMoney(
                            getValue(
                              row,
                              [
                                "UNIT RETAIL",
                                "Unit Retail",
                                "unit retail",
                                "RETAIL",
                                "Retail",
                              ]
                            )
                          );

                        const priceN =
                          retail *
                          (
                            parsePercentage(
                              percentN
                            ) /
                            100
                          );

                        return (
                          <tr
                            key={
                              index
                            }
                            className="border-b border-zinc-800 last:border-b-0"
                          >
                            <TableCell>
                              {index +
                                1}
                            </TableCell>

                            <TableCell>
                              {getValue(
                                row,
                                [
                                  "Pallet ID",
                                  "PALLET ID",
                                  "Pallet",
                                ]
                              ) ||
                                "—"}
                            </TableCell>

                            <TableCell>
                              {getValue(
                                row,
                                [
                                  "ASIN",
                                  "asin",
                                ]
                              ) ||
                                "—"}
                            </TableCell>

                            <TableCell>
                              {getValue(
                                row,
                                [
                                  "EAN",
                                  "ean",
                                ]
                              ) ||
                                "—"}
                            </TableCell>

                            <TableCell wide>
                              {getValue(
                                row,
                                [
                                  "Item Desc",
                                  "ITEM DESC",
                                  "Item Description",
                                  "Description",
                                ]
                              ) ||
                                "—"}
                            </TableCell>

                            <TableCell>
                              {getValue(
                                row,
                                [
                                  "CONDITION",
                                  "Condition",
                                  "condition",
                                ]
                              ) ||
                                "—"}
                            </TableCell>

                            <TableCell right>
                              {formatCurrency(
                                retail
                              )}
                            </TableCell>

                            <TableCell
                              right
                              important
                            >
                              {formatCurrency(
                                priceN
                              )}
                            </TableCell>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {stats.articoli >
                previewRows.length && (
                <div className="p-5 text-center text-sm font-bold text-zinc-600">
                  + altre{" "}
                  {stats.articoli -
                    previewRows.length}{" "}
                  righe nel manifest
                </div>
              )}
            </section>

            {/* STEP 3 */}

            <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                STEP 3
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Creazione articoli POPORAMA
              </h2>

              <p className="mt-2 text-zinc-400">
                Prepariamo prima la numerazione
                PP. Durante la preparazione non
                viene creato nessun articolo.
              </p>

              {recoveryMessage && (
                <div className="mt-6 rounded-2xl border border-yellow-700/60 bg-yellow-400/10 p-5">
                  <p className="text-xs font-black uppercase tracking-wider text-yellow-400">
                    RECUPERO IMPORT
                  </p>

                  <p className="mt-2 text-sm font-bold text-zinc-200">
                    {recoveryMessage}
                  </p>
                </div>
              )}

              {firstPPNumber !==
                null && (
                <div className="mt-6 rounded-2xl border border-yellow-700/60 bg-yellow-400/5 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                    INTERVALLO PP PREVISTO
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-2xl font-black">
                    <span>
                      {
                        firstPPCode
                      }
                    </span>

                    <span className="text-zinc-600">
                      →
                    </span>

                    <span>
                      {
                        lastPPCode
                      }
                    </span>
                  </div>

                  <p className="mt-3 text-zinc-400">
                    {stats.articoli}{" "}
                    articoli • Grado
                    N •{" "}
                    {formatPercentage(
                      parsePercentage(
                        percentN
                      )
                    )}
                  </p>
                </div>
              )}

              {importStatus ===
                "importing" && (
                <div className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-950 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-yellow-400">
                        IMPORTAZIONE
                        IN CORSO
                      </p>

                      <p className="mt-2 text-xl font-black">
                        {
                          processedCount
                        }{" "}
                        /{" "}
                        {
                          stats.articoli
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-black text-yellow-400">
                        {
                          progressPercentage
                        }
                        %
                      </p>

                      {currentPP && (
                        <p className="mt-1 text-sm text-zinc-500">
                          {
                            currentPP
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 h-4 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{
                        width: `${progressPercentage}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <MiniStat
                      label="Creati ora"
                      value={
                        createdCount
                      }
                    />

                    <MiniStat
                      label="Già presenti"
                      value={
                        alreadyExistingCount
                      }
                    />

                    <MiniStat
                      label="Processati"
                      value={
                        processedCount
                      }
                    />
                  </div>
                </div>
              )}

              {importStatus ===
                "completed" && (
                <div className="mt-6 rounded-2xl border border-emerald-800 bg-emerald-950/30 p-6">
                  <p className="font-black text-emerald-400">
                    IMPORTAZIONE
                    COMPLETATA
                  </p>

                  <p className="mt-2 text-zinc-300">
                    Tutti i{" "}
                    {
                      stats.articoli
                    }{" "}
                    articoli risultano
                    processati.
                  </p>

                  <p className="mt-2 font-bold text-white">
                    {
                      firstPPCode
                    }{" "}
                    →{" "}
                    {
                      lastPPCode
                    }
                  </p>
                </div>
              )}

              {importErrors.length >
                0 && (
                <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/30 p-6">
                  <p className="font-black text-red-400">
                    IMPORTAZIONE
                    INTERROTTA
                  </p>

                  {importErrors.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          index
                        }
                        className="mt-3 text-sm"
                      >
                        <p className="font-black text-white">
                          Riga{" "}
                          {
                            item.row
                          }{" "}
                          —{" "}
                          {
                            item.codicePP
                          }
                        </p>

                        <p className="mt-1 text-red-300">
                          {
                            item.message
                          }
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="mt-6">
                {importStatus ===
                  "idle" && (
                  <button
                    type="button"
                    onClick={
                      prepareImport
                    }
                    className="w-full rounded-2xl bg-yellow-400 px-6 py-5 text-lg font-black text-black transition hover:bg-yellow-300"
                  >
                    PREPARA IMPORT{" "}
                    {
                      stats.articoli
                    }{" "}
                    ARTICOLI
                  </button>
                )}

                {importStatus ===
                  "preparing" && (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-wait rounded-2xl bg-zinc-700 px-6 py-5 text-lg font-black text-zinc-300"
                  >
                    CONTROLLO
                    SHOPIFY...
                  </button>
                )}

                {importStatus ===
                  "ready" && (
                  <button
                    type="button"
                    onClick={
                      startImport
                    }
                    className="w-full rounded-2xl bg-yellow-400 px-6 py-5 text-lg font-black text-black transition hover:bg-yellow-300"
                  >
                    {alreadyExistingCount >
                    0
                      ? `RIPRENDI IMPORT ${stats.articoli} ARTICOLI`
                      : `IMPORTA ORA ${stats.articoli} ARTICOLI`}
                  </button>
                )}

                {importStatus ===
                  "importing" && (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-wait rounded-2xl bg-yellow-400/60 px-6 py-5 text-lg font-black text-black"
                  >
                    IMPORTAZIONE IN
                    CORSO...
                  </button>
                )}

                {importStatus ===
                  "error" &&
                  firstPPNumber !==
                    null && (
                    <button
                      type="button"
                      onClick={
                        startImport
                      }
                      className="w-full rounded-2xl bg-yellow-400 px-6 py-5 text-lg font-black text-black transition hover:bg-yellow-300"
                    >
                      CONTROLLA SHOPIFY
                      E RIPRENDI IMPORT
                    </button>
                  )}

                {firstPPNumber !==
                  null &&
                  importStatus !==
                    "importing" &&
                  importStatus !==
                    "completed" && (
                    <button
                      type="button"
                      onClick={
                        cancelPreparedImport
                      }
                      className="mt-3 w-full rounded-2xl border border-zinc-700 px-6 py-4 font-bold text-zinc-400 transition hover:border-zinc-500 hover:text-white"
                    >
                      ANNULLA
                      PREPARAZIONE
                    </button>
                  )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/*
 * ============================================================
 * COMPONENTI UI
 * ============================================================
 */

function PercentageField({
  label,
  value,
  onChange,
  disabled = false,
  important = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  disabled?: boolean;
  important?: boolean;
}) {
  return (
    <label
      className={`rounded-2xl border p-5 ${
        important
          ? "border-yellow-700/60 bg-yellow-400/5"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <span
        className={`text-xs font-black uppercase tracking-wider ${
          important
            ? "text-yellow-400"
            : "text-zinc-500"
        }`}
      >
        {label}
      </span>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-xl font-black text-white outline-none focus:border-yellow-400 disabled:opacity-50"
        />

        <span className="font-black text-zinc-500">
          %
        </span>
      </div>
    </label>
  );
}

function StatCard({
  label,
  value,
  important = false,
}: {
  label: string;
  value: string;
  important?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-black ${
          important
            ? "text-yellow-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-1 text-xl font-black">
        {value}
      </p>
    </div>
  );
}

function TableHead({
  children,
  right = false,
}: {
  children:
    React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-4 text-xs font-black uppercase tracking-wider text-zinc-500 ${
        right
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  right = false,
  wide = false,
  important = false,
}: {
  children:
    React.ReactNode;
  right?: boolean;
  wide?: boolean;
  important?: boolean;
}) {
  return (
    <td
      className={`px-4 py-4 align-top ${
        wide
          ? "min-w-[320px] max-w-[480px]"
          : "whitespace-nowrap"
      } ${
        right
          ? "text-right"
          : "text-left"
      } ${
        important
          ? "font-black text-yellow-400"
          : "text-zinc-300"
      }`}
    >
      {children}
    </td>
  );
}

/*
 * ============================================================
 * DATI MANIFEST
 * ============================================================
 */

function getValue(
  row: ManifestRow,
  possibleHeaders:
    string[]
) {
  for (
    const header of
    possibleHeaders
  ) {
    const value =
      row[header];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !==
        ""
    ) {
      return String(
        value
      ).trim();
    }
  }

  return "";
}

function parsePercentage(
  value: string
) {
  const normalized =
    value
      .trim()
      .replace(
        ",",
        "."
      );

  const parsed =
    Number(
      normalized
    );

  if (
    !Number.isFinite(
      parsed
    )
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      parsed
    )
  );
}

function parseMoney(
  value: string
) {
  if (!value) {
    return 0;
  }

  let normalized =
    value
      .trim()
      .replace(
        /[€$£\s]/g,
        ""
      );

  if (
    normalized.includes(
      ","
    ) &&
    normalized.includes(
      "."
    )
  ) {
    const lastComma =
      normalized.lastIndexOf(
        ","
      );

    const lastDot =
      normalized.lastIndexOf(
        "."
      );

    if (
      lastComma >
      lastDot
    ) {
      normalized =
        normalized
          .replace(
            /\./g,
            ""
          )
          .replace(
            ",",
            "."
          );
    } else {
      normalized =
        normalized.replace(
          /,/g,
          ""
        );
    }
  } else if (
    normalized.includes(
      ","
    ) &&
    !normalized.includes(
      "."
    )
  ) {
    normalized =
      normalized.replace(
        ",",
        "."
      );
  }

  const parsed =
    Number(
      normalized
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "it-IT",
    {
      style:
        "currency",
      currency:
        "EUR",
    }
  ).format(value);
}

function formatPercentage(
  value: number
) {
  return (
    new Intl.NumberFormat(
      "it-IT",
      {
        maximumFractionDigits:
          2,
      }
    ).format(value) + "%"
  );
}

/*
 * ============================================================
 * CSV PARSER
 *
 * Manteniamo il parser che ha già
 * letto correttamente il manifest
 * B-Stock da 599 righe / 45 colonne.
 * ============================================================
 */

function parseCsv(
  text: string
): ParsedManifest {
  const cleanText =
    text
      .replace(
        /^\uFEFF/,
        ""
      )
      .replace(
        /\r\n/g,
        "\n"
      )
      .replace(
        /\r/g,
        "\n"
      );

  const delimiter =
    detectDelimiter(
      cleanText
    );

  const records =
    parseDelimitedText(
      cleanText,
      delimiter
    );

  if (
    records.length ===
    0
  ) {
    return {
      headers: [],
      rows: [],
    };
  }

  const headers =
    records[0].map(
      (header) =>
        header.trim()
    );

  const rows:
    ManifestRow[] = [];

  for (
    let index = 1;
    index <
    records.length;
    index += 1
  ) {
    const record =
      records[index];

    const isEmpty =
      record.every(
        (cell) =>
          cell.trim() ===
          ""
      );

    if (isEmpty) {
      continue;
    }

    const row:
      ManifestRow = {};

    headers.forEach(
      (
        header,
        columnIndex
      ) => {
        row[header] =
          record[
            columnIndex
          ]?.trim() ??
          "";
      }
    );

    rows.push(row);
  }

  return {
    headers,
    rows,
  };
}

function detectDelimiter(
  text: string
) {
  const firstLine =
    text.split(
      "\n"
    )[0] ?? "";

  const candidates = [
    ",",
    ";",
    "\t",
  ];

  let bestDelimiter =
    ",";

  let bestCount = -1;

  for (
    const candidate of
    candidates
  ) {
    const count =
      countDelimiterOutsideQuotes(
        firstLine,
        candidate
      );

    if (
      count >
      bestCount
    ) {
      bestCount =
        count;

      bestDelimiter =
        candidate;
    }
  }

  return bestDelimiter;
}

function countDelimiterOutsideQuotes(
  line: string,
  delimiter: string
) {
  let inQuotes =
    false;

  let count = 0;

  for (
    let index = 0;
    index <
    line.length;
    index += 1
  ) {
    const char =
      line[index];

    if (
      char === '"'
    ) {
      if (
        inQuotes &&
        line[
          index + 1
        ] === '"'
      ) {
        index += 1;
      } else {
        inQuotes =
          !inQuotes;
      }
    } else if (
      char ===
        delimiter &&
      !inQuotes
    ) {
      count += 1;
    }
  }

  return count;
}

function parseDelimitedText(
  text: string,
  delimiter: string
) {
  const records:
    string[][] = [];

  let record:
    string[] = [];

  let field = "";

  let inQuotes =
    false;

  for (
    let index = 0;
    index <
    text.length;
    index += 1
  ) {
    const char =
      text[index];

    if (inQuotes) {
      if (
        char === '"'
      ) {
        if (
          text[
            index + 1
          ] === '"'
        ) {
          field += '"';

          index += 1;
        } else {
          inQuotes =
            false;
        }
      } else {
        field += char;
      }

      continue;
    }

    if (
      char === '"'
    ) {
      inQuotes = true;

      continue;
    }

    if (
      char ===
      delimiter
    ) {
      record.push(
        field
      );

      field = "";

      continue;
    }

    if (
      char === "\n"
    ) {
      record.push(
        field
      );

      records.push(
        record
      );

      record = [];

      field = "";

      continue;
    }

    field += char;
  }

  if (
    field.length > 0 ||
    record.length > 0
  ) {
    record.push(
      field
    );

    records.push(
      record
    );
  }

  return records;
}
