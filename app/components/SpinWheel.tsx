"use client";

import { useMemo, useRef, useState } from "react";
import { SEGMENTS, SEGMENT_ANGLE } from "@/lib/prizes";
import { safeError } from "@/app/lib/safeLog";

type Props = {
  token: string;                          // token firmato dal server
  onResult?: (kgDelta: number) => void;   // callback a giro concluso
};

export default function SpinWheel({ token, onResult }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [message, setMessage] = useState<string>("");
  const [currentToken, setCurrentToken] = useState(token);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Palette alternata (oro/viola) tipo “Crazy Time”
  const fills = useMemo(() => {
    const A = ["#F59E0B", "#8B5CF6"];
    return Array.from({ length: SEGMENTS.length }, (_, i) => A[i % A.length]);
  }, []);

  async function spin() {
    if (spinning) return;
    setSpinning(true);
    setMessage("");

    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: currentToken }),
      });

      // Non passiamo Response all'overlay; estraiamo SOLO testo/json.
      let data: any = null;
      const raw = await res.text().catch(() => "");
      try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }

      if (!res.ok) {
        throw new Error(data?.error || `Spin HTTP ${res.status}`);
      }

      // Angolo assoluto deciso dal server (include i giri extra)
      const targetAngle = Number(data.angle) || 0;
      setAngle(targetAngle);

      // Fine animazione ~2.25s: mostra esito e aggiorna token
      const ANIM_MS = 2250;
      window.setTimeout(() => {
        setSpinning(false);
        if (data?.nextToken) setCurrentToken(String(data.nextToken));

        const delta: number = Number(data?.prizeKgDelta) || 0;
        const label: string = String(data?.label ?? "");
        const mult: number = Number(data?.multiplier) || 1;

        const extra = delta > 0 ? `+${delta} kg` : label || "—";
        const suffix = mult > 1 ? ` (×${mult})` : "";
        const more = data?.hasMoreSpin ? " — hai un altro giro!" : "";

        setMessage(`Risultato: ${extra}${suffix}${more}`);
        onResult?.(delta);
      }, ANIM_MS);
    } catch (err) {
      safeError("Spin error", err);
      setSpinning(false);
      setMessage("Errore durante il giro. Riprova.");
    }
  }

  return (
    <div className="w-full">
      <div className="relative mx-auto w-[320px] h-[320px] md:w-[420px] md:h-[420px]">
        {/* Freccia */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[28px] border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow" />
        </div>

        {/* Ruota */}
        <div
          ref={wheelRef}
          className="absolute inset-0 rounded-full border-8 border-yellow-500 shadow-[0_0_40px_rgba(245,158,11,.35)]"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: spinning
              ? "transform 2.25s cubic-bezier(.17,.67,.28,.98)"
              : undefined,
            background:
              "radial-gradient(circle at 50% 50%, #111 0%, #0b0f1a 60%, #0b0f1a 100%)",
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full block">
            <defs>
              <radialGradient id="centerGlow" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#FFD977" />
                <stop offset="100%" stopColor="#F59E0B" />
              </radialGradient>
            </defs>

            {/* Spicchi */}
            {SEGMENTS.map((seg, i) => {
              const start = i * SEGMENT_ANGLE;
              const end = start + SEGMENT_ANGLE;
              const mid = (start + end) / 2;
              const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;

              const r = 48;
              const toRad = (d: number) => (Math.PI / 180) * d;

              const x1 = 50 + r * Math.cos(toRad(start));
              const y1 = 50 + r * Math.sin(toRad(start));
              const x2 = 50 + r * Math.cos(toRad(end));
              const y2 = 50 + r * Math.sin(toRad(end));

              const tx = 50 + (r - 13) * Math.cos(toRad(mid));
              const ty = 50 + (r - 13) * Math.sin(toRad(mid));

              return (
                <g key={i}>
                  <path
                    d={`M50,50 L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`}
                    fill={fills[i]}
                    stroke="rgba(0,0,0,.22)"
                    strokeWidth="0.4"
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#101010"
                    fontSize="7"
                    fontWeight="700"
                    transform={`rotate(${mid}, ${tx}, ${ty})`}
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}

            {/* Disco centrale */}
            <circle cx="50" cy="50" r="14" fill="url(#centerGlow)" stroke="#00000055" />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="6"
              fontWeight="800"
              fill="#6B21A8"
            >
              KILO
            </text>
          </svg>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className={`btn-brand px-6 ${spinning ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {spinning ? "Gira..." : "Gira la ruota"}
        </button>
      </div>

      {/* Messaggio risultato accessibile */}
      <p className="mt-3 text-center text-white/80" aria-live="polite">
        {message}
      </p>
    </div>
  );
}