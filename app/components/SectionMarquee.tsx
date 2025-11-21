"use client";

type Lang = "it" | "en" | "es" | "fr" | "de";

const LABELS: Record<Lang, string[]> = {
  it: [
    "🎁 Mystery box al kg",
    "KILOMYSTERY.COM",
    "🚚 Spedizione tracciata",
    "🔒 Pagamenti sicuri",
    "♻️ Seconda vita ai pacchi",
    "🇪🇺 Spedizione in tutta Europa",
    "🆓 Spedizione gratuita oltre 100€",
  ],
  en: [
    "🎁 Mystery boxes by the kilo",
    "KILOMYSTERY.COM",
    "🚚 Tracked shipping",
    "🔒 Secure payments",
    "♻️ Second life for parcels",
    "🇪🇺 Shipping across Europe",
    "🆓 Free shipping over €100",
  ],
  es: [
    "🎁 Mystery box al kilo",
    "KILOMYSTERY.COM",
    "🚚 Envío con seguimiento",
    "🔒 Pagos seguros",
    "♻️ Segunda vida para los paquetes",
    "🇪🇺 Envíos a toda Europa",
    "🆓 Envío gratis en pedidos superiores a 100€",
  ],
  fr: [
    "🎁 Mystery box au kilo",
    "KILOMYSTERY.COM",
    "🚚 Livraison suivie",
    "🔒 Paiements sécurisés",
    "♻️ Seconde vie pour les colis",
    "🇪🇺 Livraison dans toute l’Europe",
    "🆓 Livraison gratuite au-delà de 100€",
  ],
  de: [
    "🎁 Mystery Box zum Kilo-Preis",
    "KILOMYSTERY.COM",
    "🚚 Versand mit Tracking",
    "🔒 Sichere Zahlungen",
    "♻️ Zweites Leben für Pakete",
    "🇪🇺 Versand in ganz Europa",
    "🆓 Kostenloser Versand über 100€",
  ],
};

export default function SectionMarquee({ lang = "it" as Lang }) {
  const supported = ["it", "en", "es", "fr", "de"] as const;
  const normalized = String(lang).toLowerCase();
  const safeLang: Lang = (supported as readonly string[]).includes(
    normalized as any
  )
    ? (normalized as Lang)
    : "it";

  const items = LABELS[safeLang];

  return (
    <div className="relative overflow-hidden rounded-full border border-white/10 bg-gradient-to-r from-white/10 via-transparent to-white/10 py-2">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0e1a17] via-transparent to-[#0e1a17] opacity-70" />

      <div className="marquee-outer relative">
        <div className="marquee-inner">
          {items.map((text, i) => (
            <span
              key={`set1-${i}`}
              className="mx-6 text-xs sm:text-sm tracking-wide font-semibold"
            >
              {text}
            </span>
          ))}
          {items.map((text, i) => (
            <span
              key={`set2-${i}`}
              className="mx-6 text-xs sm:text-sm tracking-wide font-semibold"
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
          animation: marquee 22s linear infinite;
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
