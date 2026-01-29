"use client";

import { useMemo, useState } from "react";

type Mode = "items" | "order";

export default function LabelsPage({ params }: { params: { lang: string } }) {
  const lang = params?.lang || "it";

  const [order, setOrder] = useState("");
  const [mode, setMode] = useState<Mode>("items");
  const [packages, setPackages] = useState(1);
  const [warehouse, setWarehouse] = useState("Brindisi (BR)");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const apiUrl = useMemo(() => {
    const u = new URL(`/api/labels/from-order`, window.location.origin);
    u.searchParams.set("order", order.trim());
    u.searchParams.set("lang", lang);
    u.searchParams.set("mode", mode);
    u.searchParams.set("packages", String(packages));
    u.searchParams.set("warehouse", warehouse);
    return u.toString();
  }, [order, lang, mode, packages, warehouse]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setData(null);

    if (!order.trim()) {
      setErr("Inserisci il numero ordine (es: 1234 o #1234).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Errore");
      setData(json);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-10">
      <div className="card border-white/15 bg-[#0b0f14]/60">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Etichette magazzino</h1>
          <p className="mt-2 text-white/70">
            Inserisci un numero ordine Shopify e genera le etichette PDF 4×6.
          </p>

          <form onSubmit={handleGenerate} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-white/80">Numero ordine</label>
              <input
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="es: 1234 oppure #1234"
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/80">Modalità</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMode("items")}
                  className={`rounded-full px-4 py-2 text-sm border ${
                    mode === "items"
                      ? "border-white/40 bg-white/10"
                      : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  1 etichetta per prodotto (consigliata)
                </button>
                <button
                  type="button"
                  onClick={() => setMode("order")}
                  className={`rounded-full px-4 py-2 text-sm border ${
                    mode === "order"
                      ? "border-white/40 bg-white/10"
                      : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  1 etichetta per ordine (riassunto)
                </button>
              </div>
              <p className="text-xs text-white/60">
                Se di solito “tutto in una scatola” ma non sempre: usa “ordine” + imposta colli.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-white/80">Numero colli (solo modalità “ordine”)</label>
                <input
                  type="number"
                  min={1}
                  value={packages}
                  onChange={(e) => setPackages(Math.max(1, parseInt(e.target.value || "1", 10)))}
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-white/80">Magazzino</label>
                <input
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="btn btn-brand"
                disabled={loading}
              >
                {loading ? "Genero..." : "Genera etichette"}
              </button>

              {data?.labels?.length ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    for (const l of data.labels) window.open(l.pdfUrl, "_blank", "noopener,noreferrer");
                  }}
                >
                  Apri tutte in nuove tab
                </button>
              ) : null}
            </div>

            {err ? (
              <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {err}
              </div>
            ) : null}
          </form>
        </div>
      </div>

      {data?.labels?.length ? (
        <div className="mt-8 grid gap-3">
          <h2 className="text-lg font-semibold">
            Ordine: {data.orderName} · Etichette: {data.count}
          </h2>

          <div className="grid gap-3">
            {data.labels.map((l: any) => (
              <div key={l.lotId} className="card border-white/15 bg-black/20">
                <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/60">LOTTO</div>
                    <div className="font-mono text-sm">{l.lotId}</div>
                    <div className="mt-1 text-white/80 text-sm">
                      {l.product} {l.weightKg ? `· ${l.weightKg}` : ""}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a className="btn btn-brand btn-sm" href={l.pdfUrl} target="_blank" rel="noreferrer">
                      Apri PDF
                    </a>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigator.clipboard.writeText(l.pdfUrl)}
                      type="button"
                    >
                      Copia link
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-2 text-xs text-white/60">
            Tip: se l’ordine è “tutto in una scatola”, usa modalità “ordine” e imposta colli=1.
          </p>
        </div>
      ) : null}
    </main>
  );
}
