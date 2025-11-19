 import Image from "next/image";
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
          {/* Logo */}
          <div className="mx-auto w-[220px] md:w-[300px]">
            <img
              src="/hero/hero.svg"
              alt="KiloMystery"
              className="w-full h-auto drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
            />
          </div>

          {/* Titolo + testo */}
          <div className="space-y-3">
            <div className="uppercase tracking-[.2em] text-emerald-300/80 text-xs md:text-sm">
              About us
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
              Chi c&apos;è dietro KiloMystery
            </h1>

            <p className="text-white/70 text-sm md:text-base">
              Siamo una realtà giovane nata da un&apos;idea semplice: dare una
              seconda vita ai pacchi che il sistema tradizionale considera
              &quot;persi&quot;. Lavoriamo su <b>lotti reali</b>, con{" "}
              <b>trasparenza</b>, <b>tracciabilità</b> e <b>velocità</b>.
            </p>
          </div>
        </section>

        {/* 3 PUNTI CHIAVE */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="card space-y-2">
            <div className="flex items-center justify-between">
              <div className="section-kicker">Supply</div>
              <span className="text-xl">📦</span>
            </div>
            <h3 className="product-title mb-1">Lotti certificati</h3>
            <p className="text-white/70 text-sm">
              Origine e tracciabilità chiare su ogni lotto: pacchi smarriti,
              resi non reclamati e stock fermi vengono selezionati, pesati e
              registrati prima di diventare una KiloMystery Box.
            </p>
          </div>

          <div className="card space-y-2">
            <div className="flex items-center justify-between">
              <div className="section-kicker">Quality</div>
              <span className="text-xl">✅</span>
            </div>
            <h3 className="product-title mb-1">Controlli e tolleranze</h3>
            <p className="text-white/70 text-sm">
              Peso netto con tolleranza ±3% e sigillo anti-manomissione.
              Ogni box ha un ID lotto e una data, per sapere sempre cosa è
              stato preparato, quando e da dove arriva.
            </p>
          </div>

          <div className="card space-y-2">
            <div className="flex items-center justify-between">
              <div className="section-kicker">Support</div>
              <span className="text-xl">🤝</span>
            </div>
            <h3 className="product-title mb-1">Assistenza rapida</h3>
            <p className="text-white/70 text-sm">
              Risposte veloci via email prima e dopo l&apos;ordine. Il customer
              care lo seguiamo noi in prima persona, non un call center
              anonimo.
            </p>
          </div>
        </section>

        {/* MINI NUMERI / TRUST */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="card p-4 space-y-1">
            <p className="text-xs uppercase tracking-[.15em] text-emerald-300/80">
              Impatto circolare
            </p>
            <p className="text-2xl font-extrabold text-emerald-200">10.000+ kg</p>
            <p className="text-xs text-white/65">
              di pacchi recuperati da stock fermi, resi e smarrimenti, rimessi
              in circolo invece che sprecati. ♻️
            </p>
          </div>
          <div className="card p-4 space-y-1">
            <p className="text-xs uppercase tracking-[.15em] text-emerald-300/80">
              Community
            </p>
            <p className="text-2xl font-extrabold text-emerald-200">In crescita</p>
            <p className="text-xs text-white/65">
              Una base di clienti che amano l&apos;unboxing, la sorpresa e un
              approccio più consapevole al consumo.
            </p>
          </div>
          <div className="card p-4 space-y-1">
            <p className="text-xs uppercase tracking-[.15em] text-emerald-300/80">
              Online & offline
            </p>
            <p className="text-2xl font-extrabold text-emerald-200">2 canali</p>
            <p className="text-xs text-white/65">
              Store online e pop-up fisici per vivere l&apos;esperienza
              KiloMystery da vicino.
            </p>
          </div>
        </section>

        {/* SOSTENIBILITÀ */}
        <section className="card space-y-3 relative">
          <span className="pill pill--prm text-[0.7rem] absolute right-3 top-3">
            🌱 Seconda vita ai pacchi
          </span>

          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <span>Seconda vita ai pacchi, meno sprechi</span>
            <span className="text-2xl">♻️</span>
          </h2>

          <p className="text-white/80 text-sm md:text-base">
            Le nostre box recuperano pacchi che altrimenti finirebbero in
            discarica o in inceneritore: smarrimenti, resi non ritirati,
            stock dimenticati in magazzino. Invece di diventare rifiuti,
            quei prodotti tornano in circolo sotto forma di unboxing sorpresa.
          </p>

          <p className="text-white/70 text-xs md:text-sm">
            Ogni ordine è un piccolo “no” allo spreco e alla nuova produzione
            inutile, e un “sì” a un consumo più consapevole. Parliamo di
            mystery box, ma con numeri, lotti e responsabilità.
          </p>

          <ul className="list-disc ps-5 space-y-1 text-white/70 text-xs md:text-sm">
            <li>Riduciamo i rifiuti dando una nuova destinazione ai pacchi.</li>
            <li>Meno smaltimento = meno CO₂ rispetto al ciclo classico.</li>
            <li>Packaging essenziale e riciclabile dove possibile.</li>
          </ul>
        </section>

        {/* POP-UP & COMMUNITY */}
        <section className="card space-y-3">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <span>Pop-up e community in movimento</span>
            <span className="text-2xl">📍🎪</span>
          </h2>

          <p className="text-white/80 text-sm md:text-base">
            Non siamo solo uno store online: KiloMystery vive anche offline.
            Organizziamo <b>pop-up in giro per l&apos;Italia</b> dove puoi vedere le
            box dal vivo, parlare con noi e scoprire come lavoriamo dietro le
            quinte.
          </p>

          <p className="text-white/70 text-xs md:text-sm">
            Ogni evento è un momento per spiegare come funziona la filiera
            dei pacchi smarriti, perché è importante recuperare ciò che esiste
            già e come trasformiamo un problema di logistica in un gioco
            sostenibile.
          </p>

          <p className="text-white/70 text-xs md:text-sm">
            Nella pagina <b>Eventi Pop-Up</b> trovi le prossime date, le città e
            le location in cui potrai trovarci.
          </p>
        </section>

        {/* MISSION FINALE */}
        <section className="card space-y-3">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <span>La nostra promessa</span>
            <span className="text-2xl">✨</span>
          </h2>

          <p className="text-white/80 text-sm md:text-base">
            Vogliamo unire la sensazione di aprire un pacco misterioso con la
            tranquillità di sapere che dietro c&apos;è un lavoro serio su filiera,
            controlli e impatto ambientale.
          </p>

          <p className="text-white/70 text-xs md:text-sm">
            Se ti piace l&apos;idea di dare una seconda chance ai pacchi e
            ridurre lo spreco, sei nel posto giusto. KiloMystery è un
            esperimento in continua evoluzione: ascoltiamo la community,
            testiamo nuove idee e miglioriamo le box giro dopo giro.
          </p>
        </section>
      </main>

      <Footer lang={lang as any} />
    </>
  );
}
