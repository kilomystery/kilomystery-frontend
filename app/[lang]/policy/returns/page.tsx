/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

export const metadata: Metadata = {
  title: "Politica Resi",
};

type Copy = {
  heroTitle: string;
  heroSubtitle: string;
  lastUpdateLabel: string;

  introTitle: string;
  introText: string;

  noReturnTitle: string;
  noReturnIntro: string;
  noReturnItems: string[];

  allowedTitle: string;
  allowedIntro: string;
  allowedItems: string[];

  processTitle: string;
  processIntro: string;
  processItems: string[];
  processOutro: string;

  refundsTitle: string;
  refundsText: string;

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
    heroTitle: "Politica resi e segnalazioni",
    heroSubtitle:
      "Le nostre mystery box contengono pacchi smarriti, resi e stock non reclamati: il contenuto è casuale, non testato e venduto come esperienza di acquisto sorpresa. 📦",
    lastUpdateLabel: "Ultimo aggiornamento",

    introTitle: "Natura del prodotto",
    introText:
      "KiloMystery vende mystery box composte da pacchi smarriti postali, resi non reclamati e stock logistici. Il contenuto non è noto in anticipo, non è selezionabile dal cliente e non viene testato singolarmente prima della vendita. Acquistando una mystery box, il cliente accetta la natura casuale del contenuto e la possibilità che gli articoli possano presentare confezioni non perfette, segni di usura, componenti mancanti o non risultare funzionanti.",

    noReturnTitle: "Casi in cui non accettiamo resi o richieste di rimborso",
    noReturnIntro:
      "Proprio per la natura del prodotto venduto, non accettiamo resi, rimborsi o contestazioni basati su elementi soggettivi o legati ai singoli articoli contenuti nella box. In particolare, non accettiamo richieste motivate da:",
    noReturnItems: [
      "mancato funzionamento di uno o più articoli contenuti nella mystery box;",
      "presenza di articoli usati, incompleti, con scatola rovinata o packaging non perfetto;",
      "contenuto ritenuto di valore inferiore alle aspettative personali;",
      "assenza di una categoria specifica di prodotto desiderata;",
      "difetti estetici, accessori mancanti o condizioni del singolo articolo non note prima dell'apertura;",
      "valutazioni basate sul valore percepito del singolo prodotto invece che sull'esperienza complessiva della box.",
    ],

    allowedTitle: "Casi in cui è possibile aprire una segnalazione",
    allowedIntro:
      "Restano salve le tutele previste dalla legge nei casi effettivamente imputabili alla spedizione o a un errore materiale. Possiamo quindi valutare una segnalazione nei seguenti casi:",
    allowedItems: [
      "pacco non consegnato o consegna anomala risultante dal tracking;",
      "box ricevuta visibilmente manomessa o aperta prima della consegna;",
      "imballo esterno gravemente danneggiato al momento dell'arrivo;",
      "errore evidente nell'ordine spedito (ad esempio peso o tipologia acquistata completamente diversa da quella ricevuta);",
      "anomalia documentabile relativa al trasporto o al lotto ricevuto.",
    ],

    processTitle: "Come aprire una segnalazione",
    processIntro: "Per consentirci di verificare correttamente il caso, ti chiediamo di:",
    processItems: [
      "contattarci entro 48 ore dalla consegna in caso di danni, manomissioni o anomalie evidenti;",
      "indicare numero ordine e descrizione chiara del problema riscontrato;",
      "allegare foto nitide dell'imballo esterno, dell'etichetta di spedizione, della box e dell'eventuale anomalia;",
      "attendere le istruzioni del nostro servizio clienti prima di spedire qualsiasi reso.",
    ],
    processOutro:
      "Le richieste incomplete, prive di documentazione fotografica o riferite al semplice funzionamento/valore dei singoli prodotti contenuti nella mystery box potrebbero non essere accettate. L’eventuale indirizzo di rientro viene fornito esclusivamente via email dopo apertura e valutazione della pratica.",

    refundsTitle: "Rimborsi",
    refundsText:
      "Eventuali rimborsi, sostituzioni o buoni acquisto vengono valutati esclusivamente dopo verifica del caso da parte del nostro team. Non è previsto alcun rimborso automatico per articoli singoli non funzionanti, per contenuto non gradito o per differenze rispetto alle aspettative personali. Qualora una segnalazione venga accolta, la soluzione verrà definita caso per caso.",

    legalTitle: "Dati aziendali e contatti",
    legalIntro:
      "Per qualsiasi segnalazione relativa a spedizione, consegna o anomalie documentabili, puoi contattarci ai seguenti recapiti.",
    legalName: "Ragione sociale: KILO MYSTERY SRLS",
    legalVat: "Partita IVA: 02794550745",
    legalAddress:
      "Sede legale e operativa: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italia",
    legalEmail: "Email assistenza: sales@kilomystery.com",
    legalPhone: "Telefono: +39 353 492 3350",
    legalHours: "Orari assistenza: Lunedì–Venerdì, 09:00–18:00",
  },

  en: {
    heroTitle: "Returns & claims policy",
    heroSubtitle:
      "Our mystery boxes contain lost parcels, unclaimed returns and logistics stock: contents are random, untested and sold as a surprise buying experience. 📦",
    lastUpdateLabel: "Last update",

    introTitle: "Product nature",
    introText:
      "KiloMystery sells mystery boxes made up of lost postal parcels, unclaimed returns and logistics stock. Contents are unknown in advance, cannot be selected by the customer and are not individually tested before sale. By purchasing a mystery box, the customer accepts the random nature of the contents and the possibility that items may have imperfect packaging, signs of use, missing components or may not be working.",

    noReturnTitle: "Cases where we do not accept returns or refunds",
    noReturnIntro:
      "Due to the nature of the product sold, we do not accept returns, refunds or disputes based on subjective expectations or on individual items inside the box. In particular, we do not accept claims based on:",
    noReturnItems: [
      "one or more items inside the mystery box not working;",
      "used items, incomplete items, damaged retail boxes or imperfect packaging;",
      "contents considered lower in value than personal expectations;",
      "absence of a specific desired product category;",
      "cosmetic defects, missing accessories or unknown condition of individual items after opening;",
      "evaluations based on the perceived value of a single item rather than the overall mystery box experience.",
    ],

    allowedTitle: "Cases where a claim can be opened",
    allowedIntro:
      "Legal protections remain in place for issues actually caused by shipping or material order errors. We may therefore review claims in the following cases:",
    allowedItems: [
      "parcel not delivered or anomalous delivery shown by tracking;",
      "box visibly tampered with or opened before delivery;",
      "outer packaging severely damaged on arrival;",
      "clear shipping error (for example, completely different purchased weight or type than received);",
      "documentable anomaly related to shipping or the received batch.",
    ],

    processTitle: "How to open a claim",
    processIntro: "To allow us to review the case properly, please:",
    processItems: [
      "contact us within 48 hours of delivery in case of damage, tampering or clear anomalies;",
      "provide your order number and a clear description of the issue;",
      "attach clear photos of the outer packaging, shipping label, box and the reported anomaly;",
      "wait for our customer service instructions before sending any return.",
    ],
    processOutro:
      "Requests that are incomplete, lack photo documentation, or are based solely on the functioning/value of individual products inside the mystery box may not be accepted. Any return address is provided by email only after the case has been opened and reviewed.",

    refundsTitle: "Refunds",
    refundsText:
      "Any refund, replacement or store credit is assessed only after case review by our team. No automatic refund is provided for single non-working items, unwanted contents or differences from personal expectations. If a claim is accepted, the solution is determined case by case.",

    legalTitle: "Company details & contacts",
    legalIntro:
      "For any claim relating to shipping, delivery or documentable anomalies, you can contact us using the details below.",
    legalName: "Legal name: KILO MYSTERY SRLS",
    legalVat: "VAT number: 02794550745",
    legalAddress:
      "Registered and operational address: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italy",
    legalEmail: "Support email: sales@kilomystery.com",
    legalPhone: "Phone: +39 353 492 3350",
    legalHours: "Support hours: Monday–Friday, 9:00 AM–6:00 PM",
  },

  es: {
    heroTitle: "Política de devoluciones y reclamaciones",
    heroSubtitle:
      "Nuestras mystery box contienen paquetes perdidos, devoluciones no reclamadas y stock logístico: el contenido es aleatorio, no probado y se vende como una experiencia sorpresa. 📦",
    lastUpdateLabel: "Última actualización",

    introTitle: "Naturaleza del producto",
    introText:
      "KiloMystery vende mystery box compuestas por paquetes postales perdidos, devoluciones no reclamadas y stock logístico. El contenido no se conoce de antemano, no puede seleccionarse por el cliente y no se prueba individualmente antes de la venta. Al comprar una mystery box, el cliente acepta la naturaleza aleatoria del contenido y la posibilidad de que los artículos tengan embalaje imperfecto, signos de uso, componentes faltantes o no funcionen.",

    noReturnTitle: "Casos en los que no aceptamos devoluciones ni reembolsos",
    noReturnIntro:
      "Debido a la naturaleza del producto vendido, no aceptamos devoluciones, reembolsos ni reclamaciones basadas en expectativas subjetivas o en artículos individuales dentro de la caja. En particular, no aceptamos reclamaciones por:",
    noReturnItems: [
      "uno o más artículos de la mystery box que no funcionen;",
      "artículos usados, incompletos, con caja dañada o embalaje imperfecto;",
      "contenido considerado de menor valor que las expectativas personales;",
      "ausencia de una categoría de producto específica deseada;",
      "defectos estéticos, accesorios faltantes o estado desconocido de artículos individuales tras la apertura;",
      "valoraciones basadas en el valor percibido de un solo artículo en vez de la experiencia global de la box.",
    ],

    allowedTitle: "Casos en los que sí puede abrirse una reclamación",
    allowedIntro:
      "Se mantienen las protecciones legales en casos realmente imputables al envío o a un error material del pedido. Por tanto, podremos valorar reclamaciones en los siguientes casos:",
    allowedItems: [
      "paquete no entregado o entrega anómala según el tracking;",
      "box visiblemente manipulada o abierta antes de la entrega;",
      "embalaje exterior gravemente dañado al llegar;",
      "error evidente en el pedido enviado (por ejemplo, peso o tipo completamente distinto al comprado);",
      "anomalía documentable relacionada con el transporte o el lote recibido.",
    ],

    processTitle: "Cómo abrir una reclamación",
    processIntro: "Para que podamos revisar correctamente el caso, le pedimos que:",
    processItems: [
      "nos contacte dentro de las 48 horas posteriores a la entrega en caso de daños, manipulación o anomalías evidentes;",
      "indique el número de pedido y una descripción clara del problema;",
      "adjunte fotos claras del embalaje exterior, la etiqueta de envío, la box y la anomalía reportada;",
      "espere las instrucciones de nuestro servicio de atención al cliente antes de enviar cualquier devolución.",
    ],
    processOutro:
      "Las solicitudes incompletas, sin documentación fotográfica o referidas únicamente al funcionamiento/valor de productos individuales dentro de la mystery box pueden no ser aceptadas. La dirección de devolución solo se facilita por email tras abrir y revisar la incidencia.",

    refundsTitle: "Reembolsos",
    refundsText:
      "Cualquier reembolso, sustitución o saldo en tienda se valora únicamente tras la revisión del caso por nuestro equipo. No se prevé ningún reembolso automático por artículos individuales que no funcionen, contenido no deseado o diferencias respecto a expectativas personales. Si una reclamación es aceptada, la solución se definirá caso por caso.",

    legalTitle: "Datos de la empresa y contacto",
    legalIntro:
      "Para cualquier reclamación relacionada con envío, entrega o anomalías documentables, puede contactarnos en los siguientes canales.",
    legalName: "Razón social: KILO MYSTERY SRLS",
    legalVat: "Número de IVA: 02794550745",
    legalAddress:
      "Dirección legal y operativa: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italia",
    legalEmail: "Email de soporte: sales@kilomystery.com",
    legalPhone: "Teléfono: +39 353 492 3350",
    legalHours: "Horario de atención: Lunes–Viernes, 09:00–18:00",
  },

  fr: {
    heroTitle: "Politique de retours et réclamations",
    heroSubtitle:
      "Nos mystery box contiennent des colis perdus, des retours non réclamés et des stocks logistiques : le contenu est aléatoire, non testé et vendu comme une expérience surprise. 📦",
    lastUpdateLabel: "Dernière mise à jour",

    introTitle: "Nature du produit",
    introText:
      "KiloMystery vend des mystery box composées de colis postaux perdus, de retours non réclamés et de stocks logistiques. Le contenu n’est pas connu à l’avance, n’est pas sélectionnable par le client et n’est pas testé individuellement avant la vente. En achetant une mystery box, le client accepte la nature aléatoire du contenu et la possibilité que les articles présentent un emballage imparfait, des traces d’usage, des composants manquants ou ne fonctionnent pas.",

    noReturnTitle: "Cas dans lesquels nous n’acceptons pas les retours ni remboursements",
    noReturnIntro:
      "En raison de la nature du produit vendu, nous n’acceptons pas les retours, remboursements ou contestations fondés sur des attentes subjectives ou sur des articles individuels présents dans la box. En particulier, nous n’acceptons pas les demandes liées à :",
    noReturnItems: [
      "un ou plusieurs articles de la mystery box non fonctionnels ;",
      "des articles usagés, incomplets, avec boîte abîmée ou emballage imparfait ;",
      "un contenu jugé d’une valeur inférieure aux attentes personnelles ;",
      "l’absence d’une catégorie de produit spécifique souhaitée ;",
      "des défauts esthétiques, accessoires manquants ou état inconnu d’articles individuels après ouverture ;",
      "des évaluations fondées sur la valeur perçue d’un seul article plutôt que sur l’expérience globale de la box.",
    ],

    allowedTitle: "Cas dans lesquels une réclamation peut être ouverte",
    allowedIntro:
      "Les protections légales restent applicables dans les cas réellement imputables à la livraison ou à une erreur matérielle de commande. Nous pouvons donc examiner une réclamation dans les cas suivants :",
    allowedItems: [
      "colis non livré ou livraison anormale selon le suivi ;",
      "box visiblement ouverte ou altérée avant la livraison ;",
      "emballage extérieur gravement endommagé à l’arrivée ;",
      "erreur manifeste dans la commande expédiée (par exemple poids ou type totalement différent de celui acheté) ;",
      "anomalie documentable liée au transport ou au lot reçu.",
    ],

    processTitle: "Comment ouvrir une réclamation",
    processIntro: "Pour nous permettre de vérifier correctement le dossier, merci de :",
    processItems: [
      "nous contacter dans les 48 heures suivant la livraison en cas de dommage, altération ou anomalie évidente ;",
      "indiquer le numéro de commande et une description claire du problème ;",
      "joindre des photos nettes de l’emballage extérieur, de l’étiquette d’expédition, de la box et de l’anomalie signalée ;",
      "attendre les instructions de notre service client avant tout renvoi.",
    ],
    processOutro:
      "Les demandes incomplètes, sans preuve photo, ou fondées uniquement sur le fonctionnement/la valeur des produits individuels contenus dans la mystery box peuvent ne pas être acceptées. L’adresse de retour est communiquée uniquement par email après ouverture et examen du dossier.",

    refundsTitle: "Remboursements",
    refundsText:
      "Tout remboursement, remplacement ou avoir est évalué uniquement après examen du dossier par notre équipe. Aucun remboursement automatique n’est prévu pour des articles individuels non fonctionnels, un contenu non apprécié ou des différences par rapport aux attentes personnelles. Si une réclamation est acceptée, la solution sera définie au cas par cas.",

    legalTitle: "Informations légales et contacts",
    legalIntro:
      "Pour toute réclamation relative à l’expédition, à la livraison ou à une anomalie documentable, vous pouvez nous contacter via les coordonnées ci-dessous.",
    legalName: "Raison sociale : KILO MYSTERY SRLS",
    legalVat: "Numéro de TVA : 02794550745",
    legalAddress:
      "Adresse légale et opérationnelle : P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italie",
    legalEmail: "Email du support : sales@kilomystery.com",
    legalPhone: "Téléphone : +39 353 492 3350",
    legalHours: "Horaires : Lundi–Vendredi, 09h00–18h00",
  },

  de: {
    heroTitle: "Rückgabe- und Reklamationsrichtlinie",
    heroSubtitle:
      "Unsere Mystery Boxen enthalten verlorene Pakete, nicht abgeholte Retouren und Logistikbestände: der Inhalt ist zufällig, ungetestet und wird als Überraschungserlebnis verkauft. 📦",
    lastUpdateLabel: "Letzte Aktualisierung",

    introTitle: "Produktcharakter",
    introText:
      "KiloMystery verkauft Mystery Boxen aus verlorenen Postpaketen, nicht abgeholten Retouren und Logistikbeständen. Der Inhalt ist vorab nicht bekannt, nicht auswählbar und wird vor dem Verkauf nicht einzeln getestet. Mit dem Kauf einer Mystery Box akzeptiert der Kunde den zufälligen Charakter des Inhalts und die Möglichkeit, dass Artikel beschädigte Verpackungen, Gebrauchsspuren, fehlende Teile haben oder nicht funktionieren.",

    noReturnTitle: "Fälle, in denen wir keine Rückgabe oder Erstattung akzeptieren",
    noReturnIntro:
      "Aufgrund der Art des verkauften Produkts akzeptieren wir keine Rückgaben, Erstattungen oder Beanstandungen, die auf subjektiven Erwartungen oder einzelnen Artikeln innerhalb der Box beruhen. Insbesondere akzeptieren wir keine Ansprüche wegen:",
    noReturnItems: [
      "eines oder mehrerer nicht funktionierender Artikel in der Mystery Box;",
      "gebrauchter, unvollständiger Artikel, beschädigter Verkaufsverpackungen oder unperfekter Verpackung;",
      "eines Inhalts, der als weniger wertvoll als erwartet angesehen wird;",
      "des Fehlens einer bestimmten gewünschten Produktkategorie;",
      "optischer Mängel, fehlender Zubehörteile oder unbekanntem Zustand einzelner Artikel nach dem Öffnen;",
      "Bewertungen auf Basis des wahrgenommenen Werts eines einzelnen Artikels statt des gesamten Mystery-Box-Erlebnisses.",
    ],

    allowedTitle: "Fälle, in denen eine Reklamation eröffnet werden kann",
    allowedIntro:
      "Gesetzliche Schutzrechte bleiben in Fällen bestehen, die tatsächlich durch Versand oder einen materiellen Bestellfehler verursacht wurden. Wir können daher Reklamationen in folgenden Fällen prüfen:",
    allowedItems: [
      "Paket nicht zugestellt oder auffällige Zustellung laut Tracking;",
      "sichtbar manipulierte oder bereits geöffnete Box vor Zustellung;",
      "äußere Verpackung bei Ankunft stark beschädigt;",
      "offensichtlicher Versandfehler (z. B. völlig anderes Gewicht oder andere Variante als bestellt);",
      "nachweisbare Auffälligkeit im Zusammenhang mit dem Transport oder dem erhaltenen Posten.",
    ],

    processTitle: "So eröffnest du eine Reklamation",
    processIntro: "Damit wir den Fall korrekt prüfen können, bitten wir dich:",
    processItems: [
      "uns innerhalb von 48 Stunden nach Zustellung bei Schäden, Manipulation oder klaren Auffälligkeiten zu kontaktieren;",
      "Bestellnummer und eine klare Problembeschreibung anzugeben;",
      "deutliche Fotos von Außenverpackung, Versandetikett, Box und gemeldeter Auffälligkeit beizufügen;",
      "vor einer Rücksendung auf die Anweisungen unseres Kundenservice zu warten.",
    ],
    processOutro:
      "Unvollständige Anfragen, Anfragen ohne Fotodokumentation oder Anfragen, die sich nur auf Funktion/Wert einzelner Produkte in der Mystery Box beziehen, können abgelehnt werden. Eine Rücksendeadresse wird ausschließlich per E-Mail nach Eröffnung und Prüfung des Vorgangs mitgeteilt.",

    refundsTitle: "Erstattungen",
    refundsText:
      "Erstattungen, Ersatz oder Guthaben werden ausschließlich nach Prüfung des Falls durch unser Team bewertet. Für einzelne nicht funktionierende Artikel, unerwünschten Inhalt oder Abweichungen von persönlichen Erwartungen erfolgt keine automatische Erstattung. Wird eine Reklamation anerkannt, wird die Lösung im Einzelfall festgelegt.",

    legalTitle: "Unternehmensdaten und Kontakt",
    legalIntro:
      "Bei Reklamationen zu Versand, Lieferung oder dokumentierbaren Auffälligkeiten kannst du uns über die folgenden Kontaktdaten erreichen.",
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
        {/* HERO - uguale stile home con logo */}
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

        <section className="grid gap-5 md:grid-cols-2">
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.introTitle}</span>
              <span>📦</span>
            </h2>
            <p className="text-white/70 text-sm">{t.introText}</p>

            <h3 className="font-bold mt-4 text-sm">{t.noReturnTitle}</h3>
            <p className="text-white/70 text-sm">{t.noReturnIntro}</p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.noReturnItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.allowedTitle}</span>
              <span>🛡️</span>
            </h2>
            <p className="text-white/70 text-sm">{t.allowedIntro}</p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.allowedItems.map((item, idx) => (
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