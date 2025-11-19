/* eslint-disable react/no-unescaped-entities */
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
            spacchetti e scopri cosa contiene. ♻️🎁
          </p>
        </section>

        {/* STEP PRINCIPALI */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* STEP 1 */}
          <div className="card text-center p-6 space-y-3">
            <div className="text-5xl">🧪</div>
            <h3 className="text-xl font-extrabold">1. Scegli il peso</h3>
            <p className="text-white/70">
              Seleziona Standard o Premium e scegli tra 1 kg e 10 kg. Ogni box
              è sigillata, tracciata e collegata a un ID lotto.
            </p>
            <ul className="text-white/60 text-sm list-disc ps-5 space-y-1 text-left">
              <li>Nessun spoiler sul contenuto.</li>
              <li>Lotti reali da stock, resi e pacchi smarriti.</li>
              <li>Preparazione e pesatura interna.</li>
            </ul>
          </div>

          {/* STEP 2 */}
          <div className="card text-center p-6 space-y-3">
            <div className="text-5xl">🔐</div>
            <h3 className="text-xl font-extrabold">2. Paga in sicurezza</h3>
            <p className="text-white/70">
              Paghi con metodi sicuri e ricevi subito una mail con il riepilogo
              dell'ordine.
            </p>
            <ul className="text-white/60 text-sm list-disc ps-5 space-y-1 text-left">
              <li>Transazioni sicure.</li>
              <li>Riepilogo ordine chiaro.</li>
              <li>Assistenza reale e veloce.</li>
            </ul>
          </div>

          {/* STEP 3 */}
          <div className="card text-center p-6 space-y-3">
            <div className="text-5xl">🚚</div>
            <h3 className="text-xl font-extrabold">3. Traccia e ricevi</h3>
            <p className="text-white/70">
              Spedizione tracciata in 24–72h, di solito. Ricevi il codice di
              tracking appena il pacco parte.
            </p>
            <ul className="text-white/60 text-sm list-disc ps-5 space-y-1 text-left">
              <li>Tracking attivo fino alla consegna.</li>
              <li>Imballo sicuro.</li>
              <li>Consegna in tutta Italia 🇮🇹.</li>
            </ul>
          </div>
        </section>

        {/* PILASTRI EXTRA */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="card p-5 space-y-2">
            <h4 className="font-bold text-emerald-200 text-sm">
              ♻️ Economia circolare
            </h4>
            <p className="text-white/70 text-sm">
              Recuperiamo stock fermi, resi e pacchi smarriti invece di farli
              finire nello smaltimento classico.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <h4 className="font-bold text-emerald-200 text-sm">
              🎯 Valore misterioso
            </h4>
            <p className="text-white/70 text-sm">
              Ogni box è diversa: l'esperienza è quella della sorpresa e
              dell'unboxing.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <h4 className="font-bold text-emerald-200 text-sm">
              📦 Zero spoiler
            </h4>
            <p className="text-white/70 text-sm">
              Non apriamo e non scegliamo cosa inserire: lavoriamo sui lotti,
              non sui singoli pezzi.
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
