"use client";

import { Lang } from "@/i18n/lang";

type Item = {
  icon: string;
  label: string;
  tag?: string;
};

type CopyPerLang = {
  title: string;
  subtitle: string;
  items: Item[];
};

const COPY: Record<Lang, CopyPerLang> = {
  it: {
    title: "Cosa puoi trovare nelle box",
    subtitle:
      "Nessuna promessa sul contenuto: ogni lotto è diverso. Ecco le categorie più comuni provenienti da pacchi smarriti, resi e stock fermi.",
    items: [
      { icon: "🔌", label: "Accessori tech", tag: "Tech" },
      { icon: "📱", label: "Gadget per smartphone", tag: "Mobile" },
      { icon: "🏠", label: "Casa & cucina", tag: "Home" },
      { icon: "🏋️‍♀️", label: "Allenamento & sport", tag: "Sport" },
      { icon: "🏕️", label: "Outdoor & tempo libero", tag: "Outdoor" },
      { icon: "⚡", label: "Piccoli elettrodomestici", tag: "Utility" },
      { icon: "🚗", label: "Accessori auto/moto", tag: "Auto & Moto" },
      { icon: "✨", label: "Articoli lifestyle", tag: "Lifestyle" },
      { icon: "🎁", label: "Regali & oggettistica", tag: "Gift" },
      { icon: "🧥", label: "Abbigliamento leggero", tag: "Fashion" },
    ],
  },

  en: {
    title: "What you may find inside",
    subtitle:
      "No guaranteed items — every batch is unique. These are the most common categories from lost parcels, unclaimed returns and overstock.",
    items: [
      { icon: "🔌", label: "Tech accessories", tag: "Tech" },
      { icon: "📱", label: "Smartphone gadgets", tag: "Mobile" },
      { icon: "🏠", label: "Home & kitchen", tag: "Home" },
      { icon: "🏋️‍♀️", label: "Fitness & sports", tag: "Sport" },
      { icon: "🏕️", label: "Outdoor & leisure", tag: "Outdoor" },
      { icon: "⚡", label: "Small appliances", tag: "Utility" },
      { icon: "🚗", label: "Car/motorbike accessories", tag: "Auto/Moto" },
      { icon: "✨", label: "Lifestyle items", tag: "Lifestyle" },
      { icon: "🎁", label: "Gifts & collectibles", tag: "Gift" },
      { icon: "🧥", label: "Light clothing", tag: "Fashion" },
    ],
  },

  es: {
    title: "Qué puedes encontrar dentro",
    subtitle:
      "No garantizamos artículos concretos: cada lote es distinto. Estas son las categorías más comunes procedentes de paquetes perdidos y devoluciones.",
    items: [
      { icon: "🔌", label: "Accesorios tech", tag: "Tech" },
      { icon: "📱", label: "Gadgets para smartphone", tag: "Mobile" },
      { icon: "🏠", label: "Hogar & cocina", tag: "Hogar" },
      { icon: "🏋️‍♀️", label: "Fitness & deporte", tag: "Deporte" },
      { icon: "🏕️", label: "Outdoor & tiempo libre", tag: "Outdoor" },
      { icon: "⚡", label: "Pequeños electrodomésticos", tag: "Utility" },
      { icon: "🚗", label: "Accesorios coche/moto", tag: "Auto/Moto" },
      { icon: "✨", label: "Artículos lifestyle", tag: "Lifestyle" },
      { icon: "🎁", label: "Regalos & objetos", tag: "Regalo" },
      { icon: "🧥", label: "Ropa ligera", tag: "Moda" },
    ],
  },

  fr: {
    title: "Ce que tu peux trouver à l’intérieur",
    subtitle:
      "Aucun article garanti : chaque lot est différent. Voici les catégories les plus fréquentes provenant de colis perdus ou retours.",
    items: [
      { icon: "🔌", label: "Accessoires tech", tag: "Tech" },
      { icon: "📱", label: "Gadgets smartphone", tag: "Mobile" },
      { icon: "🏠", label: "Maison & cuisine", tag: "Maison" },
      { icon: "🏋️‍♀️", label: "Sport & fitness", tag: "Sport" },
      { icon: "🏕️", label: "Outdoor & loisirs", tag: "Outdoor" },
      { icon: "⚡", label: "Petits appareils", tag: "Utility" },
      { icon: "🚗", label: "Accessoires auto/moto", tag: "Auto/Moto" },
      { icon: "✨", label: "Objets lifestyle", tag: "Lifestyle" },
      { icon: "🎁", label: "Cadeaux & goodies", tag: "Cadeaux" },
      { icon: "🧥", label: "Vêtements légers", tag: "Mode" },
    ],
  },

  de: {
    title: "Was in den Boxen stecken kann",
    subtitle:
      "Keine garantierten Produkte – jeder Posten ist einzigartig. Hier die häufigsten Kategorien aus verlorenen Paketen und Retouren.",
    items: [
      { icon: "🔌", label: "Tech-Zubehör", tag: "Tech" },
      { icon: "📱", label: "Smartphone-Gadgets", tag: "Mobile" },
      { icon: "🏠", label: "Haushalt & Küche", tag: "Haus" },
      { icon: "🏋️‍♀️", label: "Fitness & Sport", tag: "Sport" },
      { icon: "🏕️", label: "Outdoor & Freizeit", tag: "Outdoor" },
      { icon: "⚡", label: "Kleingeräte", tag: "Utility" },
      { icon: "🚗", label: "Auto-/Motorrad Zubehör", tag: "Auto/Moto" },
      { icon: "✨", label: "Lifestyle-Artikel", tag: "Lifestyle" },
      { icon: "🎁", label: "Geschenke & Deko", tag: "Geschenk" },
      { icon: "🧥", label: "Leichte Kleidung", tag: "Mode" },
    ],
  },
};

export default function SectionInsideBox({ lang }: { lang: Lang }) {
  const t = COPY[lang] ?? COPY.it;

  return (
    <section className="my-16 relative">
      {/* sfondo leggero */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.15),transparent_60%),radial-gradient(circle_at_bottom,_rgba(45,212,191,0.15),transparent_55%)] opacity-70" />

      <div className="relative">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3">
          <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
            {t.title}
          </span>
        </h2>

        <p className="text-center text-white/70 max-w-2xl mx-auto mb-8 text-sm md:text-base">
          {t.subtitle}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {t.items.map((item, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2 hover:border-emerald-400/60 hover:bg-white/10 transition"
            >
              {/* glow */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-60 transition bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),transparent_55%)]" />

              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl md:text-3xl drop-shadow-sm">
                    {item.icon}
                  </span>
                  <span className="font-semibold text-sm md:text-base">
                    {item.label}
                  </span>
                </div>

                {item.tag && (
                  <span className="relative inline-flex items-center rounded-full border border-emerald-300/60 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-[.16em] text-emerald-200">
                    {item.tag}
                  </span>
                )}
              </div>

              <div className="relative h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mt-2 opacity-0 group-hover:opacity-100 transition" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
