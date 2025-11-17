// app/[lang]/page.tsx
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductsTabs from "../components/ProductsTabs";
import ContactForm from "../components/ContactForm";

export default function HomePage({ params }: { params: { lang: string } }) {
  const { lang } = params;

  return (
    <>
      {/* HEADER con lingua dal server */}
      <Header lang={lang as any} />

      <main className="container space-y-16 py-10">
        {/* === HERO (NUOVO) === */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 pt-10 md:pt-12">
          {/* LOGO */}
          <div className="mx-auto mb-6 md:mb-8 w-[220px] md:w-[320px]">
            <img
              src="/hero/hero.svg"
              alt="KiloMistery"
              className="w-full h-auto drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
            />
          </div>

          {/* TITOLO con gradient */}
          <h1 className="text-center text-4xl md:text-6xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
              Mystery box al Kg
            </span>
          </h1>

          {/* SOTTOTITOLO */}
          <p className="mx-auto mt-4 max-w-2xl text-center text-white/70">
            Scegli Standard o Premium, seleziona il peso e aggiungi al carrello.
            Trasparenza, tracciabilità, sorpresa vera.
          </p>

          {/* CTA pill “stilosi” (solo Tailwind inline) */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={`/${lang}/products`}
              className="inline-flex items-center justify-center rounded-full px-5 py-3 font-extrabold text-[#0c0f10]
                         bg-gradient-to-r from-[#7A20FF] to-[#20D27A]
                         shadow-[0_14px_36px_rgba(122,32,255,.25),0_8px_24px_rgba(32,210,122,.25)]
                         border border-white/70 transition-transform duration-150 hover:-translate-y-0.5"
            >
              Vedi prezzi
            </a>

            <a
              href="#come-funziona"
              className="inline-flex items-center justify-center rounded-full px-5 py-3 font-bold
                         text-white bg-white/10 border border-white/25
                         shadow-[0_8px_22px_rgba(0,0,0,.25)]
                         transition-transform duration-150 hover:bg-white/15 hover:-translate-y-0.5"
            >
              Come funziona
            </a>
          </div>
        </section>

        {/* PRODOTTI */}
        <section id="prodotti">
          <ProductsTabs lang={lang as any} />
        </section>

        {/* COME FUNZIONA */}
        <section id="come-funziona" className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            Come funziona KiloMistery
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card">
              <div className="text-3xl">🧪</div>
              <h3 className="mt-2 text-lg font-extrabold">
                Scegli peso e tipologia
              </h3>
              <p className="text-white/70">Standard o Premium da 1–10 kg.</p>
              <ul className="mt-2 text-white/70 text-sm list-disc ps-5 space-y-1">
                <li>Prezzi chiari, niente sorprese sul checkout</li>
                <li>Etichetta con ID lotto</li>
              </ul>
            </div>

            <div className="card">
              <div className="text-3xl">🔐</div>
              <h3 className="mt-2 text-lg font-extrabold">Paga in sicurezza</h3>
              <p className="text-white/70">
                Metodi sicuri, riepilogo via email.
              </p>
              <ul className="mt-2 text-white/70 text-sm list-disc ps-5 space-y-1">
                <li>Conferma immediata</li>
                <li>Assistenza dedicata</li>
              </ul>
            </div>

            <div className="card">
              <div className="text-3xl">🚚</div>
              <h3 className="mt-2 text-lg font-extrabold">
                Spedizione tracciata
              </h3>
              <p className="text-white/70">Tracking 24–72h (di solito).</p>
              <ul className="mt-2 text-white/70 text-sm list-disc ps-5 space-y-1">
                <li>Imballo sicuro</li>
                <li>Sorpresa all’apertura</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SOSTENIBILITÀ */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            Perché è meglio per il pianeta
          </h2>
          <div className="card space-y-3">
            <p className="text-white/80">
              Le nostre mystery box nascono da{" "}
              <b>pacchi smarriti, resi non reclamati e stock fermi</b>. Invece
              di finire in discarica o in inceneritore, quei prodotti tornano in
              circolo sotto forma di unboxing sorpresa.
            </p>
            <p className="text-white/70 text-sm">
              Così trasformiamo uno spreco in un gioco, riducendo l&apos;impatto
              ambientale legato allo smaltimento e alla produzione di nuova
              merce.
            </p>
            <ul className="list-disc ps-5 space-y-1 text-white/70 text-sm">
              <li>Seconda vita ai pacchi: meno rifiuti da smaltire.</li>
              <li>CO₂ evitata rispetto a discarica e incenerimento.</li>
              <li>Packaging essenziale e riciclabile dove possibile.</li>
              <li>
                Lotti tracciati: sai sempre da dove arriva ciò che spacchetti.
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold">FAQ</h2>

          <details className="card">
            <summary className="font-semibold cursor-pointer">
              Cosa c&apos;è nelle mystery box?
            </summary>
            <p className="text-white/70 mt-2">
              Contenuti misti e legali da stock: il bello è la sorpresa. Ogni
              box è sigillata e tracciata.
            </p>
          </details>

          <details className="card">
            <summary className="font-semibold cursor-pointer">
              Posso scegliere la categoria?
            </summary>
            <p className="text-white/70 mt-2">
              No, ma puoi scegliere peso e tipologia (Standard/Premium). La
              selezione è curata per varietà e qualità.
            </p>
          </details>

          <details className="card">
            <summary className="font-semibold cursor-pointer">
              Tempi di spedizione?
            </summary>
            <p className="text-white/70 mt-2">
              Di solito 24–72h. Ricevi il tracking appena il pacco parte.
            </p>
          </details>
        </section>

        {/* CONTATTACI */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold">Contattaci</h2>
          <p className="text-white/70">
            Domande su ordini, spedizioni o partnership? Scrivici:
          </p>
          <ContactForm />
        </section>
      </main>

      {/* FOOTER */}
      <Footer lang={lang as any} />
    </>
  );
}
