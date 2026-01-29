import Link from "next/link";

export default function VerifyResultPage({
  params,
}: {
  params: { lang: string; id: string };
}) {
  const lang = params?.lang || "it";
  const id = decodeURIComponent(params?.id || "");

  // Per ora è “pagina di atterraggio”
  // In futuro puoi collegare una vera verifica (DB / Shopify / logistica).
  return (
    <main className="container py-10">
      <div className="card border-white/15 bg-[#0b0f14]/60">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Verifica</h1>

          <div className="mt-4 rounded-2xl border border-white/15 bg-black/30 p-4">
            <div className="text-sm text-white/60">Codice lotto</div>
            <div className="mt-1 font-mono text-sm text-white">{id}</div>
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div className="font-semibold text-emerald-200">Codice ricevuto ✅</div>
            <p className="mt-1 text-sm text-emerald-100/80">
              Grazie! Questo codice è nel formato ufficiale KiloMystery.
              (Se vuoi la verifica “forte”, al prossimo step lo colleghiamo agli ordini Shopify.)
            </p>
          </div>

          <div className="mt-6 flex gap-2">
            <Link href={`/${lang}`} className="btn btn-brand">
              Torna al sito
            </Link>
            <Link href={`/${lang}/verify`} className="btn btn-ghost">
              Verifica un altro codice
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
