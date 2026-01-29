"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useMemo, useState } from "react";

export default function LabelsPage({ params }: { params: { lang: string } }) {
  const lang = params?.lang || "it";

  const [id, setId] = useState("KM-20260128-PRM-5KG-0001");
  const [product, setProduct] = useState("Premium Box");
  const [weightKg, setWeightKg] = useState("5 KG");
  const [date, setDate] = useState("28/01/2026");
  const [warehouse, setWarehouse] = useState("Brindisi (BR)");
  const [loading, setLoading] = useState(false);

  const pdfUrl = useMemo(() => {
    const u = new URL(`/api/label`, window.location.origin);
    u.searchParams.set("id", id);
    u.searchParams.set("product", product);
    u.searchParams.set("weightKg", weightKg);
    u.searchParams.set("date", date);
    u.searchParams.set("warehouse", warehouse);
    u.searchParams.set("lang", lang);
    return u.toString();
  }, [id, product, weightKg, date, warehouse, lang]);

  function openPdf() {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <Header lang={lang as any} />

      <main className="container py-10">
        <div className="card border-white/15 bg-[#0b0f14]/60">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Etichette magazzino</h1>
            <p className="mt-2 text-white/70">
              Compila i campi e genera il PDF 4×6 (stampante etichette).
            </p>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-white/80">ID lotto</label>
                <input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm text-white/80">Prodotto</label>
                  <input
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-white/80">Peso</label>
                  <input
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm text-white/80">Data</label>
                  <input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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

              <div className="flex flex-wrap gap-2">
                <button
                  className="btn btn-brand"
                  onClick={() => {
                    setLoading(true);
                    try {
                      openPdf();
                    } finally {
                      setTimeout(() => setLoading(false), 400);
                    }
                  }}
                  type="button"
                  disabled={loading}
                >
                  {loading ? "Apro..." : "Genera PDF etichetta"}
                </button>

                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => navigator.clipboard.writeText(pdfUrl)}
                >
                  Copia link
                </button>
              </div>

              <div className="mt-2 text-xs text-white/60 break-all">
                Link: {pdfUrl}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer lang={lang as any} />
    </>
  );
}
