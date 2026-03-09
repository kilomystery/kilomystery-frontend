"use client";

type Lang = "it" | "en" | "es" | "fr" | "de";

const ITEMS: Record<Lang, string[]> = {
  it: [
    "Tracking incluso",
    "Checkout sicuro",
    "Klarna disponibile",
    "Pacchi da lotti reali",
    "Spediamo in tutta Europa",
    "Consegna in 24/48h",
  ],
  en: [
    "Tracking included",
    "Secure checkout",
    "Klarna available",
    "Parcels from real lots",
    "Shipping across Europe",
    "Standard and Premium",
  ],
  es: [
    "Seguimiento incluido",
    "Checkout seguro",
    "Klarna disponible",
    "Paquetes de lotes reales",
    "Envíos a toda Europa",
    "Standard y Premium",
  ],
  fr: [
    "Suivi inclus",
    "Checkout sécurisé",
    "Klarna disponible",
    "Colis issus de lots réels",
    "Livraison dans toute l’Europe",
    "Standard et Premium",
  ],
  de: [
    "Tracking inklusive",
    "Sicherer Checkout",
    "Klarna verfügbar",
    "Pakete aus echten Posten",
    "Versand in ganz Europa",
    "Standard und Premium",
  ],
};

export default function SectionMarquee({ lang = "it" as Lang }) {
  const supported = ["it", "en", "es", "fr", "de"] as const;
  const normalized = String(lang).toLowerCase();
  const safeLang: Lang = (supported as readonly string[]).includes(normalized as any)
    ? (normalized as Lang)
    : "it";

  const items = ITEMS[safeLang];

  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-[#09110f] text-white">
      <div className="marquee-outer py-2">
        <div className="marquee-inner">
          {[...items, ...items].map((text, i) => (
            <span
              key={i}
              className="mx-6 whitespace-nowrap text-[11px] sm:text-xs md:text-sm font-medium text-white/80"
            >
              {text} <span className="mx-6 text-white/40">•</span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee-outer {
          white-space: nowrap;
        }

        .marquee-inner {
          display: inline-flex;
          align-items: center;
          animation: marquee 28s linear infinite;
        }

        .marquee-outer:hover .marquee-inner {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}