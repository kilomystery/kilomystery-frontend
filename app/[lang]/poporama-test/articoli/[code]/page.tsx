"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

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
  error?: string;
};

export default function SchedaArticoloPage() {
  const params = useParams();
  const router = useRouter();

  const code =
    typeof params.code === "string"
      ? decodeURIComponent(params.code).toUpperCase()
      : "";

  const [articolo, setArticolo] =
    useState<Articolo | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!code) {
      return;
    }

    loadArticolo();
  }, [code]);

  async function loadArticolo() {
    try {
      setLoading(true);
      setError("");

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

      setArticolo(data.articolo);
    } catch (err) {
      console.error(
        "Errore caricamento scheda POPORAMA:",
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

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <p className="font-black text-yellow-400">
            POPORAMA
          </p>

          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-4xl">
              ⏳
            </p>

            <p className="mt-4 font-black">
              Caricamento scheda articolo...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !articolo) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            ← Indietro
          </button>

          <div className="mt-8 rounded-3xl border border-red-800 bg-red-950/30 p-8">
            <h1 className="text-xl font-black text-red-300">
              Articolo non disponibile
            </h1>

            <p className="mt-3 text-red-200">
              {error ||
                "Impossibile trovare l'articolo richiesto."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const grade =
    normalizeGrade(articolo.grado);

  const sold =
    normalizeSaleStatus(
      articolo.statoVendita
    ) === "VENDUTO";

  const testato =
    grade !== "N";

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            ← Indietro
          </button>

          <span className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-black text-zinc-400">
            SCHEDA ARTICOLO
          </span>
        </div>

        <header className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
              POPORAMA
            </p>

            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-4xl font-black text-yellow-400 sm:text-5xl">
                  {articolo.codicePP}
                </h1>

                <h2 className="mt-4 max-w-3xl text-xl font-black leading-snug sm:text-2xl">
                  {articolo.nomeProdotto ||
                    "Articolo POPORAMA"}
                </h2>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge>
                    GRADO {grade}
                  </Badge>

                  <Badge>
                    {sold
                      ? "VENDUTO"
                      : "DISPONIBILE"}
                  </Badge>

                  <Badge>
                    {testato
                      ? "TESTATO"
                      : "NON TESTATO"}
                  </Badge>
                </div>
              </div>

              <div className="min-w-[240px] rounded-2xl border border-yellow-500/30 bg-zinc-950 p-5">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Prezzo POPORAMA
                </p>

                <p className="mt-2 text-4xl font-black text-yellow-400">
                  {formatCurrency(
                    articolo.prezzoPoporama
                  )}
                </p>

                {articolo.percentualePrezzo >
                0 ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    {formatPercentage(
                      articolo.percentualePrezzo
                    )}{" "}
                    del Retail
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {grade === "N" ? (
            <div className="border-b border-zinc-800 bg-yellow-400/10 px-6 py-4 sm:px-8">
              <p className="font-black text-yellow-300">
                ARTICOLO REGISTRATO • NON ANCORA TESTATO
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                Il grado definitivo verrà assegnato dopo il test POPORAMA.
              </p>
            </div>
          ) : (
            <div className="border-b border-zinc-800 bg-emerald-950/20 px-6 py-4 sm:px-8">
              <p className="font-black text-emerald-300">
                ARTICOLO TESTATO • GRADO {grade}
              </p>

              {articolo.dataTest ? (
                <p className="mt-1 text-sm text-zinc-400">
                  Test del{" "}
                  {formatDate(
                    articolo.dataTest
                  )}
                </p>
              ) : null}
            </div>
          )}

          <div className="grid gap-px bg-zinc-800 md:grid-cols-2">
            <div className="bg-zinc-900 p-6 sm:p-8">
              <SectionTitle
                eyebrow="01"
                title="Identificazione"
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Info
                  label="EAN"
                  value={articolo.ean}
                />

                <Info
                  label="ASIN"
                  value={articolo.asin}
                />

                <Info
                  label="FNSKU"
                  value={articolo.fnsku}
                />

                <Info
                  label="LPN"
                  value={articolo.lpn}
                />

                <Info
                  label="Numero seriale"
                  value={
                    articolo.numeroSeriale
                  }
                />

                <Info
                  label="Pallet"
                  value={
                    articolo.palletId
                  }
                />
              </div>
            </div>

            <div className="bg-zinc-900 p-6 sm:p-8">
              <SectionTitle
                eyebrow="02"
                title="Prodotto"
              />

              <div className="mt-6 space-y-3">
                <Info
                  label="Categoria"
                  value={
                    articolo.categoria
                  }
                />

                <Info
                  label="Sottocategoria"
                  value={
                    articolo.sottocategoria
                  }
                />

                <Info
                  label="Condizione origine"
                  value={
                    articolo.condizioneOriginale
                  }
                />

                <Info
                  label="Retail di riferimento"
                  value={formatCurrency(
                    articolo.retail
                  )}
                />
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <SectionTitle
            eyebrow="03"
            title="Condizioni dichiarate"
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ConditionCard
              title="Condizione estetica"
              value={
                articolo.condizioneEstetica
              }
            />

            <ConditionCard
              title="Accessori mancanti"
              value={
                articolo.accessoriMancanti
              }
            />

            <ConditionCard
              title="Difetti dichiarati"
              value={
                articolo.difettiDichiarati
              }
            />
          </div>
        </section>

        {testato ? (
          <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
            <SectionTitle
              eyebrow="04"
              title="Esito test POPORAMA"
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {getTestRows(
                articolo.risultatiTest
              ).map((row) => (
                <div
                  key={row.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div>
                    <p className="font-black">
                      {row.label}
                    </p>

                    {row.note ? (
                      <p className="mt-1 text-sm text-zinc-500">
                        {row.note}
                      </p>
                    ) : null}
                  </div>

                  <TestBadge
                    result={row.result}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info
                label="Testato da"
                value={
                  articolo.testatoDa
                }
              />

              <Info
                label="Data test"
                value={
                  articolo.dataTest
                    ? formatDate(
                        articolo.dataTest
                      )
                    : ""
                }
              />
            </div>
          </section>
        ) : null}

        {sold ? (
          <section className="mt-6 rounded-3xl border border-red-800 bg-red-950/20 p-6 sm:p-8">
            <p className="font-black text-red-300">
              ARTICOLO VENDUTO
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Info
                label="Prezzo vendita"
                value={formatCurrency(
                  articolo.prezzoVendita
                )}
              />

              <Info
                label="Data vendita"
                value={
                  articolo.dataVendita
                    ? formatDate(
                        articolo.dataVendita
                      )
                    : ""
                }
              />
            </div>
          </section>
        ) : null}

        <footer className="mt-8 border-t border-zinc-800 pt-6 text-center">
          <p className="text-xs leading-relaxed text-zinc-600">
            Scheda identificativa POPORAMA •{" "}
            {articolo.codicePP}
          </p>
        </footer>
      </div>
    </main>
  );
}

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

      <p className="mt-2 break-words text-sm font-bold text-zinc-300">
        {value || "—"}
      </p>
    </div>
  );
}

function ConditionCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
        {title}
      </p>

      <p className="mt-3 whitespace-pre-wrap text-sm font-bold leading-relaxed text-zinc-300">
        {value || "—"}
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

function TestBadge({
  result,
}: {
  result: string;
}) {
  const normalized =
    String(result || "")
      .trim()
      .toUpperCase();

  if (normalized === "OK") {
    return (
      <span className="shrink-0 rounded-lg border border-emerald-700 bg-emerald-950/40 px-3 py-1.5 text-xs font-black text-emerald-300">
        ✓ OK
      </span>
    );
  }

  if (normalized === "KO") {
    return (
      <span className="shrink-0 rounded-lg border border-red-700 bg-red-950/40 px-3 py-1.5 text-xs font-black text-red-300">
        ✕ KO
      </span>
    );
  }

  if (normalized === "NA") {
    return (
      <span className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-black text-zinc-400">
        N/A
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-black text-zinc-600">
      —
    </span>
  );
}

const TEST_LABELS: Record<
  string,
  string
> = {
  accensione: "Accensione",
  alimentazione:
    "Alimentazione / ricarica",
  funzioni_principali:
    "Funzioni principali",
  comandi: "Comandi / pulsanti",
  display: "Display / indicatori",
  connettivita: "Connettività",
  audio_video: "Audio / video",
  movimento_meccanica:
    "Movimento / meccanica",
  sicurezza:
    "Controlli di sicurezza",
  prova_generale: "Prova generale",
};

function getTestRows(
  stored: Record<string, unknown> | null
) {
  if (
    !stored ||
    typeof stored !== "object"
  ) {
    return [];
  }

  return Object.entries(TEST_LABELS).map(
    ([id, label]) => {
      const raw = stored[id];

      if (
        !raw ||
        typeof raw !== "object"
      ) {
        return {
          id,
          label,
          result: "",
          note: "",
        };
      }

      const value =
        raw as {
          result?: unknown;
          note?: unknown;
        };

      return {
        id,
        label,
        result: String(
          value.result ?? ""
        ),
        note: String(
          value.note ?? ""
        ),
      };
    }
  );
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
    .toUpperCase() === "VENDUTO"
    ? "VENDUTO"
    : "DISPONIBILE";
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

function formatPercentage(
  value: number
) {
  return new Intl.NumberFormat(
    "it-IT",
    {
      maximumFractionDigits: 2,
    }
  ).format(
    Number.isFinite(value)
      ? value
      : 0
  );
}

function formatDate(
  value: string
) {
  if (!value) {
    return "—";
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
    "it-IT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}
