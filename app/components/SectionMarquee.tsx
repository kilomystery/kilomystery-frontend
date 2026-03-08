"use client";

type Lang = "it" | "en" | "es" | "fr" | "de";

const LABELS: Record<Lang, string[]> = {
  it: [
    "Spedizione tracciata",
    "Pagamenti sicuri",
    "Seconda vita ai pacchi",
    "Spedizione in tutta Europa",
  ],
  en: [
    "Tracked shipping",
    "Secure payments",
    "Second life for parcels",
    "Shipping across Europe",
  ],
  es: [
    "Envío con seguimiento",
    "Pagos seguros",
    "Segunda vida para los paquetes",
    "Envíos a toda Europa",
  ],
  fr: [
    "Livraison suivie",
    "Paiements sécurisés",
    "Seconde vie pour les colis",
    "Livraison dans toute l’Europe",
  ],
  de: [
    "Versand mit Tracking",
    "Sichere Zahlungen",
    "Zweites Leben für Pakete",
    "Versand in ganz Europa",
  ],
};

export default function SectionMarquee({ lang = "it" as Lang }) {
  const supported = ["it", "en", "es", "fr", "de"] as const;
  const normalized = String(lang).toLowerCase();
  const safeLang: Lang = (supported as readonly string[]).includes(normalized as any)
    ? (normalized as Lang)
    : "it";

  const items = LABELS[safeLang];

  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-[#09110f] text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#7A20FF]/40 to-transparent" />

      <div className="marquee-outer py-2">
        <div className="marquee-inner">
          {[...items, ...items].map((text, i) => (
            <span
              key={i}
              className="mx-6 inline-flex items-center gap-6 whitespace-nowrap text-[11px] sm:text-xs md:text-sm font-medium text-white/85"
            >
              <span>{text}</span>
              <span className="h-1 w-1 rounded-full bg-emerald-300/70" />
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
          animation: marquee 30s linear infinite;
          will-change: transform;
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