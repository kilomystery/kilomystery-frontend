/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Politica Resi",
};

export default function ReturnsPage({ params }: { params: { lang: string } }) {
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
            <span className="brand-text">Politica resi</span>
          </h1>
          <p className="text-center text-white/70 mt-3 text-sm">
            Ultimo aggiornamento:{" "}
            <b>{new Date().toLocaleDateString("it-IT")}</b>
          </p>
          <p className="text-center text-white/60 text-xs mt-1">
            Le mystery box sono per definizione sorprendenti, ma vogliamo
            essere chiari sulle condizioni di reso. 📦
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {/* RESI */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Resi delle mystery box</span>
              <span>🎁</span>
            </h2>
            <p className="text-white/70 text-sm">
              Le box sono vendute come <b>mystery sigillate</b>: il contenuto
              non è noto in anticipo e non è personalizzabile. Per questo, il
              reso non è previsto per semplice mancato gradimento o per il
              valore percepito dei prodotti ricevuti.
            </p>

            <h3 className="font-bold mt-3 text-sm">Eccezioni</h3>
            <p className="text-white/70 text-sm">
              Valutiamo caso per caso situazioni di:
            </p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>imballo gravemente danneggiato all&apos;arrivo;</li>
              <li>box visibilmente manomessa;</li>
              <li>errori evidenti di spedizione (es. peso completamente diverso).</li>
            </ul>
          </article>

          {/* COME APRIRE UNA SEGNALAZIONE */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Come segnalarci un problema</span>
              <span>🛠️</span>
            </h2>
            <p className="text-white/70 text-sm">
              Se noti problemi al momento della consegna, ti chiediamo di:
            </p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>contattarci entro 48 ore dalla consegna;</li>
              <li>
                allegare foto chiare di imballo esterno, sigilli e contenuto;
              </li>
              <li>indicare numero ordine e descrizione del problema.</li>
            </ul>
            <p className="text-white/70 text-sm">
              Puoi aprire la segnalazione dalla pagina{" "}
              <a href={`/${lang}/contact`} className="btn-link">
                Contatti
              </a>
              .
            </p>

            <h3 className="font-bold mt-3 text-sm">Rimborsi</h3>
            <p className="text-white/70 text-sm">
              In caso di approvazione, il rimborso viene effettuato sullo stesso
              metodo di pagamento utilizzato in fase di acquisto, di solito entro
              5–10 giorni lavorativi (tempistiche dei circuiti di pagamento).
            </p>
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
