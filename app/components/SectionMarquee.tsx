"use client";

type Lang = "it" | "en" | "es" | "fr" | "de";

const LABELS: Record<Lang, string[]> = {
  it: [
    "🆓 Spedizione gratuita oltre 50€",
    "🚚 Spedizione tracciata",
    "🔒 Pagamenti sicuri",
    "♻️ Seconda vita ai pacchi",
    "🇪🇺 Spedizione in tutta Europa",
  ],
  en: [
    "🆓 Free shipping over €50",
    "🚚 Tracked shipping",
    "🔒 Secure payments",
    "♻️ Second life for parcels",
    "🇪🇺 Shipping across Europe",
  ],
  es: [
    "🆓 Envío gratis en pedidos superiores a 50€",
    "🚚 Envío con seguimiento",
    "🔒 Pagos seguros",
    "♻️ Segunda vida para los paquetes",
    "🇪🇺 Envíos a toda Europa",
  ],
  fr: [
    "🆓 Livraison gratuite au-delà de 50€",
    "🚚 Livraison suivie",
    "🔒 Paiements sécurisés",
    "♻️ Seconde vie pour les colis",
    "🇪🇺 Livraison dans toute l’Europe",
  ],
  de: [
    "🆓 Kostenloser Versand über 50€",
    "🚚 Versand mit Tracking",
    "🔒 Sichere Zahlungen",
    "♻️ Zweites Leben für Pakete",
    "🇪🇺 Versand in ganz Europa",
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
    <div className="relative overflow-hidden border-y border-white/10 bg-[#08110f] py-2 text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0e1a17] via-transparent to-[#0e1a17] opacity-70" />

      <div className="marquee-outer relative">
        <div className="marquee-inner">
          {items.map((text, i) => (
            <span
              key={`set1-${i}`}
              className="mx-6 text-[11px] sm:text-xs md:text-sm tracking-wide font-semibold whitespace-nowrap"
            >
              {text}
            </span>
          ))}
          {items.map((text, i) => (
            <span
              key={`set2-${i}`}
              className="mx-6 text-[11px] sm:text-xs md:text-sm tracking-wide font-semibold whitespace-nowrap"
            >
              {text}
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
          animation: marquee 24s linear infinite;
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