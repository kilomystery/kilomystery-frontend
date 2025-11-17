"use client";
export default function SectionMarquee() {
  return (
    <div className="relative overflow-hidden py-3">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      <div className="whitespace-nowrap animate-marquee text-sm tracking-wide">
        <span className="mx-6">MYSTERY BOX</span>•<span className="mx-6">KILOMISTERY.COM</span>•
        <span className="mx-6">+2 KG BONUS CON LA RUOTA</span>•<span className="mx-6">SPEDIZIONE TRACCIATA</span>•
        <span className="mx-6">PAGAMENTI SICURI</span>•
      </div>
      <style jsx>{`
        .animate-marquee {
          display: inline-block;
          animation: marquee 22s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}