/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Spedizioni",
};

export default function ShippingPage({ params }: { params: { lang: string } }) {
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
            <span className="brand-text">Spedizioni</span>
          </h1>
          <p className="text-center text-white/70 mt-3 text-sm">
            Ultimo aggiornamento:{" "}
            <b>{new Date().toLocaleDateString("it-IT")}</b>
          </p>
          <p className="text-center text-white/60 text-xs mt-1">
            Qui ti spieghiamo tempi, costi e tracking delle tue box. 🚚
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {/* TEMPI & TRACKING */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Tempi & tracking</span>
              <span>⏱️</span>
            </h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>Preparazione ordine: di solito 24–48 ore lavorative.</li>
              <li>
                Consegna stimata: 24–72 ore lavorative in Italia (salvo isole
                minori o zone difficilmente raggiungibili).
              </li>
              <li>
                Il codice di tracking viene inviato via email non appena il
                corriere prende in carico il pacco.
              </li>
            </ul>
            <p className="text-white/60 text-xs">
              Le tempistiche indicate sono stime medie: eventuali ritardi dovuti
              ai corrieri o a terze parti non dipendono da noi, ma ti aiutiamo a
              monitorare la spedizione.
            </p>
          </article>

          {/* COSTI & NOTE */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Costi & note importanti</span>
              <span>💶</span>
            </h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>
                Il costo di spedizione è calcolato al checkout in base al peso
                totale dell&apos;ordine.
              </li>
              <li>
                Indirizzi incompleti o errati possono causare ritardi o
                riconsegne: ti chiediamo di ricontrollare sempre i dati.
              </li>
              <li>
                In caso di problemi di consegna, puoi contattarci dalla pagina{" "}
                <a href={`/${lang}/contact`} className="btn-link">
                  Contatti
                </a>
                .
              </li>
            </ul>
            <p className="text-white/60 text-xs">
              Spediamo solo a indirizzi serviti dai nostri corrieri. Alcune aree
              remote possono richiedere tempi leggermente più lunghi.
            </p>
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
