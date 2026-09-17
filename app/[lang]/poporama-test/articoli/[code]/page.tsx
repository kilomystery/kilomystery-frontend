"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

type Articolo = {
  id: string;
  handle: string;

  codicePP: string;
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

  grado:
    | "A"
    | "B"
    | "C"
    | "D"
    | "N";

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

type ApiResponse = {
  ok: boolean;
  error?: string;
  totaleDettagli?: number;
  articoli?: Articolo[];
};

export default function PoporamaArticoloPage({
  params,
}: {
  params: {
    lang: string;
    code: string;
  };
}) {
  const [articolo, setArticolo] =
    useState<Articolo | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadArticolo() {
      try {
        setLoading(true);
        setError("");

        const match =
          /^PP-(\d{6})$/i.exec(
            params.code
          );

        if (!match) {
          throw new Error(
            "Codice PP non valido."
          );
        }

        const numero =
          Number(match[1]);

        const response =
          await fetch(
            `/api/poporama/articoli?from=${numero}&to=${numero}&details=1`,
            {
              cache:
                "no-store",
            }
          );

        const data =
          (await response.json()) as ApiResponse;

        if (
          !response.ok ||
          !data.ok
        ) {
          throw new Error(
            data.error ||
              "Impossibile recuperare l'articolo."
          );
        }

        const trovato =
          data.articoli?.find(
            (item) =>
              item.codicePP.toUpperCase() ===
              params.code.toUpperCase()
          );

        if (!trovato) {
          throw new Error(
            `Articolo ${params.code} non trovato.`
          );
        }

        setArticolo(
          trovato
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Errore sconosciuto."
        );
      } finally {
        setLoading(false);
      }
    }

    loadArticolo();
  }, [params.code]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-5 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">
            POPORAMA TEST CENTER
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Caricamento articolo...
          </h1>
        </div>
      </main>
    );
  }

  if (
    error ||
    !articolo
  ) {
    return (
      <main className="min-h-screen bg-black px-5 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">
            POPORAMA TEST CENTER
          </p>

          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-950/30 p-6">
            <h1 className="text-2xl font-black">
              ARTICOLO NON DISPONIBILE
            </h1>

            <p className="mt-3 text-sm text-red-200">
              {error ||
                "Articolo non trovato."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
              POPORAMA TEST CENTER
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              {articolo.codicePP}
            </h1>
          </div>

          <Link
            href={`/${params.lang}/poporama-test`}
            className="rounded-xl border border-zinc-700 px-4 py-3 text-xs font-black uppercase tracking-wider transition hover:border-yellow-400 hover:text-yellow-400"
          >
            ← Dashboard
          </Link>
        </div>

        <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Articolo
            </p>

            <h2 className="mt-2 text-xl font-black leading-tight sm:text-3xl">
              {articolo.nomeProdotto ||
                "Prodotto senza descrizione"}
            </h2>

            <div className="mt-5 flex flex-wrap gap-2">
              {articolo.categoria && (
                <Badge>
                  {articolo.categoria}
                </Badge>
              )}

              {articolo.sottocategoria && (
                <Badge>
                  {articolo.sottocategoria}
                </Badge>
              )}

              <Badge>
                {articolo.statoVendita ||
                  "DISPONIBILE"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-px bg-zinc-800 sm:grid-cols-2">
            <div className="bg-zinc-950 p-5 sm:p-7">
              <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
                GRADO
              </p>

              <div className="mt-3 flex h-32 w-32 items-center justify-center border-4 border-white text-7xl font-black">
                {articolo.grado}
              </div>

              <p className="mt-4 text-sm font-bold">
                {gradeDescription(
                  articolo.grado
                )}
              </p>
            </div>

            <div className="bg-zinc-950 p-5 sm:p-7">
              <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
                PREZZO POPORAMA
              </p>

              <p className="mt-3 text-5xl font-black text-yellow-400">
                {formatEuro(
                  articolo.prezzoPoporama
                )}
              </p>

              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  PREZZO DI RIFERIMENTO
                </p>

                <p className="mt-1 text-xl font-bold text-zinc-400 line-through">
                  {formatEuro(
                    articolo.retail
                  )}
                </p>
              </div>

              <p className="mt-4 text-xs text-zinc-500">
                Percentuale applicata:{" "}
                {articolo.percentualePrezzo}%
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <InfoBox title="IDENTIFICAZIONE">
            <InfoRow
              label="Codice PP"
              value={
                articolo.codicePP
              }
            />

            <InfoRow
              label="EAN"
              value={
                articolo.ean ||
                "-"
              }
            />

            <InfoRow
              label="UPC"
              value={
                articolo.upc ||
                "-"
              }
            />

            <InfoRow
              label="ASIN"
              value={
                articolo.asin ||
                "-"
              }
            />

            <InfoRow
              label="FNSKU"
              value={
                articolo.fnsku ||
                "-"
              }
            />

            <InfoRow
              label="LPN"
              value={
                articolo.lpn ||
                "-"
              }
            />

            <InfoRow
              label="Seriale"
              value={
                articolo.numeroSeriale ||
                "-"
              }
            />
          </InfoBox>

          <InfoBox title="PROVENIENZA">
            <InfoRow
              label="Pallet"
              value={
                articolo.palletId ||
                "-"
              }
            />

            <InfoRow
              label="Condizione originale"
              value={
                articolo.condizioneOriginale ||
                "-"
              }
            />

            <InfoRow
              label="Costo manifest"
              value={formatEuro(
                articolo.costoManifest
              )}
            />

            <InfoRow
              label="Registrato"
              value={formatDate(
                articolo.createdAt
              )}
            />
          </InfoBox>

          <InfoBox title="TEST POPORAMA">
            <InfoRow
              label="Grado"
              value={
                articolo.grado
              }
            />

            <InfoRow
              label="Condizione estetica"
              value={
                articolo.condizioneEstetica ||
                "Non indicata"
              }
            />

            <InfoRow
              label="Accessori mancanti"
              value={
                articolo.accessoriMancanti ||
                "Nessuno dichiarato"
              }
            />

            <InfoRow
              label="Difetti"
              value={
                articolo.difettiDichiarati ||
                "Nessuno dichiarato"
              }
            />

            <InfoRow
              label="Testato da"
              value={
                articolo.testatoDa ||
                "-"
              }
            />

            <InfoRow
              label="Data test"
              value={
                articolo.dataTest
                  ? formatDate(
                      articolo.dataTest
                    )
                  : "-"
              }
            />
          </InfoBox>

          <InfoBox title="VENDITA">
            <InfoRow
              label="Stato"
              value={
                articolo.statoVendita ||
                "DISPONIBILE"
              }
            />

            <InfoRow
              label="Prezzo vendita"
              value={
                articolo.prezzoVendita >
                0
                  ? formatEuro(
                      articolo.prezzoVendita
                    )
                  : "-"
              }
            />

            <InfoRow
              label="Data vendita"
              value={
                articolo.dataVendita
                  ? formatDate(
                      articolo.dataVendita
                    )
                  : "-"
              }
            />
          </InfoBox>
        </section>

        <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-400">
            QR POPORAMA
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Questa è la scheda collegata al QR
            dell'articolo. Il codice{" "}
            <strong className="text-white">
              {articolo.codicePP}
            </strong>{" "}
            rimane l'identificativo permanente
            dell'articolo anche dopo test,
            cambio grado e vendita.
          </p>
        </div>
      </div>
    </main>
  );
}

function Badge({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-300">
      {children}
    </span>
  );
}

function InfoBox({
  title,
  children,
}: {
  title: string;
  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
        {title}
      </h3>

      <div className="divide-y divide-zinc-900">
        {children}
      </div>
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value:
    string | number;
}) {
  return (
    <div className="grid grid-cols-[135px_1fr] gap-3 py-3 text-sm">
      <span className="text-zinc-500">
        {label}
      </span>

      <span className="break-words font-semibold text-zinc-200">
        {value}
      </span>
    </div>
  );
}

function formatEuro(
  value: number
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return "€ 0,00";
  }

  return new Intl.NumberFormat(
    "it-IT",
    {
      style:
        "currency",
      currency:
        "EUR",
    }
  ).format(number);
}

function formatDate(
  value: string
) {
  if (!value) {
    return "-";
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
      day:
        "2-digit",
      month:
        "2-digit",
      year:
        "numeric",
      hour:
        "2-digit",
      minute:
        "2-digit",
    }
  ).format(date);
}

function gradeDescription(
  grade: Articolo["grado"]
) {
  switch (grade) {
    case "A":
      return "TESTATO - PIENAMENTE FUNZIONANTE";

    case "B":
      return "TESTATO - FUNZIONANTE CON INCOMPLETEZZA";

    case "C":
      return "FUNZIONANTE - DIFETTO DICHIARATO";

    case "D":
      return "NON FUNZIONANTE - RIPARAZIONE / RICAMBI";

    case "N":
      return "NON TESTATO";

    default:
      return "";
  }
}