"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useEffect, useMemo, useState } from "react";

type Line = "PRM" | "STD" | "EXP";
type Channel = "Shopify" | "eBay" | "TikTok Live" | "Sito" | "Altro";

function pad4(n: number) {
  return String(n).padStart(4, "0");
}

function yyyymmddFromDateInput(v: string) {
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  return `${m[1]}${m[2]}${m[3]}`;
}

function todayInput() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function LabelsPage({ params }: { params: { lang: string } }) {
  const lang = params?.lang || "it";

  const [autoId, setAutoId] = useState(true);
  const [line, setLine] = useState<Line>("PRM");
  const [weightNum, setWeightNum] = useState<number>(5);
  const [dateInput, setDateInput] = useState<string>(todayInput());
  const [warehouse, setWarehouse] = useState("Brindisi (BR)");

  const [channel, setChannel] = useState<Channel>("Sito");
  const [externalOrderId, setExternalOrderId] = useState("");
  const [discountCode, setDiscountCode] = useState("");

  const [product, setProduct] = useState("Premium Box");
  const [id, setId] = useState("");

  const [loading, setLoading] = useState(false);

  const weightKg = `${weightNum} KG`;

  function generateId() {
    const yyyymmdd = yyyymmddFromDateInput(dateInput);
    if (!yyyymmdd) return;

    const seq = pad4(Math.floor(Math.random() * 10000));
    const next = `KM-${yyyymmdd}-${line}-${weightNum}KG-${seq}`;
    setId(next);
  }

  useEffect(() => {
    if (autoId) generateId();
  }, [autoId, line, weightNum, dateInput]);

  const pdfUrl = useMemo(() => {
    if (!id) return "";
    const u = new URL(`/api/label`, window.location.origin);
    u.searchParams.set("id", id);
    u.searchParams.set("product", product);
    u.searchParams.set("weightKg", weightKg);
    u.searchParams.set("date", new Date(dateInput).toLocaleDateString("it-IT"));
    u.searchParams.set("warehouse", warehouse);
    u.searchParams.set("lang", lang);
    u.searchParams.set("channel", channel);
    if (externalOrderId) u.searchParams.set("externalOrderId", externalOrderId);
    if (discountCode) u.searchParams.set("discount", discountCode);
    return u.toString();
  }, [id, product, weightNum, dateInput, warehouse, lang, channel, externalOrderId, discountCode]);

  function openPdf() {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <Header lang={lang as any} />
      <main className="container py-10">
        <div className="card border-white/15 bg-[#0b0f14]/60 p-6">
          <h1 className="text-2xl font-bold">Etichette magazzino</h1>
          <p className="mt-2 text-white/70">
            Compila i campi e genera il PDF 4×6.
          </p>

          <div className="mt-6 grid gap-4">
            <div className="grid md:grid-cols-3 gap-4">
              <select
                value={line}
                onChange={(e) => setLine(e.target.value as Line)}
                className="rounded-xl bg-black/30 px-4 py-3"
              >
                <option value="PRM">Premium</option>
                <option value="STD">Standard</option>
                <option value="EXP">Explorer</option>
              </select>

              <input
                type="number"
                min={1}
                value={weightNum}
                onChange={(e) => setWeightNum(parseInt(e.target.value || "1"))}
                className="rounded-xl bg-black/30 px-4 py-3"
              />

              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="rounded-xl bg-black/30 px-4 py-3"
              />
            </div>

            <input
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="rounded-xl bg-black/30 px-4 py-3"
            />

            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="rounded-xl bg-black/30 px-4 py-3"
            />

            <div className="grid md:grid-cols-3 gap-4">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel)}
                className="rounded-xl bg-black/30 px-4 py-3"
              >
                <option>Shopify</option>
                <option>eBay</option>
                <option>TikTok Live</option>
                <option>Sito</option>
                <option>Altro</option>
              </select>

              <input
                placeholder="Order ref"
                value={externalOrderId}
                onChange={(e) => setExternalOrderId(e.target.value)}
                className="rounded-xl bg-black/30 px-4 py-3"
              />

              <input
                placeholder="Codice sconto"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="rounded-xl bg-black/30 px-4 py-3"
              />
            </div>

            <div className="flex items-center gap-4">
              <input
                value={id}
                readOnly
                className="flex-1 rounded-xl bg-black/30 px-4 py-3"
              />

              <button onClick={generateId} className="btn btn-ghost">
                Rigenera ID
              </button>
            </div>

            <button onClick={openPdf} className="btn btn-brand">
              Genera PDF etichetta
            </button>

            <div className="text-xs break-all text-white/60">{pdfUrl}</div>
          </div>
        </div>
      </main>
      <Footer lang={lang as any} />
    </>
  );
}
