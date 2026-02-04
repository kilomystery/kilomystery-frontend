/* eslint-disable react/no-unescaped-entities */
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";
import { HERO_IMAGE } from "@/lib/staticImages";

export const metadata = {
  title: "Politica Resi",
};

type Copy = {
  heroTitle: string;
  heroSubtitle: string;
  lastUpdateLabel: string;

  // NEW: Recesso
  withdrawalTitle: string;
  withdrawalIntro: string;
  withdrawalItems: string[];

  // Resi / condizioni
  returnsTitle: string;
  returnsIntro: string;

  conditionsTitle: string;
  conditionsIntro: string;
  conditionsItems: string[];

  // Problemi / difetti
  issuesTitle: string;
  issuesIntro: string;
  issuesItems: string[];

  // Come fare il reso
  processTitle: string;
  processIntro: string;
  processItems: string[];
  processOutro: string;

  // Rimborsi
  refundsTitle: string;
  refundsText: string;

  // Dati aziendali
  legalTitle: string;
  legalIntro: string;
  legalName: string;
  legalVat: string;
  legalAddress: string;
  legalEmail: string;
  legalPhone: string;
  legalHours: string;
};

const RETURNS_COPY: Record<Lang, Copy> = {
  it: {
    heroTitle: "Politica resi e rimborsi",
    heroSubtitle:
      "Le mystery box sono per definizione sorprendenti. Qui trovi regole chiare su recesso, resi e rimborsi. 📦",
    lastUpdateLabel: "Ultimo aggiornamento",

    withdrawalTitle: "Diritto di recesso (14 giorni)",
    withdrawalIntro:
      "Se acquisti come consumatore, puoi esercitare il diritto di recesso entro 14 giorni dalla consegna, senza dover fornire motivazioni.",
    withdrawalItems: [
      "Il prodotto deve essere restituito integro, non usato e con sigilli/chiusure non manomessi (se presenti).",
      "Se la box o i sigilli risultano aperti/manomessi, potremmo applicare una riduzione del rimborso per perdita di valore.",
      "Le spese di spedizione per la restituzione sono a carico del cliente, salvo diversa indicazione o casi di difetto/non conformità.",
    ],

    returnsTitle: "Resi delle mystery box",
    returnsIntro:
      "Le nostre box sono sigillate e vendute come mystery: il contenuto non è noto in anticipo e non è personalizzabile. Questo significa che non possiamo accettare contestazioni basate sul valore percepito dei prodotti. Restano comunque validi i diritti di recesso e le tutele per difetti/non conformità.",

    conditionsTitle: "Condizioni per accettare un reso",
    conditionsIntro: "Per accettare la richiesta di reso, chiediamo che:",
    conditionsItems: [
      "la box sia integra e restituita completa di tutti i componenti ricevuti;",
      "sigilli e chiusure siano intatti (se presenti);",
      "l’imballo esterno sia adeguato per il trasporto (per evitare danni ulteriori);",
      "la richiesta venga inviata entro i termini previsti (recesso: 14 giorni).",
    ],

    issuesTitle: "Problemi alla consegna o difetti",
    issuesIntro:
      "Se riscontri problemi (danni, manomissioni, errori evidenti di spedizione o non conformità), li gestiamo con priorità. Esempi:",
    issuesItems: [
      "imballo gravemente danneggiato all’arrivo;",
      "box visibilmente manomessa o sigilli rotti;",
      "errore di spedizione evidente (es. peso completamente diverso rispetto a quanto acquistato);",
      "prodotti difettosi/non conformi (ove applicabile).",
    ],

    processTitle: "Come richiedere un reso o aprire una segnalazione",
    processIntro: "Per avviare la procedura, ti chiediamo di:",
    processItems: [
      "contattarci entro 48 ore dalla consegna in caso di danni/manomissioni, oppure entro 14 giorni se vuoi esercitare il recesso;",
      "indicare numero ordine e motivo della richiesta (recesso / problema alla consegna / altro);",
      "allegare foto chiare di: imballo esterno, sigilli/chiusure, etichetta di spedizione e contenuto (se pertinente).",
    ],
    processOutro:
      "Ti risponderemo con le istruzioni e, se necessario, un codice/ID pratica. L’indirizzo di restituzione viene fornito via email dopo l’apertura della pratica.",

    refundsTitle: "Rimborsi",
    refundsText:
      "Se la richiesta viene approvata, il rimborso viene effettuato sullo stesso metodo di pagamento usato in fase di acquisto. Di norma, elaboriamo il rimborso entro 5–10 giorni lavorativi dalla ricezione e verifica del reso (le tempistiche finali dipendono dai circuiti di pagamento).",

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
  },

  en: {
    heroTitle: "Returns & refunds policy",
    heroSubtitle:
      "Mystery boxes are meant to be surprising. Here you’ll find clear rules for withdrawal, returns and refunds. 📦",
    lastUpdateLabel: "Last update",

    withdrawalTitle: "Right of withdrawal (14 days)",
    withdrawalIntro:
      "If you purchase as a consumer, you can withdraw from the purchase within 14 days from delivery, without giving any reason.",
    withdrawalItems: [
      "Items must be returned unused, intact and with seals/closures not tampered with (if present).",
      "If the box or seals are opened/tampered with, we may reduce the refund due to loss of value.",
      "Return shipping costs are borne by the customer, unless otherwise stated or in case of defects/non-conformity.",
    ],

    returnsTitle: "Returns for mystery boxes",
    returnsIntro:
      "Our boxes are sealed and sold as mystery: contents are not known in advance and cannot be customized. We cannot accept claims based on the perceived value of items. Your withdrawal rights and legal protections for defects/non-conformity still apply.",

    conditionsTitle: "Return conditions",
    conditionsIntro: "To accept a return request, we ask that:",
    conditionsItems: [
      "the box is intact and returned with all received components;",
      "seals/closures are intact (if present);",
      "outer packaging is suitable for shipping (to avoid further damage);",
      "the request is submitted within the applicable deadlines (withdrawal: 14 days).",
    ],

    issuesTitle: "Delivery issues or defects",
    issuesIntro:
      "If you experience issues (damage, tampering, clear shipping errors, or non-conformity), we prioritize your case. Examples:",
    issuesItems: [
      "package severely damaged upon arrival;",
      "box visibly tampered with or broken seals;",
      "clear shipping mistake (e.g., completely different weight than purchased);",
      "defective/non-conforming items (where applicable).",
    ],

    processTitle: "How to request a return or report an issue",
    processIntro: "To start the process, please:",
    processItems: [
      "contact us within 48 hours from delivery for damage/tampering, or within 14 days to exercise withdrawal;",
      "include your order number and the reason (withdrawal / delivery issue / other);",
      "attach clear photos of: outer packaging, seals/closures, shipping label, and contents (if relevant).",
    ],
    processOutro:
      "We will reply with instructions and, if needed, a case ID. The return address is provided by email after the case is opened.",

    refundsTitle: "Refunds",
    refundsText:
      "If approved, the refund is issued to the same payment method used at checkout. We usually process refunds within 5–10 business days after receiving and inspecting the return (final timing depends on payment networks).",

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
  },

  es: {
    heroTitle: "Política de devoluciones y reembolsos",
    heroSubtitle:
      "Las mystery box son sorprendentes por naturaleza. Aquí encontrarás reglas claras sobre desistimiento, devoluciones y reembolsos. 📦",
    lastUpdateLabel: "Última actualización",

    withdrawalTitle: "Derecho de desistimiento (14 días)",
    withdrawalIntro:
      "Si compras como consumidor, puedes desistir de la compra dentro de los 14 días posteriores a la entrega, sin necesidad de indicar un motivo.",
    withdrawalItems: [
      "El producto debe devolverse intacto, sin usar y con los precintos/cierres sin manipular (si existen).",
      "Si la caja o los precintos están abiertos/manipulados, podemos aplicar una reducción del reembolso por pérdida de valor.",
      "Los gastos de envío de la devolución corren a cargo del cliente, salvo indicación contraria o casos de defecto/no conformidad.",
    ],

    returnsTitle: "Devoluciones de mystery box",
    returnsIntro:
      "Nuestras cajas están precintadas y se venden como mystery: el contenido no se conoce de antemano y no es personalizable. No aceptamos reclamaciones basadas en el valor percibido de los productos. Siguen vigentes el derecho de desistimiento y las protecciones legales por defectos/no conformidad.",

    conditionsTitle: "Condiciones para aceptar una devolución",
    conditionsIntro: "Para aceptar la devolución, solicitamos que:",
    conditionsItems: [
      "la caja esté intacta y se devuelva con todos los componentes recibidos;",
      "los precintos/cierres estén intactos (si existen);",
      "el embalaje exterior sea adecuado para el transporte (para evitar daños adicionales);",
      "la solicitud se envíe dentro de los plazos aplicables (desistimiento: 14 días).",
    ],

    issuesTitle: "Problemas en la entrega o defectos",
    issuesIntro:
      "Si detectas problemas (daños, manipulación, errores evidentes de envío o no conformidad), lo gestionamos con prioridad. Ejemplos:",
    issuesItems: [
      "embalaje gravemente dañado al llegar;",
      "caja visiblemente manipulada o precintos rotos;",
      "error evidente de envío (p. ej., peso completamente diferente al comprado);",
      "productos defectuosos/no conformes (cuando corresponda).",
    ],

    processTitle: "Cómo solicitar una devolución o comunicar un problema",
    processIntro: "Para iniciar el proceso, por favor:",
    processItems: [
      "contáctanos dentro de las 48 horas desde la entrega en caso de daños/manipulación, o dentro de 14 días para ejercer el desistimiento;",
      "indica el número de pedido y el motivo (desistimiento / problema de entrega / otro);",
      "adjunta fotos claras del embalaje externo, precintos/cierres, etiqueta de envío y contenido (si corresponde).",
    ],
    processOutro:
      "Responderemos con instrucciones y, si es necesario, un ID de incidencia. La dirección de devolución se facilita por email tras abrir la incidencia.",

    refundsTitle: "Reembolsos",
    refundsText:
      "Si se aprueba la solicitud, el reembolso se realiza en el mismo método de pago utilizado en la compra. Normalmente procesamos el reembolso en 5–10 días laborables tras recibir y verificar la devolución (el tiempo final depende de los proveedores de pago).",

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
  },

  fr: {
    heroTitle: "Politique de retours et remboursements",
    heroSubtitle:
      "Les mystery box sont par nature surprenantes. Voici des règles claires sur la rétractation, les retours et les remboursements. 📦",
    lastUpdateLabel: "Dernière mise à jour",

    withdrawalTitle: "Droit de rétractation (14 jours)",
    withdrawalIntro:
      "Si tu achètes en tant que consommateur, tu peux exercer ton droit de rétractation dans les 14 jours suivant la livraison, sans avoir à te justifier.",
    withdrawalItems: [
      "Le produit doit être retourné intact, non utilisé et avec les scellés/fermetures non altérés (si présents).",
      "Si la box ou les scellés sont ouverts/altérés, nous pouvons appliquer une réduction du remboursement en raison de la perte de valeur.",
      "Les frais de retour sont à la charge du client, sauf indication contraire ou en cas de défaut/non-conformité.",
    ],

    returnsTitle: "Retours des mystery box",
    returnsIntro:
      "Nos box sont scellées et vendues comme mystery : le contenu n’est pas connu à l’avance et n’est pas personnalisable. Nous n’acceptons pas de réclamations basées sur la valeur perçue. Les droits de rétractation et les protections légales pour défaut/non-conformité s’appliquent toutefois.",

    conditionsTitle: "Conditions de retour",
    conditionsIntro: "Pour accepter un retour, nous demandons que :",
    conditionsItems: [
      "la box soit intacte et retournée avec tous les éléments reçus ;",
      "les scellés/fermetures soient intacts (si présents) ;",
      "l’emballage extérieur soit adapté au transport (pour éviter tout dommage supplémentaire) ;",
      "la demande soit effectuée dans les délais applicables (rétractation : 14 jours).",
    ],

    issuesTitle: "Problèmes à la livraison ou défauts",
    issuesIntro:
      "En cas de problème (dommages, altération, erreur manifeste d’expédition ou non-conformité), nous traitons ta demande en priorité. Exemples :",
    issuesItems: [
      "emballage fortement endommagé à la réception ;",
      "box visiblement ouverte/altérée ou scellés cassés ;",
      "erreur manifeste d’expédition (par exemple un poids totalement différent) ;",
      "produits défectueux/non conformes (le cas échéant).",
    ],

    processTitle: "Comment demander un retour ou signaler un problème",
    processIntro: "Pour démarrer la procédure :",
    processItems: [
      "contacte-nous dans les 48 h suivant la livraison en cas de dommages/altération, ou dans les 14 jours pour exercer la rétractation ;",
      "indique ton numéro de commande et le motif (rétractation / problème à la livraison / autre) ;",
      "joins des photos claires : emballage externe, scellés/fermetures, étiquette d’expédition, contenu (si pertinent).",
    ],
    processOutro:
      "Nous te répondrons avec les instructions et, si nécessaire, un ID de dossier. L’adresse de retour est fournie par email après ouverture du dossier.",

    refundsTitle: "Remboursements",
    refundsText:
      "Si la demande est approuvée, le remboursement est effectué via le même moyen de paiement utilisé lors de l’achat. Nous traitons généralement le remboursement sous 5 à 10 jours ouvrés après réception et contrôle du retour (délais finaux selon les réseaux de paiement).",

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
  },

  de: {
    heroTitle: "Rückgabe- und Erstattungsrichtlinie",
    heroSubtitle:
      "Mystery-Boxen leben von der Überraschung. Hier findest du klare Regeln zu Widerruf, Rückgabe und Erstattung. 📦",
    lastUpdateLabel: "Letzte Aktualisierung",

    withdrawalTitle: "Widerrufsrecht (14 Tage)",
    withdrawalIntro:
      "Wenn du als Verbraucher kaufst, kannst du innerhalb von 14 Tagen nach Lieferung ohne Angabe von Gründen widerrufen.",
    withdrawalItems: [
      "Die Ware muss unbenutzt, vollständig und mit unversehrten Siegeln/Verschlüssen (falls vorhanden) zurückgesendet werden.",
      "Wenn die Box oder Siegel geöffnet/manipuliert sind, können wir den Erstattungsbetrag wegen Wertverlusts reduzieren.",
      "Die Rücksendekosten trägt der Kunde, sofern nicht anders angegeben oder bei Mängeln/Nichtkonformität.",
    ],

    returnsTitle: "Rückgabe von Mystery-Boxen",
    returnsIntro:
      "Unsere Boxen sind versiegelt und werden als Mystery verkauft: Der Inhalt ist im Voraus nicht bekannt und nicht personalisierbar. Reklamationen aufgrund des subjektiv wahrgenommenen Wertes können wir nicht akzeptieren. Widerrufsrechte und gesetzliche Gewährleistung bei Mängeln/Nichtkonformität bleiben unberührt.",

    conditionsTitle: "Voraussetzungen für eine Rückgabe",
    conditionsIntro: "Damit wir eine Rückgabe annehmen können, gilt:",
    conditionsItems: [
      "Die Box muss intakt sein und mit allen erhaltenen Bestandteilen zurückgesendet werden.",
      "Siegel/Verschlüsse müssen unversehrt sein (falls vorhanden).",
      "Die Außenverpackung muss für den Versand geeignet sein (um weitere Schäden zu vermeiden).",
      "Die Anfrage muss innerhalb der Fristen erfolgen (Widerruf: 14 Tage).",
    ],

    issuesTitle: "Lieferprobleme oder Mängel",
    issuesIntro:
      "Bei Problemen (Schäden, Manipulation, offensichtliche Versandfehler oder Nichtkonformität) behandeln wir deinen Fall vorrangig. Beispiele:",
    issuesItems: [
      "stark beschädigte Verpackung bei Ankunft;",
      "sichtbar geöffnete/manipulierte Box oder gebrochene Siegel;",
      "offensichtlicher Versandfehler (z. B. völlig abweichendes Gewicht);",
      "defekte/nicht konforme Artikel (falls zutreffend).",
    ],

    processTitle: "So meldest du eine Rückgabe oder ein Problem",
    processIntro: "Um den Prozess zu starten, bitte:",
    processItems: [
      "kontaktiere uns innerhalb von 48 Stunden nach Zustellung bei Schäden/Manipulation oder innerhalb von 14 Tagen für den Widerruf;",
      "nenne Bestellnummer und Grund (Widerruf / Lieferproblem / anderes);",
      "füge klare Fotos bei: Außenverpackung, Siegel/Verschlüsse, Versandlabel und Inhalt (falls relevant).",
    ],
    processOutro:
      "Wir antworten mit den nächsten Schritten und ggf. einer Vorgangs-ID. Die Rücksendeadresse erhältst du per E-Mail nach Eröffnung des Vorgangs.",

    refundsTitle: "Erstattungen",
    refundsText:
      "Bei Genehmigung erfolgt die Erstattung über dieselbe Zahlungsmethode wie beim Kauf. In der Regel bearbeiten wir Erstattungen innerhalb von 5–10 Werktagen nach Erhalt und Prüfung der Rücksendung (endgültige Dauer abhängig von Zahlungsanbietern).",

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
  },
};

function formatLastUpdate(lang: Lang) {
  const locale =
    lang === "it"
      ? "it-IT"
      : lang === "en"
      ? "en-GB"
      : lang === "es"
      ? "es-ES"
      : lang === "fr"
      ? "fr-FR"
      : "de-DE";
  return new Date().toLocaleDateString(locale);
}

export default async function ReturnsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolved = await params;
  const lang: Lang = normalizeLang(resolved?.lang);
  const t = RETURNS_COPY[lang] ?? RETURNS_COPY.it;
  const today = formatLastUpdate(lang);

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
          <p className="text-center text-white/60 text-xs mt-1">{t.heroSubtitle}</p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {/* RECESSO + CONDIZIONI */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.withdrawalTitle}</span>
              <span>🧾</span>
            </h2>
            <p className="text-white/70 text-sm">{t.withdrawalIntro}</p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.withdrawalItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <h3 className="font-bold mt-4 text-sm">{t.conditionsTitle}</h3>
            <p className="text-white/70 text-sm">{t.conditionsIntro}</p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.conditionsItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </article>

          {/* PROBLEMI + PROCESSO + RIMBORSI */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.issuesTitle}</span>
              <span>🛠️</span>
            </h2>
            <p className="text-white/70 text-sm">{t.issuesIntro}</p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.issuesItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <h3 className="font-bold mt-4 text-sm">{t.processTitle}</h3>
            <p className="text-white/70 text-sm">{t.processIntro}</p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.processItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <p className="text-white/70 text-sm">
              {t.processOutro}{" "}
              <a href={`/${lang}/contact`} className="btn-link">
                {lang === "it"
                  ? "Contatti"
                  : lang === "en"
                  ? "Contact"
                  : lang === "es"
                  ? "Contacto"
                  : lang === "fr"
                  ? "Contact"
                  : "Kontakt"}
              </a>
              .
            </p>

            <h3 className="font-bold mt-4 text-sm">{t.refundsTitle}</h3>
            <p className="text-white/70 text-sm">{t.refundsText}</p>
          </article>
        </section>

        {/* MYSTERY BOX INFO (mantengo il messaggio ma “safe”) */}
        <section className="card space-y-3">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <span>{t.returnsTitle}</span>
            <span>🎁</span>
          </h2>
          <p className="text-white/70 text-sm">{t.returnsIntro}</p>
        </section>

        {/* DATI AZIENDALI */}
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
