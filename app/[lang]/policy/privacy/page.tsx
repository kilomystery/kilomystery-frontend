// app/[lang]/policy/privacy/page.tsx
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Privacy",
};

export default function PrivacyPage({ params }: { params: { lang: string } }) {
  const lang = (params?.lang || "it") as any;

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-10">
        {/* HERO */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
          <div className="mx-auto mb-6 grid place-items-center">
            <Image
              src="/hero/hero.svg"
              alt="KiloMistery"
              width={320}
              height={320}
              priority
              className="w-[240px] h-[240px] object-contain drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
            />
          </div>
          <h1 className="section-title text-center text-4xl font-extrabold">
            <span className="brand-text">Privacy Policy</span>
          </h1>
          <p className="text-center text-white/70 mt-3">
            Ultimo aggiornamento: <b>{new Date().toLocaleDateString("it-IT")}</b>
          </p>
        </section>

        {/* CONTENUTO */}
        <section className="grid gap-5 md:grid-cols-2">
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">Chi tratta i dati</h2>
            <p className="text-white/70">
              Il Titolare del trattamento è <b>KiloMistery</b>. Per qualsiasi richiesta
              puoi scriverci dalla pagina{" "}
              <a href={`/${lang}/contact`} className="btn-link">Contatti</a>.
            </p>
            <h3 className="font-bold mt-3">Categorie di dati</h3>
            <ul className="bullets space-y-1">
              <li>Dati identificativi (nome, email, indirizzo, telefono)</li>
              <li>Dati di acquisto (prodotti, importi, indirizzi di spedizione)</li>
              <li>Dati tecnici (IP, device, cookie/analytics anonimizzati)</li>
            </ul>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">Finalità & basi giuridiche</h2>
            <ul className="bullets space-y-1">
              <li>Evasione ordini e assistenza clienti — esecuzione del contratto</li>
              <li>Adempimenti fiscali/legali — obbligo legale</li>
              <li>Newsletter e promozioni — consenso (revocabile)</li>
              <li>Analytics e miglioramento servizio — legittimo interesse / consenso</li>
            </ul>
            <h3 className="font-bold mt-3">Conservazione</h3>
            <p className="text-white/70">
              Conserviamo i dati per il tempo necessario a soddisfare le finalità
              indicate e adempiere agli obblighi di legge.
            </p>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">Diritti dell’utente</h2>
            <p className="text-white/70">
              Puoi esercitare i diritti di accesso, rettifica, cancellazione,
              limitazione, portabilità e opposizione, oltre a revocare il consenso.
              Contattaci da{" "}
              <a href={`/${lang}/contact`} className="btn-link">qui</a>.
            </p>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">Cookie</h2>
            <p className="text-white/70">
              Usiamo cookie tecnici e, previo consenso, cookie analytics/marketing.
              Puoi gestire le preferenze dal banner cookie o dalle impostazioni del browser.
            </p>
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}