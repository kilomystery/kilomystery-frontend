/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { getPageMetadata } from "@/src/seo/meta";
import { Lang, normalizeLang } from "@/i18n/lang";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductsTabs from "../components/ProductsTabs";
import ContactForm from "../components/ContactForm";
import SectionMarquee from "../components/SectionMarquee";


type CopyKey =
  | "heroTitle"
  | "heroSubtitle"
  | "ctaPrices"
  | "ctaHowItWorks"
  | "howTitle"
  | "howCard1Title"
  | "howCard1Subtitle"
  | "howCard1Bullet1"
  | "howCard1Bullet2"
  | "howCard2Title"
  | "howCard2Subtitle"
  | "howCard2Bullet1"
  | "howCard2Bullet2"
  | "howCard3Title"
  | "howCard3Subtitle"
  | "howCard3Bullet1"
  | "howCard3Bullet2"
  | "sustainTitle"
  | "sustainP1"
  | "sustainP2"
  | "sustainBullet1"
  | "sustainBullet2"
  | "sustainBullet3"
  | "sustainBullet4"
  | "faqTitle"
  | "faq1Q"
  | "faq1A"
  | "faq2Q"
  | "faq2A"
  | "faq3Q"
  | "faq3A"
  | "faq4Q"
  | "faq4A"
  | "faq5Q"
  | "faq5A"
  | "faq6Q"
  | "faq6A"
  | "eventsTitle"
  | "eventsSubtitle"
  | "eventsCta"
  | "eventsCard1Kicker"
  | "eventsCard1Title"
  | "eventsCard1Text"
  | "eventsCard2Kicker"
  | "eventsCard2Title"
  | "eventsCard2Text"
  | "eventsCard3Kicker"
  | "eventsCard3Title"
  | "eventsCard3Text"
  | "contactTitle"
  | "contactSubtitle";

type CopyPerLang = Record<CopyKey, string>;

const HOME_COPY: Record<Lang, CopyPerLang> = {
  it: {
    heroTitle: "Mystery box al Kg",
    heroSubtitle:
      "Scegli Standard o Premium, seleziona il peso e aggiungi al carrello. Trasparenza, tracciabilità, sorpresa vera.",
    ctaPrices: "Vedi prezzi",
    ctaHowItWorks: "Come funziona",

    howTitle: "Come funziona KiloMistery",
    howCard1Title: "Scegli peso e tipologia",
    howCard1Subtitle: "Standard o Premium da 1–10 kg.",
    howCard1Bullet1: "Prezzi chiari, niente sorprese sul checkout",
    howCard1Bullet2: "Etichetta con ID lotto",
    howCard2Title: "Paga in sicurezza",
    howCard2Subtitle: "Metodi sicuri, riepilogo via email.",
    howCard2Bullet1: "Conferma immediata",
    howCard2Bullet2: "Assistenza dedicata",
    howCard3Title: "Spedizione tracciata",
    howCard3Subtitle: "Tracking 24–72h (di solito).",
    howCard3Bullet1: "Imballo sicuro",
    howCard3Bullet2: "Sorpresa all’apertura",

    sustainTitle: "Il nostro impegno per la sostenibilità",
    sustainP1:
      "Le nostre mystery box nascono da pacchi smarriti, resi non reclamati e stock fermi. Invece di finire in discarica o in inceneritore, quei prodotti tornano in circolo sotto forma di unboxing sorpresa. ♻️",
    sustainP2:
      "Così trasformiamo uno spreco in un gioco, riducendo l'impatto ambientale legato allo smaltimento e alla produzione di nuova merce, dando una seconda vita a ciò che esiste già. 🌿",
    sustainBullet1: "Seconda vita ai pacchi: meno rifiuti da smaltire.",
    sustainBullet2: "CO₂ evitata rispetto a discarica e incenerimento.",
    sustainBullet3: "Packaging essenziale e riciclabile dove possibile.",
    sustainBullet4:
      "Lotti tracciati: sai sempre da dove arriva ciò che spacchetti.",

    faqTitle: "FAQ",
    faq1Q: "Cosa c'è nelle mystery box?",
    faq1A:
      "Contenuti misti e legali da stock: il bello è la sorpresa. Ogni box è sigillata e tracciata.",
    faq2Q: "Posso scegliere la categoria?",
    faq2A:
      "No, ma puoi scegliere peso e tipologia (Standard/Premium). La selezione è curata per varietà e qualità.",
    faq3Q: "Tempi di spedizione?",
    faq3A: "Di solito 24–72h. Ricevi il tracking appena il pacco parte.",
    faq4Q: "I prodotti sono nuovi o usati?",
    faq4A:
      "I prodotti possono essere nuovi, usati o provenire da resi e stock fermi. Possono presentare segni d'uso o packaging non perfetto, ma vengono selezionati per garantire un'esperienza di unboxing interessante.",
    faq5Q: "Il valore della box è sempre superiore al prezzo?",
    faq5A:
      "L'esperienza è pensata come una mystery: il valore percepito può variare da box a box. In media puntiamo a offrire un rapporto qualità/prezzo vantaggioso, ma non possiamo garantire un valore minimo preciso per ogni singola box.",
    faq6Q: "Posso ritirare la box a un evento pop-up?",
    faq6A:
      "In alcuni eventi è possibile acquistare direttamente in loco le mystery box. Controlla sempre la pagina eventi per i dettagli aggiornati sulle modalità di vendita.",

    eventsTitle: "Scopri i nostri prossimi eventi pop-up",
    eventsSubtitle:
      "Vieni a trovarci dal vivo: eventi pop-up, fiere e corner temporanei dove puoi vedere le mystery box, parlare con il team e vivere l'atmosfera della community KiloMystery. ✨",
    eventsCta: "Vedi calendario eventi",
    eventsCard1Kicker: "Pop-up in città",
    eventsCard1Title: "Tappe nelle principali città italiane 🇮🇹",
    eventsCard1Text:
      "Scopri quando saremo vicino a te, passa al corner e scopri da vicino il mondo KiloMystery.",
    eventsCard2Kicker: "Area sostenibilità",
    eventsCard2Title: "Scopri come recuperiamo pacchi e stock ♻️",
    eventsCard2Text:
      "Uno spazio dedicato per raccontarti come funzionano i lotti, perché evitiamo sprechi e come funziona l'economia circolare dietro le box.",
    eventsCard3Kicker: "Community",
    eventsCard3Title: "Incontra altri appassionati di mystery box 🤝",
    eventsCard3Text:
      "Condividi l'esperienza, scopri cosa hanno trovato gli altri, scatta foto con la tua box e porta a casa un ricordo.",

    contactTitle: "Contattaci",
    contactSubtitle:
      "Domande su ordini, spedizioni o partnership? Scrivici:",
  },

  en: {
    heroTitle: "Mystery boxes by the kilo",
    heroSubtitle:
      "Choose Standard or Premium, select the weight and add to cart. Transparency, traceability, real surprise.",
    ctaPrices: "View prices",
    ctaHowItWorks: "How it works",

    howTitle: "How KiloMystery works",
    howCard1Title: "Choose weight and type",
    howCard1Subtitle: "Standard or Premium from 1–10 kg.",
    howCard1Bullet1: "Clear prices, no surprises at checkout",
    howCard1Bullet2: "Label with batch ID",
    howCard2Title: "Pay securely",
    howCard2Subtitle: "Secure methods, order summary via email.",
    howCard2Bullet1: "Instant confirmation",
    howCard2Bullet2: "Dedicated support",
    howCard3Title: "Tracked shipping",
    howCard3Subtitle: "Tracking usually within 24–72 hours.",
    howCard3Bullet1: "Secure packaging",
    howCard3Bullet2: "The surprise happens when you open it",

    sustainTitle: "Our commitment to sustainability",
    sustainP1:
      "Our mystery boxes come from lost parcels, unclaimed returns and idle stock. Instead of ending up in landfill or incinerators, these products re-enter circulation as surprise unboxings. ♻️",
    sustainP2:
      "This way we turn waste into a game, reducing the environmental impact linked to disposal and new production by giving a second life to what already exists. 🌿",
    sustainBullet1: "Second life for parcels: less waste to dispose of.",
    sustainBullet2: "CO₂ avoided compared to landfill and incineration.",
    sustainBullet3: "Essential, recyclable packaging wherever possible.",
    sustainBullet4:
      "Traceable batches: you always know where what you unbox comes from.",

    faqTitle: "FAQ",
    faq1Q: "What’s inside the mystery boxes?",
    faq1A:
      "A mixed, fully legal assortment from stock: the fun is in the surprise. Every box is sealed and traceable.",
    faq2Q: "Can I choose the category?",
    faq2A:
      "No, but you can choose weight and type (Standard/Premium). The selection is curated for variety and quality.",
    faq3Q: "What about shipping times?",
    faq3A:
      "Usually 24–72 hours. You receive tracking as soon as the parcel ships.",
    faq4Q: "Are the products new or used?",
    faq4A:
      "Products may be new, used or come from returns and idle stock. They may show signs of use or imperfect packaging, but we select them to ensure an interesting unboxing experience.",
    faq5Q: "Is the value of the box always higher than the price?",
    faq5A:
      "The experience is designed as a mystery: perceived value can vary from box to box. On average we aim to offer a good value for money, but we cannot guarantee a precise minimum value for every single box.",
    faq6Q: "Can I pick up a box at a pop-up event?",
    faq6A:
      "At some events you can purchase mystery boxes on site. Always check the events page for up-to-date details on how sales work.",

    eventsTitle: "Discover our upcoming pop-up events",
    eventsSubtitle:
      "Come and meet us in person: pop-up events, fairs and temporary corners where you can see the mystery boxes, talk to the team and feel the KiloMystery community vibe. ✨",
    eventsCta: "View events calendar",
    eventsCard1Kicker: "City pop-ups",
    eventsCard1Title: "Stops in major Italian cities 🇮🇹",
    eventsCard1Text:
      "Find out when we’ll be near you, drop by the corner and discover the KiloMystery world up close.",
    eventsCard2Kicker: "Sustainability area",
    eventsCard2Title: "See how we recover parcels and stock ♻️",
    eventsCard2Text:
      "A dedicated space where we explain how batches work, why we avoid waste and how the circular economy behind the boxes works.",
    eventsCard3Kicker: "Community",
    eventsCard3Title: "Meet other mystery box fans 🤝",
    eventsCard3Text:
      "Share the experience, see what others found, take photos with your box and go home with a memory.",

    contactTitle: "Contact us",
    contactSubtitle:
      "Questions about orders, shipping or partnerships? Write to us:",
  },

  es: {
    heroTitle: "Cajas mystery al kilo",
    heroSubtitle:
      "Elige Standard o Premium, selecciona el peso y añádelo al carrito. Transparencia, trazabilidad y una sorpresa real.",
    ctaPrices: "Ver precios",
    ctaHowItWorks: "Cómo funciona",

    howTitle: "Cómo funciona KiloMystery",
    howCard1Title: "Elige peso y tipo",
    howCard1Subtitle: "Standard o Premium de 1 a 10 kg.",
    howCard1Bullet1:
      "Precios claros, sin sorpresas en el checkout",
    howCard1Bullet2: "Etiqueta con ID de lote",
    howCard2Title: "Paga con seguridad",
    howCard2Subtitle:
      "Métodos seguros y resumen del pedido por email.",
    howCard2Bullet1: "Confirmación inmediata",
    howCard2Bullet2: "Atención dedicada",
    howCard3Title: "Envío con seguimiento",
    howCard3Subtitle: "Seguimiento normalmente en 24–72 horas.",
    howCard3Bullet1: "Embalaje seguro",
    howCard3Bullet2: "La sorpresa llega al abrir la caja",

    sustainTitle: "Nuestro compromiso con la sostenibilidad",
    sustainP1:
      "Nuestras mystery box nacen de paquetes perdidos, devoluciones no reclamadas y stock parado. En lugar de acabar en vertederos o incineradoras, esos productos vuelven a circular en forma de unboxing sorpresa. ♻️",
    sustainP2:
      "Así convertimos el desperdicio en juego, reduciendo el impacto ambiental ligado al desecho y a la producción de nueva mercancía, dando una segunda vida a lo que ya existe. 🌿",
    sustainBullet1:
      "Segunda vida para los paquetes: menos residuos que eliminar.",
    sustainBullet2:
      "CO₂ evitado frente a vertederos e incineración.",
    sustainBullet3:
      "Packaging esencial y reciclable siempre que sea posible.",
    sustainBullet4:
      "Lotes trazables: siempre sabes de dónde viene lo que desempaquetas.",

    faqTitle: "FAQ",
    faq1Q: "¿Qué hay dentro de las mystery box?",
    faq1A:
      "Contenido mixto y legal procedente de stock: la gracia está en la sorpresa. Cada caja está sellada y es trazable.",
    faq2Q: "¿Puedo elegir la categoría?",
    faq2A:
      "No, pero puedes elegir peso y tipo (Standard/Premium). La selección se cuida para asegurar variedad y calidad.",
    faq3Q: "¿Plazos de envío?",
    faq3A:
      "Normalmente 24–72 horas. Recibirás el tracking en cuanto salga el paquete.",
    faq4Q: "¿Los productos son nuevos o usados?",
    faq4A:
      "Los productos pueden ser nuevos, usados o proceder de devoluciones y stock parado. Pueden mostrar signos de uso o embalaje imperfecto, pero se seleccionan para garantizar una experiencia de unboxing interesante.",
    faq5Q:
      "¿El valor de la caja es siempre superior al precio?",
    faq5A:
      "La experiencia está pensada como una mystery: el valor percibido puede variar de una caja a otra. De media buscamos ofrecer una buena relación calidad/precio, pero no podemos garantizar un valor mínimo fijo para cada caja.",
    faq6Q: "¿Puedo recoger la caja en un evento pop-up?",
    faq6A:
      "En algunos eventos es posible comprar las mystery box directamente allí. Consulta siempre la página de eventos para ver los detalles actualizados sobre las modalidades de venta.",

    eventsTitle: "Descubre nuestros próximos eventos pop-up",
    eventsSubtitle:
      "Ven a conocernos en persona: eventos pop-up, ferias y corners temporales donde puedes ver las mystery box, hablar con el equipo y vivir el ambiente de la comunidad KiloMystery. ✨",
    eventsCta: "Ver calendario de eventos",
    eventsCard1Kicker: "Pop-ups en la ciudad",
    eventsCard1Title:
      "Paradas en las principales ciudades italianas 🇮🇹",
    eventsCard1Text:
      "Descubre cuándo estaremos cerca de ti, acércate al corner y conoce de cerca el mundo KiloMystery.",
    eventsCard2Kicker: "Zona sostenibilidad",
    eventsCard2Title:
      "Descubre cómo recuperamos paquetes y stock ♻️",
    eventsCard2Text:
      "Un espacio dedicado para explicarte cómo funcionan los lotes, por qué evitamos el desperdicio y cómo funciona la economía circular detrás de las cajas.",
    eventsCard3Kicker: "Comunidad",
    eventsCard3Title:
      "Conoce a otros fans de las mystery box 🤝",
    eventsCard3Text:
      "Comparte la experiencia, descubre qué han encontrado los demás, haz fotos con tu caja y llévate un recuerdo a casa.",

    contactTitle: "Contáctanos",
    contactSubtitle:
      "¿Dudas sobre pedidos, envíos o colaboraciones? Escríbenos:",
  },

  fr: {
    heroTitle: "Mystery box au kilo",
    heroSubtitle:
      "Choisis Standard ou Premium, sélectionne le poids et ajoute au panier. Transparence, traçabilité, vraie surprise.",
    ctaPrices: "Voir les prix",
    ctaHowItWorks: "Comment ça marche",

    howTitle: "Comment fonctionne KiloMystery",
    howCard1Title: "Choisir le poids et le type",
    howCard1Subtitle: "Standard ou Premium de 1 à 10 kg.",
    howCard1Bullet1:
      "Prix clairs, aucune surprise au moment du paiement",
    howCard1Bullet2: "Étiquette avec ID de lot",
    howCard2Title: "Payer en toute sécurité",
    howCard2Subtitle:
      "Moyens de paiement sécurisés, récapitulatif par e-mail.",
    howCard2Bullet1: "Confirmation immédiate",
    howCard2Bullet2: "Support dédié",
    howCard3Title: "Expédition suivie",
    howCard3Subtitle:
      "Numéro de suivi en général sous 24–72 h.",
    howCard3Bullet1: "Emballage sécurisé",
    howCard3Bullet2: "La surprise commence à l’ouverture",

    sustainTitle: "Notre engagement pour la durabilité",
    sustainP1:
      "Nos mystery box proviennent de colis perdus, de retours non réclamés et de stocks dormants. Au lieu de finir en décharge ou à l’incinérateur, ces produits reviennent en circulation sous forme d’unboxing surprise. ♻️",
    sustainP2:
      "Ainsi, nous transformons le gaspillage en jeu, en réduisant l’impact environnemental lié au traitement des déchets et à la production de nouveaux produits, et en donnant une seconde vie à ce qui existe déjà. 🌿",
    sustainBullet1:
      "Seconde vie pour les colis : moins de déchets à traiter.",
    sustainBullet2:
      "CO₂ évité par rapport à la décharge et à l’incinération.",
    sustainBullet3:
      "Packaging minimaliste et recyclable lorsque c’est possible.",
    sustainBullet4:
      "Lots traçables : tu sais toujours d’où vient ce que tu déballe.",

    faqTitle: "FAQ",
    faq1Q: "Que trouve-t-on dans les mystery box ?",
    faq1A:
      "Contenu varié et 100 % légal issu de stocks : tout l’intérêt est dans la surprise. Chaque box est scellée et traçable.",
    faq2Q: "Puis-je choisir la catégorie ?",
    faq2A:
      "Non, mais tu peux choisir le poids et le type (Standard/Premium). La sélection est pensée pour la variété et la qualité.",
    faq3Q: "Quels sont les délais de livraison ?",
    faq3A:
      "En général 24–72 h. Tu reçois le numéro de suivi dès que le colis est expédié.",
    faq4Q: "Les produits sont-ils neufs ou d’occasion ?",
    faq4A:
      "Les produits peuvent être neufs, d’occasion ou issus de retours et de stocks dormants. Ils peuvent présenter des marques d’usage ou un emballage imparfait, mais ils sont sélectionnés pour garantir une expérience d’unboxing intéressante.",
    faq5Q:
      "La valeur de la box est-elle toujours supérieure au prix ?",
    faq5A:
      "L’expérience est conçue comme une mystery : la valeur perçue peut varier d’une box à l’autre. En moyenne, nous visons un bon rapport qualité/prix, mais nous ne pouvons pas garantir une valeur minimale précise pour chaque box.",
    faq6Q:
      "Puis-je récupérer ma box lors d’un événement pop-up ?",
    faq6A:
      "Lors de certains événements, il est possible d’acheter les mystery box sur place. Consulte toujours la page événements pour les détails à jour sur les modalités de vente.",

    eventsTitle: "Découvre nos prochains événements pop-up",
    eventsSubtitle:
      "Viens nous voir en vrai : événements pop-up, salons et corners temporaires où tu peux découvrir les mystery box, parler avec l’équipe et vivre l’ambiance de la communauté KiloMystery. ✨",
    eventsCta: "Voir le calendrier des événements",
    eventsCard1Kicker: "Pop-up en ville",
    eventsCard1Title:
      "Étapes dans les principales villes italiennes 🇮🇹",
    eventsCard1Text:
      "Découvre quand nous serons près de chez toi, passe au corner et découvre l’univers KiloMystery de près.",
    eventsCard2Kicker: "Espace durabilité",
    eventsCard2Title:
      "Découvre comment nous récupérons colis et stocks ♻️",
    eventsCard2Text:
      "Un espace dédié pour t’expliquer le fonctionnement des lots, pourquoi nous évitons le gaspillage et comment fonctionne l’économie circulaire derrière les box.",
    eventsCard3Kicker: "Communauté",
    eventsCard3Title:
      "Rencontre d’autres fans de mystery box 🤝",
    eventsCard3Text:
      "Partage ton expérience, découvre ce que les autres ont trouvé, prends des photos avec ta box et repars avec un souvenir.",

    contactTitle: "Contactez-nous",
    contactSubtitle:
      "Des questions sur les commandes, les livraisons ou les partenariats ? Écrivez-nous :",
  },

  de: {
    heroTitle: "Mystery Box zum Kilo-Preis",
    heroSubtitle:
      "Wähle Standard oder Premium, bestimme das Gewicht und lege in den Warenkorb. Transparenz, Nachverfolgbarkeit, echte Überraschung.",
    ctaPrices: "Preise ansehen",
    ctaHowItWorks: "So funktioniert’s",

    howTitle: "So funktioniert KiloMystery",
    howCard1Title: "Gewicht und Typ wählen",
    howCard1Subtitle: "Standard oder Premium von 1–10 kg.",
    howCard1Bullet1:
      "Klare Preise, keine Überraschungen beim Checkout",
    howCard1Bullet2: "Etikett mit Posten-ID",
    howCard2Title: "Sicher bezahlen",
    howCard2Subtitle:
      "Sichere Zahlungsmethoden, Bestellübersicht per E-Mail.",
    howCard2Bullet1: "Sofortige Bestätigung",
    howCard2Bullet2: "Eigener Support",
    howCard3Title: "Sendung mit Tracking",
    howCard3Subtitle:
      "Sendungsverfolgung in der Regel innerhalb von 24–72 Stunden.",
    howCard3Bullet1: "Sichere Verpackung",
    howCard3Bullet2: "Die Überraschung beginnt beim Auspacken",

    sustainTitle: "Unser Engagement für Nachhaltigkeit",
    sustainP1:
      "Unsere Mystery Boxen entstehen aus verlorenen Paketen, nicht abgeholten Retouren und ruhenden Lagerbeständen. Statt auf der Deponie oder in der Verbrennung zu landen, kommen diese Produkte als Überraschungs-Unboxing wieder in den Kreislauf. ♻️",
    sustainP2:
      "So machen wir aus potenziellem Müll ein Spiel, verringern die Umweltbelastung durch Entsorgung und Neuproduktion und geben dem, was bereits existiert, ein zweites Leben. 🌿",
    sustainBullet1:
      "Zweites Leben für Pakete: weniger Abfall zur Entsorgung.",
    sustainBullet2:
      "Vermeidetes CO₂ im Vergleich zu Deponie und Verbrennung.",
    sustainBullet3:
      "Reduziertes, möglichst recycelbares Packaging.",
    sustainBullet4:
      "Nachverfolgbare Posten: du weißt immer, woher dein Inhalt kommt.",

    faqTitle: "FAQ",
    faq1Q: "Was steckt in den Mystery Boxen?",
    faq1A:
      "Gemischte, vollständig legale Inhalte aus Lagerbeständen – der Reiz liegt in der Überraschung. Jede Box ist versiegelt und nachverfolgbar.",
    faq2Q: "Kann ich die Kategorie auswählen?",
    faq2A:
      "Nein, aber du kannst Gewicht und Typ (Standard/Premium) wählen. Die Auswahl wird für Vielfalt und Qualität kuratiert.",
    faq3Q: "Wie lange dauert der Versand?",
    faq3A:
      "In der Regel 24–72 Stunden. Du erhältst die Sendungsnummer, sobald das Paket auf dem Weg ist.",
    faq4Q: "Sind die Produkte neu oder gebraucht?",
    faq4A:
      "Die Produkte können neu, gebraucht oder aus Retouren und ruhenden Beständen sein. Sie können Gebrauchsspuren oder eine nicht perfekte Verpackung aufweisen, werden aber so ausgewählt, dass das Unboxing spannend bleibt.",
    faq5Q: "Ist der Wert der Box immer höher als der Preis?",
    faq5A:
      "Die Erfahrung ist als Mystery gedacht: Der wahrgenommene Wert kann von Box zu Box variieren. Im Durchschnitt zielen wir auf ein faires Preis-Leistungs-Verhältnis ab, können aber keinen festen Mindestwert pro Box garantieren.",
    faq6Q: "Kann ich die Box auf einem Pop-up-Event abholen?",
    faq6A:
      "Auf einigen Events kannst du Mystery Boxen direkt vor Ort kaufen. Sieh dir dafür immer die Event-Seite mit den aktuellen Verkaufs-Infos an.",

    eventsTitle: "Entdecke unsere nächsten Pop-up-Events",
    eventsSubtitle:
      "Komm vorbei und triff uns live: Pop-up-Events, Messen und temporäre Corner, bei denen du die Mystery Boxen sehen, mit dem Team sprechen und die KiloMystery-Community erleben kannst. ✨",
    eventsCta: "Eventkalender ansehen",
    eventsCard1Kicker: "Pop-ups in der Stadt",
    eventsCard1Title:
      "Stops in den wichtigsten italienischen Städten 🇮🇹",
    eventsCard1Text:
      "Finde heraus, wann wir in deiner Nähe sind, besuche unseren Corner und entdecke die Welt von KiloMystery aus nächster Nähe.",
    eventsCard2Kicker: "Nachhaltigkeitsbereich",
    eventsCard2Title: "So retten wir Pakete und Lagerbestände ♻️",
    eventsCard2Text:
      "Ein eigener Bereich, in dem wir erklären, wie die Posten funktionieren, warum wir Abfall vermeiden und wie die Kreislaufwirtschaft hinter den Boxen aussieht.",
    eventsCard3Kicker: "Community",
    eventsCard3Title: "Triff andere Mystery-Box-Fans 🤝",
    eventsCard3Text:
      "Teile deine Erfahrungen, sieh, was andere gefunden haben, mach Fotos mit deiner Box und nimm eine Erinnerung mit nach Hause.",

    contactTitle: "Kontaktiere uns",
    contactSubtitle:
      "Fragen zu Bestellungen, Versand oder Partnerschaften? Schreib uns:",
  },
};

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang: Lang = normalizeLang(params?.lang);
  return getPageMetadata(lang, "home");
}

export default function HomePage({ params }: { params: { lang: string } }) {
  const { lang: rawLang } = params;
  const lang: Lang = normalizeLang(rawLang);
  const t = HOME_COPY[lang] ?? HOME_COPY.it;

  return (
    <>
      {/* HEADER con lingua dal server */}
      <Header lang={lang as any} />

      <main className="container space-y-16 py-10">
        {/* === HERO (NUOVO) === */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 pt-10 md:pt-12">
          {/* LOGO */}
          <div className="mx-auto mb-6 md:mb-8 w-[220px] md:w-[320px]">
            <Image
              src="/hero/hero.svg"
              alt="KiloMistery"
              width={320}
              height={180}
              className="w-full h-auto drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
              priority
            />
          </div>

          {/* TITOLO con gradient */}
          <h1 className="text-center text-4xl md:text-6xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
              {t.heroTitle}
            </span>
          </h1>

          {/* SOTTOTITOLO */}
          <p className="mx-auto mt-4 max-w-2xl text-center text-white/70">
            {t.heroSubtitle}
          </p>

          {/* CTA pill */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={`/${lang}/products`}
              className="inline-flex items-center justify-center rounded-full px-5 py-3 font-extrabold text-[#0c0f10]
                         bg-gradient-to-r from-[#7A20FF] to-[#20D27A]
                         shadow-[0_14px_36px_rgba(122,32,255,.25),0_8px_24px_rgba(32,210,122,.25)]
                         border border-white/70 transition-transform duration-150 hover:-translate-y-0.5"
            >
              {t.ctaPrices}
            </a>

            <a
              href="#come-funziona"
              className="inline-flex items-center justify-center rounded-full px-5 py-3 font-bold
                         text-white bg-white/10 border border-white/25
                         shadow-[0_8px_22px_rgba(0,0,0,.25)]
                         transition-transform duration-150 hover:bg-white/15 hover:-translate-y-0.5"
            >
              {t.ctaHowItWorks}
            </a>
          </div>
        </section>

        {/* PRODOTTI */}
        <section id="prodotti">
          <ProductsTabs lang={lang as any} />
        </section>

        {/* MARQUEE TRA PRODOTTI E COME FUNZIONA */}
        <section>
          <SectionMarquee lang={lang as any} />
        </section>

        {/* COME FUNZIONA */}
        <section id="come-funziona" className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            {t.howTitle}
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card">
              <div className="text-3xl">🧪</div>
              <h3 className="mt-2 text-lg font-extrabold">
                {t.howCard1Title}
              </h3>
              <p className="text-white/70">{t.howCard1Subtitle}</p>
              <ul className="mt-2 text-white/70 text-sm list-disc ps-5 space-y-1">
                <li>{t.howCard1Bullet1}</li>
                <li>{t.howCard1Bullet2}</li>
              </ul>
            </div>

            <div className="card">
              <div className="text-3xl">🔐</div>
              <h3 className="mt-2 text-lg font-extrabold">
                {t.howCard2Title}
              </h3>
              <p className="text-white/70">{t.howCard2Subtitle}</p>
              <ul className="mt-2 text-white/70 text-sm list-disc ps-5 space-y-1">
                <li>{t.howCard2Bullet1}</li>
                <li>{t.howCard2Bullet2}</li>
              </ul>
            </div>

            <div className="card">
              <div className="text-3xl">🚚</div>
              <h3 className="mt-2 text-lg font-extrabold">
                {t.howCard3Title}
              </h3>
              <p className="text-white/70">{t.howCard3Subtitle}</p>
              <ul className="mt-2 text-white/70 text-sm list-disc ps-5 space-y-1">
                <li>{t.howCard3Bullet1}</li>
                <li>{t.howCard3Bullet2}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SOSTENIBILITÀ */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <span>{t.sustainTitle}</span>
            <span className="text-2xl">🌱🌍</span>
          </h2>
          <div className="card space-y-3">
            <p className="text-white/80">{t.sustainP1}</p>
            <p className="text-white/70 text-sm">{t.sustainP2}</p>
            <ul className="list-disc ps-5 space-y-1 text-white/70 text-sm">
              <li>{t.sustainBullet1}</li>
              <li>{t.sustainBullet2}</li>
              <li>{t.sustainBullet3}</li>
              <li>{t.sustainBullet4}</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            {t.faqTitle}
          </h2>

          <details className="card">
            <summary className="font-semibold cursor-pointer">
              {t.faq1Q}
            </summary>
            <p className="text-white/70 mt-2">{t.faq1A}</p>
          </details>

          <details className="card">
            <summary className="font-semibold cursor-pointer">
              {t.faq2Q}
            </summary>
            <p className="text-white/70 mt-2">{t.faq2A}</p>
          </details>

          <details className="card">
            <summary className="font-semibold cursor-pointer">
              {t.faq3Q}
            </summary>
            <p className="text-white/70 mt-2">{t.faq3A}</p>
          </details>

          <details className="card">
            <summary className="font-semibold cursor-pointer">
              {t.faq4Q}
            </summary>
            <p className="text-white/70 mt-2">{t.faq4A}</p>
          </details>

          <details className="card">
            <summary className="font-semibold cursor-pointer">
              {t.faq5Q}
            </summary>
            <p className="text-white/70 mt-2">{t.faq5A}</p>
          </details>

          <details className="card">
            <summary className="font-semibold cursor-pointer">
              {t.faq6Q}
            </summary>
            <p className="text-white/70 mt-2">{t.faq6A}</p>
          </details>
        </section>

        {/* EVENTI */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
                <span>{t.eventsTitle}</span>
                <span className="text-2xl">📍🎪</span>
              </h2>
              <p className="text-white/70 text-sm md:text-base mt-1 max-w-xl">
                {t.eventsSubtitle}
              </p>
            </div>

            <a
              href="https://www.kilomystery.com/it/events"
              className="btn btn-brand btn-sm md:btn-lg"
            >
              {t.eventsCta}
            </a>
          </div>

          <div className="grid gap-3 md:grid-cols-3 text-sm text-white/75">
            <div className="card">
              <p className="text-xs uppercase tracking-[.15em] text-emerald-300/80 mb-1">
                {t.eventsCard1Kicker}
              </p>
              <p className="font-semibold">{t.eventsCard1Title}</p>
              <p className="text-xs text-white/60 mt-1">
                {t.eventsCard1Text}
              </p>
            </div>

            <div className="card">
              <p className="text-xs uppercase tracking-[.15em] text-emerald-300/80 mb-1">
                {t.eventsCard2Kicker}
              </p>
              <p className="font-semibold">{t.eventsCard2Title}</p>
              <p className="text-xs text-white/60 mt-1">
                {t.eventsCard2Text}
              </p>
            </div>

            <div className="card">
              <p className="text-xs uppercase tracking-[.15em] text-emerald-300/80 mb-1">
                {t.eventsCard3Kicker}
              </p>
              <p className="font-semibold">{t.eventsCard3Title}</p>
              <p className="text-xs text-white/60 mt-1">
                {t.eventsCard3Text}
              </p>
            </div>
          </div>
        </section>

        {/* CONTATTACI */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            {t.contactTitle}
          </h2>
          <p className="text-white/70">{t.contactSubtitle}</p>
          <ContactForm lang={lang} />
        </section>
      </main>

      {/* FOOTER */}
      <Footer lang={lang as any} />
    </>
  );
}
