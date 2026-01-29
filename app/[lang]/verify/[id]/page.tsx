// app/[lang]/verify/[id]/page.tsx
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";

type Parsed = {
  ok: boolean;
  code: string;
  date?: string;     // YYYY-MM-DD
  type?: "STD" | "PRM" | "EXP" | string;
  weight?: string;   // "5KG"
  seq?: string;      // "0001"
  reason?: string;
};

function parseLot(codeRaw: string): Parsed {
  const code = (codeRaw || "").trim();

  // Formato atteso: KM-YYYYMMDD-TYPE-WEIGHT-SEQ
  // es: KM-20260128-PRM-5KG-0001
  const re = /^KM-(\d{8})-([A-Z]{3})-(\d+(?:\.\d+)?)KG-(\d{4})$/i;
  const m = code.match(re);

  if (!m) {
    return {
      ok: false,
      code,
      reason:
        "Formato non riconosciuto. Controlla che il codice sia completo e senza spazi.",
    };
  }

  const yyyymmdd = m[1];
  const type = m[2].toUpperCase();
  const weightNum = m[3];
  const seq = m[4];

  const yyyy = yyyymmdd.slice(0, 4);
  const mm = yyyymmdd.slice(4, 6);
  const dd = yyyymmdd.slice(6, 8);
  const date = `${yyyy}-${mm}-${dd}`;

  return {
    ok: true,
    code,
    date,
    type,
    weight: `${weightNum}KG`,
    seq,
  };
}

function typeLabel(t?: string) {
  if (!t) return "—";
  if (t === "PRM") return "Premium";
  if (t === "STD") return "Standard";
  if (t === "EXP") return "Explorer";
  return t;
}

export default function VerifyResultPage({
  params,
}: {
  params: { lang: string; id: string };
}) {
  const lang = (params?.lang || "it") as any;
  const decoded = decodeURIComponent(params.id || "");
  const parsed = parseLot(decoded);

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10">
        <div className="card border-white/15 bg-[#0b0f14]/60 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Esito verifica</h1>
              <p className="mt-2 text-white/70 max-w-2xl">
                Questa è la pagina ufficiale KiloMystery per il codice scansionato.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-white/70">Pagina ufficiale</span>
            </div>
          </div>

          {/* BLOCCO AUTENTICITÀ */}
          {parsed.ok ? (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-200 text-lg">✓</span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-emerald-100">
                    Autenticità: codice valido
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    Il codice rispetta il formato ufficiale KiloMystery.
                  </div>
                  <div className="mt-3 font-mono text-sm text-white">
                    {parsed.code}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid md:grid-cols-4 gap-3">
                <Fact label="Linea" value={typeLabel(parsed.type)} />
                <Fact label="Peso" value={parsed.weight || "—"} />
                <Fact label="Data lotto" value={parsed.date || "—"} />
                <Fact label="Progressivo" value={parsed.seq || "—"} />
              </div>

              <div className="mt-4 text-xs text-white/60">
                Nota: questa verifica conferma il <b>formato ufficiale</b>. La verifica “forte”
                collegata agli ordini Shopify verrà aggiunta in seguito.
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-9 w-9 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-200 text-lg">!</span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-100">
                    Attenzione: codice non valido
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    {parsed.reason}
                  </div>
                  <div className="mt-3 font-mono text-sm text-white">
                    {parsed.code}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-white/60">
                Se pensi sia un errore, controlla che il codice sia completo e riprova.
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${lang}`} className="btn btn-brand">
              Torna al sito
            </Link>
            <Link href={`/${lang}/verify`} className="btn btn-ghost">
              Verifica un altro codice
            </Link>
          </div>

          {/* MINI FOOT NOTE */}
          <div className="mt-6 text-xs text-white/50">
            KiloMystery · Verifica autenticità tramite QR su etichetta ufficiale.
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white/90">{value}</div>
    </div>
  );
}
