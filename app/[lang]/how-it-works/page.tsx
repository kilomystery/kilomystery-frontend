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
              <li>Nessun contenuto visibile</li>
              <li>Valore variabile, sorpresa garantita</li>
              <li>Proviene da stock reali</li>
            </ul>
          </div>

          {/* STEP 2 */}
          <div className="card text-center p-6 space-y-3">
            <div className="text-5xl">🔐</div>
            <h3 className="text-xl font-extrabold">2. Paga in sicurezza</h3>
            <p className="text-white/70">
              Paghi tramite i nostri metodi sicuri (Stripe, PayPal o carta).
              Ricevi subito la conferma dell'ordine via email.
            </p>
            <ul className="text-white/60 text-sm space-y-1 list-disc ps-5 text-left">
              <li>Metodo di pagamento cifrato</li>
              <li>Assistenza disponibile 7 giorni su 7</li>
              <li>Gestione resi trasparente</li>
            </ul>
          </div>

          {/* STEP 3 */}
          <div className="card text-center p-6 space-y-3">
            <div className="text-5xl">🚚</div>
            <h3 className="text-xl font-extrabold">3. Traccia e ricevi</h3>
            <p className="text-white/70">
              Spedizione tracciata entro 24–72h (di solito).  
              Appena parte, ricevi il codice tracking.
            </p>
            <ul className="text-white/60 text-sm space-y-1 list-disc ps-5 text-left">
              <li>Tracking completo</li>
              <li>Imballo protetto</li>
              <li>Consegna in tutta Italia 🇮🇹</li>
            </ul>
          </div>
        </section>

        {/* INFOGRAFICA */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="card p-5 space-y-2">
            <h4 className="font-bold text-emerald-200">♻️ Economia circolare</h4>
            <p className="text-white/70 text-sm">
              Riduciamo gli sprechi recuperando pacchi smarriti e stock che
              altrimenti finirebbero distrutti.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <h4 className="font-bold text-emerald-200">🎯 Valore misto e reale</h4>
            <p className="text-white/70 text-sm">
              Ogni box è diversa, con contenuti casuali provenienti da lotti veri.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <h4 className="font-bold text-emerald-200">📦 Sigillato & tracciato</h4>
            <p className="text-white/70 text-sm">
              Non sappiamo neanche noi cosa contiene ogni singolo pacco.
              È questo il divertimento.
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
