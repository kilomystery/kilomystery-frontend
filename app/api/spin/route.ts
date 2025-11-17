import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { SEGMENTS, SEGMENT_ANGLE } from "@/lib/prizes";

const SECRET = process.env.SPIN_SECRET || "dev-secret-change-me";

type SpinState = {
  orderId: string;
  customerId: string;
  kg: number;           // deve essere 10
  exp: number;          // epoch seconds
  jti: string;          // nonce
  spinCount: number;    // quanti giri già fatti (0-based)
  multiplier: number;   // moltiplicatore corrente (parte da 1)
  pendingSpins: number; // giri bonus rimasti
};

const b64u = (s: Buffer | string) =>
  Buffer.from(s).toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
const b64uDecode = (s: string) =>
  Buffer.from(s.replace(/-/g,"+").replace(/_/g,"/"), "base64").toString();

function sign(payload: string) {
  return b64u(createHmac("sha256", SECRET).update(payload).digest());
}
function encode(state: SpinState) {
  const p = b64u(JSON.stringify(state));
  return `${p}.${sign(p)}`;
}
function decode(token: string): SpinState {
  const [p64, sig] = token.split(".");
  if (!p64 || !sig) throw new Error("Malformed");
  if (sign(p64) !== sig) throw new Error("Bad signature");
  return JSON.parse(b64uDecode(p64)) as SpinState;
}

function seededIndex(seedStr: string, modulo: number) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h += (h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);
  }
  if (h < 0) h = ~h + 1;
  return h % modulo;
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const state = decode(token);
    const now = Math.floor(Date.now()/1000);
    if (state.exp < now) return NextResponse.json({ error: "Expired" }, { status: 403 });
    if (state.kg !== 10)  return NextResponse.json({ error: "Not eligible" }, { status: 403 });

    // indice deterministico: ordine + jti + spinCount
    const idx = seededIndex(`${state.orderId}:${state.jti}:${state.spinCount}`, SEGMENTS.length);
    const seg  = SEGMENTS[idx];

    let addKg = 0;
    let next = { ...state, spinCount: state.spinCount + 1 };

    switch (seg.type) {
      case "ZERO": break;
      case "HALF": addKg += (seg.valueKg ?? 0.5) * state.multiplier; break;
      case "ONE":  addKg += (seg.valueKg ?? 1)   * state.multiplier; break;
      case "TWO":  addKg += (seg.valueKg ?? 2)   * state.multiplier; break;
      case "RESPIN": next.pendingSpins += 1; break;
      case "X2":     next.multiplier *= 2; break;
    }

    const base = 360 * 6; // giri pieni
    const angle = base + (idx + 0.5) * SEGMENT_ANGLE;

    // se ci sono giri pendenti, consumane uno automaticamente (quello appena fatto)
    // nota: qui abbiamo già incrementato spinCount, pendingSpins descrive quelli EXTRA rimasti
    const hasMoreSpin = next.pendingSpins > 0;
    if (hasMoreSpin) next.pendingSpins -= 1;

    // TODO: salva su DB l’esito cumulativo per orderId (kg vinti totali, spin log, multiplier corrente)
    const nextToken = encode(next);

    return NextResponse.json({
      index: idx,
      angle,
      prizeKgDelta: +addKg.toFixed(2),
      multiplier: next.multiplier,
      hasMoreSpin,
      nextToken,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Spin error" }, { status: 400 });
  }
}