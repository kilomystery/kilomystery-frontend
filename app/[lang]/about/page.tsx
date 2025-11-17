// app/[lang]/about/page.tsx
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function AboutPage({ params }: { params: { lang: string } }) {
  const { lang } = params;

  return (
    <>
      <Header lang={lang as any} />

      <main className="container py-10 space-y-10">
        {/* HERO logo */}
        <div className="mx-auto w-[220px] md:w-[300px]">
          <img
            src="/hero/hero.svg"
            alt="KiloMistery"
            className="w-full h-auto drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
          />
        </div>

        {/* Titolo grande */}
        <header className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="section-title text-4xl md:text-5xl">
            Chi siamo
          </h1>
          <p className="text-white/70">
            Siamo una realtà giovane nata da un’idea semplice: dare una seconda
            vita ai pacchi che il sistema tradizionale considera “persi”.
            Selezione, trasparenza e velocità. Ogni box è sigillata, pesata
            e tracciata.
          </p>
        </header>

        {/* 3 punti chiave */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="card">
            <div className="section-kicker mb-2">Supply</div>
            <h3 className="product-title mb-1">Lotti certificati</h3>
            <p className="text-white/70">
              Origine e tracciabilità chiare su ogni lotto: pacchi smarriti,
              resi non reclamati e stock fermi vengono selezionati, pesati e
              registrati prima di diventare una KiloMystery Box.
            </p>
          </div>
          <div className="card">
            <div className="section-kicker mb-2">Quality</div>
            <h3 className="product-title mb-1">Controlli e tolleranze</h3>
            <p className="text-white/70">
              Peso netto con tolleranza ±3% e sigillo anti-manomissione.
              Ogni box ha un ID lotto e una data, per sapere sempre cosa è
              stato preparato, quando e da dove arriva.
            </p>
          </div>
          <div className="card">
            <div className="section-kicker mb-2">Support</div>
            <h3 className="product-title mb-1">Assistenza rapida</h3>
            <p className="text-white/70">
              Risposte veloci via email prima e dopo l’ordine. Siamo noi a
              seguire il customer care, non un call center anonimo.
            </p>
          </div>
        </section>

        {/* Blocco: sostenibilità */}
        <section className="card space-y-3">
          <h2 className="text-2xl font-extrabold">
            Seconda vita ai pacchi, meno sprechi
          </h2>
          <p className="text-white/80">
            Le nostre box recuperano pacchi che altrimenti finirebbero in
            discarica o in inceneritore: smarrimenti, resi non ritirati,
            stock dimenticati in magazzino. Invece di diventare rifiuti,
            quei prodotti tornano in circolo sotto forma di unboxing sorpresa.
          </p>
          <p className="text-white/70 text-sm">
            Ogni ordine è un piccolo “no” allo spreco e a nuova produzione
            inutile, e un “sì” a un consumo più consapevole. È per questo che
            parliamo di mystery box, ma con numeri, lotti e responsabilità.
          </p>
          <ul className="list-disc ps-5 space-y-1 text-white/70 text-sm">
            <li>Riduciamo i rifiuti dando una nuova destinazione ai pacchi.</li>
            <li>Meno smaltimento = meno CO₂ rispetto al ciclo classico.</li>
            <li>Packaging essenziale e riciclabile dove possibile.</li>
          </ul>
        </section>

        {/* Blocco: pop-up ed esperienza fisica */}
        <section className="card space-y-3">
          <h2 className="text-2xl font-extrabold">
            Pop-up e community in movimento
          </h2>
          <p className="text-white/80">
            Non siamo solo uno store online: KiloMystery vive anche offline.
            Organizziamo <b>pop-up in giro per l’Italia</b> dove puoi vedere le
            box dal vivo, parlare con noi e scoprire come lavoriamo dietro le quinte.
          </p>
          <p className="text-white/70 text-sm">
            Ogni evento è un momento per spiegare come funziona la filiera
            dei pacchi smarriti, perché è importante recuperare ciò che esiste
            già e come trasformiamo un problema di logistica in un gioco
            sostenibile.
          </p>
          <p className="text-white/70 text-sm">
            Nella pagina <b>Eventi Pop-Up</b> trovi le prossime date, le città e
            le location in cui potrai trovarci.
          </p>
        </section>

        {/* Blocco: mission finale */}
        <section className="card space-y-3">
          <h2 className="text-2xl font-extrabold">
            La nostra promessa
          </h2>
          <p className="text-white/80">
            Vogliamo unire la sensazione di aprire un pacco misterioso con la
            tranquillità di sapere che dietro c&apos;è un lavoro serio su filiera,
            controlli e impatto ambientale.
          </p>
          <p className="text-white/70 text-sm">
            Se ti piace l&apos;idea di dare una seconda chance ai pacchi e
            ridurre lo spreco, sei nel posto giusto. KiloMystery è un esperimento
            in continua evoluzione: ascoltiamo la community, testiamo nuove
            idee e miglioriamo le box giro dopo giro.
          </p>
        </section>
      </main>

      <Footer lang={lang as any} />
    </>
  );
}
