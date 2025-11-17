// app/[lang]/events/page.tsx
"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

type Event = {
  id: string;
  date: string; // es: "25 novembre 2025"
  city: string;
  location: string;
  title: string;
  description: string;
  extraInfo?: string;
};

const upcomingEvents: Event[] = [
  {
    id: "roma-2025-11-25",
    date: "25 novembre 2025",
    city: "Roma",
    location: "Piazza Alessandro Romano 11",
    title: "KiloMystery Pop-Up – Roma",
    description:
      "Il primo pop-up fisico di KiloMystery: pacchi smarriti al kg, unboxing live e promo dedicate solo all’evento.",
    extraInfo: "Posti limitati: consigliato arrivare in anticipo.",
  },
  {
    id: "milano-2025-12-10",
    date: "10 dicembre 2025",
    city: "Milano",
    location: "Zona Navigli (location in aggiornamento)",
    title: "KiloMystery Pop-Up – Milano",
    description:
      "Mystery box Standard e Premium, ruota della fortuna speciale in store e contenuti esclusivi per social.",
    extraInfo: "Location definitiva e orari saranno aggiornati a breve.",
  },
];

export default function EventsPage({ params }: { params: { lang: string } }) {
  const lang = (params?.lang || "it") as any;

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 mb-16 space-y-8">
        {/* Hero / intro */}
        <header className="space-y-3 text-center max-w-3xl mx-auto">
          <h1 className="section-title text-3xl md:text-4xl">
            Pop-Up &amp; Eventi{" "}
            <span className="brand-text">KiloMystery</span>
          </h1>
          <p className="text-white/70">
            Vieni a toccare con mano le nostre mystery box al kg: unboxing dal
            vivo, offerte esclusive e possibilità di scegliere il tuo lotto
            preferito direttamente in store.
          </p>
        </header>

        {/* Lista eventi */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold">Prossimi eventi</h2>

          {upcomingEvents.length === 0 ? (
            <div className="card text-white/70">
              Al momento non ci sono eventi programmati. Torna a trovarci presto
              o seguici sui social per gli aggiornamenti.
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <article
                  key={event.id}
                  className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold">{event.title}</h3>
                    <p className="text-sm text-white/60">
                      {event.date} • {event.city}
                    </p>
                    <p className="text-sm text-white/70">{event.location}</p>
                    <p className="mt-2 text-sm text-white/80">
                      {event.description}
                    </p>
                    {event.extraInfo && (
                      <p className="mt-1 text-xs text-white/60">
                        {event.extraInfo}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 md:mt-0 md:text-right flex md:flex-col gap-2">
                    <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
                      Pop-Up Store
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* CTA finale */}
        <section className="card space-y-2">
          <h3 className="text-lg font-extrabold">
            Vuoi ospitare un pop-up KiloMystery?
          </h3>
          <p className="text-white/70 text-sm">
            Siamo aperti a collaborazioni con store, eventi, fiere e spazi
            creativi. Se vuoi portare KiloMystery nella tua città, contattaci
            dalla pagina Contatti o via email.
          </p>
          <a
            href={`/${lang}#contattaci`}
            className="btn btn-ghost inline-flex mt-1"
          >
            Vai alla sezione contatti
          </a>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
