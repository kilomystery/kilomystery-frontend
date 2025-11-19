import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function AboutPage({ params }: { params: { lang: string } }) {
  const { lang } = params;

  return (
    <>
      <Header lang={lang as any} />

      <main className="container py-12 space-y-12">
        {/* HERO */}
        <section className="space-y-8 text-center max-w-3xl mx-auto">
          <div className="mx-auto w-[220px] md:w-[300px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero/hero.svg"
              alt="KiloMystery"
              className="w-full h-auto drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
            />
          </div>

          <div className="space-y-3">
            <div className="uppercase tracking-[.2em] text-emerald-300/80 text-xs md:text-sm">
              About us
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
              Chi c'è dietro KiloMystery
            </h1>

            <p className="text-white/70 text-base md:text-lg">
              Siamo una realtà giovane nata da un'idea semplice: dare una
              seconda vita ai pacchi che i circuiti tradizionali considerano
              “persi”. Trasparenza, tracciabilità e velocità sono la base
              di ogni box.
            </p>
          </div>
        </section>

        {/* PUNTI CHIAVE */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="card space-y-2">
            <div className="flex items-center justify-between">
              <span className="section-kicker">Supply</span>
              <span className="text-xl">📦</span>
            </div>
            <h3 className="product-title">Lotti certificati</h3>
            <p className="text-white/70 text-sm">
              Pacchi smarriti, resi non reclamati e stock fermi vengono
              selezionati, pesati e registrati prima di diventare box.
            </p>
          </div>

          <div className="card space-y-2">
            <div className="flex items-center justify-between">
              <span className="section-kicker">Quality</span>
              <span className="text-xl">✅</span>
            </div>
            <h3 className="product-title">Controlli seri</h3>
            <p className="text-white/70 text-sm">
              Peso netto con tolleranza ±3%, sigillo anti-manomissione,
              ID lotto e tracciabilità interna.
            </p>
          </div>

          <div className="card space-y-2">
            <div className="flex items-center justify-between">
              <span className="section-kicker">Support</span>
              <span className="text-xl">🤝</span>
            </div>
            <h3 className="product-title">Assistenza rapida</h3>
            <p className="text-white/70 text-sm">
              Risposte veloci via email: niente call center, solo noi.
            </p>
          </div>
        </section>

        {/* SOSTENIBILITÀ */}
        <section className="card space-y-3 relative">
          <span className="pill pill--prm text-[0.7rem] absolute right-3 top-3">
            🌱 Seconda vita ai pacchi
          </span>

          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            Seconda vita ai pacchi, meno sprechi ♻️
          </h2>

          <p className="text-white/80 text-sm md:text-base">
            Le nostre box recuperano pacchi che altrimenti finirebbero in
            discarica o inceneritore. Invece di diventare rifiuti,
            tornano in circolo.
          </p>

          <ul className="list-disc ps-5 space-y-1 text-white/70 text-sm">
            <li>Riduciamo i rifiuti dando una nuova destinazione ai pacchi.</li>
            <li>Meno smaltimento = meno CO₂.</li>
            <li>Packaging essenziale e riciclabile.</li>
          </ul>
        </section>

        {/* POP-UP */}
        <section className="card space-y-3">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            Pop-up e community in movimento 🎪📍
          </h2>

          <p className="text-white/80 text-sm md:text-base">
            Organizziamo pop-up in tutta Italia per incontrare la community,
            far vedere le box e spiegare come lavoriamo.
          </p>

          <p className="text-white/70 text-sm">
            Nella pagina <b>Eventi Pop-Up</b> trovi le prossime date e location.
          </p>
        </section>

        {/* MISSION */}
        <section className="card space-y-3">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            La nostra promessa ✨
          </h2>

          <p className="text-white/80 text-sm md:text-base">
            Vogliamo unire la sorpresa dell'unboxing con la tranquillità
            di un lavoro serio sulla filiera e sul recupero.
          </p>

          <p className="text-white/70 text-sm">
            KiloMystery evolve continuamente ascoltando la community
            e migliorando le box giro dopo giro.
          </p>
        </section>
      </main>

      <Footer lang={lang as any} />
    </>
  );
}
