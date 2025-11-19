import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function HowItWorks({ params }: { params: { lang: string } }) {
  const lang = (params?.lang || "it") as any;

  return (
    <>
      <Header lang={lang} />

      <main className="container py-12 space-y-16">
        {/* HERO INTRO */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="uppercase tracking-[.2em] text-emerald-300/80 text-sm">
            How it works
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
            Come funziona KiloMystery
          </h1>

          <p className="text-white/70 text-lg">
            Le nostre box trasformano stock fermi, resi e pacchi smarriti
            in una sorpresa emozionante: scegli il peso, ricevi a casa,
            spacchetti e scopri cosa hai trovato. ♻️🎁
          </p>
        </section>

        {/* MAIN STEPS */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* STEP 1 */}
          <div className="card text-center p-6 space-y-3">
            <div className="text-5xl">🧪</div>
            <h3 className="text-xl font-extrabold">1. Scegli il peso</h3>
            <p className="text-white/70">
              Seleziona Standard o Premium e scegli tra 1 kg e 10 kg.
              Ogni box è sigillata, tracciata e con ID lotto.
            </p>
            <ul className="text-white/60 text-sm space-y-1 list-disc ps-5 text-left">
              <li>Nessun contenuto visibile in anticipo.</li>
              <li>Lotti reali provenienti da stock, resi e smarrimenti.</li>
              <li>Preparazione e pesatura interne, con controlli dedicati.</li>
            </ul>
          </div>

          {/* STEP 2 */}
          <div className="card text-center p-6 space-y-3">
            <div className="text-5xl">🔐</div>
            <h3 className="text-xl font-extrabold">2. Paga in sicurezza</h3>
            <p className="text-white/70">
              Paghi tramite metodi sicuri e ricevi subito la conferma ordine
              via email, con tutti i dettagli.
            </p>
            <ul className="text-white/60 text-sm space-y-1 list-disc ps-5 text-left">
              <li>Pagamenti gestiti da provider affidabili.</li>
              <li>Riepilogo chiaro e trasparente.</li>
              <li>Assistenza dedicata prima e dopo l&apos;ordine.</li>
            </ul>
          </div>

          {/* STEP 3 */}
          <div className="card text-center p-6 space-y-3">
            <div className="text-5xl">🚚</div>
            <h3 className="text-xl font-extrabold">3. Traccia e ricevi</h3>
            <p className="text-white/70">
              Spedizione tracciata in 24–72 ore, di solito. Quando il pacco
              parte, ricevi il codice di tracking.
            </p>
            <ul className="text-white/60 text-sm space-y-1 list-disc ps-5 text-left">
              <li>Tracking attivo fino alla consegna.</li>
              <li>Imballo protetto per il trasporto.</li>
              <li>Consegna in tutta Italia.</li>
            </ul>
          </div>
        </section>

        {/* INFOGRAFICA / PILLAR */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="card p-5 space-y-2">
            <h4 className="font-bold text-emerald-200 text-sm">
              ♻️ Economia circolare
            </h4>
            <p className="text-white/70 text-sm">
              Recuperiamo stock fermi, resi e pacchi smarriti invece di lasciarli
              finire nel ciclo dello smaltimento classico.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <h4 className="font-bold text-emerald-200 text-sm">
              🎯 Valore reale ma misterioso
            </h4>
            <p className="text-white/70 text-sm">
              Ogni box è diversa: il contenuto varia, ma l&apos;esperienza
              resta la stessa, basata sulla sorpresa.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <h4 className="font-bold text-emerald-200 text-sm">
              📦 Zero spoiler
            </h4>
            <p className="text-white/70 text-sm">
              Non apriamo le box per scegliere cosa inserire. Lavoriamo sui lotti,
              non sui singoli pezzi, per mantenere la natura misteriosa del contenuto.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <a
            href={`/${lang}/products`}
            className="btn btn-brand btn-lg"
          >
            Vai ai prodotti
          </a>
        </div>
      </main>

      <Footer lang={lang} />
    </>
  );
}
