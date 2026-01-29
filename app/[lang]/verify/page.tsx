// app/[lang]/verify/page.tsx
import type { Metadata } from "next";
import VerifyForm from "./VerifyForm";

export const metadata: Metadata = {
  title: "Verifica autenticità",
  description: "Verifica l’autenticità del tuo codice KiloMystery.",
};

export default function VerifyPage({
  params,
}: {
  params: { lang: string };
}) {
  return (
    <main className="container py-10">
      <div className="card bg-[#0b0f14]/70 border-white/10 backdrop-blur-md">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Verifica autenticità
        </h1>
        <p className="mt-2 text-white/70">
          Inserisci il <span className="font-semibold text-white/85">codice lotto</span> presente
          sull’etichetta per verificare che sia un prodotto originale KiloMystery.
        </p>

        <div className="mt-6">
          <VerifyForm lang={params.lang} />
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          <div className="font-semibold text-white/85">Esempio formato:</div>
          <div className="mt-1 font-mono text-white/80">
            KM-20260128-PRM-5KG-0001
          </div>
          <div className="mt-2">
            Se hai scansionato il QR, questa pagina si apre automaticamente con il codice già compilato.
          </div>
        </div>
      </div>
    </main>
  );
}
