"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

type ApiResponse = {
  ok: boolean;
  totale?: number;
  lotti?: Lotto[];
  error?: string;
};

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

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadLotto();
  }, [handle]);

  async function loadLotto() {
    if (!handle) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/poporama/lotti",
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
            "Impossibile caricare il lotto."
        );
      }

      const trovato =
        (data.lotti ?? []).find(
          (item) => item.handle === handle
        ) ?? null;

      if (!trovato) {
        throw new Error(
          "Lotto non trovato nell'archivio POPORAMA."
        );
      }

      setLotto(trovato);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <p className="font-black text-yellow-400">
            POPORAMA
          </p>

          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <div className="text-4xl">
              ⏳
            </div>

            <p className="mt-4 font-black">
              Caricamento lotto...
            </p>
          </div>
        </div>
      </main>
    );
  }

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
              Impossibile aprire il lotto
            </h1>

            <p className="mt-3 text-red-200">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <a
          href={`/${lang}/poporama-test/lotti`}
          className="text-sm font-bold text-zinc-400 transition hover:text-white"
        >
          ← Lotti & Carichi
        </a>

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
            Scheda operativa del carico.
          </p>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Pezzi dichiarati"
            value={String(lotto.numeroPezzi)}
          />

          <StatCard
            label="Costo totale"
            value={formatCurrency(
              lotto.costoTotale
            )}
          />

          <StatCard
            label="Prodotti censiti"
            value="0"
          />

          <StatCard
            label="Da testare"
            value="0"
          />
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <h2 className="text-xl font-black">
            Dati del lotto
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DataItem
              label="Fornitore"
              value={lotto.fornitore || "—"}
            />

            <DataItem
              label="Provenienza"
              value={lotto.provenienza || "—"}
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

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Costi
            </p>

            <h2 className="mt-2 text-xl font-black">
              Investimento nel carico
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MoneyCard
              label="Merce"
              value={lotto.costoMerce}
            />

            <MoneyCard
              label="Trasporto"
              value={lotto.costoTrasporto}
            />

            <MoneyCard
              label="Altri costi"
              value={lotto.altriCosti}
            />

            <MoneyCard
              label="Totale"
              value={lotto.costoTotale}
              important
            />
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
            Inventario
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Carica la merce
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Scegli come registrare gli articoli
            appartenenti a questo lotto. Ogni prodotto
            verrà collegato a {lotto.codiceLotto} e
            partirà come N — NON TESTATO.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-yellow-500/40 bg-zinc-950 p-6">
              <div className="text-4xl">
                📄
              </div>

              <h3 className="mt-4 text-xl font-black">
                Importa manifest
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Carica CSV o Excel, controlla i dati,
                imposta le percentuali e prepara
                automaticamente tutti gli articoli.
              </p>

              <a
                href={`/${lang}/poporama-test/lotti/${handle}/importa`}
                className="mt-6 block w-full rounded-xl bg-yellow-400 px-5 py-4 text-center font-black text-black transition hover:bg-yellow-300"
              >
                IMPORTA MANIFEST →
              </a>

              <p className="mt-3 text-center text-xs font-bold uppercase tracking-wider text-yellow-500/70">
                CSV / Excel
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-6">
              <div className="text-4xl">
                📦
              </div>

              <h3 className="mt-4 text-xl font-black">
                Inserimento manuale
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Registra un prodotto tramite EAN,
                barcode oppure compilazione manuale.
              </p>

              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-xl bg-zinc-800 px-5 py-4 font-black text-zinc-500"
              >
                + AGGIUNGI PRODOTTO
              </button>

              <p className="mt-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-600">
                Lo attiviamo dopo il manifest
              </p>
            </div>
          </div>
        </section>

        {lotto.note && (
          <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
            <h2 className="text-xl font-black">
              Note
            </h2>

            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-zinc-300">
              {lotto.note}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm font-bold text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}

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
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const parts = value.split("-");

  if (parts.length !== 3) {
    return value;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}