/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

export const metadata = {
  title: "Politica Resi",
};

type Copy = {
  heroTitle: string;
  heroSubtitle: string;
  lastUpdateLabel: string;
  returnsTitle: string;
  returnsIntro: string;
  exceptionsTitle: string;
  exceptionsIntro: string;
  exceptionsItems: string[];
  reportTitle: string;
  reportIntro: string;
  reportItems: string[];
  reportOutro: string;
  refundsTitle: string;
  refundsText: string;
};

const RETURNS_COPY: Record<Lang, Copy> = {
  it: {
    heroTitle: "Politica resi",
    heroSubtitle:
      "Le mystery box sono per definizione sorprendenti, ma vogliamo essere chiari sulle condizioni di reso. 📦",
    lastUpdateLabel: "Ultimo aggiornamento",
    returnsTitle: "Resi delle mystery box",
    returnsIntro:
      "Le box sono vendute come mystery sigillate: il contenuto non è noto in anticipo e non è personalizzabile. Per questo, il reso non è previsto per semplice mancato gradimento o per il valore percepito dei prodotti ricevuti.",
    exceptionsTitle: "Eccezioni",
    exceptionsIntro: "Valutiamo caso per caso situazioni di:",
    exceptionsItems: [
      "imballo gravemente danneggiato all'arrivo;",
      "box visibilmente manomessa;",
      "errori evidenti di spedizione (es. peso completamente diverso).",
    ],
    reportTitle: "Come segnalarci un problema",
    reportIntro:
      "Se noti problemi al momento della consegna, ti chiediamo di:",
    reportItems: [
      "contattarci entro 48 ore dalla consegna;",
      "allegare foto chiare di imballo esterno, sigilli e contenuto;",
      "indicare numero ordine e descrizione del problema.",
    ],
    reportOutro:
      "Puoi aprire la segnalazione dalla pagina Contatti.",
    refundsTitle: "Rimborsi",
    refundsText:
      "In caso di approvazione, il rimborso viene effettuato sullo stesso metodo di pagamento utilizzato in fase di acquisto, di solito entro 5–10 giorni lavorativi (tempistiche dei circuiti di pagamento).",
  },
  en: {
    heroTitle: "Return policy",
    heroSubtitle:
      "Mystery boxes are, by nature, surprising – but we want to be transparent about how returns work. 📦",
    lastUpdateLabel: "Last update",
    returnsTitle: "Returns of mystery boxes",
    returnsIntro:
      "Boxes are sold as sealed mystery boxes: the content is not known in advance and cannot be customised. Therefore, returns are not accepted for simple dissatisfaction or for the perceived value of the products received.",
    exceptionsTitle: "Exceptions",
    exceptionsIntro: "We assess on a case-by-case basis situations such as:",
    exceptionsItems: [
      "packaging severely damaged on arrival;",
      "box visibly tampered with;",
      "clear shipping errors (e.g. completely different weight).",
    ],
    reportTitle: "How to report a problem",
    reportIntro:
      "If you notice an issue at the time of delivery, please:",
    reportItems: [
      "contact us within 48 hours of delivery;",
      "attach clear photos of the outer packaging, seals and contents;",
      "include the order number and a description of the problem.",
    ],
    reportOutro:
      "You can open a report from the Contact page.",
    refundsTitle: "Refunds",
    refundsText:
      "If your claim is approved, the refund will be issued to the same payment method used at checkout, usually within 5–10 business days (depending on the payment circuits).",
  },
  es: {
    heroTitle: "Política de devoluciones",
    heroSubtitle:
      "Las mystery box son, por definición, sorprendentes, pero queremos ser claros con las condiciones de devolución. 📦",
    lastUpdateLabel: "Última actualización",
    returnsTitle: "Devoluciones de las mystery box",
    returnsIntro:
      "Las cajas se venden como mystery boxes precintadas: el contenido no se conoce de antemano y no es personalizable. Por este motivo, no se aceptan devoluciones por simple falta de satisfacción o por el valor percibido de los productos recibidos.",
    exceptionsTitle: "Excepciones",
    exceptionsIntro: "Valoramos caso por caso situaciones como:",
    exceptionsItems: [
      "embalaje gravemente dañado a la llegada;",
      "caja visiblemente manipulada;",
      "errores evidentes de envío (p. ej., peso completamente diferente).",
    ],
    reportTitle: "Cómo comunicarnos un problema",
    reportIntro:
      "Si detectas problemas en el momento de la entrega, te pedimos:",
    reportItems: [
      "contactarnos en un plazo de 48 horas desde la entrega;",
      "adjuntar fotos claras del embalaje externo, precintos y contenido;",
      "indicar el número de pedido y una descripción del problema.",
    ],
    reportOutro:
      "Puedes abrir una incidencia desde la página de Contacto.",
    refundsTitle: "Reembolsos",
    refundsText:
      "En caso de aprobación, el reembolso se realiza en el mismo método de pago utilizado en la compra, normalmente en un plazo de 5–10 días laborables (según los circuitos de pago).",
  },
  fr: {
    heroTitle: "Politique de retours",
    heroSubtitle:
      "Les mystery box sont par définition surprenantes, mais nous souhaitons être clairs sur les conditions de retour. 📦",
    lastUpdateLabel: "Dernière mise à jour",
    returnsTitle: "Retours des mystery box",
    returnsIntro:
      "Les box sont vendues comme des mystery box scellées : le contenu n’est pas connu à l’avance et n’est pas personnalisable. Les retours ne sont donc pas prévus en cas de simple insatisfaction ou de valeur perçue des produits reçus.",
    exceptionsTitle: "Exceptions",
    exceptionsIntro:
      "Nous étudions au cas par cas des situations telles que :",
    exceptionsItems: [
      "emballage fortement endommagé à la réception ;",
      "box visiblement ouverte ou altérée ;",
      "erreurs manifestes d’expédition (par exemple un poids totalement différent).",
    ],
    reportTitle: "Comment nous signaler un problème",
    reportIntro:
      "Si tu remarques un problème au moment de la livraison, merci de :",
    reportItems: [
      "nous contacter dans les 48 heures suivant la livraison ;",
      "joindre des photos claires de l’emballage externe, des scellés et du contenu ;",
      "indiquer le numéro de commande et une description du problème.",
    ],
    reportOutro:
      "Tu peux ouvrir un signalement depuis la page Contact.",
    refundsTitle: "Remboursements",
    refundsText:
      "En cas d’approbation, le remboursement est effectué sur le même moyen de paiement que celui utilisé lors de l’achat, en général sous 5 à 10 jours ouvrés (délais des réseaux de paiement).",
  },
  de: {
    heroTitle: "Rückgabebedingungen",
    heroSubtitle:
      "Mystery Boxen leben von der Überraschung – trotzdem möchten wir transparent mit den Rückgaberegeln umgehen. 📦",
    lastUpdateLabel: "Letzte Aktualisierung",
    returnsTitle: "Rückgabe von Mystery Boxen",
    returnsIntro:
      "Boxen werden als versiegelte Mystery Boxen verkauft: Der Inhalt ist im Voraus nicht bekannt und kann nicht personalisiert werden. Daher sind Rückgaben bei bloßer Unzufriedenheit oder aufgrund des subjektiv wahrgenommenen Werts der Produkte nicht vorgesehen.",
    exceptionsTitle: "Ausnahmen",
    exceptionsIntro:
      "In folgenden Fällen prüfen wir dein Anliegen im Einzelfall:",
    exceptionsItems: [
      "stark beschädigte Verpackung bei Ankunft;",
      "sichtbar geöffnete oder manipulierte Box;",
      "offensichtliche Versandfehler (z. B. völlig abweichendes Gewicht).",
    ],
    reportTitle: "Wie du ein Problem meldest",
    reportIntro:
      "Wenn dir bei der Lieferung etwas auffällt, bitten wir dich:",
    reportItems: [
      "uns innerhalb von 48 Stunden nach Zustellung zu kontaktieren;",
      "klare Fotos der Außenverpackung, Siegel und des Inhalts beizufügen;",
      "Bestellnummer und Problembeschreibung anzugeben.",
    ],
    reportOutro:
      "Du kannst dein Anliegen über die Kontakt-Seite melden.",
    refundsTitle: "Rückerstattungen",
    refundsText:
      "Bei Genehmigung erfolgt die Rückerstattung über dieselbe Zahlungsmethode, die du beim Kauf verwendet hast – in der Regel innerhalb von 5–10 Werktagen (abhängig von den Zahlungsdienstleistern).",
  },
};

export default async function ReturnsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolved = await params;
  const lang: Lang = normalizeLang(resolved?.lang);
  const t = RETURNS_COPY[lang] ?? RETURNS_COPY.it;
  const today = new Date().toLocaleDateString("it-IT");

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
          {/* RESI */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.returnsTitle}</span>
              <span>🎁</span>
            </h2>
            <p className="text-white/70 text-sm">{t.returnsIntro}</p>

            <h3 className="font-bold mt-3 text-sm">
              {t.exceptionsTitle}
            </h3>
            <p className="text-white/70 text-sm">{t.exceptionsIntro}</p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.exceptionsItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </article>

          {/* COME APRIRE UNA SEGNALAZIONE */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.reportTitle}</span>
              <span>🛠️</span>
            </h2>
            <p className="text-white/70 text-sm">{t.reportIntro}</p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.reportItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <p className="text-white/70 text-sm">
              {lang === "it" ? (
                <>
                  Puoi aprire la segnalazione dalla pagina{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Contatti
                  </a>
                  .
                </>
              ) : lang === "en" ? (
                <>
                  You can open a claim from the{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Contact
                  </a>{" "}
                  page.
                </>
              ) : lang === "es" ? (
                <>
                  Puedes abrir la incidencia desde la página de{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Contacto
                  </a>
                  .
                </>
              ) : lang === "fr" ? (
                <>
                  Tu peux ouvrir un signalement depuis la page{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Contact
                  </a>
                  .
                </>
              ) : (
                <>
                  Du kannst dein Anliegen über die Seite{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Kontakt
                  </a>{" "}
                  melden.
                </>
              )}
            </p>

            <h3 className="font-bold mt-3 text-sm">
              {t.refundsTitle}
            </h3>
            <p className="text-white/70 text-sm">{t.refundsText}</p>
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
