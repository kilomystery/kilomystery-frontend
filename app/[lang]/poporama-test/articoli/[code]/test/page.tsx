"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateTestPrice, parseTestPercentage } from "@/app/lib/poporama-test-pricing";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  downloadPoporamaLabelPdf,
} from "app/components/PoporamaLabelPdf";
import type {
  LabelData,
} from "app/components/PoporamaLabelPdf";

type Grade = "NEW" | "A" | "B" | "C" | "N";
type Listino = Record<Grade, number | null>;
type TestResult = "OK" | "KO" | "NA" | "";

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

  risultatiTest: Record<string, unknown>;

  testatoDa: string;
  dataTest: string;

  statoVendita: string;
  prezzoVendita: number;
  dataVendita: string;

  numeroSeriale: string;

  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  ok: boolean;
  articolo?: Articolo;
  listino?: Listino | null;
  erroreListino?: string;
  error?: string;
  message?: string;
};

type TestItem = {
  id: string;
  label: string;
  result: TestResult;
  note: string;
};

const TEST_BASE: Array<{
  id: string;
  label: string;
}> = [
  {
    id: "accensione",
    label: "Accensione",
  },
  {
    id: "alimentazione",
    label: "Alimentazione / ricarica",
  },
  {
    id: "funzioni_principali",
    label: "Funzioni principali",
  },
  {
    id: "comandi",
    label: "Comandi / pulsanti",
  },
  {
    id: "display",
    label: "Display / indicatori",
  },
  {
    id: "connettivita",
    label: "Connettività",
  },
  {
    id: "audio_video",
    label: "Audio / video",
  },
  {
    id: "movimento_meccanica",
    label: "Movimento / meccanica",
  },
  {
    id: "sicurezza",
    label: "Controlli di sicurezza",
  },
  {
    id: "prova_generale",
    label: "Prova generale",
  },
];

const GRADE_INFO: Record<
  Grade,
  {
    title: string;
    description: string;
  }
> = {
  A: {
    title: "TESTATO • PIENAMENTE FUNZIONANTE",
    description:
      "Articolo testato e pienamente funzionante.",
  },

  B: {
    title:
      "TESTATO • FUNZIONANTE CON INCOMPLETEZZA",
    description:
      "Funzionante, ma con accessori o dotazione incompleta.",
  },

  C: {
    title:
      "TESTATO • NON FUNZIONANTE",
    description:
      "Prodotto sottoposto a test e non funzionante. N indica invece un prodotto non testato.",
  },

  NEW: {
    title: "NUOVO",
    description: "Prodotto nuovo. I test tecnici non sono obbligatori.",
  },
  N: {
    title: "NON TESTATO",
    description: "Articolo non sottoposto a test tecnico.",
  },
};

export default function TestArticoloPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const lang =
    typeof params.lang === "string"
      ? params.lang
      : "it";

  const code =
    typeof params.code === "string"
      ? decodeURIComponent(params.code).toUpperCase()
      : "";

  const lottoHandle =
    searchParams.get("lotto")?.trim() || "";

  const lottoUrl = lottoHandle
    ? `/${lang}/poporama-test/lotti/${encodeURIComponent(
        lottoHandle
      )}`
    : `/${lang}/poporama-test/lotti`;

  const articleUrl =
    `/${lang}/poporama-test/articoli/${encodeURIComponent(
      code
    )}`;

  const [articolo, setArticolo] =
    useState<Articolo | null>(null);

  const [listino, setListino] = useState<Listino | null>(null);
  const [erroreListino, setErroreListino] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [etichettaInCorso, setEtichettaInCorso] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [grado, setGrado] =
    useState<Grade | "">("");

  const [
    percentualePrezzo,
    setPercentualePrezzo,
  ] = useState("");

  const [
    prezzoPoporama,
    setPrezzoPoporama,
  ] = useState("");

  const [
    numeroSeriale,
    setNumeroSeriale,
  ] = useState("");

  const [
    condizioneEstetica,
    setCondizioneEstetica,
  ] = useState("");

  const [
    accessoriMancanti,
    setAccessoriMancanti,
  ] = useState("");

  const [
    difettiDichiarati,
    setDifettiDichiarati,
  ] = useState("");

  const [noteTest, setNoteTest] =
    useState("");

  const [testatoDa, setTestatoDa] =
    useState("");

  const [dataTest, setDataTest] =
    useState(getTodayDate());

  const [tests, setTests] =
    useState<TestItem[]>(
      createEmptyTests()
    );

  /*
   * ==========================================================
   * CARICAMENTO
   * ==========================================================
   */

  useEffect(() => {
    if (!code) {
      return;
    }

    async function loadArticolo() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response = await fetch(
          `/api/poporama/articoli/${encodeURIComponent(
            code
          )}/test`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as ApiResponse;

        if (
          !response.ok ||
          !data.ok ||
          !data.articolo
        ) {
          throw new Error(
            data.error ||
              "Impossibile caricare l'articolo."
          );
        }

        const item = data.articolo;

        setArticolo(item);

        const existingGrade =
          normalizeGrade(item.grado);

        setGrado(existingGrade === "D" ? "" : existingGrade);
        setListino(data.listino ?? null);
        setErroreListino(data.erroreListino || "");
        const percentage = existingGrade === "D" ? null
          : parseTestPercentage(item.percentualePrezzo) ?? data.listino?.[existingGrade];
        setPercentualePrezzo(percentage == null ? "" : String(percentage));
        setPrezzoPoporama(percentage == null || data.erroreListino
          ? ""
          : calculateTestPrice(item.retail, percentage).toFixed(2));

        setNumeroSeriale(
          item.numeroSeriale || ""
        );

        setCondizioneEstetica(
          item.condizioneEstetica ||
            ""
        );

        setAccessoriMancanti(
          item.accessoriMancanti ||
            ""
        );

        setDifettiDichiarati(
          item.difettiDichiarati ||
            ""
        );

        setNoteTest(
          item.noteTest || ""
        );

        setTestatoDa(
          item.testatoDa || ""
        );

        setDataTest(
          item.dataTest ||
            getTodayDate()
        );

        setTests(
          hydrateTests(
            item.risultatiTest
          )
        );
      } catch (err) {
        console.error(
          "Errore caricamento test:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Errore durante il caricamento."
        );
      } finally {
        setLoading(false);
      }
    }

    loadArticolo();
  }, [code]);

  /*
   * ==========================================================
   * GRADO
   * ==========================================================
   */

  function selectGrade(
    nextGrade: Grade
  ) {
    if (nextGrade === grado) return;
    setGrado(nextGrade);
    setSuccess("");
    setError("");

    if (!articolo) {
      return;
    }

    const percentage = listino?.[nextGrade];
    setPercentualePrezzo(percentage == null ? "" : String(percentage));
    setPrezzoPoporama(percentage == null || erroreListino
      ? ""
      : calculateTestPrice(articolo.retail, percentage).toFixed(2));
  }

  function changePercentage(value: string) {
    setPercentualePrezzo(value);
    setSuccess("");
    setError("");
    const percentage = parseTestPercentage(value);
    setPrezzoPoporama(percentage === null || !articolo || erroreListino ? ""
      : calculateTestPrice(articolo.retail, percentage).toFixed(2));
  }

  /*
   * ==========================================================
   * CHECKLIST
   * ==========================================================
   */

  function updateTestResult(
    id: string,
    result: TestResult
  ) {
    setTests((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              result,
            }
          : item
      )
    );
  }

  function updateTestNote(
    id: string,
    note: string
  ) {
    setTests((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              note,
            }
          : item
      )
    );
  }

  /*
   * ==========================================================
   * SALVATAGGIO
   * ==========================================================
   */

  async function scaricaEtichetta() {
    if (!articolo || etichettaInCorso) {
      return;
    }

    try {
      setEtichettaInCorso(true);

      const grade = normalizeGradeForLabel(articolo.grado);

      // L'etichetta usa solo l'articolo restituito dal server, mai il form.
      const prezzo = Number(articolo.prezzoPoporama);

      const retail =
        Number(articolo.retail);

      const labelData: LabelData = {
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
          Number.isFinite(retail)
            ? retail.toFixed(2)
            : undefined,
        poporamaPrice:
          Number.isFinite(prezzo)
            ? prezzo.toFixed(2)
            : undefined,
        grade,
        testDate:
          formatDateForLabel(
            grade === "NEW"
              ? articolo.updatedAt || articolo.createdAt
              : grade === "N"
                ? articolo.createdAt
                : articolo.dataTest || articolo.updatedAt || articolo.createdAt
          ),
      };

      await downloadPoporamaLabelPdf(
        labelData
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
      setEtichettaInCorso(false);
    }
  }

  async function saveTest() {
    if (!articolo || saving) {
      return;
    }

    setError("");
    setSuccess("");

    if (!grado) {
      setError(
        "Seleziona la classificazione NUOVO, A, B, C oppure N."
      );
      return;
    }

    const chosenPercentage = parseTestPercentage(percentualePrezzo);
    if (erroreListino || chosenPercentage === null || !prezzoPoporama) {
      setError(erroreListino || "Percentuale prezzo obbligatoria: inserisci un numero da 0 a 100 con massimo 2 decimali, usando virgola o punto.");
      return;
    }

    if (grado !== "NEW" && grado !== "N" && !dataTest) {
      setError("Inserisci la data del test.");
      return;
    }

    try {
      setSaving(true);

      const risultatiTest =
        buildTestPayload(tests);

      const response = await fetch(
        `/api/poporama/articoli/${encodeURIComponent(
          articolo.codicePP
        )}/test`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            grado,
            percentualePrezzo: chosenPercentage,

            condizioneEstetica:
              condizioneEstetica.trim(),

            accessoriMancanti:
              accessoriMancanti.trim(),

            difettiDichiarati:
              difettiDichiarati.trim(),

            noteTest:
              noteTest.trim(),

            risultatiTest,

            testatoDa:
              grado === "NEW" || grado === "N" ? "" : testatoDa.trim(),

            dataTest: grado === "NEW" || grado === "N" ? "" : dataTest,

            numeroSeriale:
              numeroSeriale.trim(),
          }),
        }
      );

      const data =
        (await response.json()) as ApiResponse;

      if (
        !response.ok ||
        !data.ok ||
        !data.articolo
      ) {
        throw new Error(
          data.error ||
            "Impossibile salvare il test."
        );
      }

      setArticolo(
        data.articolo
      );
      setListino(data.listino ?? null);

      setPercentualePrezzo(
        String(
          data.articolo
            .percentualePrezzo
        )
      );

      setPrezzoPoporama(
        data.articolo
          .prezzoPoporama
          .toFixed(2)
      );

      setSuccess(
        `${data.articolo.codicePP} salvato correttamente: grado ${displayGrade(data.articolo.grado)} • ${formatCurrency(
          data.articolo
            .prezzoPoporama
        )}`
      );
    } catch (err) {
      console.error(
        "Errore salvataggio test:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Errore durante il salvataggio."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ==========================================================
   * RIEPILOGO TEST
   * ==========================================================
   */

  const testSummary =
    useMemo(() => {
      return {
        ok: tests.filter(
          (item) =>
            item.result === "OK"
        ).length,

        ko: tests.filter(
          (item) =>
            item.result === "KO"
        ).length,

        na: tests.filter(
          (item) =>
            item.result === "NA"
        ).length,

        vuoti: tests.filter(
          (item) => !item.result
        ).length,
      };
    }, [tests]);

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="font-black text-yellow-400">
            POPORAMA TEST CENTER
          </p>

          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-4xl">
              ⏳
            </p>

            <p className="mt-4 font-black">
              Caricamento
              articolo...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ==========================================================
   * ERRORE CARICAMENTO
   * ==========================================================
   */

  if (error && !articolo) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="text-sm font-bold text-zinc-400 hover:text-white"
          >
            ← Indietro
          </button>

          <div className="mt-8 rounded-3xl border border-red-800 bg-red-950/30 p-8">
            <h1 className="text-xl font-black text-red-300">
              Articolo non
              disponibile
            </h1>

            <p className="mt-3 text-red-200">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!articolo) {
    return null;
  }

  const currentGrade =
    normalizeGrade(
      articolo.grado
    );

  const sold =
    normalizeSaleStatus(
      articolo.statoVendita
    ) === "VENDUTO";

  /*
   * ==========================================================
   * PAGINA
   * ==========================================================
   */

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        {/* NAV */}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              router.push(lottoUrl)
            }
            className="text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            ← Torna al lotto
          </button>

          <button
            type="button"
            onClick={() =>
              window.location.assign(
                articleUrl
              )
            }
            className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-black transition hover:border-zinc-500"
          >
            SCHEDA ARTICOLO
          </button>
        </div>

        {/* HEADER */}

        <header className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
                POPORAMA TEST
                CENTER
              </p>

              <h1 className="mt-3 text-4xl font-black text-yellow-400">
                {articolo.codicePP}
              </h1>

              <h2 className="mt-4 max-w-4xl text-xl font-black leading-snug sm:text-2xl">
                {articolo.nomeProdotto ||
                  "Articolo POPORAMA"}
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>
                  GRADO ATTUALE{" "}
                  {displayGrade(currentGrade)}
                </Badge>

                <Badge>
                  {
                    articolo.statoVendita
                  }
                </Badge>

                {articolo.ean ? (
                  <Badge>
                    EAN{" "}
                    {articolo.ean}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="min-w-[230px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-zinc-600">
                Retail
              </p>

              <p className="mt-1 text-lg font-bold text-zinc-400">
                {formatCurrency(
                  articolo.retail
                )}
              </p>

              <p className="mt-5 text-xs font-black uppercase tracking-wider text-zinc-600">
                Prezzo attuale
              </p>

              <p className="mt-1 text-3xl font-black text-yellow-400">
                {formatCurrency(
                  articolo.prezzoPoporama
                )}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {
                  articolo.percentualePrezzo
                }
                % del Retail
              </p>
            </div>
          </div>
        </header>

        {sold ? (
          <div className="mt-6 rounded-2xl border border-red-700 bg-red-950/30 p-5">
            <p className="font-black text-red-300">
              ARTICOLO VENDUTO
            </p>

            <p className="mt-2 text-sm text-red-200">
              Il test di un
              articolo già venduto
              non può essere
              modificato.
            </p>
          </div>
        ) : null}

        {/* IDENTIFICAZIONE */}

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <SectionTitle
            eyebrow="01"
            title="Identificazione"
          />

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Info
              label="ASIN"
              value={
                articolo.asin || "—"
              }
            />

            <Info
              label="EAN"
              value={
                articolo.ean || "—"
              }
            />

            <Info
              label="FNSKU"
              value={
                articolo.fnsku || "—"
              }
            />

            <Info
              label="LPN"
              value={
                articolo.lpn || "—"
              }
            />

            <Info
              label="PALLET"
              value={
                articolo.palletId ||
                "—"
              }
            />

            <Info
              label="CONDIZIONE MANIFEST"
              value={
                articolo.condizioneOriginale ||
                "—"
              }
            />
          </div>

          <div className="mt-6">
            <FieldLabel>
              Numero seriale
            </FieldLabel>

            <input
              type="text"
              value={numeroSeriale}
              onChange={(event) =>
                setNumeroSeriale(
                  event.target.value
                )
              }
              disabled={sold}
              placeholder="Inserisci o scansiona il seriale..."
              className={inputClass}
            />
          </div>
        </section>

        {/* CHECKLIST */}

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <SectionTitle
            eyebrow="02"
            title="Test funzionale"
          />

          <p className="mt-3 text-sm text-zinc-400">
            Registra il risultato
            delle verifiche
            effettuate. Usa N/A per
            i controlli non
            applicabili
            all&apos;articolo.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <SummaryBadge
              label="OK"
              value={testSummary.ok}
            />

            <SummaryBadge
              label="KO"
              value={testSummary.ko}
            />

            <SummaryBadge
              label="N/A"
              value={testSummary.na}
            />

            <SummaryBadge
              label="DA COMPILARE"
              value={
                testSummary.vuoti
              }
            />
          </div>

          <div className="mt-6 space-y-3">
            {tests.map((test) => (
              <div
                key={test.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                  <div className="min-w-[230px] flex-1">
                    <p className="font-black">
                      {test.label}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <TestButton
                      active={
                        test.result ===
                        "OK"
                      }
                      disabled={sold}
                      onClick={() =>
                        updateTestResult(
                          test.id,
                          "OK"
                        )
                      }
                    >
                      ✓ OK
                    </TestButton>

                    <TestButton
                      active={
                        test.result ===
                        "KO"
                      }
                      disabled={sold}
                      onClick={() =>
                        updateTestResult(
                          test.id,
                          "KO"
                        )
                      }
                    >
                      ✕ KO
                    </TestButton>

                    <TestButton
                      active={
                        test.result ===
                        "NA"
                      }
                      disabled={sold}
                      onClick={() =>
                        updateTestResult(
                          test.id,
                          "NA"
                        )
                      }
                    >
                      N/A
                    </TestButton>
                  </div>

                  <input
                    type="text"
                    value={test.note}
                    onChange={(event) =>
                      updateTestNote(
                        test.id,
                        event.target.value
                      )
                    }
                    disabled={sold}
                    placeholder="Nota..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400 xl:w-[280px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONDIZIONI */}

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <SectionTitle
            eyebrow="03"
            title="Condizioni e difetti"
          />

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <FieldLabel>
                Condizione estetica
              </FieldLabel>

              <textarea
                value={
                  condizioneEstetica
                }
                onChange={(event) =>
                  setCondizioneEstetica(
                    event.target.value
                  )
                }
                disabled={sold}
                rows={4}
                placeholder="Graffi, segni, ammaccature, stato generale..."
                className={
                  textareaClass
                }
              />
            </div>

            <div>
              <FieldLabel>
                Accessori mancanti
              </FieldLabel>

              <textarea
                value={
                  accessoriMancanti
                }
                onChange={(event) =>
                  setAccessoriMancanti(
                    event.target.value
                  )
                }
                disabled={sold}
                rows={4}
                placeholder="Caricatore, telecomando, cavi, manuale..."
                className={
                  textareaClass
                }
              />
            </div>

            <div>
              <FieldLabel>
                Difetti dichiarati
              </FieldLabel>

              <textarea
                value={
                  difettiDichiarati
                }
                onChange={(event) =>
                  setDifettiDichiarati(
                    event.target.value
                  )
                }
                disabled={sold}
                rows={4}
                placeholder="Descrivi eventuali difetti o limitazioni..."
                className={
                  textareaClass
                }
              />
            </div>

            <div>
              <FieldLabel>
                Note interne test
              </FieldLabel>

              <textarea
                value={noteTest}
                onChange={(event) =>
                  setNoteTest(
                    event.target.value
                  )
                }
                disabled={sold}
                rows={4}
                placeholder="Note operative..."
                className={
                  textareaClass
                }
              />
            </div>
          </div>
        </section>

        {/* GRADO */}

        <section className="mt-6 rounded-3xl border border-yellow-500/30 bg-zinc-900 p-6 sm:p-8">
          <SectionTitle
            eyebrow="04"
            title="Grado finale"
          />

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
            Il codice PP rimane
            sempre lo stesso.
            Seleziona il grado
            dell&apos;articolo. NUOVO non richiede tutti i test tecnici; N resta NON TESTATO.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {(
              [
                "NEW",
                "A",
                "B",
                "C",
                "N",
              ] as Grade[]
            ).map((item) => {
              const config =
                GRADE_INFO[item];

              const active =
                grado === item;

              return (
                <button
                  key={item}
                  type="button"
                  disabled={sold || saving}
                  onClick={() =>
                    selectGrade(item)
                  }
                  className={`rounded-2xl border p-5 text-left transition ${
                    active
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 min-w-12 px-2 shrink-0 items-center justify-center rounded-xl text-xl font-black ${
                        active
                          ? "bg-yellow-400 text-black"
                          : "bg-zinc-800 text-white"
                      }`}
                    >
                      {displayGrade(item)}
                    </div>

                    <div>
                      <p className="font-black">
                        {config.title}
                      </p>

                      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                        {
                          config.description
                        }
                      </p>

                      <p className="mt-3 text-xs font-black text-yellow-400">
                        {listino?.[item] != null
                          ? `${listino[item]}% RETAIL`
                          : "LISTINO NON CONFIGURATO"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {erroreListino ? (
          <p role="alert" className="mt-6 rounded-2xl border border-red-700 bg-red-950/30 p-5 text-red-200">
            {erroreListino}
          </p>
        ) : null}

        {/* PREZZO */}

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <SectionTitle
            eyebrow="05"
            title="Prezzo POPORAMA"
          />

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-zinc-600">
                Retail
              </p>

              <p className="mt-2 text-2xl font-black text-zinc-300">
                {formatCurrency(
                  articolo.retail
                )}
              </p>
            </div>

            <div>
              <FieldLabel>
                PERCENTUALE PREZZO
              </FieldLabel>

              <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={
                  percentualePrezzo
                }
                onChange={(event) => changePercentage(event.target.value)}
                required
                aria-label="Percentuale prezzo"
                disabled={sold || saving}
                placeholder="—"
                className={inputClass}
              />
              <span className="font-black text-yellow-400">%</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                LISTINO LOTTO: {grado && listino?.[grado] != null ? `${listino[grado]}%` : "non configurato"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Da 0 a 100, massimo 2 decimali. La modifica vale solo per questo articolo.</p>
            </div>

            <div>
              <FieldLabel>
                PREZZO POPORAMA
              </FieldLabel>

              <input
                type="text"
                inputMode="decimal"
                value={
                  formatInputCurrency(prezzoPoporama)
                }
                readOnly
                disabled={sold}
                placeholder="—"
                className={`${inputClass} text-xl font-black text-yellow-400`}
              />

              <p className="mt-2 text-xs text-zinc-500">
                Anteprima della percentuale scelta. Il prezzo definitivo viene ricalcolato dal server sul retail dell’articolo.
              </p>
            </div>
          </div>
        </section>

        {/* OPERATORE */}

        {grado !== "NEW" && grado !== "N" ? <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <SectionTitle
            eyebrow="06"
            title="Chiusura test"
          />

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <FieldLabel>
                Testato da
              </FieldLabel>

              <input
                type="text"
                value={testatoDa}
                onChange={(event) =>
                  setTestatoDa(
                    event.target.value
                  )
                }
                disabled={sold}
                placeholder="Nome operatore..."
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel>
                Data test
              </FieldLabel>

              <input
                type="date"
                value={dataTest}
                onChange={(event) =>
                  setDataTest(
                    event.target.value
                  )
                }
                disabled={sold}
                className={inputClass}
              />
            </div>
          </div>
        </section> : null}

        {/* ERROR */}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-700 bg-red-950/30 p-5 text-red-200">
            <p className="font-black">
              ERRORE
            </p>

            <p className="mt-2 text-sm">
              {error}
            </p>
          </div>
        ) : null}

        {/* SUCCESS */}

        {success ? (
          <div className="mt-6 rounded-2xl border border-emerald-600 bg-emerald-950/30 p-5 text-emerald-200">
            <p className="font-black">
              CLASSIFICAZIONE SALVATA
            </p>

            <p className="mt-2 text-sm">
              {success}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push(lottoUrl)
                }
                className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-black"
              >
                TORNA AL LOTTO
              </button>

              <button
            type="button"
            onClick={() =>
              window.location.assign(
                articleUrl
              )
            }
            className="rounded-xl border border-emerald-500/50 px-5 py-3 text-sm font-black"
          >
            VEDI SCHEDA
          </button>

              <button
                type="button"
                onClick={scaricaEtichetta}
                disabled={etichettaInCorso}
                className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {etichettaInCorso
                  ? "GENERAZIONE..."
                  : "SCARICA ETICHETTA"}
              </button>
            </div>
          </div>
        ) : null}

        {/* SAVE */}

        <div className="sticky bottom-4 mt-8 rounded-2xl border border-zinc-700 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black">
                {grado
                  ? `GRADO ${displayGrade(grado)}`
                  : "GRADO NON SELEZIONATO"}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {grado
                  ? `${
                      percentualePrezzo ||
                      "—"
                    }% • ${formatInputCurrency(
                      prezzoPoporama
                    )}`
                  : "Completa il test e assegna il grado finale."}
              </p>
            </div>

            <button
              type="button"
              onClick={saveTest}
              disabled={
                sold || saving || !!erroreListino
              }
              className="rounded-xl bg-yellow-400 px-7 py-4 text-sm font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving
                ? "SALVATAGGIO..."
                : grado === "NEW" || grado === "N" ? "SALVA CLASSIFICAZIONE" : "SALVA TEST"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function normalizeGradeForLabel(
  value: string
): LabelData["grade"] {
  const normalized =
    String(value || "")
      .trim()
      .toUpperCase();

  if (
    normalized === "NEW" ||
    normalized === "A" ||
    normalized === "B" ||
    normalized === "C" ||
    normalized === "D" ||
    normalized === "N"
  ) {
    return normalized;
  }

  throw new Error("Classificazione non valida per l’etichetta.");
}

function formatDateForLabel(
  value: string
) {
  if (!value) {
    return new Intl.DateTimeFormat(
      "it-IT"
    ).format(new Date());
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
 * COMPONENTI
 * ============================================================
 */

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-black sm:text-2xl">
        {title}
      </h2>
    </div>
  );
}

function FieldLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-500">
      {children}
    </label>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-bold text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-black text-zinc-300">
      {children}
    </span>
  );
}

function SummaryBadge({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
      <span className="text-xs font-bold text-zinc-500">
        {label}
      </span>

      <span className="ml-2 font-black text-white">
        {value}
      </span>
    </div>
  );
}

function TestButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-black transition ${
        active
          ? "border-yellow-400 bg-yellow-400 text-black"
          : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

/*
 * ============================================================
 * TEST HELPERS
 * ============================================================
 */

function createEmptyTests(): TestItem[] {
  return TEST_BASE.map(
    (item) => ({
      ...item,
      result: "",
      note: "",
    })
  );
}

function hydrateTests(
  stored:
    | Record<string, unknown>
    | null
    | undefined
): TestItem[] {
  const base =
    createEmptyTests();

  if (
    !stored ||
    typeof stored !== "object"
  ) {
    return base;
  }

  return base.map((item) => {
    const storedItem =
      stored[item.id];

    if (
      !storedItem ||
      typeof storedItem !==
        "object"
    ) {
      return item;
    }

    const value =
      storedItem as {
        result?: unknown;
        note?: unknown;
      };

    return {
      ...item,
      result:
        normalizeTestResult(
          value.result
        ),
      note: String(
        value.note ?? ""
      ),
    };
  });
}

function buildTestPayload(
  tests: TestItem[]
) {
  const payload: Record<
    string,
    {
      result: TestResult;
      note: string;
    }
  > = {};

  for (const item of tests) {
    payload[item.id] = {
      result: item.result,
      note: item.note.trim(),
    };
  }

  return payload;
}

function normalizeTestResult(
  value: unknown
): TestResult {
  const result = String(
    value || ""
  )
    .trim()
    .toUpperCase();

  if (
    result === "OK" ||
    result === "KO" ||
    result === "NA"
  ) {
    return result;
  }

  return "";
}

/*
 * ============================================================
 * GENERALI
 * ============================================================
 */

function normalizeGrade(
  value: string
): Grade | "D" {
  const grade = String(
    value || ""
  )
    .trim()
    .toUpperCase();

  if (
    grade === "NEW" ||
    grade === "N" ||
    grade === "A" ||
    grade === "B" ||
    grade === "C" ||
    grade === "D"
  ) {
    return grade;
  }

  return "N";
}

function normalizeSaleStatus(
  value: string
) {
  return String(value || "")
    .trim()
    .toUpperCase() ===
    "VENDUTO"
    ? "VENDUTO"
    : "DISPONIBILE";
}

function parseInputNumber(
  value: string
) {
  const normalized =
    String(value || "")
      .trim()
      .replace(",", ".");

  if (!normalized) {
    return null;
  }

  const number =
    Number(normalized);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

function roundMoney(
  value: number
) {
  return (
    Math.round(
      (value +
        Number.EPSILON) *
        100
    ) / 100
  );
}

function displayGrade(value: string) {
  return value === "NEW" ? "NUOVO" : value === "D" ? "D (LEGACY)" : value;
}

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "it-IT",
    {
      style: "currency",
      currency: "EUR",
    }
  ).format(
    Number.isFinite(value)
      ? value
      : 0
  );
}

function formatInputCurrency(
  value: string
) {
  const number =
    parseInputNumber(value);

  if (number === null) {
    return "—";
  }

  return formatCurrency(number);
}

function getTodayDate() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50";
