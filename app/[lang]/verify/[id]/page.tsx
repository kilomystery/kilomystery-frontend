// app/[lang]/verify/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verifica autenticità",
  description: "Risultato verifica codice lotto KiloMystery.",
};

function parseCode(id: string) {
  // KM-YYYYMMDD-TYPE-WEIGHT-XXXX  (esempio)
  const clean = decodeURIComponent(id).trim();
  const parts = clean.split("-");

  // fallback safe
  const out = {
    code: clean,
    date: "",
    type: "",
    weight: "",
    serial: "",
  };

  // prova a leggere se è nel formato standard
  if (parts.length >= 5 && parts[0] === "KM") {
    out.date = parts[1] || "";
    out.type = parts[2] || "";
    out.weight = parts[3] || "";
    out.serial = parts.slice(4).join("-") || "";
  }
  return out;
}

function formatDateYYYYMMDD(v: string) {
  if (!/^\d{8}$/.test(v)) return v;
  const y = v.slice(0, 4);
  const m = v.slice(4, 6);
  const d = v.slice(6, 8);
  return `${d}/${m}/${y}`;
}

function typeLabel(t: string) {
  if (t === "PRM") return "Premium";
  if (t === "STD") return "Standard";
  if (t === "EXP") return "Explorer";
  return t || "—";
}

export default function VerifyIdPage({
  params,
}: {
  params: { lang: string; id: string };
}) {
  const { lang, id } = params;
  const info = parseCode(id);

  const looksValid =
    /^KM-[0-9]{8}-[A-Z]{3}-[A-Z0-9]+-[A-Z0-9-]+$/i.test(info.code);

  return (
    <main className="container py-10">
      <div className="card bg-[#0b0f14]/70 border-white/10 backdrop-blur-md">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Verifica autenticità
        </h1>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-sm text-white/60">Codice lotto</div>
          <div className="mt-1 font-mono text-lg text-white">{info.code}</div>
        </div>

        <div
          className={`mt-4 rounded-2xl border p-4 ${
            looksValid
              ? "border-emerald-400/20 bg-emerald-500/10"
              : "border-amber-400/20 bg-amber-500/10"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="text-lg">
              {looksValid ? "✅" : "⚠️"}
            </div>
            <div className="font-semibold">
              {looksValid ? "Codice riconosciuto" : "Codice non nel formato standard"}
            </div>
          </div>

          <p className="mt-2 text-sm text-white/75">
            {looksValid
              ? "Questo codice è nel formato ufficiale KiloMystery. (Se vuoi la verifica “forte”, al prossimo step lo colleghiamo anche agli ordini Shopify.)"
              : "Controlla di aver inserito correttamente il codice. Se il problema persiste, contatta l’assistenza."}
          </p>
        </div>

        {/* Dettagli (non “inventiamo” dati Shopify: mostriamo solo ciò che è nel codice) */}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-white/60">Data lotto</div>
            <div className="mt-1 text-white font-semibold">
              {info.date ? formatDateYYYYMMDD(info.date) : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-white/60">Linea</div>
            <div className="mt-1 text-white font-semibold">
              {typeLabel(info.type)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-white/60">Peso</div>
            <div className="mt-1 text-white font-semibold">
              {info.weight || "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-white/60">Seriale</div>
            <div className="mt-1 text-white font-semibold">
              {info.serial || "—"}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-3">
          <Link
            href={`/${lang}`}
            className="btn btn-brand rounded-2xl px-5 py-3 font-semibold"
          >
            Torna al sito
          </Link>
          <Link
            href={`/${lang}/verify`}
            className="btn btn-ghost rounded-2xl px-5 py-3 font-semibold"
          >
            Verifica un altro codice
          </Link>
        </div>

        <div className="mt-6 text-xs text-white/50">
          Suggerimento: conserva l’etichetta. Questo codice serve anche per assistenza e tracciamento interno.
        </div>
      </div>
    </main>
  );
}
