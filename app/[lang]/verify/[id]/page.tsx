// app/[lang]/verify/[id]/page.tsx
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";

type Props = {
  params: { lang: string; id: string };
};

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

// Piccolo parser facoltativo: KM-YYYYMMDD-PRM-5KG-0001
function parseId(id: string) {
  const raw = id.trim();
  const parts = raw.split("-");
  if (parts.length < 5) return null;

  const brand = parts[0];
  const ymd = parts[1];
  const type = parts[2];
  const weight = parts[3];
  const seq = parts.slice(4).join("-");

  const yyyy = ymd.slice(0, 4);
  const mm = ymd.slice(4, 6);
  const dd = ymd.slice(6, 8);

  const date = yyyy.length === 4 ? `${dd}/${mm}/${yyyy}` : null;

  return { brand, ymd, type, weight, seq, date };
}

export default function VerifyIdPage({ params }: Props) {
  const lang = (params.lang || "it") as any;
  const id = safeDecode(params.id || "");
  const parsed = parseId(id);

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white">
      <Header lang={lang} />

      <main className="container py-10">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-[#0f1420]/70 border border-white/10 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Verifica autenticità
                </h1>
                <p className="mt-2 text-white/70">
                  Hai scansionato un QR ufficiale KiloMystery.
                </p>
              </div>

              <div className="shrink-0 rounded-2xl px-3 py-2 border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 font-semibold text-sm">
                ✓ Codice trovato
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs uppercase tracking-wider text-white/50">
                ID / LOTTO
              </div>
              <div className="mt-1 text-lg font-semibold text-white">
                {id}
              </div>
            </div>

            {parsed && (
              <div className="mt-4 grid md:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-wider text-white/50">
                    Tipo
                  </div>
                  <div className="mt-1 font-semibold">
                    {parsed.type === "PRM" ? "Premium" : parsed.type}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-wider text-white/50">
                    Peso
                  </div>
                  <div className="mt-1 font-semibold">{parsed.weight}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-wider text-white/50">
                    Data (da ID)
                  </div>
                  <div className="mt-1 font-semibold">{parsed.date ?? "—"}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-wider text-white/50">
                    Progressivo
                  </div>
                  <div className="mt-1 font-semibold">{parsed.seq}</div>
                </div>
              </div>
            )}

            <div className="mt-6 text-sm text-white/70">
              Se il codice non corrisponde al tuo ordine o noti anomalie, contattaci:
              <span className="ml-1 font-semibold text-white/85">support@kilomystery.com</span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Link
                href={`/${lang}`}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-white/10 hover:bg-white/15 border border-white/15 transition"
              >
                Vai al sito
              </Link>

              <Link
                href={`/${lang}/products`}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] text-black hover:opacity-90 transition"
              >
                Scopri le box
              </Link>
            </div>

            <div className="mt-4 text-xs text-white/45">
              Nota: in futuro questa pagina potrà validare il lotto via database per dire anche “spedito / consegnato / ecc.”.
            </div>
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
