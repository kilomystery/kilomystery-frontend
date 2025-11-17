// app/[lang]/policy/shipping/page.tsx
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
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
          <div className="mx-auto mb-6 grid place-items-center">
            <Image src="/hero/hero.svg" alt="KiloMistery" width={320} height={320}
              className="w-[240px] h-[240px] object-contain" />
          </div>
          <h1 className="section-title text-center text-4xl font-extrabold">
            <span className="brand-text">Spedizioni</span>
          </h1>
          <p className="text-center text-white/70 mt-3">
            Ultimo aggiornamento: <b>{new Date().toLocaleDateString("it-IT")}</b>
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">Tempi & tracking</h2>
            <ul className="bullets space-y-1">
              <li>Preparazione: 24–48h lavorative</li>
              <li>Consegna stimata: 24–72h in Italia</li>
              <li>Tracking inviato via email quando il pacco parte</li>
            </ul>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">Costi & note</h2>
            <ul className="bullets space-y-1">
              <li>Costo calcolato al checkout in base al peso totale</li>
              <li>Indirizzo incompleto può causare ritardi</li>
              <li>Per assistenza usa la pagina <a href={`/${lang}/contact`} className="btn-link">Contatti</a></li>
            </ul>
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}