/* eslint-disable react/no-unescaped-entities */

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

type CopyKey =
  | "kicker"
  | "heroTitle"
  | "heroTagline"
  | "heroSubtitle"
  | "badge1"
  | "badge2"
  | "badge3"
  | "supplyTitle"
  | "supplyText"
  | "qualityTitle"
  | "qualityText"
  | "supportTitle"
  | "supportText"
  | "sustainTitle"
  | "sustainP1"
  | "sustainP2"
  | "sustainLi1"
  | "sustainLi2"
  | "sustainLi3"
  | "popupTitle"
  | "popupP1"
  | "popupP2"
  | "popupP3"
  | "popupCta"
  | "promiseTitle"
  | "promiseP1"
  | "promiseP2";

type CopyPerLang = Record<CopyKey, string>;

const ABOUT_COPY: Record<Lang, CopyPerLang> = {
  it: {
    kicker: "About",
    heroTitle: "Chi siamo",
    heroTagline: "Pacchi smarriti, seconde possibilità 🎁",
    heroSubtitle:
      "Siamo una realtà giovane nata da un’idea semplice: dare una seconda vita ai pacchi che il sistema tradizionale considera “persi”. Selezione, trasparenza e velocità. Ogni box è sigillata, pesata e tracciata.",

    badge1: "Lotti reali certificati",
    badge2: "Peso netto al Kg",
    badge3: "Meno sprechi, più sorpresa",

    supplyTitle: "Lotti certificati",
    supplyText:
      "Origine e tracciabilità chiare su ogni lotto: pacchi smarriti, resi non reclamati e stock fermi vengono selezionati, pesati e registrati prima di diventare una KiloMystery Box.",

    qualityTitle: "Controlli e tolleranze",
    qualityText:
      "Peso netto con tolleranza ±3% e sigillo anti-manomissione. Ogni box ha un ID lotto e una data, per sapere sempre cosa è stato preparato, quando e da dove arriva.",

    supportTitle: "Assistenza rapida",
    supportText:
      "Risposte veloci via email prima e dopo l’ordine. Siamo noi a seguire il customer care, non un call center anonimo.",

    sustainTitle: "Seconda vita ai pacchi, meno sprechi 🌱",
    sustainP1:
      "Le nostre box recuperano pacchi che altrimenti finirebbero in discarica o in inceneritore: smarrimenti, resi non ritirati, stock dimenticati in magazzino. Invece di diventare rifiuti, quei prodotti tornano in circolo sotto forma di unboxing sorpresa.",
    sustainP2:
      "Ogni ordine è un piccolo “no” allo spreco e a nuova produzione inutile, e un “sì” a un consumo più consapevole. È per questo che parliamo di mystery box, ma con numeri, lotti e responsabilità.",
    sustainLi1:
      "Riduciamo i rifiuti dando una nuova destinazione ai pacchi.",
    sustainLi2:
      "Meno smaltimento = meno CO₂ rispetto al ciclo classico.",
    sustainLi3: "Packaging essenziale e riciclabile dove possibile.",

    popupTitle: "Pop-up e community in movimento 🎪",
    popupP1:
      "Non siamo solo uno store online: KiloMystery vive anche offline. Organizziamo pop-up in giro per l’Italia dove puoi vedere le box dal vivo, parlare con noi e scoprire come lavoriamo dietro le quinte.",
    popupP2:
      "Ogni evento è un momento per spiegare come funziona la filiera dei pacchi smarriti, perché è importante recuperare ciò che esiste già e come trasformiamo un problema di logistica in un gioco sostenibile.",
    popupP3:
      "Nella pagina Eventi Pop-Up trovi le prossime date, le città e le location in cui potrai trovarci.",
    popupCta: "Vai alla pagina eventi",

    promiseTitle: "La nostra promessa ✨",
    promiseP1:
      "Vogliamo unire la sensazione di aprire un pacco misterioso con la tranquillità di sapere che dietro c'è un lavoro serio su filiera, controlli e impatto ambientale.",
    promiseP2:
      "Se ti piace l’idea di dare una seconda chance ai pacchi e ridurre lo spreco, sei nel posto giusto. KiloMystery è un esperimento in continua evoluzione: ascoltiamo la community, testiamo nuove idee e miglioriamo le box giro dopo giro.",
  },

  en: {
    kicker: "About",
    heroTitle: "About us",
    heroTagline: "Lost parcels, second chances 🎁",
    heroSubtitle:
      "We are a young project born from a simple idea: giving a second life to parcels that the traditional system considers “lost”. Selection, transparency and speed. Every box is sealed, weighed and traceable.",

    badge1: "Certified real lots",
    badge2: "Net weight by the kilo",
    badge3: "Less waste, more surprise",

    supplyTitle: "Certified lots",
    supplyText:
      "Clear origin and traceability for every lot: lost parcels, unclaimed returns and overstock are selected, weighed and registered before becoming a KiloMystery Box.",

    qualityTitle: "Checks and tolerances",
    qualityText:
      "Net weight with ±3% tolerance and tamper-evident seal. Each box has a batch ID and date so you always know what was prepared, when and from where it comes.",

    supportTitle: "Fast support",
    supportText:
      "Quick answers via email before and after your order. Customer care is handled directly by us, not by an anonymous call center.",

    sustainTitle: "Second life for parcels, less waste 🌱",
    sustainP1:
      "Our boxes rescue parcels that would otherwise end up in landfill or incinerators: lost shipments, uncollected returns, stock forgotten in warehouses. Instead of becoming waste, these products come back to life as a surprise unboxing.",
    sustainP2:
      "Each order is a small “no” to waste and unnecessary new production, and a “yes” to more conscious consumption. That’s why we talk about mystery boxes, but with numbers, batches and responsibility.",
    sustainLi1:
      "We reduce waste by giving parcels a new destination.",
    sustainLi2:
      "Less disposal = less CO₂ compared to the classic cycle.",
    sustainLi3:
      "Essential and recyclable packaging where possible.",

    popupTitle: "Pop-ups and a moving community 🎪",
    popupP1:
      "We are not just an online store: KiloMystery also lives offline. We organize pop-ups around Italy where you can see the boxes in real life, talk to us and discover how we work behind the scenes.",
    popupP2:
      "Each event is a chance to explain how the lost-parcel chain works, why it matters to recover what already exists and how we turn a logistics problem into a sustainable game.",
    popupP3:
      "On the Pop-Up Events page, you’ll find the next dates, cities and locations where you can meet us.",
    popupCta: "Go to events page",

    promiseTitle: "Our promise ✨",
    promiseP1:
      "We want to blend the thrill of opening a mystery parcel with the reassurance of solid work on supply chain, quality checks and environmental impact.",
    promiseP2:
      "If you like the idea of giving parcels a second chance and reducing waste, you’re in the right place. KiloMystery is a constantly evolving experiment: we listen to the community, test new ideas and improve the boxes with every batch.",
  },

  es: {
    kicker: "About",
    heroTitle: "Quiénes somos",
    heroTagline: "Paquetes perdidos, segundas oportunidades 🎁",
    heroSubtitle:
      "Somos un proyecto joven nacido de una idea sencilla: dar una segunda vida a los paquetes que el sistema tradicional considera “perdidos”. Selección, transparencia y rapidez. Cada caja está sellada, pesada y trazada.",

    badge1: "Lotes reales certificados",
    badge2: "Peso neto por kilo",
    badge3: "Menos residuos, más sorpresa",

    supplyTitle: "Lotes certificados",
    supplyText:
      "Origen y trazabilidad claros en cada lote: paquetes perdidos, devoluciones no reclamadas y stock parado se seleccionan, pesan y registran antes de convertirse en una KiloMystery Box.",

    qualityTitle: "Controles y tolerancias",
    qualityText:
      "Peso neto con tolerancia de ±3% y precinto contra manipulaciones. Cada caja tiene un ID de lote y una fecha para saber siempre qué se ha preparado, cuándo y desde dónde llega.",

    supportTitle: "Atención rápida",
    supportText:
      "Respuestas rápidas por email antes y después del pedido. El servicio lo gestionamos nosotros, no un call center anónimo.",

    sustainTitle: "Segunda vida para los paquetes, menos residuos 🌱",
    sustainP1:
      "Nuestras cajas recuperan paquetes que de otro modo acabarían en vertederos o incineradoras: envíos perdidos, devoluciones no recogidas, stock olvidado en almacenes. En lugar de convertirse en residuos, esos productos vuelven a circular como un unboxing sorpresa.",
    sustainP2:
      "Cada pedido es un pequeño “no” al desperdicio y a la producción nueva e innecesaria, y un “sí” a un consumo más consciente. Por eso hablamos de mystery box, pero con números, lotes y responsabilidad.",
    sustainLi1:
      "Reducimos residuos dando un nuevo destino a los paquetes.",
    sustainLi2:
      "Menos eliminación = menos CO₂ frente al ciclo clásico.",
    sustainLi3:
      "Packaging esencial y reciclable siempre que sea posible.",

    popupTitle: "Pop-ups y comunidad en movimiento 🎪",
    popupP1:
      "No somos solo una tienda online: KiloMystery también vive offline. Organizamos pop-ups por Italia donde puedes ver las cajas en directo, hablar con nosotros y descubrir cómo trabajamos entre bastidores.",
    popupP2:
      "Cada evento es un momento para explicar cómo funciona la cadena de los paquetes perdidos, por qué es importante recuperar lo que ya existe y cómo convertimos un problema logístico en un juego sostenible.",
    popupP3:
      "En la página de Eventos Pop-Up encontrarás las próximas fechas, ciudades y localizaciones donde podrás encontrarnos.",
    popupCta: "Ir a la página de eventos",

    promiseTitle: "Nuestra promesa ✨",
    promiseP1:
      "Queremos unir la emoción de abrir un paquete misterioso con la tranquilidad de saber que detrás hay un trabajo serio sobre la cadena de suministro, los controles y el impacto ambiental.",
    promiseP2:
      "Si te gusta la idea de dar una segunda oportunidad a los paquetes y reducir el desperdicio, estás en el lugar adecuado. KiloMystery es un experimento en evolución continua: escuchamos a la comunidad, probamos nuevas ideas y mejoramos las cajas envío tras envío.",
  },

  fr: {
    kicker: "About",
    heroTitle: "Qui sommes-nous",
    heroTagline: "Colis perdus, seconde vie 🎁",
    heroSubtitle:
      "Nous sommes une jeune structure née d’une idée simple : donner une seconde vie aux colis que le système traditionnel considère comme “perdus”. Sélection, transparence et rapidité. Chaque box est scellée, pesée et traçable.",

    badge1: "Lots réels certifiés",
    badge2: "Poids net au kilo",
    badge3: "Moins de déchets, plus de surprise",

    supplyTitle: "Lots certifiés",
    supplyText:
      "Origine et traçabilité claires pour chaque lot : colis perdus, retours non réclamés et stocks dormants sont sélectionnés, pesés et enregistrés avant de devenir une KiloMystery Box.",

    qualityTitle: "Contrôles et tolérances",
    qualityText:
      "Poids net avec une tolérance de ±3 % et scellé inviolable. Chaque box possède un ID de lot et une date pour savoir ce qui a été préparé, quand et d’où cela vient.",

    supportTitle: "Support réactif",
    supportText:
      "Des réponses rapides par email avant et après la commande. Le service client est géré par nous, pas par un centre d’appel anonyme.",

    sustainTitle: "Une seconde vie pour les colis, moins de déchets 🌱",
    sustainP1:
      "Nos box récupèrent des colis qui finiraient autrement en décharge ou en incinérateur : pertes, retours non retirés, stocks oubliés en entrepôt. Au lieu de devenir des déchets, ces produits reviennent en circulation sous forme d’un unboxing surprise.",
    sustainP2:
      "Chaque commande est un petit “non” au gaspillage et à la production inutile, et un “oui” à une consommation plus responsable. C’est pour cela que nous parlons de mystery box, mais avec des chiffres, des lots et des engagements.",
    sustainLi1:
      "Nous réduisons les déchets en donnant une nouvelle destination aux colis.",
    sustainLi2:
      "Moins de traitement = moins de CO₂ par rapport au circuit classique.",
    sustainLi3:
      "Packaging essentiel et recyclable autant que possible.",

    popupTitle: "Pop-ups et communauté en mouvement 🎪",
    popupP1:
      "Nous ne sommes pas qu’une boutique en ligne : KiloMystery vit aussi hors ligne. Nous organisons des pop-ups en Italie où tu peux voir les box en vrai, discuter avec nous et découvrir notre travail en coulisses.",
    popupP2:
      "Chaque événement est une occasion d’expliquer comment fonctionne la filière des colis perdus, pourquoi il est important de récupérer ce qui existe déjà et comment nous transformons un problème logistique en jeu durable.",
    popupP3:
      "Sur la page Événements Pop-Up, tu trouveras les prochaines dates, villes et lieux où nous rencontrer.",
    popupCta: "Aller à la page évènements",

    promiseTitle: "Notre promesse ✨",
    promiseP1:
      "Nous voulons associer la sensation d’ouvrir un colis mystère à la tranquillité de savoir qu’il y a derrière un vrai travail sur la filière, les contrôles et l’impact environnemental.",
    promiseP2:
      "Si tu aimes l’idée de donner une seconde chance aux colis et de réduire le gaspillage, tu es au bon endroit. KiloMystery est une expérience en évolution permanente : nous écoutons la communauté, testons de nouvelles idées et améliorons les box au fil des lots.",
  },

  de: {
    kicker: "About",
    heroTitle: "Über uns",
    heroTagline: "Verlorene Pakete, zweite Chance 🎁",
    heroSubtitle:
      "Wir sind ein junges Projekt, entstanden aus einer einfachen Idee: Paketen ein zweites Leben zu geben, die im traditionellen System als „verloren“ gelten. Selektion, Transparenz und Schnelligkeit. Jede Box wird versiegelt, gewogen und nachverfolgbar gemacht.",

    badge1: "Zertifizierte echte Posten",
    badge2: "Nettogewicht pro Kilo",
    badge3: "Weniger Müll, mehr Überraschung",

    supplyTitle: "Zertifizierte Posten",
    supplyText:
      "Klare Herkunft und Nachverfolgbarkeit für jeden Posten: verlorene Pakete, nicht abgeholte Retouren und liegengebliebene Lagerbestände werden ausgewählt, gewogen und registriert, bevor sie zu einer KiloMystery Box werden.",

    qualityTitle: "Kontrollen und Toleranzen",
    qualityText:
      "Nettogewicht mit einer Toleranz von ±3 % und manipulationssicherem Siegel. Jede Box besitzt eine Posten-ID und ein Datum, damit du immer weißt, was vorbereitet wurde, wann und woher es kommt.",

    supportTitle: "Schneller Support",
    supportText:
      "Schnelle Antworten per E-Mail vor und nach der Bestellung. Der Kundenservice wird direkt von uns betreut, nicht von einem anonymen Callcenter.",

    sustainTitle: "Zweites Leben für Pakete, weniger Müll 🌱",
    sustainP1:
      "Unsere Boxen retten Pakete, die sonst auf der Mülldeponie oder in der Verbrennung landen würden: verlorene Sendungen, nicht abgeholte Retouren, vergessene Lagerbestände. Anstatt zu Abfall zu werden, kommen diese Produkte als Überraschungs-Unboxing zurück in den Kreislauf.",
    sustainP2:
      "Jede Bestellung ist ein kleines „Nein“ zu Verschwendung und unnötiger Neuproduktion und ein „Ja“ zu bewussterem Konsum. Deshalb sprechen wir von Mystery Boxen – aber mit Zahlen, Posten und Verantwortung.",
    sustainLi1:
      "Wir reduzieren Abfall, indem wir Paketen ein neues Ziel geben.",
    sustainLi2:
      "Weniger Entsorgung = weniger CO₂ im Vergleich zum klassischen Zyklus.",
    sustainLi3:
      "Schlichtes, möglichst recycelbares Packaging.",

    popupTitle: "Pop-ups und Community in Bewegung 🎪",
    popupP1:
      "Wir sind nicht nur ein Onlineshop: KiloMystery existiert auch offline. Wir organisieren Pop-ups in ganz Italien, bei denen du die Boxen live sehen, mit uns sprechen und einen Blick hinter die Kulissen werfen kannst.",
    popupP2:
      "Jedes Event ist eine Gelegenheit zu erklären, wie die Kette der verlorenen Pakete funktioniert, warum es wichtig ist, bereits vorhandene Waren zu retten und wie wir ein Logistikproblem in ein nachhaltiges Spiel verwandeln.",
    popupP3:
      "Auf der Pop-Up-Eventseite findest du die nächsten Termine, Städte und Locations, an denen du uns treffen kannst.",
    popupCta: "Zur Eventseite",

    promiseTitle: "Unser Versprechen ✨",
    promiseP1:
      "Wir wollen das Gefühl, ein geheimnisvolles Paket zu öffnen, mit der Sicherheit verbinden, dass dahinter ernsthafte Arbeit an Lieferkette, Kontrollen und Umwelteinfluss steckt.",
    promiseP2:
      "Wenn dir die Idee gefällt, Paketen eine zweite Chance zu geben und Verschwendung zu reduzieren, bist du hier richtig. KiloMystery ist ein Experiment in ständiger Entwicklung: Wir hören der Community zu, testen neue Ideen und verbessern die Boxen von Runde zu Runde.",
  },
};

export default function AboutPage({ params }: { params: { lang: string } }) {
  const lang: Lang = normalizeLang(params?.lang);
  const t = ABOUT_COPY[lang] ?? ABOUT_COPY.it;

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-10">
        {/* HERO */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 md:p-8">
          <div className="mx-auto mb-6 md:mb-8 w-[220px] md:w-[280px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero/hero.svg"
              alt="KiloMystery"
              className="w-full h-auto drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
            />
          </div>

          <header className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="section-kicker">{t.kicker}</div>
            <h1 className="text-4xl md:text-5xl font-extrabold">
              <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
                {t.heroTitle}
              </span>
            </h1>
            <p className="text-sm uppercase tracking-[.22em] text-emerald-300/80">
              {t.heroTagline}
            </p>
            <p className="text-white/70">{t.heroSubtitle}</p>
          </header>

          {/* micro badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-[0.75rem]">
            <span className="pill">
              <span>📦</span>
              <span>{t.badge1}</span>
            </span>
            <span className="pill">
              <span>⚖️</span>
              <span>{t.badge2}</span>
            </span>
            <span className="pill">
              <span>🌍</span>
              <span>{t.badge3}</span>
            </span>
          </div>
        </section>

        {/* 3 PUNTI CHIAVE */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="card space-y-2">
            <div className="text-3xl">📦</div>
            <h3 className="product-title mb-1 text-lg font-extrabold">
              {t.supplyTitle}
            </h3>
            <p className="text-white/70 text-sm md:text-base">
              {t.supplyText}
            </p>
          </div>
          <div className="card space-y-2">
            <div className="text-3xl">🧪</div>
            <h3 className="product-title mb-1 text-lg font-extrabold">
              {t.qualityTitle}
            </h3>
            <p className="text-white/70 text-sm md:text-base">
              {t.qualityText}
            </p>
          </div>
          <div className="card space-y-2">
            <div className="text-3xl">🤝</div>
            <h3 className="product-title mb-1 text-lg font-extrabold">
              {t.supportTitle}
            </h3>
            <p className="text-white/70 text-sm md:text-base">
              {t.supportText}
            </p>
          </div>
        </section>

        {/* SOSTENIBILITÀ */}
        <section className="card space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <span>🌱</span>
            <span>{t.sustainTitle}</span>
          </h2>
          <p className="text-white/80 text-sm md:text-base">
            {t.sustainP1}
          </p>
          <p className="text-white/70 text-sm md:text-base">
            {t.sustainP2}
          </p>
          <ul className="list-disc ps-5 space-y-1 text-white/70 text-sm">
            <li>{t.sustainLi1}</li>
            <li>{t.sustainLi2}</li>
            <li>{t.sustainLi3}</li>
          </ul>
        </section>

        {/* POP-UP / COMMUNITY */}
        <section className="card space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <span>🎪</span>
            <span>{t.popupTitle}</span>
          </h2>
          <p className="text-white/80 text-sm md:text-base">
            {t.popupP1}
          </p>
          <p className="text-white/70 text-sm md:text-base">
            {t.popupP2}
          </p>
          <p className="text-white/70 text-sm md:text-base">
            {t.popupP3}
          </p>
          <a
            href={`/${lang}/events`}
            className="btn btn-ghost btn-sm inline-flex mt-1"
          >
            {t.popupCta}
          </a>
        </section>

        {/* PROMESSA */}
        <section className="card space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <span>✨</span>
            <span>{t.promiseTitle}</span>
          </h2>
          <p className="text-white/80 text-sm md:text-base">
            {t.promiseP1}
          </p>
          <p className="text-white/70 text-sm md:text-base">
            {t.promiseP2}
          </p>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
