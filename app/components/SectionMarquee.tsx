"use client";

const items = [
  "🎁 Mystery box al kg",
  "KILOMYSTERY.COM",
  "🚚 Spedizione tracciata",
  "🔒 Pagamenti sicuri",
  "♻️ Seconda vita ai pacchi",
  "🇮🇹 Spedizione in tutta Italia",
];

export default function SectionMarquee() {
  return (
    <div className="relative overflow-hidden rounded-full border border-white/10 bg-gradient-to-r from-white/10 via-transparent to-white/10 py-2">
      {/* Overlay leggero per glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0e1a17] via-transparent to-[#0e1a17] opacity-70" />

      <div className="marquee-outer relative">
        <div className="marquee-inner">
          {items.map((text, i) => (
            <span key={`set1-${i}`} className="mx-6 text-xs sm:text-sm tracking-wide font-semibold">
              {text}
            </span>
          ))}
          {/* seconda copia per loop continuo */}
          {items.map((text, i) => (
            <span key={`set2-${i}`} className="mx-6 text-xs sm:text-sm tracking-wide font-semibold">
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
