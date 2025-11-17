// app/[lang]/policy/returns/page.tsx
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Politica Resi",
};

export default function ReturnsPage({ params }: { params: { lang: string } }) {
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
            <span className="brand-text">Politica Resi</span>
          </h1>
          <p className="text-center text-white/70 mt-3">
            Ultimo aggiornamento: <b>{new Date().toLocaleDateString("it-IT")}</b>
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">Resi</h2>
            <p className="text-white/70">
              Le box sono vendute come <b>mystery sigillate</b>: il reso non è previsto, salvo
              non conformità o danneggiamento evidente all’arrivo.
            </p>
            <h3 className="font-bold mt-3">In caso di problema</h3>
            <ul className="bullets space-y-1">
              <li>Contattaci entro 48h dalla consegna</li>
              <li>Allega foto chiare di imballo e contenuto</li>
              <li>Indica numero ordine e descrizione del difetto</li>
            </ul>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">Rimborsi</h2>
            <p className="text-white/70">
              Se approvato, il rimborso avviene sullo stesso metodo di pagamento entro 5–10 giorni lavorativi.
            </p>
            <p className="text-white/70">
              Per aprire una segnalazione usa la pagina{" "}
              <a href={`/${lang}/contact`} className="btn-link">Contatti</a>.
            </p>
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}