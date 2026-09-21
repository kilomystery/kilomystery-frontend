import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { formatPPCode, maximumPPNumber } from "./poporama-pp";

// Stato condiviso da tutte le richieste nello stesso processo, anche dopo HMR.
// Non è una sequenza distribuita: su più istanze Shopify deve respingere
// eventuali collisioni sull'handle. Usiamo sempre create, MAI upsert/update.
const processState = globalThis as typeof globalThis & {
  poporamaPPSequence?: { tail: Promise<void>; highWater: number };
};
const state = processState.poporamaPPSequence ??= { tail: Promise.resolve(), highWater: 0 };

export async function lockPPSequence() {
  const previous = state.tail;
  let release!: () => void;
  state.tail = new Promise<void>(resolve => { release = resolve; });
  await previous;
  return release;
}

export function nextPPNumber(existingCodes: string[]) {
  const next = Math.max(maximumPPNumber(existingCodes), state.highWater) + 1;
  formatPPCode(next); // Fallisce esplicitamente oltre gli interi rappresentabili.
  return next;
}

export function rememberPPNumber(number: number) {
  formatPPCode(number);
  state.highWater = Math.max(state.highWater, number);
}

type Reservation = { lottoId: string; from: number; to: number; id: string };
function sign(payload: string) {
  const secret = process.env.POPORAMA_SESSION_SECRET;
  if (!secret) throw new Error("Configurazione server per la numerazione PP mancante.");
  return createHmac("sha256", secret).update(`poporama-pp-range-v1:${payload}`).digest();
}

// Chiamare sotto lock. La prenotazione non modifica Shopify.
export function reservePPRange(existingCodes: string[], count: number, lottoId: string) {
  if (!Number.isSafeInteger(count) || count < 1) throw new Error("Numero articoli non valido.");
  const from = nextPPNumber(existingCodes);
  const to = from + count - 1;
  formatPPCode(to);
  const payload = Buffer.from(JSON.stringify({ lottoId, from, to, id: randomUUID() })).toString("base64url");
  const ppReservation = `${payload}.${sign(payload).toString("hex")}`;
  rememberPPNumber(to);
  return { from, to, ppReservation };
}

// Il piano firmato può essere ricaricato dopo un'interruzione, anche su un'altra
// istanza. Non autorizza mai a sovrascrivere un PP esistente.
export function readPPReservation(token: unknown, lottoId: string): Reservation | null {
  if (typeof token !== "string" || token.length > 2048) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !/^[a-f0-9]{64}$/.test(parts[1])) return null;
  try {
    if (!timingSafeEqual(sign(parts[0]), Buffer.from(parts[1], "hex"))) return null;
    const plan = JSON.parse(Buffer.from(parts[0], "base64url").toString()) as Reservation;
    if (plan.lottoId !== lottoId || !plan.id || !Number.isSafeInteger(plan.from) ||
        !Number.isSafeInteger(plan.to) || plan.from < 1 || plan.to < plan.from) return null;
    return plan;
  } catch { return null; }
}
