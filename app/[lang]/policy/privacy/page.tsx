/* eslint-disable react/no-unescaped-entities */
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
              alt="KiloMystery"
              width={320}
              height={320}
              priority
              className="w-[240px] h-[240px] object-contain drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
            />
          </div>
          <h1 className="section-title text-center text-3xl md:text-4xl font-extrabold">
            <span className="brand-text">Privacy Policy</span>
          </h1>
          <p className="text-center text-white/70 mt-3 text-sm">
            Ultimo aggiornamento:{" "}
            <b>{new Date().toLocaleDateString("it-IT")}</b>
          </p>
          <p className="text-center text-white/60 text-xs mt-1">
            Qui trovi in modo semplice come gestiamo i tuoi dati quando usi
            KiloMystery, acquisti una box o ci contatti. 🔒
          </p>
        </section>

        {/* CONTENUTO */}
        <section className="grid gap-5 md:grid-cols-2">
          {/* TITOLARE & DATI */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Chi tratta i dati</span>
              <span>🧾</span>
            </h2>
            <p className="text-white/70 text-sm">
              Il Titolare del trattamento è <b>KiloMystery</b>. Per qualsiasi
              richiesta sulla privacy puoi scriverci dalla pagina{" "}
              <a href={`/${lang}/contact`} className="btn-link">
                Contatti
              </a>
              .
            </p>

            <h3 className="font-bold mt-3 text-sm">Categorie di dati</h3>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>Dati identificativi (nome, email, indirizzo, telefono).</li>
              <li>Dati di acquisto (prodotti, importi, indirizzi di spedizione).</li>
              <li>
                Dati tecnici (IP, device, log di navigazione, cookie / analytics
                in forma aggregata o anonimizzata, dove possibile).
              </li>
            </ul>
          </article>

          {/* FINALITÀ */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Finalità & basi giuridiche</span>
              <span>⚖️</span>
            </h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>
                Evasione ordini e assistenza clienti —{" "}
                <b>esecuzione del contratto</b>.
              </li>
              <li>
                Adempimenti fiscali / contabili — <b>obbligo di legge</b>.
              </li>
              <li>
                Newsletter e comunicazioni promozionali — <b>consenso</b>{" "}
                (sempre revocabile).
              </li>
              <li>
                Analytics e miglioramento del servizio —{" "}
                <b>legittimo interesse</b> e/o <b>consenso</b>, a seconda dello
                strumento usato.
              </li>
            </ul>

            <h3 className="font-bold mt-3 text-sm">Tempi di conservazione</h3>
            <p className="text-white/70 text-sm">
              Conserviamo i dati solo per il tempo necessario a raggiungere le
              finalità indicate e per rispettare gli obblighi di legge (es.
              fiscali e contabili).
            </p>
          </article>

          {/* DIRITTI */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Diritti dell&apos;utente</span>
              <span>🧑‍⚖️</span>
            </h2>
            <p className="text-white/70 text-sm">
              Puoi chiederci in qualsiasi momento di:
            </p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>accedere ai dati che ti riguardano;</li>
              <li>rettificare o aggiornare i dati;</li>
              <li>chiedere la cancellazione, quando possibile;</li>
              <li>limitare il trattamento o opporti a determinati utilizzi;</li>
              <li>richiedere la portabilità dei dati;</li>
              <li>revocare il consenso dato in precedenza.</li>
            </ul>
            <p className="text-white/70 text-sm">
              Per esercitare questi diritti puoi contattarci da{" "}
              <a href={`/${lang}/contact`} className="btn-link">
                qui
              </a>
              .
            </p>
          </article>

          {/* COOKIE */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>Cookie & tracking</span>
              <span>🍪</span>
            </h2>
            <p className="text-white/70 text-sm">
              Utilizziamo cookie tecnici per far funzionare il sito e, solo
              se acconsenti, cookie di analytics e marketing per capire come
              viene usata la piattaforma e migliorare l&apos;esperienza.
            </p>
            <p className="text-white/70 text-sm">
              Puoi gestire le preferenze dal banner cookie iniziale o dalle
              impostazioni del browser. Alcune funzionalità potrebbero
              limitarsi se disattivi totalmente i cookie.
            </p>
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
