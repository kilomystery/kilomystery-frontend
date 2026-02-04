/* eslint-disable react/no-unescaped-entities */
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";
import { HERO_IMAGE } from "@/lib/staticImages";
import type { Metadata } from "next";
import { getPageMetadata } from "@/src/seo/meta";

type Copy = {
  heroTitle: string;
  heroSubtitle: string;
  lastUpdateLabel: string;

  timesTitle: string;
  timesBullets: string[];
  timesNote: string;

  costsTitle: string;
  costsBulletsBase: string[];
  costsNote: string;

  coverageTitle: string;
  coverageText: string;

  problemsTitle: string;
  problemsIntro: string;
  problemsItems: string[];

  legalTitle: string;
  legalIntro: string;
  legalName: string;
  legalVat: string;
  legalAddress: string;
  legalEmail: string;
  legalPhone: string;
  legalHours: string;

  linksTitle: string;
  linksItems: string[];
};

const SHIPPING_COPY: Record<Lang, Copy> = {
  it: {
    heroTitle: "Spedizioni",
    heroSubtitle:
      "Qui trovi tempi, costi, tracking e informazioni utili per la consegna delle tue box. 🚚",
    lastUpdateLabel: "Ultimo aggiornamento",

    timesTitle: "Tempi & tracking",
    timesBullets: [
      "Preparazione ordine: di solito 24–48 ore lavorative.",
      "Consegna stimata: 48–72 ore lavorative in Europa (salvo zone remote o difficilmente raggiungibili).",
      "Il tracking viene inviato via email non appena il corriere prende in carico il pacco.",
    ],
    timesNote:
      "Le tempistiche sono stime medie. In caso di ritardi del corriere o controlli, ti aiutiamo a monitorare la spedizione.",

    costsTitle: "Costi & note importanti",
    costsBulletsBase: [
      "Il costo di spedizione è calcolato al checkout in base al peso totale dell’ordine e alla destinazione.",
      "Spedizione gratuita per ordini superiori a 100€ (se disponibile per la destinazione selezionata).",
      "Indirizzi incompleti o errati possono causare ritardi, giacenze o riconsegne: ricontrolla sempre i dati prima di confermare l’ordine.",
    ],
    costsNote:
      "Alcune aree remote possono richiedere tempi più lunghi o sovrapprezzi applicati dai corrieri.",

    coverageTitle: "Dove spediamo",
    coverageText:
      "Spediamo in Europa verso indirizzi serviti dai nostri corrieri partner. Se un’area non è servita, lo vedrai direttamente al checkout.",

    problemsTitle: "Problemi di consegna",
    problemsIntro:
      "Se hai un problema con la spedizione, ecco cosa fare:",
    problemsItems: [
      "Controlla il tracking (se disponibile) e verifica lo stato aggiornato del corriere.",
      "Se il pacco risulta in giacenza o non consegnabile, contattaci il prima possibile così possiamo aprire assistenza.",
      "Se il pacco torna al mittente per indirizzo errato o mancato ritiro, potremmo richiedere un nuovo pagamento per la rispedizione.",
    ],

    legalTitle: "Dati aziendali e contatti",
    legalIntro:
      "Trasparenza prima di tutto: qui trovi i dati ufficiali del venditore e i canali di contatto.",
    legalName: "Ragione sociale: KILO MYSTERY SRLS",
    legalVat: "Partita IVA: 02794550745",
    legalAddress:
      "Sede legale e operativa: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italia",
    legalEmail: "Email assistenza: sales@kilomystery.com",
    legalPhone: "Telefono: +39 353 492 3350",
    legalHours: "Orari assistenza: Lunedì–Venerdì, 09:00–18:00",

    linksTitle: "Link utili",
    linksItems: ["Politica Resi", "Termini e condizioni", "Contatti"],
  },

  en: {
    heroTitle: "Shipping",
    heroSubtitle:
      "Here you’ll find delivery times, costs, tracking and helpful shipping information. 🚚",
    lastUpdateLabel: "Last update",

    timesTitle: "Timing & tracking",
    timesBullets: [
      "Order preparation: usually 24–48 business hours.",
      "Estimated delivery: 48–72 business hours across Europe (except remote or hard-to-reach areas).",
      "Tracking is emailed as soon as the courier picks up the parcel.",
    ],
    timesNote:
      "Times are average estimates. If couriers are delayed or additional checks occur, we’ll help you monitor the shipment.",

    costsTitle: "Costs & important notes",
    costsBulletsBase: [
      "Shipping cost is calculated at checkout based on the total order weight and destination.",
      "Free shipping on orders over €100 (if available for the selected destination).",
      "Incomplete or incorrect addresses may cause delays, holding at depot, or re-deliveries: please double-check your details before confirming the order.",
    ],
    costsNote:
      "Some remote areas may require longer delivery times or additional courier surcharges.",

    coverageTitle: "Where we ship",
    coverageText:
      "We ship across Europe to addresses served by our partner couriers. If an area is not covered, it will be shown at checkout.",

    problemsTitle: "Delivery issues",
    problemsIntro: "If you have a shipping issue, here’s what to do:",
    problemsItems: [
      "Check the tracking (if available) and the carrier status.",
      "If the parcel is held at depot or marked undeliverable, contact us as soon as possible so we can open a support case.",
      "If the parcel is returned to sender due to an incorrect address or failed pickup, we may require a new shipping payment for re-delivery.",
    ],

    legalTitle: "Company details & contacts",
    legalIntro:
      "Transparency first: here are the official seller details and contact channels.",
    legalName: "Legal name: KILO MYSTERY SRLS",
    legalVat: "VAT number: 02794550745",
    legalAddress:
      "Registered and operational address: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italy",
    legalEmail: "Support email: sales@kilomystery.com",
    legalPhone: "Phone: +39 353 492 3350",
    legalHours: "Support hours: Monday–Friday, 9:00 AM–6:00 PM",

    linksTitle: "Useful links",
    linksItems: ["Return Policy", "Terms & Conditions", "Contact"],
  },

  es: {
    heroTitle: "Envíos",
    heroSubtitle:
      "Aquí encontrarás plazos, costes, seguimiento y información útil para la entrega. 🚚",
    lastUpdateLabel: "Última actualización",

    timesTitle: "Plazos y tracking",
    timesBullets: [
      "Preparación del pedido: normalmente 24–48 horas laborables.",
      "Entrega estimada: 48–72 horas laborables en Europa (salvo zonas remotas o de difícil acceso).",
      "El tracking se envía por email en cuanto el transportista recoge el paquete.",
    ],
    timesNote:
      "Los plazos son estimaciones medias. Si hay retrasos del transportista o controles adicionales, te ayudaremos a seguir el envío.",

    costsTitle: "Costes y notas importantes",
    costsBulletsBase: [
      "El coste de envío se calcula en el checkout según el peso total del pedido y el destino.",
      "Envío gratis en pedidos superiores a 100€ (si está disponible para el destino seleccionado).",
      "Direcciones incompletas o erróneas pueden causar retrasos o reentregas: revisa tus datos antes de confirmar el pedido.",
    ],
    costsNote:
      "Algunas zonas remotas pueden requerir más tiempo de entrega o recargos del transportista.",

    coverageTitle: "Dónde enviamos",
    coverageText:
      "Enviamos en Europa a direcciones cubiertas por nuestros transportistas asociados. Si una zona no está cubierta, se mostrará en el checkout.",

    problemsTitle: "Problemas de entrega",
    problemsIntro:
      "Si tienes un problema con el envío, haz lo siguiente:",
    problemsItems: [
      "Revisa el tracking (si está disponible) y el estado del transportista.",
      "Si el paquete está retenido o figura como no entregable, contáctanos lo antes posible para abrir un caso.",
      "Si el paquete vuelve al remitente por dirección incorrecta o falta de recogida, puede requerirse un nuevo pago de envío para reenviarlo.",
    ],

    legalTitle: "Datos de la empresa y contacto",
    legalIntro:
      "Transparencia ante todo: aquí tienes los datos oficiales del vendedor y los canales de contacto.",
    legalName: "Razón social: KILO MYSTERY SRLS",
    legalVat: "Número de IVA: 02794550745",
    legalAddress:
      "Dirección legal y operativa: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italia",
    legalEmail: "Email de soporte: sales@kilomystery.com",
    legalPhone: "Teléfono: +39 353 492 3350",
    legalHours: "Horario de atención: Lunes–Viernes, 09:00–18:00",

    linksTitle: "Enlaces útiles",
    linksItems: ["Política de devoluciones", "Términos y condiciones", "Contacto"],
  },

  fr: {
    heroTitle: "Livraisons",
    heroSubtitle:
      "Ici, tu trouveras les délais, les coûts, le suivi et des infos utiles pour la livraison. 🚚",
    lastUpdateLabel: "Dernière mise à jour",

    timesTitle: "Délais & suivi",
    timesBullets: [
      "Préparation de la commande : en général 24–48 heures ouvrées.",
      "Livraison estimée : 48–72 heures ouvrées en Europe (hors zones éloignées ou difficiles d’accès).",
      "Le suivi est envoyé par email dès que le transporteur prend en charge le colis.",
    ],
    timesNote:
      "Les délais sont des estimations moyennes. En cas de retard du transporteur ou de contrôles, nous t’aidons à suivre l’envoi.",

    costsTitle: "Coûts & notes importantes",
    costsBulletsBase: [
      "Les frais de livraison sont calculés au checkout selon le poids total et la destination.",
      "Livraison gratuite dès 100€ d’achat (si disponible pour la destination choisie).",
      "Une adresse incomplète/erronée peut entraîner des retards ou de nouvelles tentatives : vérifie bien tes informations avant de valider.",
    ],
    costsNote:
      "Certaines zones éloignées peuvent nécessiter plus de temps de livraison ou des surcoûts imposés par les transporteurs.",

    coverageTitle: "Où livrons-nous",
    coverageText:
      "Nous livrons en Europe vers les adresses desservies par nos transporteurs partenaires. Si une zone n’est pas couverte, cela apparaîtra au checkout.",

    problemsTitle: "Problèmes de livraison",
    problemsIntro:
      "En cas de problème de livraison, voici quoi faire :",
    problemsItems: [
      "Vérifie le suivi (si disponible) et l’état du transporteur.",
      "Si le colis est en instance ou indiqué comme non livrable, contacte-nous au plus vite pour ouvrir une assistance.",
      "Si le colis est retourné à l’expéditeur à cause d’une adresse incorrecte ou d’un non-retrait, un nouveau paiement des frais de livraison peut être demandé pour le renvoi.",
    ],

    legalTitle: "Informations légales et contacts",
    legalIntro:
      "Transparence avant tout : voici les informations officielles du vendeur et les moyens de contact.",
    legalName: "Raison sociale : KILO MYSTERY SRLS",
    legalVat: "Numéro de TVA : 02794550745",
    legalAddress:
      "Adresse légale et opérationnelle : P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italie",
    legalEmail: "Email du support : sales@kilomystery.com",
    legalPhone: "Téléphone : +39 353 492 3350",
    legalHours: "Horaires : Lundi–Vendredi, 09h00–18h00",

    linksTitle: "Liens utiles",
    linksItems: ["Politique de retours", "Termes et Conditions", "Contact"],
  },

  de: {
    heroTitle: "Versand",
    heroSubtitle:
      "Hier findest du Lieferzeiten, Kosten, Tracking und nützliche Versandinfos. 🚚",
    lastUpdateLabel: "Letzte Aktualisierung",

    timesTitle: "Lieferzeiten & Tracking",
    timesBullets: [
      "Bestellvorbereitung: in der Regel 24–48 Werktage (je nach Aufkommen).",
      "Voraussichtliche Lieferung: 48–72 Werktage in Europa (ausgenommen abgelegene oder schwer erreichbare Regionen).",
      "Tracking wird per E-Mail gesendet, sobald der Versanddienstleister das Paket übernommen hat.",
    ],
    timesNote:
      "Die angegebenen Zeiten sind Durchschnittswerte. Bei Verzögerungen durch Versanddienstleister oder Kontrollen helfen wir dir beim Monitoring.",

    costsTitle: "Kosten & wichtige Hinweise",
    costsBulletsBase: [
      "Versandkosten werden im Checkout anhand des Gesamtgewichts und der Destination berechnet.",
      "Kostenloser Versand ab 100€ Bestellwert (sofern für die gewählte Destination verfügbar).",
      "Unvollständige oder falsche Adressen können zu Verzögerungen oder erneuten Zustellversuchen führen: bitte prüfe deine Angaben vor Bestellabschluss.",
    ],
    costsNote:
      "In einigen abgelegenen Gebieten kann die Lieferung länger dauern oder zusätzliche Zuschläge der Versanddienstleister anfallen.",

    coverageTitle: "Wohin wir versenden",
    coverageText:
      "Wir versenden in Europa an Adressen, die von unseren Partner-Versanddienstleistern bedient werden. Nicht verfügbare Regionen werden im Checkout angezeigt.",

    problemsTitle: "Lieferprobleme",
    problemsIntro: "Wenn es ein Problem mit der Lieferung gibt:",
    problemsItems: [
      "Prüfe das Tracking (falls verfügbar) und den Status beim Versanddienstleister.",
      "Wenn das Paket im Depot liegt oder als nicht zustellbar markiert ist, kontaktiere uns so schnell wie möglich, damit wir ein Support-Ticket eröffnen können.",
      "Wenn das Paket wegen falscher Adresse oder Nichtabholung an uns zurückgeht, kann für einen erneuten Versand eine neue Versandzahlung erforderlich sein.",
    ],

    legalTitle: "Unternehmensdaten und Kontakt",
    legalIntro:
      "Transparenz steht an erster Stelle: Hier findest du die offiziellen Unternehmensdaten und Kontaktmöglichkeiten.",
    legalName: "Firmenname: KILO MYSTERY SRLS",
    legalVat: "USt-IdNr.: 02794550745",
    legalAddress:
      "Rechts- und Geschäftsadresse: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italien",
    legalEmail: "Support-E-Mail: sales@kilomystery.com",
    legalPhone: "Telefon: +39 353 492 3350",
    legalHours: "Supportzeiten: Montag–Freitag, 09:00–18:00",

    linksTitle: "Nützliche Links",
    linksItems: ["Rückgaberichtlinie", "AGB", "Kontakt"],
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

  const returnsHref = `/${lang}/returns`;
  const termsHref = `/${lang}/terms`;
  const contactHref = `/${lang}/contact`;

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-10">
        {/* HERO */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
          <div className="mx-auto mb-6 grid place-items-center">
            <picture className="w-[240px] h-[240px] object-contain drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]">
              <source srcSet={HERO_IMAGE.webp} type="image/webp" />
              <source srcSet={HERO_IMAGE.png} type="image/png" />
              <img
                src={HERO_IMAGE.png}
                alt={HERO_IMAGE.alt}
                width={320}
                height={320}
                className="w-full h-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </picture>
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
              {t.costsBulletsBase.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
              <li>
                {lang === "it" ? (
                  <>
                    In caso di problemi di consegna, contattaci dalla pagina{" "}
                    <a href={contactHref} className="btn-link">
                      Contatti
                    </a>
                    .
                  </>
                ) : lang === "en" ? (
                  <>
                    If you have delivery issues, reach us via the{" "}
                    <a href={contactHref} className="btn-link">
                      Contact
                    </a>{" "}
                    page.
                  </>
                ) : lang === "es" ? (
                  <>
                    Si tienes problemas con la entrega, contáctanos desde{" "}
                    <a href={contactHref} className="btn-link">
                      Contacto
                    </a>
                    .
                  </>
                ) : lang === "fr" ? (
                  <>
                    En cas de problème de livraison, écris-nous via{" "}
                    <a href={contactHref} className="btn-link">
                      Contact
                    </a>
                    .
                  </>
                ) : (
                  <>
                    Bei Lieferproblemen kontaktiere uns über{" "}
                    <a href={contactHref} className="btn-link">
                      Kontakt
                    </a>
                    .
                  </>
                )}
              </li>
            </ul>
            <p className="text-white/60 text-xs">{t.costsNote}</p>
          </article>
        </section>

        {/* COVERAGE */}
        <section className="card space-y-3">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <span>{t.coverageTitle}</span>
            <span>🗺️</span>
          </h2>
          <p className="text-white/70 text-sm">{t.coverageText}</p>
        </section>

        {/* PROBLEMS */}
        <section className="card space-y-3">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <span>{t.problemsTitle}</span>
            <span>🧩</span>
          </h2>
          <p className="text-white/70 text-sm">{t.problemsIntro}</p>
          <ul className="bullets space-y-1 text-sm text-white/70">
            {t.problemsItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        {/* LINKS */}
        <section className="card space-y-3">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <span>{t.linksTitle}</span>
            <span>🔗</span>
          </h2>
          <ul className="bullets space-y-1 text-sm text-white/70">
            <li>
              <a href={returnsHref} className="btn-link">
                {t.linksItems[0]}
              </a>
            </li>
            <li>
              <a href={termsHref} className="btn-link">
                {t.linksItems[1]}
              </a>
            </li>
            <li>
              <a href={contactHref} className="btn-link">
                {t.linksItems[2]}
              </a>
            </li>
          </ul>
        </section>

        {/* COMPANY DETAILS */}
        <section className="card space-y-2">
          <h2 className="text-xl font-extrabold">{t.legalTitle}</h2>
          <p className="text-white/70 text-sm">{t.legalIntro}</p>
          <ul className="text-sm space-y-1 text-white/70">
            <li>{t.legalName}</li>
            <li>{t.legalVat}</li>
            <li>{t.legalAddress}</li>
            <li>{t.legalEmail}</li>
            <li>{t.legalPhone}</li>
            <li>{t.legalHours}</li>
          </ul>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
