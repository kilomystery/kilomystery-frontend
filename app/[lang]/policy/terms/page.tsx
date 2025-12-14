/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

export const metadata = {
  title: "Termini e Condizioni",
};

type Copy = {
  heroTitle: string;
  heroSubtitle: string;
  lastUpdateLabel: string;
  objectTitle: string;
  objectText: string;
  purchaseTitle: string;
  purchaseItems: string[];
  liabilityTitle: string;
  liabilityP1: string;
  liabilityP2: string;
  lawTitle: string;
  lawP1: string;
};

const TERMS_COPY: Record<Lang, Copy> = {
  it: {
    heroTitle: "Termini e condizioni",
    heroSubtitle:
      "Un riepilogo chiaro delle regole con cui usi il sito e acquisti le nostre mystery box. 📜",
    lastUpdateLabel: "Ultimo aggiornamento",
    objectTitle: "Oggetto",
    objectText:
      "Le presenti condizioni disciplinano l'accesso e l'uso del sito KiloMystery e la vendita di prodotti sotto forma di mystery box. Acquistando una box accetti che il contenuto sia non visibile in anticipo e non selezionabile nel dettaglio.",
    purchaseTitle: "Acquisto & prezzi",
    purchaseItems: [
      "I prezzi sono indicati in EUR, IVA inclusa salvo diversa indicazione.",
      "Il contenuto delle box è di tipo “mystery”: non è possibile scegliere i singoli articoli.",
      "Ricevi una conferma ordine via email con riepilogo e dettaglio dell'acquisto.",
      "I pagamenti sono gestiti tramite provider terzi affidabili; noi non salviamo i dati completi della tua carta.",
    ],
    liabilityTitle: "Limitazione di responsabilità",
    liabilityP1:
      "Il sito e i servizi sono forniti “as is”. Ci impegniamo a mantenere la piattaforma funzionante e aggiornata, ma non possiamo garantire l'assenza totale di interruzioni, errori tecnici o ritardi dovuti a terze parti (es. provider, corrieri, gateway di pagamento).",
    liabilityP2:
      "In nessun caso saremo responsabili per danni indiretti o consequenziali derivanti dall'uso del sito o da ritardi non direttamente imputabili a noi.",
    lawTitle: "Legge applicabile & foro competente",
    lawP1:
      "Le presenti condizioni sono regolate dalla legge italiana. Quando applicabile, è competente il foro del consumatore; negli altri casi, il foro competente è quello individuato secondo la normativa vigente. Per qualsiasi dubbio sui termini puoi contattarci dalla pagina Contatti.",
  },
  en: {
    heroTitle: "Terms & Conditions",
    heroSubtitle:
      "A clear summary of the rules for using the site and purchasing our mystery boxes. 📜",
    lastUpdateLabel: "Last update",
    objectTitle: "Scope",
    objectText:
      "These terms govern access to and use of the KiloMystery website and the sale of products in the form of mystery boxes. By purchasing a box, you accept that its content is not visible in advance and cannot be selected in detail.",
    purchaseTitle: "Purchase & prices",
    purchaseItems: [
      "Prices are shown in EUR, VAT included unless stated otherwise.",
      "The content of the boxes is of a “mystery” nature: it is not possible to choose individual items.",
      "You receive an order confirmation by email with a summary and details of your purchase.",
      "Payments are handled by trusted third-party providers; we do not store full card details.",
    ],
    liabilityTitle: "Limitation of liability",
    liabilityP1:
      "The site and services are provided “as is”. We strive to keep the platform running and up to date, but we cannot guarantee the complete absence of interruptions, technical errors or delays caused by third parties (e.g. providers, couriers, payment gateways).",
    liabilityP2:
      "In no event shall we be liable for indirect or consequential damages arising from the use of the site or from delays not directly attributable to us.",
    lawTitle: "Governing law & jurisdiction",
    lawP1:
      "These terms are governed by Italian law. Where consumer regulations apply, the competent court is that of the consumer; in other cases, jurisdiction is determined according to the applicable law. For any questions about the terms you can contact us via the Contact page.",
  },
  es: {
    heroTitle: "Términos y Condiciones",
    heroSubtitle:
      "Un resumen claro de las normas para usar el sitio y comprar nuestras mystery box. 📜",
    lastUpdateLabel: "Última actualización",
    objectTitle: "Objeto",
    objectText:
      "Las presentes condiciones regulan el acceso y uso del sitio KiloMystery y la venta de productos en forma de mystery box. Al comprar una caja aceptas que su contenido no se muestre por adelantado y no sea seleccionable en detalle.",
    purchaseTitle: "Compra y precios",
    purchaseItems: [
      "Los precios se indican en EUR, IVA incluida salvo que se indique lo contrario.",
      "El contenido de las cajas es de tipo “mystery”: no es posible elegir los artículos individuales.",
      "Recibirás una confirmación de pedido por email con el resumen y el detalle de tu compra.",
      "Los pagos son gestionados por proveedores externos de confianza; nosotros no guardamos los datos completos de tu tarjeta.",
    ],
    liabilityTitle: "Limitación de responsabilidad",
    liabilityP1:
      "El sitio y los servicios se ofrecen “tal cual”. Nos esforzamos por mantener la plataforma operativa y actualizada, pero no podemos garantizar la ausencia total de interrupciones, errores técnicos o retrasos debidos a terceros (por ejemplo proveedores, transportistas o pasarelas de pago).",
    liabilityP2:
      "En ningún caso seremos responsables de daños indirectos o consecuentes derivados del uso del sitio o de retrasos no directamente atribuibles a nosotros.",
    lawTitle: "Ley aplicable y fuero competente",
    lawP1:
      "Las presentes condiciones se rigen por la ley italiana. Cuando se aplica la normativa de consumidores, el fuero competente es el del consumidor; en los demás casos, el fuero se determina conforme a la legislación vigente. Para cualquier duda sobre los términos puedes contactarnos desde la página de Contacto.",
  },
  fr: {
    heroTitle: "Termes et Conditions",
    heroSubtitle:
      "Un récapitulatif clair des règles d’utilisation du site et d’achat de nos mystery box. 📜",
    lastUpdateLabel: "Dernière mise à jour",
    objectTitle: "Objet",
    objectText:
      "Les présentes conditions régissent l’accès et l’utilisation du site KiloMystery ainsi que la vente de produits sous forme de mystery box. En achetant une box, tu acceptes que son contenu ne soit pas visible à l’avance et ne puisse pas être choisi dans le détail.",
    purchaseTitle: "Achat & prix",
    purchaseItems: [
      "Les prix sont indiqués en EUR, TVA incluse sauf mention contraire.",
      "Le contenu des box est de nature « mystery » : il n’est pas possible de choisir les articles individuellement.",
      "Tu reçois une confirmation de commande par email avec le récapitulatif et le détail de ton achat.",
      "Les paiements sont gérés par des prestataires tiers de confiance ; nous ne stockons pas l’intégralité des données de ta carte.",
    ],
    liabilityTitle: "Limitation de responsabilité",
    liabilityP1:
      "Le site et les services sont fournis « en l’état ». Nous faisons notre possible pour maintenir la plateforme fonctionnelle et à jour, mais nous ne pouvons pas garantir l’absence totale d’interruptions, d’erreurs techniques ou de retards dus à des tiers (par exemple prestataires, transporteurs, passerelles de paiement).",
    liabilityP2:
      "Nous ne pourrons en aucun cas être tenus responsables de dommages indirects ou consécutifs résultant de l’utilisation du site ou de retards qui ne nous sont pas directement imputables.",
    lawTitle: "Loi applicable & juridiction compétente",
    lawP1:
      "Les présentes conditions sont régies par le droit italien. Lorsque le droit de la consommation s’applique, la juridiction compétente est celle du consommateur ; dans les autres cas, la compétence est déterminée conformément à la loi en vigueur. Pour toute question concernant ces termes, tu peux nous contacter depuis la page Contact.",
  },
  de: {
    heroTitle: "Allgemeine Geschäftsbedingungen",
    heroSubtitle:
      "Eine übersichtliche Zusammenfassung der Regeln für die Nutzung der Website und den Kauf unserer Mystery Boxen. 📜",
    lastUpdateLabel: "Letzte Aktualisierung",
    objectTitle: "Gegenstand",
    objectText:
      "Diese Bedingungen regeln den Zugriff auf und die Nutzung der KiloMystery-Website sowie den Verkauf von Produkten in Form von Mystery Boxen. Mit dem Kauf einer Box akzeptierst du, dass der Inhalt im Voraus nicht sichtbar ist und nicht im Detail ausgewählt werden kann.",
    purchaseTitle: "Kauf & Preise",
    purchaseItems: [
      "Die Preise werden in EUR angegeben, inklusive MwSt., sofern nicht anders angegeben.",
      "Der Inhalt der Boxen ist „mystery“: Es ist nicht möglich, einzelne Artikel auszuwählen.",
      "Du erhältst eine Bestellbestätigung per E-Mail mit Übersicht und Details deines Kaufs.",
      "Zahlungen werden über vertrauenswürdige Drittanbieter abgewickelt; wir speichern keine vollständigen Kartendaten.",
    ],
    liabilityTitle: "Haftungsbeschränkung",
    liabilityP1:
      "Die Website und die Dienste werden „wie besehen“ bereitgestellt. Wir bemühen uns, die Plattform funktionsfähig und aktuell zu halten, können jedoch keine vollständige Freiheit von Unterbrechungen, technischen Fehlern oder Verzögerungen garantieren, die durch Dritte verursacht werden (z. B. Provider, Kuriere, Zahlungsdienstleister).",
    liabilityP2:
      "In keinem Fall haften wir für indirekte oder Folgeschäden, die aus der Nutzung der Website oder aus Verzögerungen entstehen, die nicht direkt auf uns zurückzuführen sind.",
    lawTitle: "Anwendbares Recht & Gerichtsstand",
    lawP1:
      "Diese Bedingungen unterliegen italienischem Recht. Soweit Verbraucherschutzrecht anwendbar ist, ist das Gericht am Wohnsitz des Verbrauchers zuständig; in anderen Fällen richtet sich die Zuständigkeit nach den einschlägigen gesetzlichen Vorschriften. Bei Fragen zu diesen Bedingungen kannst du uns über die Kontakt-Seite erreichen.",
  },
};

const DATE_LOCALE: Record<Lang, string> = {
  it: "it-IT",
  en: "en-GB",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolved = await params;
  const lang: Lang = normalizeLang(resolved?.lang);
  const t = TERMS_COPY[lang] ?? TERMS_COPY.it;
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

        <section className="space-y-5">
          {/* OGGETTO */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.objectTitle}</span>
              <span>📌</span>
            </h2>
            <p className="text-white/70 text-sm">{t.objectText}</p>
          </article>

          {/* ACQUISTO & PREZZI */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.purchaseTitle}</span>
              <span>💳</span>
            </h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.purchaseItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </article>

          {/* RESPONSABILITÀ */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.liabilityTitle}</span>
              <span>⚠️</span>
            </h2>
            <p className="text-white/70 text-sm">{t.liabilityP1}</p>
            <p className="text-white/70 text-sm">{t.liabilityP2}</p>
          </article>

          {/* LEGGE APPLICABILE */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.lawTitle}</span>
              <span>⚖️</span>
            </h2>
            <p className="text-white/70 text-sm">
              {lang === "it" ? (
                <>
                  {t.lawP1}{" "}
                  Per qualsiasi dubbio sui termini puoi contattarci dalla pagina{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Contatti
                  </a>
                  .
                </>
              ) : lang === "en" ? (
                <>
                  {t.lawP1}{" "}
                  For any questions about these terms you can contact us via the{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Contact
                  </a>{" "}
                  page.
                </>
              ) : lang === "es" ? (
                <>
                  {t.lawP1}{" "}
                  Para cualquier duda sobre los términos puedes escribirnos desde la página de{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Contacto
                  </a>
                  .
                </>
              ) : lang === "fr" ? (
                <>
                  {t.lawP1}{" "}
                  Pour toute question concernant ces termes, tu peux nous contacter depuis la page{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Contact
                  </a>
                  .
                </>
              ) : (
                <>
                  {t.lawP1}{" "}
                  Bei Fragen zu diesen Bedingungen kannst du uns über die Seite{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Kontakt
                  </a>{" "}
                  erreichen.
                </>
              )}
            </p>
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
