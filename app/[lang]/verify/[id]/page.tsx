/* eslint-disable react/no-unescaped-entities */
"use client";

import { useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { normalizeLang, type Lang } from "@/i18n/lang";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDDMMYYYY(iso: string) {
  // iso: YYYY-MM-DD -> DD/MM/YYYY
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function VerifyPage({
  params,
  searchParams,
}: {
  params: { lang: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const lang: Lang = normalizeLang(params?.lang);

  const initialId =
    typeof searchParams?.id === "string" ? searchParams?.id : "";

  const [id, setId] = useState(initialId);
  const [product, setProduct] = useState("Premium Box");
  const [weightKg, setWeightKg] = useState("5");
  const [dateISO, setDateISO] = useState(todayISO());
  const [warehouse, setWarehouse] = useState("Brindisi (BR)");
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    const date = formatDDMMYYYY(dateISO);

    const qs = new URLSearchParams();
    qs.set("id", id.trim());
    qs.set("product", product.trim());
    qs.set("weightKg", `${weightKg}`.trim());
    qs.set("date", date.trim());
    qs.set("warehouse", warehouse.trim());
    qs.set("lang", lang);

    return `/api/label?${qs.toString()}`;
  }, [id, product, weightKg, dateISO, warehouse, lang]);

  const canGenerate = id.trim().length > 0;

  const openPdf = () => {
    if (!canGenerate) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback
      prompt("Copia questo link:", window.location.origin + url);
    }
  };

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-6">
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="brand-text">Verify / Label generator</span>
          </h1>
          <p className="text-white/70 text-sm mt-2">
            Compila i campi e genera la tua etichetta PDF 4x6 pronta da stampare.
          </p>
        </section>

        <section className="card grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="section-kicker mb-1" htmlFor="id">
              ID Lotto / Ordine *
            </label>
            <input
              id="id"
              className="input"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="KM-20260128-PRM-5KG-0001"
              required
            />
            <p className="text-xs text-white/40 mt-1">
              Questo ID verrà anche usato nel QR.
            </p>
          </div>

          <div>
            <label className="section-kicker mb-1" htmlFor="product">
              Prodotto
            </label>
            <input
              id="product"
              className="input"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Premium Box"
            />
          </div>

          <div>
            <label className="section-kicker mb-1" htmlFor="weight">
              Peso (kg)
            </label>
            <input
              id="weight"
              className="input"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="5"
              inputMode="decimal"
            />
          </div>

          <div>
            <label className="section-kicker mb-1" htmlFor="date">
              Data
            </label>
            <input
              id="date"
              className="input"
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
            />
          </div>

          <div>
            <label className="section-kicker mb-1" htmlFor="warehouse">
              Magazzino
            </label>
            <input
              id="warehouse"
              className="input"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              placeholder="Brindisi (BR)"
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={`btn btn-brand px-6 ${!canGenerate ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={openPdf}
              disabled={!canGenerate}
            >
              Genera PDF 4x6
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={copyLink}
              disabled={!canGenerate}
            >
              Copia link PDF
            </button>

            {copied && (
              <span className="text-emerald-400 font-semibold">Copiato ✔️</span>
            )}
          </div>

          <div className="md:col-span-2">
            <p className="text-xs text-white/40">
              Link che verrà generato:
            </p>
            <code className="block mt-2 text-xs text-white/70 break-all bg-black/30 border border-white/10 rounded-xl p-3">
              {canGenerate ? url : "/api/label?... (compila ID)"}
            </code>
          </div>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
