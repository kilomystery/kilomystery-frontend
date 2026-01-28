// app/[lang]/verify/[id]/page.tsx

import { notFound } from "next/navigation";

interface PageProps {
  params: {
    lang: string;
    id: string;
  };
}

// Simulazione DB (per ora)
// In futuro qui colleghi un vero database
const MOCK_DB: Record<
  string,
  {
    product: string;
    weight: string;
    date: string;
    warehouse: string;
  }
> = {
  "KM-20260128-PRM-5KG-0001": {
    product: "Premium Box",
    weight: "5 Kg",
    date: "28/01/2026",
    warehouse: "Brindisi (BR)",
  },
};

export default function VerifyPage({ params }: PageProps) {
  const { id, lang } = params;

  // Recupera dati (per ora fake)
  const data = MOCK_DB[id];

  if (!id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="container max-w-3xl py-16">

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Verifica prodotto
        </h1>

        <p className="text-white/70 mb-10">
          Controlla l’autenticità del tuo Kilo Mystery
        </p>

        {/* Box */}
        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8 backdrop-blur">

          {/* Status */}
          {data ? (
            <div className="mb-6 flex items-center gap-2 text-green-400 font-semibold">
              ✅ Prodotto autentico verificato
            </div>
          ) : (
            <div className="mb-6 flex items-center gap-2 text-yellow-400 font-semibold">
              ⚠️ Codice non trovato nel sistema
            </div>
          )}

          {/* ID */}
          <div className="mb-6">
            <p className="text-sm text-white/60 mb-1">Codice lotto</p>
            <p className="font-mono text-lg break-all">{id}</p>
          </div>

          {/* Details */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

              <Info label="Prodotto" value={data.product} />
              <Info label="Peso" value={data.weight} />
              <Info label="Data" value={data.date} />
              <Info label="Magazzino" value={data.warehouse} />

            </div>
          )}

          {/* Manual check */}
          <div className="border-t border-white/10 pt-6">

            <h3 className="font-semibold mb-3">
              Verifica manuale
            </h3>

            <p className="text-sm text-white/60 mb-4">
              Inserisci un codice lotto per controllarlo
            </p>

            <form
              action={`/${lang}/verify`}
              method="get"
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                name="id"
                placeholder="KM-2026..."
                required
                className="flex-1 rounded-lg bg-white/10 border border-white/15 px-4 py-2 text-white outline-none focus:border-brand"
              />

              <button
                type="submit"
                className="btn btn-brand px-6"
              >
                Verifica
              </button>
            </form>

          </div>

        </div>

      </div>
    </main>
  );
}

/* Component */
function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-white/50 mb-1">
        {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
