// app/[lang]/how-it-works/page.tsx
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function HowItWorks({ params }: { params: { lang: string } }) {
  const lang = (params?.lang || 'it') as any;

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-10">
        <header className="text-center space-y-2">
          <div className="section-kicker">How it works</div>
          <h1 className="section-title text-4xl md:text-5xl brand-text">Come funziona KiloMistery</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Scegli il peso, aggiungi al carrello, ricevi la tua mystery box. Trasparente, tracciabile e divertente.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="card">
            <div className="step-icon">🧪</div>
            <h3 className="step-title">1. Scegli</h3>
            <p className="text-white/70">Standard o Premium da 1 a 10 kg.</p>
          </div>
          <div className="card">
            <div className="step-icon">🔐</div>
            <h3 className="step-title">2. Paga</h3>
            <p className="text-white/70">Pagamento sicuro, riepilogo via email.</p>
          </div>
          <div className="card">
            <div className="step-icon">🚚</div>
            <h3 className="step-title">3. Traccia</h3>
            <p className="text-white/70">Spedizione tracciata in 24–72h (di solito).</p>
          </div>
        </div>

        <div className="text-center">
          <a href={`/${lang}#prodotti`} className="btn btn-brand btn-lg">Vai ai prodotti</a>
        </div>
      </main>

      <Footer lang={lang} />
    </>
  );
}