// app/[lang]/policy/terms/page.tsx
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Termini e Condizioni",
};

export default function TermsPage({ params }: { params: { lang: string } }) {
  const lang = (params?.lang || "it") as any;

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-10">
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
          <div className="mx-auto mb-6 grid place-items-center">
            <Image src="/hero/hero.svg" alt="KiloMistery" width={320} height={320}
              className="w-[240px] h-[240px] object-contain" />
          </div>
          <h1 className="section-title text-center text-4xl font-extrabold">
            <span className="brand-text">Termini e Condizioni</span>
          </h1>
          <p className="text-center text-white/70 mt-3">
            Ultimo aggiornamento: <b>{new Date().toLocaleDateString("it-IT")}</b>
          </p>
        </section>

        <section className="space-y-5">
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">Oggetto</h2>
            <p className="text-white/70">
              Le presenti condizioni disciplinano l’accesso e l’uso del sito e la
              vendita di prodotti “mystery box”.
            </p>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">Acquisto & prezzi</h2>
            <ul className="bullets space-y-1">
              <li>Prezzi in EUR, IVA inclusa salvo diversa indicazione.</li>
              <li>Il contenuto è “mystery”: non selezionabile nel dettaglio.</li>
              <li>Conferma ordine via email; pagamento sicuro con provider terzi.</li>
            </ul>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">Responsabilità</h2>
            <p className="text-white/70">
              Il sito è fornito “as is”. Non siamo responsabili per interruzioni
              del servizio o ritardi non imputabili a noi.
            </p>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">Legge applicabile</h2>
            <p className="text-white/70">
              Le presenti condizioni sono regolate dalla legge italiana. Foro competente
              quello del consumatore ove previsto.
            </p>
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}