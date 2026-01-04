// app/[lang]/mystery-box/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

type Lang = "it" | "en" | "es" | "fr" | "de";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";

function normLang(l: string): Lang {
  const x = String(l || "it").toLowerCase();
  if (x === "en" || x === "es" || x === "fr" || x === "de") return x;
  return "it";
}

type FAQ = { q: string; a: string };

const COPY: Record<Lang, {
  title: string;
  description: string;
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
  faqTitle: string;
  faqIntro: string;
  faqs: FAQ[];
}> = {
  it: {
    title: "Mystery Box: guida + FAQ | KiloMystery",
    description:
      "Cos’è una mystery box? Come funziona una mystery box al kg? Scopri Standard/Premium, spedizioni, resi e FAQ. KiloMystery: mystery box sigillate e tracciate.",
    h1: "Mystery Box: cos’è, come funziona e perché sceglierla",
    intro:
      "Una mystery box è una scatola “sorpresa” con prodotti selezionati: non conosci l’esatto contenuto prima dell’apertura, ma conosci le regole (peso, fascia, qualità). Con KiloMystery puoi scegliere anche la formula “mystery box al kg”: paghi in base al peso e ricevi box sigillate e tracciate.",
    bulletsTitle: "Perché KiloMystery è una delle mystery box più scelte",
    bullets: [
      "Box sigillate, pesate e tracciate (trasparenza sul peso).",
      "Scelta tra Standard e Premium per diversi livelli di valore.",
      "Spedizione rapida con tracking e assistenza reale.",
      "Approccio anti-spreco: recuperiamo pacchi che altrimenti verrebbero smaltiti.",
    ],
    ctaPrimary: "Scopri le Mystery Box",
    ctaSecondary: "Come funziona",
    section1Title: "Mystery box: come funziona (in 30 secondi)",
    section1Body:
      "Scegli la tipologia (Standard o Premium) e il peso. Aggiungi al carrello e completi il checkout su Shopify in modo sicuro. Ricevi la tua mystery box a casa: l’unboxing è la parte divertente, ma la base è concreta: peso netto, lotto e tracciabilità.",
    section2Title: "Mystery Box al kg: cosa significa davvero",
    section2Body:
      "La mystery box al kg è un formato semplice: il prezzo è legato al peso della box. È ideale se vuoi controllare il budget e allo stesso tempo mantenere l’effetto sorpresa. La formula “al kg” rende chiaro il valore atteso e rende l’esperienza più trasparente.",
    section3Title: "Cosa puoi trovare dentro una mystery box?",
    section3Body:
      "Il contenuto è variabile (è il bello della mystery box), ma la logica è sempre la stessa: prodotti assortiti e selezionati, con unboxing sorprendente. Standard e Premium cambiano fascia e “qualità percepita”, ma entrambe puntano a stupire. Se cerchi un regalo originale, una mystery box è una delle scelte più apprezzate.",
    faqTitle: "FAQ – Mystery Box (domande frequenti)",
    faqIntro:
      "Risposte rapide alle domande più comuni su mystery box e mystery box al kg: spedizione, resi, pagamenti e sicurezza.",
    faqs: [
      {
        q: "Cos’è una mystery box?",
        a: "Una mystery box è una scatola sorpresa con prodotti assortiti: non conosci l’elenco esatto prima dell’apertura, ma conosci le regole (peso, categoria e fascia).",
      },
      {
        q: "Cos’è una mystery box al kg?",
        a: "È una mystery box in cui il prezzo è legato al peso. Scegli i kg e ricevi una box sigillata e pesata: più kg, più contenuto.",
      },
      {
        q: "Le mystery box sono affidabili?",
        a: "Sì, se il brand è trasparente su regole e processo. KiloMystery lavora con box sigillate, peso netto e tracciabilità di lotto.",
      },
      {
        q: "Standard o Premium: che differenza c’è?",
        a: "Sono due fasce diverse: Premium punta a un valore medio più alto. Standard è perfetta per provare l’esperienza mystery box con un prezzo più accessibile.",
      },
      {
        q: "Quanto costa una mystery box?",
        a: "Dipende dal formato e dal peso. Nel formato “mystery box al kg” il prezzo è calcolato in €/kg e varia tra Standard e Premium.",
      },
      {
        q: "Spedite in tutta Italia?",
        a: "Sì, spediamo con tracking. I tempi stimati e i dettagli sono indicati nella pagina Spedizioni.",
      },
      {
        q: "Posso fare il reso?",
        a: "Le mystery box sono sigillate e vendute come “sorpresa”: di norma il reso non è previsto, perché il contenuto non è predeterminato. Leggi la policy completa nella pagina Resi.",
      },
      {
        q: "È un’idea regalo adatta?",
        a: "Sì: una mystery box è un regalo originale perché unisce sorpresa e unboxing. Puoi scegliere peso e fascia per adattarla al budget.",
      },
      {
        q: "Il pagamento è sicuro?",
        a: "Sì. Il checkout avviene su Shopify (pagamenti sicuri e metodi principali disponibili).",
      },
      {
        q: "Come traccio l’ordine?",
        a: "Dopo l’acquisto ricevi un’email con tracking (se disponibile) e puoi seguire lo stato spedizione.",
      },
      {
        q: "Cosa succede se arriva danneggiata?",
        a: "Contatta l’assistenza con foto e numero ordine: ti aiutiamo a risolvere velocemente.",
      },
      
    ],
  },

  // ✅ EN
  en: {
    title: "Mystery Box: guide + FAQ | KiloMystery",
    description:
      "What is a mystery box? How does a mystery box by weight work? Learn Standard/Premium, shipping, returns and FAQs. KiloMystery: sealed, weighed, trackable mystery boxes.",
    h1: "Mystery Box: what it is, how it works and why people love it",
    intro:
      "A mystery box is a surprise box with curated items. You don’t know the exact list before opening, but you do know the rules (weight, tier, quality). With KiloMystery you can also choose a “mystery box by kg”: you pay by weight and receive sealed, trackable boxes.",
    bulletsTitle: "Why KiloMystery is a top choice for mystery boxes",
    bullets: [
      "Sealed, weighed and trackable boxes (transparent weight).",
      "Choose Standard or Premium for different value tiers.",
      "Fast shipping with tracking and real customer support.",
      "Anti-waste approach: we recover parcels that would be discarded.",
    ],
    ctaPrimary: "Browse Mystery Boxes",
    ctaSecondary: "How it works",
    section1Title: "How a mystery box works (quick version)",
    section1Body:
      "Pick a tier (Standard or Premium) and a weight. Add to cart and checkout securely on Shopify. Receive your box at home: surprise + clear rules (net weight, batch ID, traceability).",
    section2Title: "Mystery box by kg: what it really means",
    section2Body:
      "A mystery box by kg is simple: price is linked to weight. Great if you want to control your budget while keeping the surprise factor. The “by weight” format is more transparent and predictable.",
    section3Title: "What can you find in a mystery box?",
    section3Body:
      "Contents vary (that’s the fun), but the goal is consistent: a curated mix designed for an exciting unboxing. Standard vs Premium changes the value tier. As a gift idea, a mystery box is one of the most popular picks.",
    faqTitle: "FAQ – Mystery Box",
    faqIntro:
      "Fast answers about mystery boxes: shipping, returns, safety and payments.",
    faqs: [
      { q: "What is a mystery box?", a: "A mystery box is a surprise box with curated items. You don’t know the exact item list, but you know the rules (tier, weight, and format)." },
      { q: "What is a mystery box by kg?", a: "It’s a mystery box where price is linked to weight. Choose the kg and receive a sealed, weighed box." },
      { q: "Is it reliable?", a: "Yes when rules are transparent. KiloMystery uses sealed boxes, net weight and traceability." },
      { q: "Standard vs Premium?", a: "Different tiers. Premium targets higher average value; Standard is a more accessible entry." },
      { q: "How much does it cost?", a: "Depends on tier and weight. In the “by kg” format price is €/kg and varies by tier." },
      { q: "Do you ship nationwide?", a: "Yes, with tracking. Details are on the Shipping policy page." },
      { q: "Can I return it?", a: "Mystery boxes are sealed surprise products; returns are typically not available. See Returns policy." },
      { q: "Good gift idea?", a: "Yes—surprise + unboxing makes it a great gift. Choose weight and tier to match budget." },
    ],
  },

  // ✅ ES
  es: {
    title: "Mystery Box: guía + FAQ | KiloMystery",
    description:
      "¿Qué es una mystery box? ¿Cómo funciona una mystery box por kg? Standard/Premium, envíos, devoluciones y FAQ. KiloMystery: cajas sorpresa selladas y trazables.",
    h1: "Mystery Box: qué es, cómo funciona y por qué elegirla",
    intro:
      "Una mystery box es una caja sorpresa con productos seleccionados. No conoces la lista exacta antes de abrir, pero sí las reglas (peso, nivel, formato). Con KiloMystery también puedes elegir la versión “mystery box por kg”.",
    bulletsTitle: "Por qué KiloMystery es una gran opción",
    bullets: [
      "Cajas selladas, pesadas y trazables.",
      "Elige Standard o Premium según el nivel de valor.",
      "Envío rápido con tracking y soporte real.",
      "Enfoque anti-desperdicio: recuperamos paquetes.",
    ],
    ctaPrimary: "Ver Mystery Boxes",
    ctaSecondary: "Cómo funciona",
    section1Title: "Cómo funciona una mystery box",
    section1Body:
      "Elige Standard o Premium y el peso. Añade al carrito y paga en Shopify. Recibes tu caja en casa con reglas claras: peso neto y trazabilidad.",
    section2Title: "Mystery box por kg",
    section2Body:
      "El precio está vinculado al peso: eliges los kg y recibes más contenido. Es una forma más transparente de comprar una mystery box.",
    section3Title: "Qué puedes encontrar",
    section3Body:
      "El contenido varía (esa es la gracia), pero siempre buscamos un mix atractivo para un unboxing sorprendente. Ideal también como regalo.",
    faqTitle: "FAQ – Mystery Box",
    faqIntro: "Respuestas rápidas sobre envíos, devoluciones y seguridad.",
    faqs: [
      { q: "¿Qué es una mystery box?", a: "Una caja sorpresa con productos seleccionados. No conoces la lista exacta antes de abrirla, pero sí las reglas." },
      { q: "¿Qué es una mystery box por kg?", a: "Precio ligado al peso: eliges los kg y recibes una caja sellada y pesada." },
      { q: "¿Standard o Premium?", a: "Son dos niveles diferentes: Premium apunta a un valor medio mayor." },
    ],
  },

  // ✅ FR
  fr: {
    title: "Mystery Box : guide + FAQ | KiloMystery",
    description:
      "Qu’est-ce qu’une mystery box ? Comment fonctionne une mystery box au kg ? Standard/Premium, livraison, retours et FAQ. KiloMystery : box scellées et traçables.",
    h1: "Mystery Box : définition, fonctionnement et FAQ",
    intro:
      "Une mystery box est une boîte surprise avec des produits sélectionnés. Vous ne connaissez pas la liste exacte avant l’ouverture, mais vous connaissez les règles (poids, gamme). Avec KiloMystery, vous pouvez choisir la version “au kg”.",
    bulletsTitle: "Pourquoi choisir KiloMystery",
    bullets: [
      "Box scellées, pesées et traçables.",
      "Choix Standard ou Premium.",
      "Livraison rapide avec suivi.",
      "Approche anti-gaspillage.",
    ],
    ctaPrimary: "Voir les Mystery Boxes",
    ctaSecondary: "Comment ça marche",
    section1Title: "Fonctionnement (rapide)",
    section1Body:
      "Choisissez Standard/Premium et le poids. Ajoutez au panier et payez via Shopify. Recevez votre box chez vous avec poids net et traçabilité.",
    section2Title: "Mystery box au kg",
    section2Body:
      "Le prix est lié au poids. Plus de kg = plus de contenu. Une expérience plus transparente.",
    section3Title: "Que peut contenir une mystery box ?",
    section3Body:
      "Le contenu varie (c’est l’intérêt). Nous visons un mix excitant pour l’unboxing. Très populaire comme idée cadeau.",
    faqTitle: "FAQ – Mystery Box",
    faqIntro: "Réponses rapides : livraison, retours, sécurité.",
    faqs: [
      { q: "Qu’est-ce qu’une mystery box ?", a: "Une boîte surprise avec des produits sélectionnés. Vous ne connaissez pas la liste exacte avant l’ouverture." },
      { q: "Mystery box au kg ?", a: "Le prix dépend du poids. Vous choisissez les kg et recevez une box scellée et pesée." },
      { q: "Standard ou Premium ?", a: "Deux gammes différentes. Premium vise une valeur moyenne plus élevée." },
    ],
  },

  // ✅ DE
  de: {
    title: "Mystery Box: Guide + FAQ | KiloMystery",
    description:
      "Was ist eine Mystery Box? Wie funktioniert eine Mystery Box pro kg? Standard/Premium, Versand, Rückgabe und FAQ. KiloMystery: versiegelt, gewogen, nachverfolgbar.",
    h1: "Mystery Box: Erklärung, Ablauf und FAQ",
    intro:
      "Eine Mystery Box ist eine Überraschungsbox mit kuratierten Produkten. Du kennst nicht die exakte Liste, aber die Regeln (Gewicht, Kategorie, Tier). Bei KiloMystery gibt es auch die Variante “pro kg”.",
    bulletsTitle: "Warum KiloMystery",
    bullets: [
      "Versiegelt, gewogen und nachverfolgbar.",
      "Standard oder Premium wählen.",
      "Schneller Versand mit Tracking.",
      "Anti-Verschwendung: gerettete Pakete.",
    ],
    ctaPrimary: "Mystery Boxes ansehen",
    ctaSecondary: "So funktioniert’s",
    section1Title: "So funktioniert’s",
    section1Body:
      "Tier und Gewicht wählen, in den Warenkorb legen und sicher über Shopify bezahlen. Box kommt nach Hause – mit klaren Regeln (Nettogewicht, Traceability).",
    section2Title: "Mystery Box pro kg",
    section2Body:
      "Preis ist ans Gewicht gekoppelt. Mehr kg = mehr Inhalt. Transparent und planbar.",
    section3Title: "Was ist drin?",
    section3Body:
      "Inhalte variieren – genau das macht die Mystery Box spannend. Standard vs Premium ändert den Wert-Tier. Auch als Geschenk super beliebt.",
    faqTitle: "FAQ – Mystery Box",
    faqIntro: "Kurze Antworten zu Versand, Rückgabe, Sicherheit.",
    faqs: [
      { q: "Was ist eine Mystery Box?", a: "Eine Überraschungsbox mit kuratierten Produkten. Du kennst nicht die exakte Liste, aber die Regeln." },
      { q: "Mystery Box pro kg?", a: "Preis ist ans Gewicht gekoppelt: kg wählen, versiegelte Box erhalten." },
      { q: "Standard oder Premium?", a: "Zwei Tiers. Premium zielt auf höheren Durchschnittswert." },
    ],
  },
};

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = normLang(params?.lang);
  const c = COPY[lang];
  const url = `${SITE_URL}/${lang}/mystery-box`;

  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: url,
      languages: {
        it: `${SITE_URL}/it/mystery-box`,
        en: `${SITE_URL}/en/mystery-box`,
        es: `${SITE_URL}/es/mystery-box`,
        fr: `${SITE_URL}/fr/mystery-box`,
        de: `${SITE_URL}/de/mystery-box`,
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

export default function MysteryBoxPage({ params }: { params: { lang: string } }) {
  const lang = normLang(params?.lang);
  const c = COPY[lang];
  const pageUrl = `${SITE_URL}/${lang}/mystery-box`;

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
        name: "Mystery Box",
        item: pageUrl,
      },
    ],
  };

  return (
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
        <p className="text-white/60 text-sm">
          SEO hub: <b>mystery box</b> • keyword secondaria: <b>mystery box al kg</b>
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2">
          {c.h1}
        </h1>
        <p className="text-white/75 mt-4 text-lg leading-relaxed">
          {c.intro}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/${lang}/products`}
            className="btn btn-brand px-6 py-3 font-bold"
          >
            {c.ctaPrimary}
          </Link>
          <Link
            href={`/${lang}/how-it-works`}
            className="btn btn-ghost px-6 py-3 font-bold"
          >
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
      <section className="grid md:grid-cols-3 gap-5">
        <article className="card">
          <h3 className="text-xl font-extrabold">{c.section1Title}</h3>
          <p className="text-white/75 mt-3 leading-relaxed">{c.section1Body}</p>
        </article>
        <article className="card">
          <h3 className="text-xl font-extrabold">{c.section2Title}</h3>
          <p className="text-white/75 mt-3 leading-relaxed">{c.section2Body}</p>
        </article>
        <article className="card">
          <h3 className="text-xl font-extrabold">{c.section3Title}</h3>
          <p className="text-white/75 mt-3 leading-relaxed">{c.section3Body}</p>
        </article>
      </section>

      {/* INTERNAL LINKS (SEO) */}
      <section className="card">
        <h2 className="text-2xl font-extrabold">
          Mystery box al kg: scegli il formato giusto
        </h2>
        <p className="text-white/75 mt-3">
          Se stai cercando una <b>mystery box</b> (anche come regalo), il modo più semplice è
          scegliere peso e fascia: <b>Standard</b> per iniziare, <b>Premium</b> per un livello più alto.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/${lang}/products#buy-standard-10`} className="btn btn-silver">
            Standard 10 kg
          </Link>
          <Link href={`/${lang}/products#buy-premium-10`} className="btn btn-gold">
            Premium 10 kg
          </Link>
          <Link href={`/${lang}/policy/shipping`} className="btn btn-ghost">
            Spedizioni
          </Link>
          <Link href={`/${lang}/policy/returns`} className="btn btn-ghost">
            Resi
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
              <summary className="cursor-pointer font-bold">
                {f.q}
              </summary>
              <p className="text-white/75 mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="card text-center">
        <h2 className="text-2xl font-extrabold">
          Pronto per la tua mystery box?
        </h2>
        <p className="text-white/75 mt-2">
          Se cercavi “mystery box” o “mystery box al kg”, sei nel posto giusto: scegli peso e fascia e inizia l’unboxing.
        </p>
        <div className="mt-5 flex justify-center gap-3 flex-wrap">
          <Link href={`/${lang}/products`} className="btn btn-brand px-7 py-3 font-bold">
            {c.ctaPrimary}
          </Link>
          <Link href={`/${lang}/contact`} className="btn btn-ghost px-7 py-3 font-bold">
            Contattaci
          </Link>
        </div>
      </section>
    </main>
  );
}
