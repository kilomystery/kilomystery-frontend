/* eslint-disable react/no-unescaped-entities */

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

type CopyKey =
  | "kicker"
  | "title"
  | "subtitle"
  | "step1Title"
  | "step1Text"
  | "step2Title"
  | "step2Text"
  | "step3Title"
  | "step3Text"
  | "insideTitle"
  | "insideStdTitle"
  | "insideStdText"
  | "insidePrmTitle"
  | "insidePrmText"
  | "trustTitle"
  | "trustP1"
  | "trustP2"
  | "trustBullet1"
  | "trustBullet2"
  | "trustBullet3"
  | "ctaPrimary"
  | "ctaSecondary";

type CopyPerLang = Record<CopyKey, string>;

const HOW_COPY: Record<Lang, CopyPerLang> = {
  it: {
    kicker: "How it works",
    title: "Come funziona KiloMystery",
    subtitle:
      "Scegli il peso, aggiungi al carrello e ricevi la tua mystery box. Dal lotto al tracking, ti raccontiamo cosa succede dietro le quinte.",

    step1Title: "1. Scegli peso e tipologia",
    step1Text:
      "Decidi se partire dalla Standard o puntare sulla Premium. Ogni box è venduta al Kg, da 1 a 10 Kg, con peso netto e tolleranza controllata.",

    step2Title: "2. Pagamento e conferma ordine",
    step2Text:
      "Completa il checkout con i metodi di pagamento disponibili. Ricevi subito una mail con il riepilogo e i dati del tuo ordine.",

    step3Title: "3. Preparazione, sigillo e tracking",
    step3Text:
      "Il tuo lotto viene preparato, pesato e sigillato. Applichiamo l'etichetta con ID lotto e, appena parte la spedizione, ricevi il codice di tracking.",

    insideTitle: "Cosa puoi trovare dentro le box",
    insideStdTitle: "Standard — il modo più semplice per iniziare",
    insideStdText:
      "Mix bilanciato di prodotti provenienti da pacchi smarriti, resi non reclamati e stock fermi. Ideale per provare l'esperienza KiloMystery senza pensarci troppo.",

    insidePrmTitle: "Premium — per chi vuole il massimo",
    insidePrmText:
      "Selezione più spinta di lotti e maggiore probabilità di articoli di fascia medio–alta. Perfetta se vuoi un unboxing ancora più “spinto”.",

    trustTitle: "Trasparenza, tracciabilità e sostenibilità",
    trustP1:
      "Ogni box nasce da un lotto reale: non inventiamo il contenuto, lo recuperiamo. Per questo su ogni box trovi un'etichetta con ID lotto e data di preparazione.",
    trustP2:
      "Recuperare pacchi già esistenti significa meno sprechi e meno CO₂ rispetto a produrre e spedire sempre merce nuova.",

    trustBullet1: "Peso netto con tolleranza ±3% verificata.",
    trustBullet2:
      "Sigillo anti-manomissione e ID lotto stampato in etichetta.",
    trustBullet3:
      "Nessun prodotto illegale o vietato: i contenuti sono sempre legali.",

    ctaPrimary: "Vai ai prodotti",
    ctaSecondary: "Scopri le spedizioni",
  },

  en: {
    kicker: "How it works",
    title: "How KiloMystery works",
    subtitle:
      "Choose the weight, add to cart and receive your mystery box. From batch to tracking, here is what happens behind the scenes.",

    step1Title: "1. Choose weight and type",
    step1Text:
      "Decide whether to start with Standard or go straight to Premium. Each box is sold by the kilo, from 1 to 10 Kg, with net weight and controlled tolerance.",

    step2Title: "2. Payment and order confirmation",
    step2Text:
      "Complete checkout using the available payment methods. You immediately receive an email with your order summary and details.",

    step3Title: "3. Preparation, seal and tracking",
    step3Text:
      "Your batch is prepared, weighed and sealed. We apply a label with the batch ID and, as soon as the parcel ships, you receive the tracking code.",

    insideTitle: "What you can find inside",
    insideStdTitle: "Standard — the easiest way to start",
    insideStdText:
      "Balanced mix of products coming from lost parcels, unclaimed returns and overstock. Perfect if you want to try the KiloMystery experience without overthinking it.",

    insidePrmTitle: "Premium — for those who want more",
    insidePrmText:
      "Stronger selection of lots and a higher chance of medium–high range items. Ideal if you want an even more intense unboxing.",

    trustTitle: "Transparency, traceability and sustainability",
    trustP1:
      "Every box starts from a real batch: we don’t invent the content, we recover it. That’s why each box has a label with batch ID and preparation date.",
    trustP2:
      "Recovering existing parcels means less waste and less CO₂ compared to constantly producing and shipping new goods.",

    trustBullet1: "Net weight with a verified ±3% tolerance.",
    trustBullet2:
      "Tamper-evident seal and printed batch ID on each label.",
    trustBullet3:
      "No illegal or prohibited items: contents are always legal.",

    ctaPrimary: "Go to products",
    ctaSecondary: "See shipping info",
  },

  es: {
    kicker: "How it works",
    title: "Cómo funciona KiloMystery",
    subtitle:
      "Elige el peso, añádelo al carrito y recibe tu mystery box. Del lote al tracking, te contamos qué pasa entre bambalinas.",

    step1Title: "1. Elige peso y tipo",
    step1Text:
      "Decide si quieres empezar con Standard o ir directo a Premium. Cada caja se vende por kilo, de 1 a 10 Kg, con peso neto y tolerancia controlada.",

    step2Title: "2. Pago y confirmación del pedido",
    step2Text:
      "Completa el checkout con los métodos de pago disponibles. Recibirás al momento un email con el resumen y los datos de tu pedido.",

    step3Title: "3. Preparación, precinto y tracking",
    step3Text:
      "Tu lote se prepara, se pesa y se precinta. Aplicamos la etiqueta con el ID de lote y, en cuanto sale el envío, recibes el código de seguimiento.",

    insideTitle: "Qué puedes encontrar dentro",
    insideStdTitle: "Standard — la forma más fácil de empezar",
    insideStdText:
      "Mix equilibrado de productos procedentes de paquetes perdidos, devoluciones no reclamadas y stock parado. Ideal para probar la experiencia KiloMystery sin complicarse.",

    insidePrmTitle: "Premium — para quienes quieren más",
    insidePrmText:
      "Selección más intensa de lotes y mayor probabilidad de artículos de gama media–alta. Perfecta si quieres un unboxing aún más potente.",

    trustTitle: "Transparencia, trazabilidad y sostenibilidad",
    trustP1:
      "Cada caja nace de un lote real: no inventamos el contenido, lo recuperamos. Por eso en cada caja verás una etiqueta con ID de lote y fecha de preparación.",
    trustP2:
      "Recuperar paquetes ya existentes significa menos residuos y menos CO₂ en comparación con producir y enviar siempre mercancía nueva.",

    trustBullet1: "Peso neto con una tolerancia verificada de ±3%.",
    trustBullet2:
      "Precinto contra manipulaciones e ID de lote impreso en la etiqueta.",
    trustBullet3:
      "Ningún producto ilegal o prohibido: el contenido siempre es legal.",

    ctaPrimary: "Ir a los productos",
    ctaSecondary: "Ver información de envío",
  },

  fr: {
    kicker: "How it works",
    title: "Comment fonctionne KiloMystery",
    subtitle:
      "Choisis le poids, ajoute au panier et reçois ta mystery box. Du lot au suivi, voici ce qui se passe en coulisses.",

    step1Title: "1. Choisir le poids et le type",
    step1Text:
      "Décide si tu commences par la Standard ou si tu passes directement à la Premium. Chaque box est vendue au kilo, de 1 à 10 Kg, avec poids net et tolérance contrôlée.",

    step2Title: "2. Paiement et confirmation",
    step2Text:
      "Finalise le paiement avec les moyens proposés. Tu reçois immédiatement un email avec le récapitulatif et les détails de ta commande.",

    step3Title: "3. Préparation, scellé et suivi",
    step3Text:
      "Ton lot est préparé, pesé et scellé. Nous appliquons une étiquette avec l’ID de lot et, dès que le colis part, tu reçois le numéro de suivi.",

    insideTitle: "Ce que tu peux trouver à l’intérieur",
    insideStdTitle: "Standard — la meilleure façon de commencer",
    insideStdText:
      "Mix équilibré de produits issus de colis perdus, retours non réclamés et stocks dormants. Idéal pour découvrir KiloMystery sans trop se poser de questions.",

    insidePrmTitle: "Premium — pour ceux qui en veulent plus",
    insidePrmText:
      "Sélection plus poussée de lots et probabilité plus élevée d’articles de gamme moyenne à haute. Parfait pour un unboxing encore plus intense.",

    trustTitle: "Transparence, traçabilité et durabilité",
    trustP1:
      "Chaque box part d’un lot réel : nous n’inventons pas le contenu, nous le récupérons. C’est pourquoi tu trouves sur chaque box une étiquette avec ID de lot et date de préparation.",
    trustP2:
      "Récupérer des colis existants, c’est moins de gaspillage et moins de CO₂ que produire et expédier sans cesse de nouveaux produits.",

    trustBullet1:
      "Poids net avec une tolérance vérifiée de ±3 %.",
    trustBullet2:
      "Scellé inviolable et ID de lot imprimé sur l’étiquette.",
    trustBullet3:
      "Aucun produit illégal ou interdit : le contenu reste toujours légal.",

    ctaPrimary: "Voir les produits",
    ctaSecondary: "Voir les infos livraison",
  },

  de: {
    kicker: "How it works",
    title: "So funktioniert KiloMystery",
    subtitle:
      "Wähle das Gewicht, lege in den Warenkorb und erhalte deine Mystery Box. Vom Posten bis zur Sendungsverfolgung – so läuft es im Hintergrund ab.",

    step1Title: "1. Gewicht und Typ wählen",
    step1Text:
      "Entscheide, ob du mit Standard startest oder direkt Premium wählst. Jede Box wird kiloweise verkauft, von 1 bis 10 Kg, mit Nettogewicht und kontrollierter Toleranz.",

    step2Title: "2. Bezahlen und Bestätigung erhalten",
    step2Text:
      "Schließe den Checkout mit den verfügbaren Zahlungsmethoden ab. Du erhältst sofort eine E-Mail mit Bestellübersicht und Details.",

    step3Title: "3. Vorbereitung, Siegel und Tracking",
    step3Text:
      "Dein Posten wird vorbereitet, gewogen und versiegelt. Wir bringen ein Etikett mit Posten-ID an und sobald das Paket versandt wird, erhältst du die Sendungsnummer.",

    insideTitle: "Was in den Boxen stecken kann",
    insideStdTitle: "Standard — der einfachste Einstieg",
    insideStdText:
      "Ausgewogener Mix aus Produkten aus verlorenen Paketen, nicht abgeholten Retouren und ruhenden Lagerbeständen. Ideal, um KiloMystery zum ersten Mal auszuprobieren.",

    insidePrmTitle: "Premium — für alle, die mehr wollen",
    insidePrmText:
      "Stärker kuratierte Auswahl an Posten und höhere Wahrscheinlichkeit auf Artikel der mittel- bis höherwertigen Kategorie. Perfekt für ein noch intensiveres Unboxing.",

    trustTitle: "Transparenz, Nachverfolgbarkeit und Nachhaltigkeit",
    trustP1:
      "Jede Box basiert auf einem echten Posten: Wir erfinden den Inhalt nicht, wir retten ihn. Deshalb findest du auf jeder Box ein Etikett mit Posten-ID und Vorbereitungsdatum.",
    trustP2:
      "Das Retten vorhandener Pakete bedeutet weniger Müll und weniger CO₂ im Vergleich zur ständigen Neuproduktion und zum Versand neuer Ware.",

    trustBullet1:
      "Nettogewicht mit überprüfter Toleranz von ±3 %.",
    trustBullet2:
      "Manipulationssicheres Siegel und aufgedruckte Posten-ID auf dem Etikett.",
    trustBullet3:
      "Keine illegalen oder verbotenen Produkte: der Inhalt bleibt immer legal.",

    ctaPrimary: "Zu den Produkten",
    ctaSecondary: "Versandinfos ansehen",
  },
};

export default function HowItWorks({
  params,
}: {
  params: { lang: string };
}) {
  const lang: Lang = normalizeLang(params?.lang);
  const t = HOW_COPY[lang] ?? HOW_COPY.it;

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-10">
        {/* HERO colorato */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 md:p-8">
          <header className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="section-kicker">{t.kicker}</div>
            <h1 className="text-4xl md:text-5xl font-extrabold">
              <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>
            <p className="text-white/70">{t.subtitle}</p>
          </header>
        </section>

        {/* STEP 1-2-3 */}
        <section className="grid gap-5 md:grid-cols-3">
          <div className="card space-y-2">
            <div className="text-3xl">🧪</div>
            <h3 className="text-lg md:text-xl font-extrabold">
              {t.step1Title}
            </h3>
            <p className="text-white/70 text-sm md:text-base">
              {t.step1Text}
            </p>
          </div>
          <div className="card space-y-2">
            <div className="text-3xl">💳</div>
            <h3 className="text-lg md:text-xl font-extrabold">
              {t.step2Title}
            </h3>
            <p className="text-white/70 text-sm md:text-base">
              {t.step2Text}
            </p>
          </div>
          <div className="card space-y-2">
            <div className="text-3xl">🚚</div>
            <h3 className="text-lg md:text-xl font-extrabold">
              {t.step3Title}
            </h3>
            <p className="text-white/70 text-sm md:text-base">
              {t.step3Text}
            </p>
          </div>
        </section>

        {/* Standard vs Premium */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <span>🎁</span>
            <span>{t.insideTitle}</span>
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card card--standard space-y-2">
              <p className="text-xs uppercase tracking-[.18em] text-white/60">
                Standard
              </p>
              <h3 className="product-title text-lg font-extrabold">
                {t.insideStdTitle}
              </h3>
              <p className="text-white/70 text-sm md:text-base">
                {t.insideStdText}
              </p>
            </div>
            <div className="card card--premium space-y-2">
              <p className="text-xs uppercase tracking-[.18em] text-white/60">
                Premium
              </p>
              <h3 className="product-title text-lg font-extrabold">
                {t.insidePrmTitle}
              </h3>
              <p className="text-white/70 text-sm md:text-base">
                {t.insidePrmText}
              </p>
            </div>
          </div>
        </section>

        {/* Trasparenza & green */}
        <section className="card space-y-3">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <span>🌍</span>
            <span>{t.trustTitle}</span>
          </h2>
          <p className="text-white/80 text-sm md:text-base">{t.trustP1}</p>
          <p className="text-white/70 text-sm md:text-base">{t.trustP2}</p>
          <ul className="list-disc ps-5 space-y-1 text-white/70 text-sm">
            <li>{t.trustBullet1}</li>
            <li>{t.trustBullet2}</li>
            <li>{t.trustBullet3}</li>
          </ul>
        </section>

        {/* CTA finale doppia */}
        <section className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-white/60">
              💡
              {lang === "it"
                ? " Pronto a pesare il mistero?"
                : lang === "en"
                ? " Ready to weigh the mystery?"
                : lang === "es"
                ? " ¿Listo para pesar el misterio?"
                : lang === "fr"
                ? " Prêt à peser le mystère ?"
                : " Bereit, das Geheimnis zu wiegen?"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/${lang}/products`} className="btn btn-brand btn-lg">
              {t.ctaPrimary}
            </a>
            <a
              href={`/${lang}/policy/shipping`}
              className="btn btn-ghost btn-sm"
            >
              {t.ctaSecondary}
            </a>
          </div>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
