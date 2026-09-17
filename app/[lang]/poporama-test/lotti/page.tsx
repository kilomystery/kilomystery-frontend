"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function LottiPage() {
  const [lotti, setLotti] = useState<Lotto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLotti();
  }, []);

  async function loadLotti() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/poporama/lotti", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || "Impossibile caricare i lotti."
        );
      }

      setLotti(data.lotti ?? []);
    } catch (err) {
      console.error(
        "Errore caricamento lotti POPORAMA:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Errore durante il caricamento dei lotti."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredLotti = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return lotti;
    }

    return lotti.filter((lotto) => {
      return [
        lotto.codiceLotto,
        lotto.fornitore,
        lotto.provenienza,
        lotto.riferimentoAcquisto,
      ].some((value) =>
        value.toLowerCase().includes(term)
      );
    });
  }, [lotti, search]);

  const totalePezzi = lotti.reduce(
    (sum, lotto) => sum + lotto.numeroPezzi,
    0
  );

  const capitaleTotale = lotti.reduce(
    (sum, lotto) => sum + lotto.costoTotale,
    0
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <a
          href="../poporama-test"
          className="text-sm font-bold text-zinc-400 transition hover:text-white"
        >
          ← Test Center
        </a>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
              POPORAMA
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Lotti & Carichi
            </h1>

            <p className="mt-2 text-zinc-400">
              Gestisci manifest, prodotti, test e risultati
              economici di ogni carico.
            </p>
          </div>

          <a
            href="lotti/nuovo"
            className="rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black transition hover:bg-yellow-300"
          >
            + NUOVO LOTTO
          </a>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Lotti"
            value={String(lotti.length)}
          />

          <StatCard
            label="Pezzi dichiarati"
            value={String(totalePezzi)}
          />

          <StatCard
            label="Capitale carichi"
            value={formatCurrency(capitaleTotale)}
          />

          <StatCard
            label="Da testare"
            value="—"
          />
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">
                Carichi
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Lotti registrati nell&apos;archivio POPORAMA.
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca lotto..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400 sm:w-auto"
            />
          </div>

          {loading && (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-14 text-center">
              <div className="text-4xl">⏳</div>

              <p className="mt-4 font-black">
                Caricamento lotti...
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Lettura archivio Shopify POPORAMA.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-red-800 bg-red-950/40 p-6">
              <p className="font-black text-red-300">
                Impossibile caricare i lotti
              </p>

              <p className="mt-2 text-sm text-red-200">
                {error}
              </p>

              <button
                type="button"
                onClick={loadLotti}
                className="mt-5 rounded-xl border border-red-700 px-5 py-3 font-black text-red-200 transition hover:bg-red-900/40"
              >
                RIPROVA
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            lotti.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-6 py-14 text-center">
                <div className="text-5xl">
                  📦
                </div>

                <h3 className="mt-4 text-xl font-black">
                  Nessun lotto ancora
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-zinc-500">
                  Crea il primo carico POPORAMA. Dopo la
                  creazione potrai importare un manifest
                  Excel/CSV oppure registrare manualmente i
                  prodotti.
                </p>

                <a
                  href="lotti/nuovo"
                  className="mt-6 inline-flex rounded-xl bg-yellow-400 px-6 py-3 font-black text-black transition hover:bg-yellow-300"
                >
                  CREA PRIMO LOTTO
                </a>
              </div>
            )}

          {!loading &&
            !error &&
            lotti.length > 0 &&
            filteredLotti.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-6 py-12 text-center">
                <p className="font-black">
                  Nessun lotto trovato
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Prova con un altro termine di ricerca.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            filteredLotti.length > 0 && (
              <div className="mt-8 grid gap-4">
                {filteredLotti.map((lotto) => (
                  <LottoCard
                    key={lotto.id}
                    lotto={lotto}
                  />
                ))}
              </div>
            )}
        </section>

        <section className="mt-8">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
            Flusso POPORAMA
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              number="1"
              title="Crea il carico"
              description="Registriamo fornitore, costi, numero pezzi e provenienza."
            />

            <InfoCard
              number="2"
              title="Carica la merce"
              description="Importa il manifest oppure censisci manualmente i prodotti."
            />

            <InfoCard
              number="3"
              title="Testa e vendi"
              description="Ogni articolo viene classificato, etichettato e collegato al proprio lotto."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function LottoCard({
  lotto,
}: {
  lotto: Lotto;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="break-words text-xl font-black">
              {lotto.codiceLotto || lotto.handle}
            </h3>

            <span className="rounded-full border border-yellow-500/40 bg-yellow-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-yellow-400">
              ATTIVO
            </span>
          </div>

          <div className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
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
              value={formatDate(lotto.dataAcquisto)}
            />

            <DataItem
              label="Pezzi dichiarati"
              value={String(lotto.numeroPezzi)}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-zinc-800 pt-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                Costo totale
              </p>

              <p className="mt-1 text-2xl font-black text-yellow-400">
                {formatCurrency(lotto.costoTotale)}
              </p>
            </div>

            {lotto.riferimentoAcquisto && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                  Riferimento
                </p>

                <p className="mt-1 font-bold text-zinc-300">
                  {lotto.riferimentoAcquisto}
                </p>
              </div>
            )}
          </div>
        </div>

        <a
          href={`./lotti/${lotto.handle}`}
          className="flex shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 font-black transition hover:border-yellow-400 hover:text-yellow-400"
        >
          APRI LOTTO →
        </a>
      </div>
    </article>
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

      <p className="mt-1 font-bold text-zinc-300">
        {value}
      </p>
    </div>
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

function InfoCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-lg font-black text-black">
        {number}
      </div>

      <h3 className="mt-4 font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        {description}
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