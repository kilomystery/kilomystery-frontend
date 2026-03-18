/* eslint-disable react/no-unescaped-entities */
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";
import Image from "next/image";

export const metadata = {
  title: "Termini e Condizioni",
};

type Copy = {
  heroTitle: string;
  heroSubtitle: string;
  lastUpdateLabel: string;

  objectTitle: string;
  objectText: string;

  companyTitle: string;
  companyIntro: string;
  companyItems: string[];

  contractTitle: string;
  contractItems: string[];

  purchaseTitle: string;
  purchaseItems: string[];

  shippingTitle: string;
  shippingItems: string[];

  mysteryTitle: string;
  mysteryText: string;

  withdrawalTitle: string;
  withdrawalText: string;
  withdrawalCta: string;

  warrantyTitle: string;
  warrantyText: string;

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
      "Regole chiare per l’uso del sito e l’acquisto delle KiloMystery Box. 📜",
    lastUpdateLabel: "Ultimo aggiornamento",

    objectTitle: "Oggetto",
    objectText:
      "Le presenti condizioni disciplinano l’accesso e l’uso del sito KiloMystery e la vendita di prodotti sotto forma di mystery box. Effettuando un ordine accetti che le box siano vendute come “mystery”: il contenuto non è visibile in anticipo e non è selezionabile nel dettaglio, salvo diversa indicazione nella pagina prodotto.",

    companyTitle: "Informazioni sul venditore",
    companyIntro: "Il sito è gestito da:",
    companyItems: [
      "Ragione sociale: KILO MYSTERY SRLS",
      "Partita IVA: 02794550745",
      "Sede legale e operativa: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italia",
      "Email: sales@kilomystery.com",
      "Telefono: +39 353 492 3350",
      "Orari assistenza: Lunedì–Venerdì, 09:00–18:00",
    ],

    contractTitle: "Come si conclude il contratto",
    contractItems: [
      "Le informazioni e i prezzi mostrati sul sito costituiscono un invito a offrire.",
      "Il contratto si considera concluso quando ricevi la conferma d’ordine via email (o quando l’ordine risulta confermato nell’area cliente, se presente).",
      "Ci riserviamo il diritto di rifiutare o annullare ordini in caso di errori evidenti (es. prezzo palesemente errato), indisponibilità, sospetto di frode o dati incompleti.",
    ],

    purchaseTitle: "Prezzi, pagamenti e fatturazione",
    purchaseItems: [
      "I prezzi sono indicati in EUR e includono l’IVA salvo diversa indicazione.",
      "Le eventuali spese di spedizione sono indicate prima della conferma dell’ordine.",
      "I pagamenti sono gestiti tramite provider terzi affidabili; non memorizziamo i dati completi della carta.",
      "In caso di mancato pagamento o pagamento non autorizzato, l’ordine può essere annullato.",
    ],

    shippingTitle: "Spedizione, consegna e rischio",
    shippingItems: [
      "I tempi di consegna indicati sul sito sono stime e possono variare per cause non direttamente imputabili a noi (es. corrieri, festività, controlli).",
      "Quando l’ordine viene affidato al corriere, riceverai (se disponibile) il tracciamento.",
      "Il rischio di perdita o danneggiamento si trasferisce al consumatore al momento della consegna (o al momento in cui un terzo da lui designato acquisisce il possesso).",
    ],

    mysteryTitle: "Natura “mystery” delle box",
    mysteryText:
      "Le KiloMystery Box sono box a contenuto non predeterminato. Non garantiamo specifici brand, modelli o categorie salvo esplicita indicazione nella pagina prodotto. Eventuali immagini sono indicative. Restano salvi i diritti del consumatore (recesso, garanzia legale e tutele per non conformità).",

    withdrawalTitle: "Recesso, resi e rimborsi",
    withdrawalText:
      "Se acquisti come consumatore, puoi esercitare il diritto di recesso entro 14 giorni dalla consegna e richiedere reso/rimborso secondo le condizioni indicate nella nostra Politica Resi.",
    withdrawalCta: "Leggi la Politica Resi",

    warrantyTitle: "Garanzia legale e non conformità",
    warrantyText:
      "Per i consumatori si applica la garanzia legale di conformità prevista dalla normativa vigente. In caso di problemi, contattaci e valuteremo la soluzione più adeguata (ad es. sostituzione, rimborso o altra misura prevista dalla legge).",

    liabilityTitle: "Limitazione di responsabilità",
    liabilityP1:
      "Il sito e i servizi sono forniti “così come sono”. Ci impegniamo a mantenere la piattaforma funzionante e aggiornata, ma non possiamo garantire l’assenza totale di interruzioni, errori tecnici o ritardi dovuti a terze parti (es. provider, corrieri, gateway di pagamento).",
    liabilityP2:
      "Nei limiti consentiti dalla legge, non rispondiamo di danni indiretti o consequenziali derivanti dall’uso del sito o da ritardi non direttamente imputabili a noi. Nulla in queste condizioni limita i diritti inderogabili del consumatore.",

    lawTitle: "Legge applicabile & foro competente",
    lawP1:
      "Le presenti condizioni sono regolate dalla legge italiana. Quando applicabile, è competente il foro del consumatore; negli altri casi, la competenza è determinata secondo la normativa vigente.",
  },

  en: {
    heroTitle: "Terms & Conditions",
    heroSubtitle:
      "Clear rules for using the website and purchasing KiloMystery Boxes. 📜",
    lastUpdateLabel: "Last update",

    objectTitle: "Scope",
    objectText:
      "These terms govern access to and use of the KiloMystery website and the sale of products in the form of mystery boxes. By placing an order, you accept that boxes are sold as “mystery”: contents are not visible in advance and cannot be selected in detail, unless otherwise stated on the product page.",

    companyTitle: "Seller information",
    companyIntro: "This website is operated by:",
    companyItems: [
      "Legal name: KILO MYSTERY SRLS",
      "VAT number: 02794550745",
      "Registered and operational address: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italy",
      "Email: sales@kilomystery.com",
      "Phone: +39 353 492 3350",
      "Support hours: Monday–Friday, 9:00 AM–6:00 PM",
    ],

    contractTitle: "How the contract is formed",
    contractItems: [
      "Information and prices shown on the website are an invitation to treat.",
      "The contract is formed when you receive the order confirmation email (or when the order is shown as confirmed in your account, if available).",
      "We may refuse or cancel orders in case of obvious errors (e.g., clearly wrong price), unavailability, suspected fraud, or incomplete/incorrect data.",
    ],

    purchaseTitle: "Prices, payments and invoicing",
    purchaseItems: [
      "Prices are shown in EUR and include VAT unless stated otherwise.",
      "Any shipping costs are displayed before checkout confirmation.",
      "Payments are handled by trusted third-party providers; we do not store full card details.",
      "If payment fails or is unauthorized, the order may be cancelled.",
    ],

    shippingTitle: "Shipping, delivery and risk",
    shippingItems: [
      "Delivery times shown on the website are estimates and may vary due to factors not directly attributable to us (couriers, holidays, checks).",
      "When your order is handed to the carrier, you will receive tracking (if available).",
      "Risk of loss or damage transfers to the consumer upon delivery (or when a third party designated by the consumer takes possession).",
    ],

    mysteryTitle: "“Mystery” nature of the boxes",
    mysteryText:
      "KiloMystery Boxes have non-predetermined contents. We do not guarantee specific brands, models or categories unless explicitly stated on the product page. Images are for illustration purposes. Consumer rights (withdrawal, legal warranty, non-conformity protections) remain unaffected.",

    withdrawalTitle: "Withdrawal, returns & refunds",
    withdrawalText:
      "If you purchase as a consumer, you may withdraw within 14 days from delivery and request a return/refund according to our Return Policy.",
    withdrawalCta: "Read the Return Policy",

    warrantyTitle: "Legal warranty & non-conformity",
    warrantyText:
      "Consumers benefit from the legal warranty of conformity under applicable law. If something is wrong, contact us and we will evaluate the most appropriate solution (e.g., replacement, refund or other legal remedies).",

    liabilityTitle: "Limitation of liability",
    liabilityP1:
      "The website and services are provided “as is”. We strive to keep the platform operational and updated, but we cannot guarantee the complete absence of interruptions, technical errors or delays caused by third parties (providers, couriers, payment gateways).",
    liabilityP2:
      "To the extent permitted by law, we are not liable for indirect or consequential damages arising from the use of the website or delays not directly attributable to us. Nothing in these terms limits mandatory consumer rights.",

    lawTitle: "Governing law & jurisdiction",
    lawP1:
      "These terms are governed by Italian law. Where consumer rules apply, the competent court is that of the consumer; otherwise, jurisdiction is determined under applicable law.",
  },

  es: {
    heroTitle: "Términos y Condiciones",
    heroSubtitle:
      "Reglas claras para usar el sitio y comprar KiloMystery Boxes. 📜",
    lastUpdateLabel: "Última actualización",

    objectTitle: "Objeto",
    objectText:
      "Estas condiciones regulan el acceso y uso del sitio KiloMystery y la venta de productos en forma de mystery box. Al realizar un pedido aceptas que las cajas se venden como “mystery”: su contenido no se muestra por adelantado y no puede seleccionarse en detalle, salvo indicación expresa en la página del producto.",

    companyTitle: "Información del vendedor",
    companyIntro: "Este sitio web es gestionado por:",
    companyItems: [
      "Razón social: KILO MYSTERY SRLS",
      "Número de IVA: 02794550745",
      "Dirección legal y operativa: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italia",
      "Email: sales@kilomystery.com",
      "Teléfono: +39 353 492 3350",
      "Horario de atención: Lunes–Viernes, 09:00–18:00",
    ],

    contractTitle: "Cómo se perfecciona el contrato",
    contractItems: [
      "La información y los precios del sitio constituyen una invitación a contratar.",
      "El contrato se considera perfeccionado cuando recibes el email de confirmación del pedido (o cuando el pedido aparece como confirmado en tu cuenta, si existe).",
      "Podemos rechazar o cancelar pedidos por errores manifiestos (p. ej., precio claramente erróneo), falta de disponibilidad, sospecha de fraude o datos incompletos/incorrectos.",
    ],

    purchaseTitle: "Precios, pagos y facturación",
    purchaseItems: [
      "Los precios se muestran en EUR e incluyen IVA salvo indicación contraria.",
      "Los gastos de envío se muestran antes de confirmar el pago.",
      "Los pagos se gestionan mediante proveedores externos de confianza; no almacenamos los datos completos de tu tarjeta.",
      "Si el pago falla o no está autorizado, el pedido puede cancelarse.",
    ],

    shippingTitle: "Envío, entrega y riesgo",
    shippingItems: [
      "Los plazos de entrega mostrados son estimaciones y pueden variar por causas no directamente atribuibles a nosotros (transportistas, festivos, controles).",
      "Cuando el pedido se entregue al transportista, recibirás seguimiento (si está disponible).",
      "El riesgo de pérdida o daño se transmite al consumidor en el momento de la entrega.",
    ],

    mysteryTitle: "Naturaleza “mystery”",
    mysteryText:
      "Las KiloMystery Boxes tienen contenido no predeterminado. No garantizamos marcas/modelos/categorías concretas salvo indicación expresa en la página del producto. Las imágenes son orientativas. No se ven afectados los derechos del consumidor (desistimiento, garantía legal y protección por no conformidad).",

    withdrawalTitle: "Desistimiento, devoluciones y reembolsos",
    withdrawalText:
      "Si compras como consumidor, puedes desistir dentro de los 14 días desde la entrega y solicitar devolución/reembolso según nuestra Política de Devoluciones.",
    withdrawalCta: "Leer Política de Devoluciones",

    warrantyTitle: "Garantía legal y no conformidad",
    warrantyText:
      "A los consumidores se les aplica la garantía legal de conformidad conforme a la normativa vigente. Si surge un problema, contáctanos y evaluaremos la solución más adecuada (p. ej., sustitución, reembolso u otras medidas legales).",

    liabilityTitle: "Limitación de responsabilidad",
    liabilityP1:
      "El sitio y los servicios se ofrecen “tal cual”. Nos esforzamos por mantener la plataforma operativa, pero no garantizamos la ausencia total de interrupciones, errores técnicos o retrasos de terceros (proveedores, transportistas, pasarelas de pago).",
    liabilityP2:
      "En la medida permitida por la ley, no seremos responsables de daños indirectos o consecuentes. Nada en estas condiciones limita derechos obligatorios del consumidor.",

    lawTitle: "Ley aplicable y jurisdicción",
    lawP1:
      "Estas condiciones se rigen por la ley italiana. Cuando se aplica la normativa de consumidores, la jurisdicción competente es la del consumidor; en otros casos, se determina conforme a la ley aplicable.",
  },

  fr: {
    heroTitle: "Termes et Conditions",
    heroSubtitle:
      "Règles claires pour utiliser le site et acheter des KiloMystery Boxes. 📜",
    lastUpdateLabel: "Dernière mise à jour",

    objectTitle: "Objet",
    objectText:
      "Les présentes conditions régissent l’accès et l’utilisation du site KiloMystery ainsi que la vente de produits sous forme de mystery box. En passant commande, tu acceptes que les box soient vendues comme « mystery » : leur contenu n’est pas visible à l’avance et ne peut pas être choisi dans le détail, sauf indication contraire sur la page produit.",

    companyTitle: "Informations sur le vendeur",
    companyIntro: "Ce site est exploité par :",
    companyItems: [
      "Raison sociale : KILO MYSTERY SRLS",
      "Numéro de TVA : 02794550745",
      "Adresse légale et opérationnelle : P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italie",
      "Email : sales@kilomystery.com",
      "Téléphone : +39 353 492 3350",
      "Horaires : Lundi–Vendredi, 09h00–18h00",
    ],

    contractTitle: "Formation du contrat",
    contractItems: [
      "Les informations et prix affichés constituent une invitation à contracter.",
      "Le contrat est formé lorsque tu reçois l’email de confirmation de commande (ou lorsque la commande apparaît comme confirmée dans ton compte, si disponible).",
      "Nous pouvons refuser/annuler une commande en cas d’erreur manifeste (ex. prix manifestement erroné), d’indisponibilité, de suspicion de fraude ou de données incomplètes/incorrectes.",
    ],

    purchaseTitle: "Prix, paiements et facturation",
    purchaseItems: [
      "Les prix sont indiqués en EUR et incluent la TVA sauf mention contraire.",
      "Les frais de livraison éventuels sont affichés avant la validation du paiement.",
      "Les paiements sont gérés par des prestataires tiers de confiance ; nous ne stockons pas l’intégralité des données de carte.",
      "En cas d’échec ou de non-autorisation du paiement, la commande peut être annulée.",
    ],

    shippingTitle: "Livraison, expédition et transfert des risques",
    shippingItems: [
      "Les délais de livraison affichés sont indicatifs et peuvent varier (transporteurs, jours fériés, contrôles).",
      "Lorsque la commande est remise au transporteur, tu reçois un suivi (si disponible).",
      "Le risque de perte/dommage est transféré au consommateur au moment de la livraison.",
    ],

    mysteryTitle: "Nature « mystery »",
    mysteryText:
      "Les KiloMystery Boxes ont un contenu non prédéterminé. Nous ne garantissons pas de marques/modèles/catégories spécifiques sauf mention explicite sur la page produit. Les images sont illustratives. Les droits du consommateur (rétractation, garantie légale, non-conformité) restent applicables.",

    withdrawalTitle: "Rétractation, retours et remboursements",
    withdrawalText:
      "Si tu achètes en tant que consommateur, tu peux exercer ton droit de rétractation dans les 14 jours suivant la livraison et demander un retour/remboursement selon notre Politique de retours.",
    withdrawalCta: "Lire la Politique de retours",

    warrantyTitle: "Garantie légale et non-conformité",
    warrantyText:
      "Les consommateurs bénéficient de la garantie légale de conformité prévue par la réglementation applicable. En cas de problème, contacte-nous : nous évaluerons la solution la plus appropriée (remplacement, remboursement ou autre recours légal).",

    liabilityTitle: "Limitation de responsabilité",
    liabilityP1:
      "Le site et les services sont fournis « en l’état ». Nous faisons le maximum pour maintenir la plateforme opérationnelle, sans pouvoir garantir l’absence totale d’interruptions, d’erreurs techniques ou de retards dus à des tiers (prestataires, transporteurs, passerelles de paiement).",
    liabilityP2:
      "Dans les limites autorisées par la loi, nous ne sommes pas responsables des dommages indirects/consécutifs. Rien dans ces conditions ne limite les droits impératifs du consommateur.",

    lawTitle: "Droit applicable & juridiction",
    lawP1:
      "Les présentes conditions sont régies par le droit italien. Lorsque le droit de la consommation s’applique, le tribunal compétent est celui du consommateur ; sinon, la compétence est déterminée selon la loi applicable.",
  },

  de: {
    heroTitle: "Allgemeine Geschäftsbedingungen",
    heroSubtitle:
      "Klare Regeln für die Nutzung der Website und den Kauf von KiloMystery Boxen. 📜",
    lastUpdateLabel: "Letzte Aktualisierung",

    objectTitle: "Gegenstand",
    objectText:
      "Diese Bedingungen regeln den Zugriff auf und die Nutzung der KiloMystery-Website sowie den Verkauf von Produkten in Form von Mystery-Boxen. Mit der Bestellung akzeptierst du, dass Boxen als „Mystery“ verkauft werden: Der Inhalt ist im Voraus nicht sichtbar und kann nicht im Detail ausgewählt werden, sofern auf der Produktseite nicht anders angegeben.",

    companyTitle: "Informationen zum Verkäufer",
    companyIntro: "Diese Website wird betrieben von:",
    companyItems: [
      "Firmenname: KILO MYSTERY SRLS",
      "USt-IdNr.: 02794550745",
      "Rechts- und Geschäftsadresse: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italien",
      "E-Mail: sales@kilomystery.com",
      "Telefon: +39 353 492 3350",
      "Supportzeiten: Montag–Freitag, 09:00–18:00",
    ],

    contractTitle: "Vertragsschluss",
    contractItems: [
      "Die Informationen und Preise auf der Website stellen eine Aufforderung zur Abgabe eines Angebots dar.",
      "Der Vertrag kommt zustande, wenn du die Bestellbestätigung per E-Mail erhältst (oder wenn die Bestellung in deinem Konto als bestätigt angezeigt wird, sofern verfügbar).",
      "Wir können Bestellungen bei offensichtlichen Fehlern (z. B. eindeutig falscher Preis), Nichtverfügbarkeit, Betrugsverdacht oder unvollständigen/fehlerhaften Daten ablehnen oder stornieren.",
    ],

    purchaseTitle: "Preise, Zahlung und Abrechnung",
    purchaseItems: [
      "Preise sind in EUR angegeben und enthalten die MwSt., sofern nicht anders angegeben.",
      "Eventuelle Versandkosten werden vor Abschluss der Bestellung angezeigt.",
      "Zahlungen werden über vertrauenswürdige Drittanbieter abgewickelt; wir speichern keine vollständigen Kartendaten.",
      "Bei fehlgeschlagener oder nicht autorisierter Zahlung kann die Bestellung storniert werden.",
    ],

    shippingTitle: "Versand, Lieferung und Gefahrübergang",
    shippingItems: [
      "Angegebene Lieferzeiten sind Schätzungen und können variieren (z. B. durch Versanddienstleister, Feiertage, Kontrollen).",
      "Wenn die Bestellung dem Versanddienstleister übergeben wird, erhältst du (falls verfügbar) eine Sendungsverfolgung.",
      "Die Gefahr des Verlusts oder der Beschädigung geht bei Lieferung auf den Verbraucher über.",
    ],

    mysteryTitle: "„Mystery“-Charakter der Boxen",
    mysteryText:
      "KiloMystery Boxen haben nicht vorab festgelegte Inhalte. Wir garantieren keine bestimmten Marken/Modelle/Kategorien, sofern dies nicht ausdrücklich auf der Produktseite angegeben ist. Bilder dienen der Veranschaulichung. Verbraucherrechte (Widerruf, gesetzliche Gewährleistung, Nichtkonformität) bleiben unberührt.",

    withdrawalTitle: "Widerruf, Rückgabe und Erstattung",
    withdrawalText:
      "Wenn du als Verbraucher kaufst, kannst du innerhalb von 14 Tagen nach Lieferung widerrufen und gemäß unserer Rückgaberichtlinie eine Rückgabe/Erstattung beantragen.",
    withdrawalCta: "Rückgaberichtlinie lesen",

    warrantyTitle: "Gesetzliche Gewährleistung & Nichtkonformität",
    warrantyText:
      "Für Verbraucher gilt die gesetzliche Gewährleistung nach anwendbarem Recht. Bei Problemen kontaktiere uns – wir prüfen die passende Lösung (z. B. Ersatz, Erstattung oder andere gesetzliche Rechtsbehelfe).",

    liabilityTitle: "Haftungsbeschränkung",
    liabilityP1:
      "Die Website und Dienste werden „wie besehen“ bereitgestellt. Wir bemühen uns um einen stabilen Betrieb, können jedoch keine vollständige Freiheit von Unterbrechungen, technischen Fehlern oder Verzögerungen durch Dritte (Provider, Versanddienstleister, Payment-Gateways) garantieren.",
    liabilityP2:
      "Soweit gesetzlich zulässig, haften wir nicht für indirekte oder Folgeschäden. Nichts in diesen Bedingungen beschränkt zwingende Verbraucherrechte.",

    lawTitle: "Anwendbares Recht & Gerichtsstand",
    lawP1:
      "Diese Bedingungen unterliegen italienischem Recht. Soweit Verbraucherschutzrecht anwendbar ist, ist das Gericht am Wohnsitz des Verbrauchers zuständig; andernfalls richtet sich die Zuständigkeit nach dem anwendbaren Recht.",
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
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 md:p-8">
          <div className="mx-auto mb-6 md:mb-8 w-[220px] md:w-[320px]">
            <Image
              src="/logo.svg"
              alt="KiloMystery"
              width={320}
              height={180}
              className="w-full h-auto drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
              priority
            />
          </div>

          <h1 className="section-title text-center text-3xl md:text-4xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
              {t.heroTitle}
            </span>
          </h1>

          <p className="text-center text-white/70 mt-3 text-sm">
            {t.lastUpdateLabel}: <b>{today}</b>
          </p>

          <p className="text-center text-white/60 text-xs mt-2 max-w-3xl mx-auto">
            {t.heroSubtitle}
          </p>
        </section>

        <section className="space-y-5">
          {/* SCOPE */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.objectTitle}</span>
              <span>📌</span>
            </h2>
            <p className="text-white/70 text-sm">{t.objectText}</p>
          </article>

          {/* COMPANY */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.companyTitle}</span>
              <span>🏢</span>
            </h2>
            <p className="text-white/70 text-sm">{t.companyIntro}</p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.companyItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </article>

          {/* CONTRACT */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.contractTitle}</span>
              <span>🤝</span>
            </h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.contractItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </article>

          {/* PURCHASE */}
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

          {/* SHIPPING */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.shippingTitle}</span>
              <span>📦</span>
            </h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.shippingItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </article>

          {/* MYSTERY */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.mysteryTitle}</span>
              <span>🎁</span>
            </h2>
            <p className="text-white/70 text-sm">{t.mysteryText}</p>
          </article>

          {/* WITHDRAWAL */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.withdrawalTitle}</span>
              <span>🧾</span>
            </h2>
            <p className="text-white/70 text-sm">
              {t.withdrawalText}{" "}
              <a href={`/${lang}/returns`} className="btn-link">
                {t.withdrawalCta}
              </a>
              .
            </p>
          </article>

          {/* WARRANTY */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.warrantyTitle}</span>
              <span>✅</span>
            </h2>
            <p className="text-white/70 text-sm">{t.warrantyText}</p>
          </article>

          {/* LIABILITY */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.liabilityTitle}</span>
              <span>⚠️</span>
            </h2>
            <p className="text-white/70 text-sm">{t.liabilityP1}</p>
            <p className="text-white/70 text-sm">{t.liabilityP2}</p>
          </article>

          {/* LAW */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.lawTitle}</span>
              <span>⚖️</span>
            </h2>
            <p className="text-white/70 text-sm">
              {t.lawP1}{" "}
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
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}