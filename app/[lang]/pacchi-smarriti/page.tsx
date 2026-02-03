// app/[lang]/pacchi-smarriti/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductsTabs from "../../components/ProductsTabs";

type Lang = "it" | "en" | "es" | "fr" | "de";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";

function normLang(l: string): Lang {
  const x = String(l || "it").toLowerCase();
  if (x === "en" || x === "es" || x === "fr" || x === "de") return x;
  return "it";
}

type FAQ = { q: string; a: string };

const COPY: Record<
  Lang,
  {
    title: string;
    description: string;

    seoHubLine: string;

    h1: string;
    intro: string;

    bulletsTitle: string;
    bullets: string[];

    ctaPrimary: string;
    ctaSecondary: string;

    section1Title: string;
    section1Body: string;

    section2Title: string;
    section2Body: string;

    section3Title: string;
    section3Body: string;

    section4Title: string;
    section4Body: string;

    shopTitle: string;
    shopIntro: string;

    linksTitle: string;
    linksBody: string;
    linkProducts: string;
    linkMysteryBox: string;
    linkHowItWorks: string;
    linkShipping: string;
    linkReturns: string;

    faqTitle: string;
    faqIntro: string;
    faqs: FAQ[];

    finalTitle: string;
    finalBody: string;
    finalPrimary: string;
    finalSecondary: string;
  }
> = {
  it: {
    title: "Pacchi Smarriti: come nascono e dove comprarli | KiloMystery",
    description:
      "Pacchi smarriti: come si smarriscono, resi non ritirati, ritorni e stock di magazzino. Scopri come acquistare pacchi smarriti in modo sicuro con KiloMystery.",
    seoHubLine: "SEO hub: pacchi smarriti • keyword: comprare pacchi smarriti",

    h1: "Pacchi Smarriti: cosa sono, come nascono e dove comprarli",
    intro:
      "I pacchi smarriti sono spedizioni che non arrivano mai a destinazione oppure che non vengono ritirate dopo i tentativi di consegna. Invece di finire al macero, in alcuni casi vengono recuperate e rivendute in stock. Qui ti spieghiamo come succede davvero e come acquistarli in modo trasparente.",

    bulletsTitle: "Perché i pacchi smarriti esistono (e perché vengono rivenduti)",
    bullets: [
      "Nei grandi hub logistici passano migliaia di pacchi all’ora: errori e imprevisti accadono.",
      "Molti pacchi diventano “non consegnabili” per etichette rovinate o dati incompleti.",
      "I resi non ritirati occupano spazio e generano costi di gestione.",
      "Rivendere stock è spesso più efficiente di distruggere o stoccare a lungo.",
    ],

    ctaPrimary: "Compra Pacchi Smarriti",
    ctaSecondary: "Come funziona",

    section1Title: "Come si smarriscono i pacchi",
    section1Body:
      "Un pacco può “sparire” per motivi semplici: indirizzo errato, CAP sbagliato, etichetta illeggibile o danneggiata. Nei centri di smistamento, piccoli errori di scansione o movimentazione possono deviare una spedizione. Se non è più possibile risalire al destinatario o al mittente, il pacco entra in un flusso di gestione speciale.",

    section2Title: "Pacchi di ritorno e resi non ritirati",
    section2Body:
      "Una quota importante nasce dai pacchi non ritirati: il corriere tenta la consegna, lascia avvisi, e dopo un periodo di giacenza il pacco torna indietro. Se anche il mittente non lo reclama (o se la procedura di rientro fallisce), la spedizione può finire in stock di magazzino. In pratica, sono pacchi “orfani” dal punto di vista logistico.",

    section3Title: "Dal magazzino al macero (e perché alcuni vengono salvati)",
    section3Body:
      "Per le aziende, tenere pacchi fermi è un costo: spazio, inventario, gestione. In molti casi la soluzione è lo smaltimento (macerazione) oppure la liquidazione in lotti. La rivendita in stock consente di recuperare parte del valore e ridurre sprechi. È qui che nasce il mercato dei pacchi smarriti e dei lotti di reso.",

    section4Title: "È legale comprare pacchi smarriti?",
    section4Body:
      "Sì, quando i pacchi sono ceduti tramite canali di liquidazione dopo che non sono più reclamabili o gestibili. L’importante è acquistare da realtà trasparenti e con processi chiari. Diffida da promesse “troppo belle” (valori garantiti, iPhone assicurati, ecc.): nei pacchi smarriti conta la variabilità.",

    shopTitle: "Acquista pacchi smarriti su KiloMystery",
    shopIntro:
      "Dopo aver capito come funziona, puoi acquistare direttamente qui: scegli fascia e formato, e procedi all’ordine. (Tabs prodotti qui sotto.)",

    linksTitle: "Link utili per approfondire",
    linksBody:
      "Se vuoi confrontare il formato “pacchi smarriti” con altri prodotti e capire meglio spedizioni e regole, usa questi link interni:",

    linkProducts: "Vai ai Prodotti",
    linkMysteryBox: "Leggi la guida Mystery Box",
    linkHowItWorks: "Come funziona",
    linkShipping: "Spedizioni",
    linkReturns: "Resi",

    faqTitle: "FAQ – Pacchi Smarriti",
    faqIntro:
      "Risposte rapide alle domande più comuni su pacchi smarriti, resi non ritirati e acquisto online.",

    faqs: [
      {
        q: "Cosa sono i pacchi smarriti?",
        a: "Sono spedizioni non consegnate o non ritirate che, dopo i tentativi di consegna e le procedure di rientro, non vengono più gestite come consegna standard e possono finire in stock di liquidazione.",
      },
      {
        q: "Come si smarriscono i pacchi?",
        a: "Per errori di indirizzo, etichette danneggiate, problemi di scansione nei centri di smistamento, oppure perché il destinatario non ritira il pacco e il rientro non va a buon fine.",
      },
      {
        q: "I pacchi non ritirati finiscono sempre al macero?",
        a: "Non sempre. In alcuni casi vengono smaltiti, in altri vengono liquidati in lotti per recuperare valore e liberare spazio nei magazzini.",
      },
      {
        q: "È legale comprare pacchi smarriti?",
        a: "Sì, quando provengono da processi di liquidazione e non sono più reclamabili/gestibili come spedizioni standard. Conta acquistare da venditori trasparenti.",
      },
      {
        q: "Cosa posso trovare dentro?",
        a: "Contenuti variabili: elettronica, accessori, abbigliamento, prodotti casa e altro. Non esiste una lista garantita: la variabilità è parte del formato.",
      },
      {
        q: "Posso fare reso?",
        a: "Trattandosi di prodotti a contenuto variabile/sorpresa, di norma il reso non è previsto. Consulta la policy Resi per i dettagli.",
      },
      {
        q: "Spedite con tracking?",
        a: "Sì, la spedizione è tracciata quando disponibile. I dettagli sono nella pagina Spedizioni.",
      },
    ],

    finalTitle: "Vuoi provare l’esperienza dei pacchi smarriti?",
    finalBody:
      "Se cercavi “pacchi smarriti” per curiosità o rivendita, qui trovi una guida chiara e l’accesso diretto ai prodotti. Scegli il formato e inizia l’unboxing.",
    finalPrimary: "Acquista ora",
    finalSecondary: "Contattaci",
  },

  en: {
    title: "Lost Parcels: how they happen & where to buy | KiloMystery",
    description:
      "Lost parcels explained: misroutes, unclaimed returns, warehouse stock and liquidation. Learn how to buy lost parcels safely with KiloMystery.",
    seoHubLine: "SEO hub: lost parcels • keyword: buy lost parcels",

    h1: "Lost Parcels: what they are, how they happen, and where to buy them",
    intro:
      "Lost parcels are shipments that never reach the recipient or are never collected after delivery attempts. In some cases, instead of being destroyed, they are recovered and sold as liquidation stock. Here’s how it works and how to buy transparently.",

    bulletsTitle: "Why lost parcels exist (and why they get resold)",
    bullets: [
      "Large sorting hubs process thousands of parcels per hour—mistakes and exceptions happen.",
      "Labels can get damaged or data can be incomplete, making parcels undeliverable.",
      "Unclaimed returns take warehouse space and add handling costs.",
      "Liquidation stock is often more efficient than long-term storage or destruction.",
    ],

    ctaPrimary: "Shop Lost Parcels",
    ctaSecondary: "How it works",

    section1Title: "How parcels get lost",
    section1Body:
      "Parcels can go missing due to simple issues: wrong address, incorrect ZIP code, unreadable/damaged labels. In sorting centers, scanning or handling errors can reroute shipments. When it’s no longer possible to identify the recipient or sender, parcels may enter special handling flows.",

    section2Title: "Returns and unclaimed parcels",
    section2Body:
      "A major source is unclaimed returns: delivery attempts fail, parcels sit in pickup points, and then get returned. If the sender doesn’t reclaim them (or the return process fails), parcels can become warehouse stock. Think of them as logistics “orphans.”",

    section3Title: "From warehouse to destruction (and why some are saved)",
    section3Body:
      "Keeping parcels in storage is expensive: space, inventory management, and labor. Many end up destroyed, while others are liquidated in lots to recover value and free space. That’s how the lost-parcel liquidation market exists.",

    section4Title: "Is it legal to buy lost parcels?",
    section4Body:
      "Yes—when parcels are sold through liquidation channels after they’re no longer reclaimable/processable as standard deliveries. The key is choosing transparent sellers and avoiding unrealistic guarantees (e.g., “guaranteed iPhone”). Variability is part of the format.",

    shopTitle: "Buy lost parcels on KiloMystery",
    shopIntro:
      "After reading the explanation, you can purchase directly here: choose your tier/format and place the order. (Product tabs below.)",

    linksTitle: "Helpful internal links",
    linksBody:
      "Compare formats and understand shipping/returns via these internal pages:",

    linkProducts: "Go to Products",
    linkMysteryBox: "Read the Mystery Box guide",
    linkHowItWorks: "How it works",
    linkShipping: "Shipping",
    linkReturns: "Returns",

    faqTitle: "FAQ – Lost Parcels",
    faqIntro: "Quick answers about lost parcels, unclaimed returns, and buying online.",

    faqs: [
      {
        q: "What are lost parcels?",
        a: "They are undelivered or unclaimed shipments that, after delivery/return procedures, can become liquidation stock in some cases.",
      },
      {
        q: "How do parcels get lost?",
        a: "Wrong/incomplete address, damaged labels, scanning errors in sorting centers, or unclaimed pickup/return processes.",
      },
      {
        q: "Do unclaimed parcels always get destroyed?",
        a: "Not always. Some are destroyed, others are liquidated in lots to recover value and free warehouse space.",
      },
      {
        q: "Is it legal to buy lost parcels?",
        a: "Yes, when sourced via liquidation and no longer reclaimable/processable as standard deliveries. Transparency matters.",
      },
      {
        q: "What can be inside?",
        a: "Variable contents: electronics, accessories, clothing, home items, and more. No guaranteed list—variability is the point.",
      },
      {
        q: "Can I return it?",
        a: "Surprise/variable-content formats typically aren’t returnable. Check the Returns policy for details.",
      },
      {
        q: "Do you ship with tracking?",
        a: "Yes, tracking is provided when available. See the Shipping page for details.",
      },
    ],

    finalTitle: "Ready to try lost parcels?",
    finalBody:
      "If you searched for “lost parcels” out of curiosity or for resale, this page gives you clarity and direct access to products. Choose a format and start the unboxing.",
    finalPrimary: "Shop now",
    finalSecondary: "Contact us",
  },

  es: {
    title: "Paquetes perdidos: cómo ocurren y dónde comprarlos | KiloMystery",
    description:
      "Paquetes perdidos: desvíos, devoluciones no recogidas, stock de almacén y liquidación. Aprende a comprar paquetes perdidos con seguridad en KiloMystery.",
    seoHubLine: "SEO hub: paquetes perdidos • keyword: comprar paquetes perdidos",

    h1: "Paquetes perdidos: qué son, cómo ocurren y dónde comprarlos",
    intro:
      "Los paquetes perdidos son envíos que no llegan al destinatario o no se recogen tras varios intentos. En algunos casos, en lugar de destruirse, se recuperan y se venden en lotes de liquidación. Aquí te explicamos cómo funciona.",

    bulletsTitle: "Por qué existen (y por qué se revenden)",
    bullets: [
      "Los grandes centros logísticos procesan miles de paquetes por hora: hay incidencias.",
      "Etiquetas dañadas o datos incompletos pueden hacer el envío imposible de entregar.",
      "Las devoluciones no recogidas ocupan espacio y generan costes.",
      "Liquidar lotes puede ser más eficiente que almacenar o destruir.",
    ],

    ctaPrimary: "Comprar Paquetes Perdidos",
    ctaSecondary: "Cómo funciona",

    section1Title: "Cómo se pierden los paquetes",
    section1Body:
      "Pueden perderse por dirección errónea, código postal incorrecto, etiqueta ilegible o dañada. En centros de clasificación, errores de escaneo o manipulación pueden desviar el envío. Si no se puede identificar al destinatario o remitente, pasa a gestión especial.",

    section2Title: "Devoluciones y paquetes no recogidos",
    section2Body:
      "Una fuente importante son los paquetes no recogidos: fallan intentos de entrega, quedan en punto de recogida y luego vuelven. Si el remitente no los reclama (o falla el proceso), pueden convertirse en stock de almacén.",

    section3Title: "Del almacén a la destrucción (y por qué algunos se salvan)",
    section3Body:
      "Guardar paquetes cuesta dinero (espacio y gestión). Muchos se destruyen, otros se liquidan en lotes para recuperar valor y liberar espacio. Así nace el mercado de liquidación de paquetes perdidos.",

    section4Title: "¿Es legal comprar paquetes perdidos?",
    section4Body:
      "Sí, cuando provienen de canales de liquidación tras no ser reclamables/gestionables como entregas estándar. Evita promesas irreales: la variabilidad es parte de la experiencia.",

    shopTitle: "Compra paquetes perdidos en KiloMystery",
    shopIntro:
      "Después de entender el proceso, puedes comprar aquí mismo: elige formato y realiza el pedido. (Pestañas de productos abajo.)",

    linksTitle: "Enlaces internos útiles",
    linksBody: "Para comparar formatos y ver políticas:",

    linkProducts: "Ver Productos",
    linkMysteryBox: "Guía de Mystery Box",
    linkHowItWorks: "Cómo funciona",
    linkShipping: "Envíos",
    linkReturns: "Devoluciones",

    faqTitle: "FAQ – Paquetes perdidos",
    faqIntro: "Respuestas rápidas sobre paquetes perdidos y compras online.",

    faqs: [
      {
        q: "¿Qué son los paquetes perdidos?",
        a: "Envíos no entregados o no recogidos que, tras procesos de devolución/gestión, pueden acabar en lotes de liquidación.",
      },
      {
        q: "¿Cómo se pierden?",
        a: "Dirección incorrecta/incompleta, etiquetas dañadas, errores de escaneo o devoluciones no recogidas.",
      },
      {
        q: "¿Siempre se destruyen?",
        a: "No siempre. Algunos se destruyen y otros se liquidan en lotes para recuperar valor y liberar espacio.",
      },
      {
        q: "¿Es legal comprarlos?",
        a: "Sí, si provienen de liquidación y ya no son reclamables/gestionables como entregas estándar.",
      },
      {
        q: "¿Qué puede haber dentro?",
        a: "Contenido variable: electrónica, accesorios, ropa, hogar, etc. No hay lista garantizada.",
      },
      {
        q: "¿Se puede devolver?",
        a: "Los formatos sorpresa/variables normalmente no admiten devolución. Revisa la política de devoluciones.",
      },
      {
        q: "¿Envío con tracking?",
        a: "Sí, con seguimiento cuando esté disponible. Mira la página de envíos.",
      },
    ],

    finalTitle: "¿Listo para probar paquetes perdidos?",
    finalBody:
      "Si buscabas “paquetes perdidos”, aquí tienes una guía clara y acceso directo a productos. Elige un formato y empieza el unboxing.",
    finalPrimary: "Comprar ahora",
    finalSecondary: "Contactar",
  },

  fr: {
    title: "Colis perdus : comment ça arrive et où acheter | KiloMystery",
    description:
      "Colis perdus : erreurs logistiques, retours non récupérés, stock d’entrepôt et liquidation. Découvrez comment acheter des colis perdus en toute transparence avec KiloMystery.",
    seoHubLine: "SEO hub: colis perdus • keyword: acheter colis perdus",

    h1: "Colis perdus : définition, causes et où les acheter",
    intro:
      "Les colis perdus sont des envois non livrés ou non récupérés après plusieurs tentatives. Dans certains cas, au lieu d’être détruits, ils sont récupérés et vendus en lots de liquidation. Voici comment cela fonctionne.",

    bulletsTitle: "Pourquoi les colis perdus existent (et pourquoi ils sont revendus)",
    bullets: [
      "Les hubs de tri traitent des milliers de colis/heure : des incidents arrivent.",
      "Étiquettes abîmées ou données incomplètes : colis non livrables.",
      "Les retours non récupérés prennent de la place et coûtent cher.",
      "La liquidation de lots est souvent plus efficace que le stockage ou la destruction.",
    ],

    ctaPrimary: "Acheter des Colis Perdus",
    ctaSecondary: "Comment ça marche",

    section1Title: "Comment un colis devient “perdu”",
    section1Body:
      "Adresse incorrecte, code postal erroné, étiquette illisible/abîmée : des causes simples peuvent suffire. Dans les centres de tri, des erreurs de scan ou de manutention peuvent dévier un colis. Si l’identification expéditeur/destinataire échoue, le colis passe en gestion spéciale.",

    section2Title: "Retours et colis non récupérés",
    section2Body:
      "Une source majeure : les colis non récupérés. Après échecs de livraison, le colis reste en point relais puis repart. Si l’expéditeur ne le réclame pas (ou si le retour échoue), il peut devenir du stock d’entrepôt.",

    section3Title: "Entrepôt, destruction… ou liquidation",
    section3Body:
      "Stocker coûte cher : espace, gestion, main-d’œuvre. Beaucoup sont détruits, d’autres sont liquidés en lots pour récupérer de la valeur et libérer de l’espace. C’est le principe du marché des colis perdus.",

    section4Title: "Est-ce légal d’acheter des colis perdus ?",
    section4Body:
      "Oui, quand ils proviennent de canaux de liquidation après ne plus être réclamables/traitables comme livraisons standard. Évite les promesses irréalistes : la variabilité fait partie du format.",

    shopTitle: "Acheter sur KiloMystery",
    shopIntro:
      "Après la lecture, vous pouvez acheter directement ici : choisissez le format et commandez. (Onglets produits ci-dessous.)",

    linksTitle: "Liens utiles",
    linksBody: "Comparer les formats et consulter les politiques :", 

    linkProducts: "Voir les Produits",
    linkMysteryBox: "Guide Mystery Box",
    linkHowItWorks: "Comment ça marche",
    linkShipping: "Livraison",
    linkReturns: "Retours",

    faqTitle: "FAQ – Colis perdus",
    faqIntro: "Réponses rapides sur les colis perdus et l’achat en ligne.",

    faqs: [
      {
        q: "Qu’est-ce qu’un colis perdu ?",
        a: "Un envoi non livré ou non récupéré qui, après procédures, peut finir en lot de liquidation dans certains cas.",
      },
      {
        q: "Comment les colis se perdent-ils ?",
        a: "Adresse incomplète, étiquette abîmée, erreurs de scan/manutention, retours non récupérés.",
      },
      {
        q: "Sont-ils toujours détruits ?",
        a: "Non. Certains sont détruits, d’autres liquidés en lots pour récupérer de la valeur.",
      },
      {
        q: "Est-ce légal d’en acheter ?",
        a: "Oui, si la source est une liquidation et que le colis n’est plus réclamable/traitable comme livraison standard.",
      },
      {
        q: "Que peut-on trouver dedans ?",
        a: "Contenu variable : électronique, accessoires, vêtements, maison… aucune liste garantie.",
      },
      {
        q: "Peut-on retourner ?",
        a: "Les formats “surprise” ne sont généralement pas retournables. Voir la politique de retours.",
      },
      {
        q: "Livraison avec suivi ?",
        a: "Oui, avec tracking quand disponible. Voir la page Livraison.",
      },
    ],

    finalTitle: "Prêt à tester les colis perdus ?",
    finalBody:
      "Si vous cherchiez “colis perdus”, cette page explique clairement et vous permet d’acheter directement. Choisissez un format et lancez l’unboxing.",
    finalPrimary: "Acheter maintenant",
    finalSecondary: "Nous contacter",
  },

  de: {
    title: "Verlorene Pakete: wie sie entstehen & wo kaufen | KiloMystery",
    description:
      "Verlorene Pakete erklärt: Fehlleitungen, nicht abgeholte Rücksendungen, Lagerbestände & Liquidation. So kaufst du verlorene Pakete transparent bei KiloMystery.",
    seoHubLine: "SEO hub: verlorene pakete • keyword: verlorene pakete kaufen",

    h1: "Verlorene Pakete: was sie sind, wie sie entstehen und wo man sie kaufen kann",
    intro:
      "Verlorene Pakete sind Sendungen, die nie zugestellt oder nach Zustellversuchen nicht abgeholt werden. In manchen Fällen werden sie nicht zerstört, sondern als Liquidationsware in Lots verkauft. Hier ist der Ablauf.",

    bulletsTitle: "Warum verlorene Pakete existieren (und warum sie weiterverkauft werden)",
    bullets: [
      "Große Sortierzentren verarbeiten tausende Pakete pro Stunde – Ausnahmen passieren.",
      "Beschädigte Labels oder unvollständige Daten machen Pakete unzustellbar.",
      "Nicht abgeholte Rücksendungen kosten Lagerfläche und Handling.",
      "Lots zu liquidieren ist oft effizienter als lange zu lagern oder zu zerstören.",
    ],

    ctaPrimary: "Verlorene Pakete kaufen",
    ctaSecondary: "So funktioniert’s",

    section1Title: "Wie Pakete verloren gehen",
    section1Body:
      "Falsche Adresse, falsche PLZ, unleserliche/beschädigte Labels: schon kleine Ursachen reichen. In Sortierzentren können Scan- oder Handlingfehler Sendungen umleiten. Wenn Absender/Empfänger nicht mehr eindeutig identifizierbar sind, landen Pakete in Sonderprozessen.",

    section2Title: "Rückläufer & nicht abgeholte Sendungen",
    section2Body:
      "Eine wichtige Quelle sind nicht abgeholte Sendungen: Zustellung scheitert, Paket liegt im Abholpunkt und wird zurückgesendet. Wenn der Absender es nicht zurücknimmt (oder der Prozess scheitert), wird es zum Lagerbestand/Lot.",

    section3Title: "Vom Lager zur Zerstörung (oder Liquidation)",
    section3Body:
      "Lagerung kostet: Platz, Verwaltung, Arbeit. Viele Pakete werden zerstört, andere in Lots liquidiert, um Wert zurückzugewinnen und Lager zu leeren. Daraus entsteht der Markt für verlorene Pakete.",

    section4Title: "Ist der Kauf legal?",
    section4Body:
      "Ja, wenn die Ware aus Liquidationskanälen stammt und nicht mehr als Standardzustellung reklamierbar/abwickelbar ist. Vorsicht bei unrealistischen Versprechen – Variabilität gehört dazu.",

    shopTitle: "Verlorene Pakete bei KiloMystery kaufen",
    shopIntro:
      "Nach dem Lesen kannst du direkt hier kaufen: Format wählen und bestellen. (Produkttabs unten.)",

    linksTitle: "Nützliche interne Links",
    linksBody: "Vergleiche Formate und Policies über diese Seiten:",

    linkProducts: "Zu den Produkten",
    linkMysteryBox: "Mystery-Box-Guide",
    linkHowItWorks: "So funktioniert’s",
    linkShipping: "Versand",
    linkReturns: "Rückgabe",

    faqTitle: "FAQ – Verlorene Pakete",
    faqIntro: "Kurze Antworten zu verlorenen Paketen und Online-Kauf.",

    faqs: [
      {
        q: "Was sind verlorene Pakete?",
        a: "Nicht zugestellte oder nicht abgeholte Sendungen, die nach Prozessen in manchen Fällen als Liquidationslots verkauft werden können.",
      },
      {
        q: "Wie gehen Pakete verloren?",
        a: "Unvollständige/falsche Adresse, beschädigte Labels, Scan-/Handlingfehler, nicht abgeholte Rücksendungen.",
      },
      {
        q: "Werden sie immer zerstört?",
        a: "Nein. Einige werden zerstört, andere als Lots liquidiert, um Wert zurückzugewinnen.",
      },
      {
        q: "Ist es legal, sie zu kaufen?",
        a: "Ja, wenn sie aus Liquidation stammen und nicht mehr als Standardzustellung abwickelbar sind.",
      },
      {
        q: "Was kann drin sein?",
        a: "Variabler Inhalt: Elektronik, Zubehör, Kleidung, Haushalt u. a. Keine garantierte Liste.",
      },
      {
        q: "Kann ich zurückgeben?",
        a: "Surprise-/variabler Inhalt ist meist nicht rückgabefähig. Bitte Rückgabe-Policy prüfen.",
      },
      {
        q: "Versand mit Tracking?",
        a: "Ja, Tracking wenn verfügbar. Details auf der Versandseite.",
      },
    ],

    finalTitle: "Bereit für verlorene Pakete?",
    finalBody:
      "Wenn du nach “verlorene Pakete” gesucht hast: Hier bekommst du Klarheit und kannst direkt kaufen. Format wählen und unboxen.",
    finalPrimary: "Jetzt kaufen",
    finalSecondary: "Kontakt",
  },
};

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = normLang(params?.lang);
  const c = COPY[lang];
  const url = `${SITE_URL}/${lang}/pacchi-smarriti`;

  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: url,
      languages: {
        it: `${SITE_URL}/it/pacchi-smarriti`,
        en: `${SITE_URL}/en/pacchi-smarriti`,
        es: `${SITE_URL}/es/pacchi-smarriti`,
        fr: `${SITE_URL}/fr/pacchi-smarriti`,
        de: `${SITE_URL}/de/pacchi-smarriti`,
      },
    },
    openGraph: {
      title: c.title,
      description: c.description,
      url,
      type: "article",
    },
  };
}

export default function PacchiSmarritiPage({ params }: { params: { lang: string } }) {
  const lang = normLang(params?.lang);
  const c = COPY[lang];
  const pageUrl = `${SITE_URL}/${lang}/pacchi-smarriti`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "KiloMystery",
        item: `${SITE_URL}/${lang}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: lang === "it" ? "Pacchi Smarriti" : c.h1,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-10">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        {/* HERO */}
        <header className="max-w-3xl">
          <p className="text-white/60 text-sm">{c.seoHubLine}</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2">
            {c.h1}
          </h1>
          <p className="text-white/75 mt-4 text-lg leading-relaxed">
            {c.intro}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${lang}/products`} className="btn btn-brand px-6 py-3 font-bold">
              {c.ctaPrimary}
            </Link>
            <Link href={`/${lang}/how-it-works`} className="btn btn-ghost px-6 py-3 font-bold">
              {c.ctaSecondary}
            </Link>
          </div>
        </header>

        {/* WHY */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.bulletsTitle}</h2>
          <ul className="mt-4 space-y-2 text-white/75">
            {c.bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="mt-[2px]">✅</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* SECTIONS */}
        <section className="grid md:grid-cols-2 gap-5">
          <article className="card">
            <h2 className="text-2xl font-extrabold">{c.section1Title}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">{c.section1Body}</p>
          </article>

          <article className="card">
            <h2 className="text-2xl font-extrabold">{c.section2Title}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">{c.section2Body}</p>
          </article>

          <article className="card md:col-span-2">
            <h2 className="text-2xl font-extrabold">{c.section3Title}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">{c.section3Body}</p>
          </article>

          <article className="card md:col-span-2">
            <h2 className="text-2xl font-extrabold">{c.section4Title}</h2>
            <p className="text-white/75 mt-3 leading-relaxed">{c.section4Body}</p>
          </article>
        </section>

        {/* SHOP INLINE */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.shopTitle}</h2>
          <p className="text-white/75 mt-3 leading-relaxed">{c.shopIntro}</p>

          <div className="mt-6">
            {/* Se ProductsTabs non accetta lang, rimuovi la prop */}
            <ProductsTabs lang={lang} />
          </div>
        </section>

        {/* INTERNAL LINKS (SEO) */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.linksTitle}</h2>
          <p className="text-white/75 mt-3">{c.linksBody}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/${lang}/products`} className="btn btn-brand">
              {c.linkProducts}
            </Link>
            <Link href={`/${lang}/mystery-box`} className="btn btn-ghost">
              {c.linkMysteryBox}
            </Link>
            <Link href={`/${lang}/how-it-works`} className="btn btn-ghost">
              {c.linkHowItWorks}
            </Link>
            <Link href={`/${lang}/policy/shipping`} className="btn btn-ghost">
              {c.linkShipping}
            </Link>
            <Link href={`/${lang}/policy/returns`} className="btn btn-ghost">
              {c.linkReturns}
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="card">
          <h2 className="text-2xl font-extrabold">{c.faqTitle}</h2>
          <p className="text-white/70 mt-2">{c.faqIntro}</p>

          <div className="mt-5 space-y-3">
            {c.faqs.map((f, idx) => (
              <details
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <summary className="cursor-pointer font-bold">{f.q}</summary>
                <p className="text-white/75 mt-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="card text-center">
          <h2 className="text-2xl font-extrabold">{c.finalTitle}</h2>
          <p className="text-white/75 mt-2">{c.finalBody}</p>
          <div className="mt-5 flex justify-center gap-3 flex-wrap">
            <Link href={`/${lang}/products`} className="btn btn-brand px-7 py-3 font-bold">
              {c.finalPrimary}
            </Link>
            <Link href={`/${lang}/contact`} className="btn btn-ghost px-7 py-3 font-bold">
              {c.finalSecondary}
            </Link>
          </div>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
