/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";
import type { Metadata } from "next";
import { getPageMetadata } from "@/src/seo/meta";
;

type Copy = {
  heroTitle: string;
  heroSubtitle: string;
  lastUpdateLabel: string;
  timesTitle: string;
  costsTitle: string;
  timesBullets: string[];
  timesNote: string;
  costsBulletsBase: string[];
  costsNote: string;
};

const SHIPPING_COPY: Record<Lang, Copy> = {
  it: {
    heroTitle: "Spedizioni",
    heroSubtitle:
      "Qui ti spieghiamo tempi, costi e tracking delle tue box. 🚚",
    lastUpdateLabel: "Ultimo aggiornamento",
    timesTitle: "Tempi & tracking",
    costsTitle: "Costi & note importanti",
    timesBullets: [
      "Preparazione ordine: di solito 24–48 ore lavorative.",
      "Consegna stimata: 48–72 ore lavorative in Europa (salvo zone remote o difficilmente raggiungibili).",
      "Il codice di tracking viene inviato via email non appena il corriere prende in carico il pacco.",
    ],
    timesNote:
      "Le tempistiche indicate sono stime medie: eventuali ritardi dovuti ai corrieri o a terze parti non dipendono da noi, ma ti aiutiamo a monitorare la spedizione.",
    costsBulletsBase: [
      "Il costo di spedizione è calcolato al checkout in base al peso totale dell'ordine.",
      "Spedizione gratuita per ordini superiori a 100€.",
      "Indirizzi incompleti o errati possono causare ritardi o riconsegne: ti chiediamo di ricontrollare sempre i dati.",
    ],
    costsNote:
      "Spediamo solo a indirizzi serviti dai nostri corrieri. Alcune aree remote possono richiedere tempi leggermente più lunghi.",
  },
  en: {
    heroTitle: "Shipping",
    heroSubtitle:
      "Here you’ll find timing, costs and tracking info for your boxes. 🚚",
    lastUpdateLabel: "Last update",
    timesTitle: "Timing & tracking",
    costsTitle: "Costs & important notes",
    timesBullets: [
      "Order preparation: usually 24–48 business hours.",
      "Estimated delivery: 48–72 business hours across Europe (except remote or hard-to-reach areas).",
      "The tracking code is sent via email as soon as the courier picks up the parcel.",
    ],
    timesNote:
      "The indicated timings are average estimates: any delays caused by couriers or third parties are outside our control, but we’ll help you monitor the shipment.",
    costsBulletsBase: [
      "Shipping cost is calculated at checkout based on the total order weight.",
      "Free shipping on orders over €100.",
      "Incomplete or incorrect addresses may cause delays or re-deliveries: please double-check your details.",
    ],
    costsNote:
      "We only ship to addresses served by our partner couriers. Some remote areas may require slightly longer delivery times.",
  },
  es: {
    heroTitle: "Envíos",
    heroSubtitle:
      "Aquí te explicamos plazos, costes y tracking de tus cajas. 🚚",
    lastUpdateLabel: "Última actualización",
    timesTitle: "Plazos y tracking",
    costsTitle: "Costes y notas importantes",
    timesBullets: [
      "Preparación del pedido: normalmente 24–48 horas laborables.",
      "Entrega estimada: 48–72 horas laborables en Europa (salvo zonas remotas o de difícil acceso).",
      "El código de seguimiento se envía por email en cuanto el transportista recoge el paquete.",
    ],
    timesNote:
      "Los plazos indicados son estimaciones medias: posibles retrasos debidos a transportistas o terceros no dependen de nosotros, pero te ayudamos a seguir el envío.",
    costsBulletsBase: [
      "El coste de envío se calcula en el checkout según el peso total del pedido.",
      "Envío gratis en pedidos superiores a 100€.",
      "Direcciones incompletas o erróneas pueden causar retrasos o reenvíos: te pedimos revisar siempre los datos.",
    ],
    costsNote:
      "Enviamos solo a direcciones cubiertas por nuestros transportistas. Algunas zonas remotas pueden requerir plazos ligeramente superiores.",
  },
  fr: {
    heroTitle: "Livraisons",
    heroSubtitle:
      "Nous t’expliquons ici les délais, les coûts et le suivi de tes box. 🚚",
    lastUpdateLabel: "Dernière mise à jour",
    timesTitle: "Délais & suivi",
    costsTitle: "Coûts & notes importantes",
    timesBullets: [
      "Préparation de la commande : en général 24–48 heures ouvrées.",
      "Livraison estimée : 48–72 heures ouvrées dans toute l’Europe (hors zones très éloignées ou difficiles d’accès).",
      "Le code de suivi est envoyé par email dès que le transporteur prend en charge le colis.",
    ],
    timesNote:
      "Les délais indiqués sont des estimations moyennes : d’éventuels retards dus aux transporteurs ou à des tiers ne dépendent pas de nous, mais nous t’aidons à suivre la livraison.",
    costsBulletsBase: [
      "Les frais de livraison sont calculés au checkout en fonction du poids total de la commande.",
      "Livraison gratuite dès 100€ d’achat.",
      "Des adresses incomplètes ou erronées peuvent entraîner des retards ou de nouvelles tentatives de livraison : pense à bien vérifier tes données.",
    ],
    costsNote:
      "Nous livrons uniquement aux adresses desservies par nos transporteurs. Certaines zones éloignées peuvent nécessiter des délais légèrement plus longs.",
  },
  de: {
    heroTitle: "Versand",
    heroSubtitle:
      "Hier erklären wir dir Lieferzeiten, Kosten und Tracking deiner Boxen. 🚚",
    lastUpdateLabel: "Letzte Aktualisierung",
    timesTitle: "Lieferzeiten & Tracking",
    costsTitle: "Kosten & wichtige Hinweise",
    timesBullets: [
      "Bestellvorbereitung: in der Regel 24–48 Werktstunden.",
      "Voraussichtliche Lieferung: 48–72 Werktstunden in ganz Europa (ausgenommen entlegene oder schwer erreichbare Regionen).",
      "Der Tracking-Code wird dir per E-Mail zugesendet, sobald der Kurier das Paket übernommen hat.",
    ],
    timesNote:
      "Die angegebenen Zeiten sind Durchschnittswerte: mögliche Verzögerungen durch Kuriere oder Dritte liegen außerhalb unseres Einflusses, aber wir helfen dir, die Sendung zu verfolgen.",
    costsBulletsBase: [
      "Die Versandkosten werden im Checkout anhand des Gesamtgewichts der Bestellung berechnet.",
      "Kostenloser Versand ab 100€ Bestellwert.",
      "Unvollständige oder fehlerhafte Adressen können zu Verzögerungen oder erneuten Zustellversuchen führen: bitte prüfe deine Angaben sorgfältig.",
    ],
    costsNote:
      "Wir versenden nur an Adressen, die von unseren Versanddienstleistern bedient werden. In einigen abgelegenen Gebieten kann die Lieferung etwas länger dauern.",
  },
};

const DATE_LOCALE: Record<Lang, string> = {
  it: "it-IT",
  en: "en-GB",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const lang: Lang = normalizeLang(resolved?.lang);
  return getPageMetadata(lang, "shipping");
}

export default async function ShippingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolved = await params;
  const lang: Lang = normalizeLang(resolved?.lang);
  const t = SHIPPING_COPY[lang] ?? SHIPPING_COPY.it;
  const today = new Date().toLocaleDateString(DATE_LOCALE[lang]);

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
              className="w-[240px] h-[240px] object-contain drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
            />
          </div>
          <h1 className="section-title text-center text-3xl md:text-4xl font-extrabold">
            <span className="brand-text">{t.heroTitle}</span>
          </h1>
          <p className="text-center text-white/70 mt-3 text-sm">
            {t.lastUpdateLabel}: <b>{today}</b>
          </p>
          <p className="text-center text-white/60 text-xs mt-1">
            {t.heroSubtitle}
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {/* TEMPI & TRACKING */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.timesTitle}</span>
              <span>⏱️</span>
            </h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.timesBullets.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <p className="text-white/60 text-xs">{t.timesNote}</p>
          </article>

          {/* COSTI & NOTE */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.costsTitle}</span>
              <span>💶</span>
            </h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {/* prime righe dai copy */}
              {t.costsBulletsBase.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
              {/* riga con link localizzata */}
              <li>
                {lang === "it" ? (
                  <>
                    In caso di problemi di consegna, puoi contattarci dalla
                    pagina{" "}
                    <a href={`/${lang}/contact`} className="btn-link">
                      Contatti
                    </a>
                    .
                  </>
                ) : lang === "en" ? (
                  <>
                    If you have any delivery issues, you can reach us via the{" "}
                    <a href={`/${lang}/contact`} className="btn-link">
                      Contact
                    </a>{" "}
                    page.
                  </>
                ) : lang === "es" ? (
                  <>
                    En caso de problemas con la entrega, puedes escribirnos
                    desde la página de{" "}
                    <a href={`/${lang}/contact`} className="btn-link">
                      Contacto
                    </a>
                    .
                  </>
                ) : lang === "fr" ? (
                  <>
                    En cas de problème de livraison, tu peux nous écrire via la
                    page{" "}
                    <a href={`/${lang}/contact`} className="btn-link">
                      Contact
                    </a>
                    .
                  </>
                ) : (
                  <>
                    Bei Lieferproblemen kannst du uns über die Seite{" "}
                    <a href={`/${lang}/contact`} className="btn-link">
                      Kontakt
                    </a>{" "}
                    erreichen.
                  </>
                )}
              </li>
            </ul>
            <p className="text-white/60 text-xs">{t.costsNote}</p>
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
