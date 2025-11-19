// app/[lang]/reward/page.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

/* -------------------------------------------------------
   CONFIGURAZIONE PREMI
------------------------------------------------------- */

type Sector = { label: string; color: string };

const COLORS = {
  zero: "#1F2937", // 0 kg
  half: "#F59E0B", // 0.5 kg
  one: "#22D3EE", // 1 kg
  two: "#8B5CF6", // 2 kg
  spin: "#EC4899", // +1 spin
  x2: "#F97316", // X2
};

const SPEC = {
  zeros: 6,
  half: 3,
  one: 2,
  two: 1,
  spin: 2,
  x2: 2,
};

type Nullable<T> = T | null;

function buildSectorsAlternated(): Sector[] {
  const N = 16;
  const out = new Array<Nullable<Sector>>(N).fill(null);

  // 1) piazzo gli 0 kg sugli indici pari
  let zerosToPlace = SPEC.zeros;
  for (let i = 0; i < N && zerosToPlace > 0; i += 2) {
    out[i] = { label: "0 kg", color: COLORS.zero };
    zerosToPlace--;
  }

  // 2) slot liberi
  const freeIdx: number[] = [];
  for (let i = 1; i < N; i += 2) freeIdx.push(i);
  for (let i = 0; i < N; i += 2) if (!out[i]) freeIdx.push(i);

  // 3) round robin degli altri premi
  const bucket: Array<{ label: string; color: string; left: number }> = [
    { label: "0.5 kg", color: COLORS.half, left: SPEC.half },
    { label: "1 kg", color: COLORS.one, left: SPEC.one },
    { label: "2 kg", color: COLORS.two, left: SPEC.two },
    { label: "+1 spin", color: COLORS.spin, left: SPEC.spin },
    { label: "X2", color: COLORS.x2, left: SPEC.x2 },
  ];

  let p = 0;
  while (true) {
    const leftTotal = bucket.reduce((s, b) => s + b.left, 0);
    if (leftTotal === 0) break;

    for (const b of bucket) {
      if (!b.left) continue;
      while (p < freeIdx.length && out[freeIdx[p]] !== null) p++;
      if (p >= freeIdx.length) break;

      out[freeIdx[p]] = { label: b.label, color: b.color };
      b.left--;
      p++;
    }
  }

  return out.map((x) => x!) as Sector[];
}

/* -------------------------------------------------------
   GEOMETRIA
------------------------------------------------------- */

const rad = (d: number) => (d * Math.PI) / 180;
const norm = (deg: number) => ((deg % 360) + 360) % 360;

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
) {
  const s = rad(startDeg),
    e = rad(endDeg);
  const x1 = cx + r * Math.cos(s),
    y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e),
    y2 = cy + r * Math.sin(e);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

/* -------------------------------------------------------
   COMPONENTE
------------------------------------------------------- */

export default function RewardPage({
  params,
}: {
  params: { lang: string };
}) {
  const sectors = useMemo(buildSectorsAlternated, []);
  const N = sectors.length; // 16
  const STEP = 360 / N; // 22.5°

  const searchParams = useSearchParams();

  // presi dalla mail: /it/reward?order_id=...&kg=10
  const orderedKg = Number(searchParams.get("kg") || "0");
  const orderId = searchParams.get("order_id") || "";

  // stato ruota
  const [spinDeg, setSpinDeg] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef<HTMLDivElement | null>(null);

  // stato gioco
  const [spinsLeft, setSpinsLeft] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [wonKg, setWonKg] = useState(0);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // popup riepilogo
  const [showSummary, setShowSummary] = useState(false);

  // per non mandare due volte la nota
  const sentRef = useRef(false);

  // layout ruota
  const size = 560;
  const cx = size / 2,
    cy = size / 2;
  const R_OUT = 222;
  const R_BULB = 238;

  /* -----------------------------------------------------
     SPIN
  ----------------------------------------------------- */
  const spin = () => {
    if (spinning || spinsLeft <= 0) return;

    setLastResult(null);
    setSpinning(true);

    let nextSpins = spinsLeft - 1;
    let nextMultiplier = multiplier;
    let nextWonKg = wonKg;

    const targetIndex = Math.floor(Math.random() * N);

    const targetCenter = norm(targetIndex * STEP - 90 + STEP / 2);
    const pointer = 270;
    const current = norm(spinDeg);
    const align = norm(pointer - targetCenter - current);

    const extraSpins = 6 + Math.floor(Math.random() * 2); // 6–7 giri
    const delta = extraSpins * 360 + align;
    const finalDeg = spinDeg + delta;

    const duration = 5200;
    const easing = "cubic-bezier(0.08, 0.7, 0, 1)";

    setSpinDeg(finalDeg);
    wheelRef.current?.style.setProperty("--dur", `${duration}ms`);
    wheelRef.current?.style.setProperty("--ease", easing);

    window.setTimeout(() => {
      const landed = norm(finalDeg);
      const centerUnderPointer = norm(pointer - landed);
      const visualIndex =
        Math.floor(norm(centerUnderPointer + 90) / STEP) % N;

      const prize = sectors[visualIndex].label;
      setLastResult(prize);

      const numeric =
        prize.endsWith("kg")
          ? parseFloat(prize.replace(",", ".").replace(" kg", ""))
          : null;

      if (numeric !== null) {
        nextWonKg = +(nextWonKg + numeric * nextMultiplier).toFixed(2);
        nextMultiplier = 1;
        setWonKg(nextWonKg);
        setMultiplier(1);
      } else if (prize === "+1 spin") {
        nextSpins += 1;
      } else if (prize === "X2") {
        nextMultiplier = nextMultiplier * 2;
        nextSpins += 1;
        setMultiplier(nextMultiplier);
      }

      setSpinsLeft(nextSpins);
      setSpinning(false);

      if (nextSpins <= 0) {
        // 👉 chiamiamo il backend UNA VOLTA
        if (!sentRef.current && orderId) {
          sentRef.current = true;
          fetch("/api/spin/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,        // <-- adesso usiamo l'ID ordine
              orderedKg,
              bonusKg: nextWonKg,
              lang: params?.lang ?? "it",
            }),
          }).catch((e) => {
            console.error("spin API error", e);
          });
        }

        requestAnimationFrame(() => setShowSummary(true));
      }
    }, duration);
  };

  /* -----------------------------------------------------
     RENDER
  ----------------------------------------------------- */

  // è idoneo solo se ho un orderId e almeno 10 kg
  const notEligible = !orderId || orderedKg < 10;

  return (
    <main className="container py-8">
      {/* Logo + claim */}
      <div className="mx-auto mb-6 w-[170px] relative aspect-[3/1]">
        <Image
          src="/logo.svg"
          alt="KiloMistery"
          fill
          className="object-contain"
          priority
        />
      </div>

      <h1 className="text-center text-4xl md:text-5xl font-extrabold">
        Ruota della fortuna
      </h1>

      {notEligible ? (
        <p className="mx-auto mt-6 max-w-2xl text-center text-white/80">
          Nessun giro disponibile per questo ordine.
          <br />
          Se pensi che ci sia un errore, contatta il supporto{" "}
          <b>KiloMystery</b>.
        </p>
      ) : (
        <>
          <p className="mx-auto mt-4 max-w-3xl text-center text-white/80">
            Gira la ruota <b>Mistery Kilo</b> e vinci <b>kg bonus</b> aggiuntivi
            per il tuo ordine! Se esce <b>X2</b> raddoppi il prossimo premio (e
            ottieni un altro giro). Se esce <b>+1 spin</b> ottieni un altro giro
            gratuito.
          </p>

          {/* Stat boxes */}
          <div className="mx-auto mt-6 mb-4 flex flex-wrap items-center justify-center gap-3 text-sm md:text-base">
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
              Giri disponibili: <b>{spinsLeft}</b>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
              Moltiplicatore: <b>x{multiplier}</b>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
              Bonus cumulato: <b>{wonKg.toFixed(2)} kg</b>
            </div>
          </div>

          {/* Freccia + ruota */}
          <div className="relative mx-auto max-w-[660px]">
            <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-20">
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "16px solid transparent",
                  borderRight: "16px solid transparent",
                  borderTop: "28px solid #ef4444",
                  filter: "drop-shadow(0 2px 6px rgba(0,0,0,.55))",
                }}
              />
            </div>

            {/* RUOTA */}
            <div
              ref={wheelRef}
              className="relative"
              style={{
                width: size,
                maxWidth: "100%",
                aspectRatio: "1/1",
                margin: "0 auto",
                transform: `rotate(${spinDeg}deg)`,
                transition:
                  "transform var(--dur,5200ms) var(--ease,cubic-bezier(0.08,0.7,0,1))",
                transformOrigin: "50% 50%",
              }}
            >
              <svg
                viewBox={`0 0 ${size} ${size}`}
                className="block w-full h-auto"
              >
                {/* lampadine */}
                {Array.from({ length: 56 }).map((_, i) => {
                  const a = rad((i / 56) * 360 - 90);
                  const x = cx + R_BULB * Math.cos(a);
                  const y = cy + R_BULB * Math.sin(a);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={6}
                      fill={i % 2 ? "#fde68a" : "#fff"}
                      stroke="#a855f7"
                      strokeWidth={2}
                    />
                  );
                })}

                {/* bordo */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={R_OUT + 10}
                  fill="#8b5cf6"
                  stroke="#a78bfa"
                  strokeWidth={3}
                />

                {/* spicchi */}
                {sectors.map((s, i) => {
                  const start = i * STEP - 90;
                  const end = start + STEP;
                  const mid = (start + end) / 2;

                  // raggio un po' più interno per non uscire dagli spicchi
                  const rt = R_OUT * 0.62;
                  const tx = cx + rt * Math.cos(rad(mid));
                  const ty = cy + rt * Math.sin(rad(mid));

                  return (
                    <g key={i}>
                      <path
                        d={arcPath(cx, cy, R_OUT, start, end)}
                        fill={s.color}
                        stroke="#111827"
                        strokeWidth={1.2}
                      />
                      <line
                        x1={cx}
                        y1={cy}
                        x2={cx + R_OUT * Math.cos(rad(start))}
                        y2={cy + R_OUT * Math.sin(rad(start))}
                        stroke="rgba(255,255,255,.28)"
                        strokeWidth={1}
                      />
                      <g
                        style={{
                          transformOrigin: "0 0",
                          transform: `translate(${tx}px, ${ty}px) rotate(${
                            mid + 90
                          }deg)`,
                        }}
                      >
                        <text
                          x={0}
                          y={0}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="14" // più piccolo per restare dentro
                          fontWeight={800}
                          fill="#fff"
                        >
                          {s.label}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* mozzo */}
                <circle cx={cx} cy={cy} r={70} fill="#0b1220" />
                <circle
                  cx={cx}
                  cy={cy}
                  r={58}
                  fill="url(#gradCenter)"
                  stroke="#6ee7b7"
                  strokeWidth={2}
                />
                <defs>
                  <radialGradient id="gradCenter" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </radialGradient>
                </defs>
              </svg>

              {/* bottone centrale */}
              <button
                onClick={spin}
                disabled={spinning || spinsLeft <= 0}
                className="absolute inset-0 m-auto h-[104px] w-[210px] rounded-full font-extrabold text-white shadow-xl
                        bg-gradient-to-r from-fuchsia-500 via-purple-500 to-emerald-400
                        hover:brightness-110 transition
                        disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {spinning ? "GIRANDO..." : "GIRA LA RUOTA"}
              </button>
            </div>
          </div>

          {/* Stato live */}
          <div className="mt-6 text-center">
            {lastResult && (
              <p className="text-xl md:text-2xl font-extrabold">
                🎉 Risultato:{" "}
                <span className="text-yellow-300">{lastResult}</span>
              </p>
            )}
            <p className="text-white/60 mt-1 text-sm">
              Bonus cumulato: <b>{wonKg.toFixed(2)} kg</b> · Moltiplicatore
              attuale: <b>x{multiplier}</b> · Giri rimasti: <b>{spinsLeft}</b>
            </p>
          </div>

          {/* Popup di riepilogo */}
          {showSummary && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
              <div className="w-full max-w-md rounded-2xl bg-[#0b1220] border border-white/10 p-6 text-center">
                <div className="mx-auto mb-4 w-[140px] relative aspect-[3/1]">
                  <Image
                    src="/logo.svg"
                    alt="KiloMistery"
                    fill
                    className="object-contain"
                  />
                </div>

                <h3 className="text-2xl font-extrabold mb-1">
                  {wonKg > 0 ? "Complimenti! 🎁" : "Peccato! 😅"}
                </h3>
                <p className="text-white/70">
                  {wonKg > 0 ? (
                    <>
                      Hai vinto <b>{wonKg.toFixed(2)} kg</b> bonus aggiunti al
                      tuo ordine.
                    </>
                  ) : (
                    <>
                      Questa volta niente kg bonus, ma la prossima andrà meglio!
                    </>
                  )}
                </p>

                <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
                  <a
                    href={`/${params?.lang ?? "it"}`} // per ora torna alla home
                    className="btn-brand px-5"
                  >
                    Torna al sito
                  </a>
                  <button
                    onClick={() => setShowSummary(false)}
                    className="btn-ghost px-5"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
