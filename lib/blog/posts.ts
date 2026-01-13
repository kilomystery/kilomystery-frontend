import type { BlogPost } from "./types";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "mystery-box-guida",
    date: "2026-01-07",
    featured: true,
    tags: ["mystery-box", "guides", "unboxing"],

    title: {
      it: "Mystery Box: guida completa (cos’è, come funziona, cosa aspettarti)",
      en: "Mystery Boxes: the complete guide (what they are, how they work, what to expect)",
      es: "Mystery Boxes: guía completa (qué son, cómo funcionan, qué esperar)",
      fr: "Mystery Boxes : guide complet (ce que c’est, comment ça marche, à quoi s’attendre)",
      de: "Mystery Boxen: der komplette Guide (was sie sind, wie sie funktionieren, was dich erwartet)",
    },

    description: {
      it: "Tutto quello che devi sapere sulle mystery box: sorpresa, peso, spedizioni, e differenze tra Standard e Premium.",
      en: "Everything you need to know about mystery boxes: surprise, weight, shipping, and Standard vs Premium.",
      es: "Todo lo que necesitas saber: sorpresa, peso, envíos y diferencias entre Standard y Premium.",
      fr: "Tout ce qu’il faut savoir : surprise, poids, livraison, et Standard vs Premium.",
      de: "Alles Wichtige: Überraschung, Gewicht, Versand und Standard vs Premium.",
    },

    cover: {
      src: "/blog/covers/mystery-box.jpg",
      alt: {
        it: "KiloMystery mystery box",
        en: "KiloMystery mystery box",
        es: "KiloMystery mystery box",
        fr: "KiloMystery mystery box",
        de: "KiloMystery Mystery Box",
      },
    },

    content: {
      it: `
import Callout from "@/app/components/mdx/Callout";
import ArticleCta from "@/app/components/mdx/ArticleCta";
import ButtonLink from "@/app/components/mdx/ButtonLink";

# Mystery box: cos’è davvero (e perché piace così tanto)

Le **mystery box** sono scatole “a sorpresa”: scegli una formula (peso/qualità) e ricevi un mix di prodotti selezionati da lotti reali.  
Con **KiloMystery** il concetto è semplice: **mystery box al kg** (1–10 kg) in due livelli: **Standard** e **Premium**.

<Callout title="In breve">
- Scegli **peso** e **tier**
- Paghi in checkout Shopify
- Ricevi **tracking** e consegna
</Callout>

## Standard vs Premium: differenze reali
- **Standard**: ottima per iniziare, mix bilanciato.
- **Premium**: mix più spinto, più probabilità di fascia medio/alta.

## Quanto peso scegliere?
- **1–3 kg**: prova rapida
- **5 kg**: unboxing pieno
- **10 kg**: esperienza completa (e promo/bonus quando attivi)

<ButtonLink href="/it/products" variant="brand">Vai alle Mystery Box</ButtonLink>

<ArticleCta lang="it" />
      `.trim(),

      en: `
import Callout from "@/app/components/mdx/Callout";
import ArticleCta from "@/app/components/mdx/ArticleCta";
import ButtonLink from "@/app/components/mdx/ButtonLink";

# Mystery boxes: what they really are (and why people love them)

**Mystery boxes** are surprise boxes: you choose a format (weight/quality) and receive a curated mix from real lots.  
With **KiloMystery**, the idea is simple: **mystery boxes by the kilo** (1–10 kg) in two tiers: **Standard** and **Premium**.

<Callout title="TL;DR">
- Choose **weight** + **tier**
- Pay via Shopify checkout
- Get **tracked shipping**
</Callout>

## Standard vs Premium: the real difference
- **Standard**: perfect to start, balanced mix.
- **Premium**: stronger mix, higher chance of mid/high-tier items.

<ButtonLink href="/en/products" variant="brand">Shop Mystery Boxes</ButtonLink>

<ArticleCta lang="en" />
      `.trim(),

      es: `
import Callout from "@/app/components/mdx/Callout";
import ArticleCta from "@/app/components/mdx/ArticleCta";
import ButtonLink from "@/app/components/mdx/ButtonLink";

# Mystery boxes: qué son (y por qué enganchan)

Las **mystery boxes** son cajas sorpresa: eliges formato (peso/calidad) y recibes un mix seleccionado.  
En **KiloMystery** funciona así: **mystery box por kilo** (1–10 kg) en dos niveles: **Standard** y **Premium**.

<Callout title="Resumen">
- Elige **peso** + **nivel**
- Pagas en Shopify
- Envío con **tracking**
</Callout>

<ButtonLink href="/es/products" variant="brand">Ver Mystery Boxes</ButtonLink>

<ArticleCta lang="es" />
      `.trim(),

      fr: `
import Callout from "@/app/components/mdx/Callout";
import ArticleCta from "@/app/components/mdx/ArticleCta";
import ButtonLink from "@/app/components/mdx/ButtonLink";

# Mystery boxes : c’est quoi (et pourquoi ça plaît)

Les **mystery boxes** sont des boîtes surprise : tu choisis un format (poids/qualité) et tu reçois un mix sélectionné.  
Avec **KiloMystery** : **mystery box au kilo** (1–10 kg), en **Standard** ou **Premium**.

<Callout title="En bref">
- Choisis **poids** + **niveau**
- Paiement Shopify
- Livraison avec **tracking**
</Callout>

<ButtonLink href="/fr/products" variant="brand">Voir les Mystery Boxes</ButtonLink>

<ArticleCta lang="fr" />
      `.trim(),

      de: `
import Callout from "@/app/components/mdx/Callout";
import ArticleCta from "@/app/components/mdx/ArticleCta";
import ButtonLink from "@/app/components/mdx/ButtonLink";

# Mystery Boxen: was sie sind (und warum sie so beliebt sind)

**Mystery Boxen** sind Überraschungsboxen: du wählst Format (Gewicht/Qualität) und bekommst einen kuratierten Mix.  
Bei **KiloMystery**: **Mystery Box pro Kilo** (1–10 kg) als **Standard** oder **Premium**.

<Callout title="Kurz gesagt">
- **Gewicht** + **Tier** wählen
- Shopify Checkout
- Versand mit **Tracking**
</Callout>

<ButtonLink href="/de/products" variant="brand">Mystery Boxen ansehen</ButtonLink>

<ArticleCta lang="de" />
      `.trim(),
    },
  },

  // ✅ POST 2
  {
    slug: "mystery-box-evitare-fregature",
    date: "2026-01-08",
    featured: true,
    tags: ["mystery-box", "guides", "news"],

    title: {
      it: "Mystery box: come evitare fregature (checklist completa)",
      en: "Mystery boxes: how to avoid scams (full checklist)",
      es: "Mystery boxes: cómo evitar estafas (checklist completa)",
      fr: "Mystery boxes : éviter les arnaques (checklist complète)",
      de: "Mystery Boxen: So vermeidest du Betrug (komplette Checkliste)",
    },

    description: {
      it: "Una guida pratica per riconoscere offerte sospette e scegliere mystery box affidabili: trasparenza, policy, checkout e tracking.",
      en: "A practical guide to spot suspicious offers and choose reliable mystery boxes: transparency, policies, checkout and tracking.",
      es: "Guía práctica para detectar ofertas sospechosas y elegir mystery boxes fiables: transparencia, políticas, checkout y tracking.",
      fr: "Guide pratique pour repérer les offres suspectes et choisir des mystery boxes fiables : transparence, politiques, checkout et tracking.",
      de: "Praktischer Guide, um unseriöse Angebote zu erkennen: Transparenz, Richtlinien, Checkout und Tracking.",
    },

    cover: {
      src: "/blog/covers/anti-scam.jpg",
      alt: {
        it: "Checklist per scegliere mystery box affidabili",
        en: "Checklist to choose reliable mystery boxes",
        es: "Checklist para elegir mystery boxes fiables",
        fr: "Checklist pour choisir des mystery boxes fiables",
        de: "Checkliste für seriöse Mystery Boxen",
      },
    },

    content: {
      it: `
import Callout from "@/app/components/mdx/Callout";
import ButtonLink from "@/app/components/mdx/ButtonLink";
import ArticleCta from "@/app/components/mdx/ArticleCta";

# Mystery box: come evitare fregature (senza rovinarti l’esperienza)

La mystery box deve essere **divertente**, non stressante.  
Qui trovi una checklist concreta per capire se un’offerta è seria oppure “troppo bella per essere vera”.

<Callout title="Regola d’oro">
Se qualcuno ti promette contenuti specifici e valore garantito senza prove, **diffida**.
La sorpresa va bene, le promesse “magiche” no.
</Callout>

## 1) Trasparenza: cosa viene dichiarato?
Cerca sempre:
- **peso o fascia** chiara (es. 1–10 kg)
- **tier** (es. Standard / Premium)
- **policy resi** e condizioni
- **contatti reali**

## 2) Checkout e pagamenti
Meglio se c’è un checkout affidabile (Shopify/Stripe/PayPal ecc.).  
Evita link strani e pagamenti non tracciabili.

## 3) Spedizione e tracking
Un e-commerce serio:
- invia email di conferma
- fornisce **tracking**
- ha una pagina shipping chiara

<ButtonLink href="/it/mystery-box" variant="ghost">Perché KiloMystery è trasparente →</ButtonLink>
<ButtonLink href="/it/products" variant="brand">Vai alle Mystery Box →</ButtonLink>

<ArticleCta lang="it" />
      `.trim(),

      en: `
import Callout from "@/app/components/mdx/Callout";
import ButtonLink from "@/app/components/mdx/ButtonLink";
import ArticleCta from "@/app/components/mdx/ArticleCta";

# Mystery boxes: how to avoid scams (without ruining the fun)

Mystery boxes should be **fun**, not stressful.  
Here’s a practical checklist to tell trustworthy offers from “too good to be true”.

<Callout title="Golden rule">
If someone promises specific items and guaranteed value with no proof, **be careful**.
</Callout>

<ButtonLink href="/en/products" variant="brand">Shop Mystery Boxes →</ButtonLink>

<ArticleCta lang="en" />
      `.trim(),

      es: `
import Callout from "@/app/components/mdx/Callout";
import ButtonLink from "@/app/components/mdx/ButtonLink";
import ArticleCta from "@/app/components/mdx/ArticleCta";

# Mystery boxes: cómo evitar estafas (checklist)

Checklist para detectar ofertas sospechosas.

<ButtonLink href="/es/products" variant="brand">Ver Mystery Boxes →</ButtonLink>

<ArticleCta lang="es" />
      `.trim(),

      fr: `
import Callout from "@/app/components/mdx/Callout";
import ButtonLink from "@/app/components/mdx/ButtonLink";
import ArticleCta from "@/app/components/mdx/ArticleCta";

# Mystery boxes : éviter les arnaques (checklist)

Checklist simple pour repérer les offres douteuses.

<ButtonLink href="/fr/products" variant="brand">Voir les Mystery Boxes →</ButtonLink>

<ArticleCta lang="fr" />
      `.trim(),

      de: `
import Callout from "@/app/components/mdx/Callout";
import ButtonLink from "@/app/components/mdx/ButtonLink";
import ArticleCta from "@/app/components/mdx/ArticleCta";

# Mystery Boxen: So vermeidest du Betrug (Checkliste)

Kurze Checkliste, um unseriöse Angebote zu erkennen.

<ButtonLink href="/de/products" variant="brand">Mystery Boxen ansehen →</ButtonLink>

<ArticleCta lang="de" />
      `.trim(),
    },
  },

  // ✅ POST 3
  {
    slug: "standard-vs-premium",
    date: "2026-01-09",
    featured: true,
    tags: ["mystery-box", "guides", "unboxing"],

    title: {
      it: "Standard vs Premium: quale mystery box scegliere?",
      en: "Standard vs Premium: which mystery box should you choose?",
      es: "Standard vs Premium: ¿qué mystery box elegir?",
      fr: "Standard vs Premium : quelle mystery box choisir ?",
      de: "Standard vs Premium: Welche Mystery Box passt zu dir?",
    },

    description: {
      it: "Differenze reali tra Standard e Premium: per chi sono e come scegliere il peso giusto.",
      en: "The real differences between Standard and Premium: who they’re for and how to pick the right weight.",
      es: "Diferencias reales entre Standard y Premium: para quién son y cómo elegir el peso.",
      fr: "Différences réelles entre Standard et Premium : pour qui et comment choisir le poids.",
      de: "Echte Unterschiede: Für wen und wie du das Gewicht wählst.",
    },

    cover: {
      src: "/blog/covers/standard-vs-premium.jpg",
      alt: {
        it: "Confronto tra mystery box Standard e Premium",
        en: "Standard vs Premium mystery box comparison",
        es: "Comparación Standard vs Premium",
        fr: "Comparaison Standard vs Premium",
        de: "Vergleich Standard vs Premium",
      },
    },

    content: {
      it: `
import Callout from "@/app/components/mdx/Callout";
import ButtonLink from "@/app/components/mdx/ButtonLink";
import ArticleCta from "@/app/components/mdx/ArticleCta";

# Standard vs Premium: quale scegliere?

Quello che cambia è la **selezione**:
- Standard = mix più bilanciato
- Premium = selezione più spinta

<Callout title="Scelta veloce">
Vuoi provare? → **Standard**  
Vuoi un mix più spinto? → **Premium**
</Callout>

<ButtonLink href="/it/products" variant="brand">Scegli la tua box →</ButtonLink>
<ArticleCta lang="it" />
      `.trim(),

      en: `
import Callout from "@/app/components/mdx/Callout";
import ButtonLink from "@/app/components/mdx/ButtonLink";
import ArticleCta from "@/app/components/mdx/ArticleCta";

# Standard vs Premium: which one should you choose?

The difference is the **selection approach**.

<ButtonLink href="/en/products" variant="brand">Pick your Mystery Box →</ButtonLink>
<ArticleCta lang="en" />
      `.trim(),

      es: `
import Callout from "@/app/components/mdx/Callout";
import ButtonLink from "@/app/components/mdx/ButtonLink";
import ArticleCta from "@/app/components/mdx/ArticleCta";

# Standard vs Premium: ¿cuál elegir?

La diferencia real es la selección.

<ButtonLink href="/es/products" variant="brand">Elegir Mystery Box →</ButtonLink>
<ArticleCta lang="es" />
      `.trim(),

      fr: `
import Callout from "@/app/components/mdx/Callout";
import ButtonLink from "@/app/components/mdx/ButtonLink";
import ArticleCta from "@/app/components/mdx/ArticleCta";

# Standard vs Premium : que choisir ?

La différence : la sélection.

<ButtonLink href="/fr/products" variant="brand">Choisir une Mystery Box →</ButtonLink>
<ArticleCta lang="fr" />
      `.trim(),

      de: `
import Callout from "@/app/components/mdx/Callout";
import ButtonLink from "@/app/components/mdx/ButtonLink";
import ArticleCta from "@/app/components/mdx/ArticleCta";

# Standard vs Premium: Was passt zu dir?

Der Unterschied ist die Auswahl.

<ButtonLink href="/de/products" variant="brand">Mystery Box wählen →</ButtonLink>
<ArticleCta lang="de" />
      `.trim(),
    },
  },
];
