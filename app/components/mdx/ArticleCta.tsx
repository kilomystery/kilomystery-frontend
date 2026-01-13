"use client";

import ButtonLink from "./ButtonLink";

type Lang = "it" | "en" | "es" | "fr" | "de";

const copy = {
  it: {
    title: "Vuoi una mystery box adesso?",
    text: "Scegli Standard o Premium e il peso che preferisci. Checkout Shopify + tracking.",
    primary: "Vai ai prodotti",
    secondary: "Leggi le FAQ",
  },
  en: {
    title: "Want a mystery box now?",
    text: "Pick Standard or Premium and your preferred weight. Shopify checkout + tracking.",
    primary: "See products",
    secondary: "Read FAQ",
  },
  es: {
    title: "¿Quieres una mystery box ahora?",
    text: "Elige Standard o Premium y el peso. Checkout Shopify + tracking.",
    primary: "Ver productos",
    secondary: "Leer FAQ",
  },
  fr: {
    title: "Envie d’une mystery box maintenant ?",
    text: "Choisis Standard ou Premium et le poids. Paiement Shopify + tracking.",
    primary: "Voir les produits",
    secondary: "Lire la FAQ",
  },
  de: {
    title: "Willst du jetzt eine Mystery Box?",
    text: "Wähle Standard oder Premium und dein Gewicht. Shopify Checkout + Tracking.",
    primary: "Zu den Produkten",
    secondary: "FAQ lesen",
  },
} as const;

export default function ArticleCta({ lang = "it" }: { lang?: Lang }) {
  const t = copy[lang] ?? copy.it;

  return (
    <div className="card border border-white/10 bg-gradient-to-br from-white/[0.04] via-[#111827]/60 to-white/[0.06] p-5 rounded-2xl mt-8">
      <h3 className="text-xl md:text-2xl font-extrabold">{t.title}</h3>
      <p className="text-white/70 mt-2">{t.text}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <ButtonLink href={`/${lang}/products`} variant="brand">
          {t.primary}
        </ButtonLink>
        <ButtonLink href={`/${lang}/faq`} variant="ghost">
          {t.secondary}
        </ButtonLink>
      </div>
    </div>
  );
}
