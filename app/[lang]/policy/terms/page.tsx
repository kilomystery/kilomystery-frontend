/* eslint-disable react/no-unescaped-entities */
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
        {/* HERO */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
          <div className="mx-auto mb-6 grid place-items-center">
            <Image
              src="/hero/hero.svg"
              alt="KiloMystery"
              width={320}
              height={320}
              className="w-[240px] h-[240px] object-contain drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
            />
          </div>
          <h1 className="section-title text-center text-3xl md:text-4xl font-extrabold">
            <span className="brand-text">Termini e condizioni</span>
          </h1>
          <p className="text-center text-white/70 mt-3 text-sm">
            Ultimo aggiornamento:{" "}
            <b>{new Date().toLocaleDateString("it-IT")}</b>
          </p>
          <p className="text-center text-white/60 text-xs mt-1">
            Un riepilogo chiaro delle regole con cui usi il sito e acquisti le
            nostre mystery box. 📜
          </p>
        </section>

        <section className="space-y-5">
          {/* OGGETTO */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Oggetto</span>
              <span>📌</span>
            </h2>
            <p className="text-white/70 text-sm">
              Le presenti condizioni disciplinano l&apos;accesso e l&apos;uso
              del sito KiloMystery e la vendita di prodotti sotto forma di{" "}
              <b>mystery box</b>. Acquistando una box accetti che il contenuto
              sia non visibile in anticipo e non selezionabile nel dettaglio.
            </p>
          </article>

          {/* ACQUISTO & PREZZI */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Acquisto & prezzi</span>
              <span>💳</span>
            </h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>
                I prezzi sono indicati in EUR, IVA inclusa salvo diversa
                indicazione.
              </li>
              <li>
                Il contenuto delle box è di tipo “mystery”: non è possibile
                scegliere i singoli articoli.
              </li>
              <li>
                Ricevi una conferma ordine via email con riepilogo e dettaglio
                dell&apos;acquisto.
              </li>
              <li>
                I pagamenti sono gestiti tramite provider terzi affidabili; noi
                non salviamo i dati completi della tua carta.
              </li>
            </ul>
          </article>

          {/* RESPONSABILITÀ */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Limitazione di responsabilità</span>
              <span>⚠️</span>
            </h2>
            <p className="text-white/70 text-sm">
              Il sito e i servizi sono forniti “as is”. Ci impegniamo a
              mantenere la piattaforma funzionante e aggiornata, ma non possiamo
              garantire l&apos;assenza totale di interruzioni, errori tecnici o
              ritardi dovuti a terze parti (es. provider, corrieri, gateway di
              pagamento).
            </p>
            <p className="text-white/70 text-sm">
              In nessun caso saremo responsabili per danni indiretti o
              consequenziali derivanti dall&apos;uso del sito o da ritardi non
              direttamente imputabili a noi.
            </p>
          </article>

          {/* LEGGE APPLICABILE */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Legge applicabile & foro competente</span>
              <span>⚖️</span>
            </h2>
            <p className="text-white/70 text-sm">
              Le presenti condizioni sono regolate dalla legge italiana. Quando
              applicabile, è competente il foro del consumatore; in altri casi,
              il foro competente è quello individuato secondo la normativa
              vigente.
            </p>
            <p className="text-white/70 text-sm">
              Per qualsiasi dubbio sui termini puoi contattarci dalla pagina{" "}
              <a href={`/${lang}/contact`} className="btn-link">
                Contatti
              </a>
              .
            </p>
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
