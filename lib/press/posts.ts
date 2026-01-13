import type { PressPost, PressMention } from "./types";

export const PRESS_POSTS: PressPost[] = [
  {
    slug: "pop-up-brindisi-febbraio-2026",
    date: "2026-02-06",
    tags: ["press", "pop-up", "events", "sustainability"],

    title: {
      it: "KiloMystery arriva in provincia di Brindisi: il pop-up che trasforma lo spreco in sorpresa",
      en: "KiloMystery arrives in the Brindisi area: the pop-up turning waste into surprise",
      es: "KiloMystery llega a la provincia de Brindisi: el pop-up que transforma el desperdicio en sorpresa",
      fr: "KiloMystery arrive dans la province de Brindisi : le pop-up qui transforme le gaspillage en surprise",
      de: "KiloMystery kommt in die Provinz Brindisi: das Pop-up, das Verschwendung in Überraschung verwandelt",
    },

    description: {
      it: "Dal 6 all’8 febbraio 2026 pacchi misteriosi recuperati, sostenibilità ed economia circolare arrivano in provincia di Brindisi.",
      en: "From February 6 to 8, 2026, recovered mystery parcels, sustainability and circular economy arrive in the Brindisi area.",
      es: "Del 6 al 8 de febrero de 2026 llegan a Brindisi paquetes misteriosos recuperados, sostenibilidad y economía circular.",
      fr: "Du 6 au 8 février 2026, colis mystères récupérés, durabilité et économie circulaire arrivent à Brindisi.",
      de: "Vom 6. bis 8. Februar 2026 kommen gerettete Mystery-Pakete, Nachhaltigkeit und Kreislaufwirtschaft nach Brindisi.",
    },

    content: {
      it: `
Il nuovo anno si apre con un invito alla scoperta e alla responsabilità.  
KiloMystery arriva in provincia di Brindisi con un pop-up temporaneo dedicato ai pacchi misteriosi recuperati, un format che unisce curiosità, sostenibilità ed economia circolare.

Dal 6 all’8 febbraio 2026, il pubblico potrà vivere un’esperienza di shopping diversa dal solito: pacchi sigillati di varie dimensioni, acquistabili a sorpresa, senza conoscere il contenuto prima dell’acquisto.

Ogni anno migliaia di spedizioni non consegnate vengono distrutte perché il loro recupero non è ritenuto economicamente conveniente.  
KiloMystery nasce per cambiare questa logica, trasformando uno spreco invisibile in un’esperienza concreta e responsabile.

Il progetto punta a dare nuova vita a prodotti recuperati dagli e-commerce europei, evitando che finiscano distrutti e contribuendo a un modello di economia circolare.

Durante il pop-up, i visitatori potranno scegliere tra pacchi sigillati di diverse dimensioni e acquistarli senza conoscere il contenuto in anticipo.  
La scoperta avviene solo dopo l’acquisto, rendendo l’esperienza imprevedibile e coinvolgente.

All’interno dei pacchi si possono trovare prodotti provenienti dagli e-commerce europei: tecnologia, moda, accessori, cosmetica, oggettistica e molto altro.

L’accesso al pop-up è gratuito e aperto a tutti.  
Per i minori è richiesta la presenza di un adulto.

L’arrivo di KiloMystery in provincia di Brindisi rappresenta una nuova tappa di un progetto che punta a sensibilizzare sul tema dello spreco, dimostrando che sostenibilità e sorpresa possono convivere.

Media contact: info@kilomystery.com
      `.trim(),

      en: `
The new year opens with an invitation to discovery and responsibility.  
KiloMystery arrives in the Brindisi area with a temporary pop-up dedicated to recovered mystery parcels, a format combining curiosity, sustainability and circular economy.

From February 6 to 8, 2026, visitors will experience a different kind of shopping: sealed parcels of various sizes, purchased as a surprise without knowing the contents beforehand.

Every year, thousands of undelivered shipments are destroyed because recovery is considered economically unviable.  
KiloMystery was created to change this logic, transforming hidden waste into a tangible and responsible experience.

The project gives a second life to products recovered from European e-commerce, preventing destruction and promoting a circular economy model.

At the pop-up, visitors can choose among sealed parcels of different sizes, purchasing them without knowing the contents in advance.  
The discovery happens only after purchase, making the experience unpredictable and engaging.

Inside the parcels, customers may find products from European e-commerce platforms, including technology, fashion, accessories, cosmetics and more.

Access to the pop-up is free and open to all.  
Minors must be accompanied by an adult.

KiloMystery’s arrival in the Brindisi area marks a new step in a project focused on raising awareness about waste, proving that sustainability and surprise can coexist.

Media contact: info@kilomystery.com
      `.trim(),

      es: `
El nuevo año comienza con una invitación al descubrimiento y a la responsabilidad.  
KiloMystery llega a la provincia de Brindisi con un pop-up temporal dedicado a paquetes misteriosos recuperados, un formato que combina curiosidad, sostenibilidad y economía circular.

Del 6 al 8 de febrero de 2026, el público podrá vivir una experiencia de compra diferente: paquetes sellados de distintos tamaños, comprados a sorpresa sin conocer el contenido previamente.

Cada año miles de envíos no entregados son destruidos porque su recuperación no se considera rentable.  
KiloMystery nace para cambiar esta lógica, transformando un desperdicio invisible en una experiencia concreta y responsable.

El proyecto da una segunda vida a productos recuperados del comercio electrónico europeo, evitando su destrucción y promoviendo la economía circular.

Durante el pop-up, los visitantes pueden elegir entre paquetes sellados de diferentes tamaños y comprarlos sin conocer el contenido de antemano.  
La sorpresa llega solo después de la compra.

Dentro de los paquetes se pueden encontrar productos de e-commerce europeos como tecnología, moda, accesorios, cosmética y más.

El acceso al pop-up es gratuito y abierto a todos.  
Los menores deben ir acompañados por un adulto.

La llegada de KiloMystery a la provincia de Brindisi representa un nuevo paso en un proyecto que busca concienciar sobre el desperdicio, demostrando que sostenibilidad y sorpresa pueden coexistir.

Contacto de prensa: info@kilomystery.com
      `.trim(),

      fr: `
La nouvelle année s’ouvre sur une invitation à la découverte et à la responsabilité.  
KiloMystery arrive dans la province de Brindisi avec un pop-up temporaire dédié aux colis mystères récupérés, un concept mêlant curiosité, durabilité et économie circulaire.

Du 6 au 8 février 2026, le public pourra vivre une expérience de shopping différente : colis scellés de tailles variées, achetés à l’aveugle sans connaître leur contenu à l’avance.

Chaque année, des milliers de colis non livrés sont détruits car leur récupération est jugée non rentable.  
KiloMystery est né pour changer cette logique, en transformant un gaspillage invisible en une expérience concrète et responsable.

Le projet donne une seconde vie à des produits issus de l’e-commerce européen, évitant leur destruction et favorisant l’économie circulaire.

Lors du pop-up, les visiteurs peuvent choisir parmi des colis scellés de différentes tailles, sans connaître leur contenu avant l’achat.  
La découverte se fait uniquement après l’achat.

À l’intérieur, on peut trouver des produits provenant de l’e-commerce européen : technologie, mode, accessoires, cosmétiques et plus encore.

L’accès au pop-up est gratuit et ouvert à tous.  
Les mineurs doivent être accompagnés d’un adulte.

L’arrivée de KiloMystery dans la province de Brindisi marque une nouvelle étape d’un projet visant à sensibiliser au gaspillage, en montrant que durabilité et surprise peuvent coexister.

Contact presse : info@kilomystery.com
      `.trim(),

      de: `
Das neue Jahr beginnt mit einer Einladung zur Entdeckung und Verantwortung.  
KiloMystery kommt mit einem temporären Pop-up in die Provinz Brindisi, das sich geretteten Mystery-Paketen widmet und Neugier, Nachhaltigkeit und Kreislaufwirtschaft verbindet.

Vom 6. bis 8. Februar 2026 erleben Besucher eine besondere Shopping-Erfahrung: versiegelte Pakete in unterschiedlichen Größen, gekauft als Überraschung ohne vorherige Kenntnis des Inhalts.

Jedes Jahr werden tausende nicht zugestellte Sendungen zerstört, da ihre Rückgewinnung als wirtschaftlich nicht sinnvoll gilt.  
KiloMystery wurde gegründet, um diese Logik zu verändern und unsichtbare Verschwendung in eine greifbare, verantwortungsvolle Erfahrung zu verwandeln.

Das Projekt gibt Produkten aus dem europäischen E-Commerce ein zweites Leben und fördert die Kreislaufwirtschaft.

Beim Pop-up können Besucher aus versiegelten Paketen unterschiedlicher Größe wählen und diese kaufen, ohne den Inhalt im Voraus zu kennen.  
Die Überraschung erfolgt erst nach dem Kauf.

In den Paketen können sich Produkte aus dem europäischen Onlinehandel befinden, darunter Technik, Mode, Accessoires, Kosmetik und mehr.

Der Eintritt zum Pop-up ist kostenlos und offen für alle.  
Minderjährige müssen von einem Erwachsenen begleitet werden.

Die Ankunft von KiloMystery in der Provinz Brindisi ist ein weiterer Schritt eines Projekts, das Bewusstsein für Verschwendung schafft und zeigt, dass Nachhaltigkeit und Überraschung zusammenpassen.

Pressekontakt: info@kilomystery.com
      `.trim(),
    },
  },
];

export const PRESS_MENTIONS: PressMention[] = [];
