export function parseTestPercentage(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = String(value).trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) && number >= 0 && number <= 100 ? number : null;
}

export function calculateTestPrice(retail: number, percentage: number): number {
  // Retail in centesimi e percentuale in centesimi di punto: arrotondamento
  // half-up esatto del risultato, senza moltiplicazioni monetarie floating point.
  const cents = Math.round((retail + Number.EPSILON) * 100);
  if (!Number.isSafeInteger(cents) || cents < 0 || parseTestPercentage(percentage) === null) {
    throw new Error("Retail o percentuale non validi per il prezzo POPORAMA.");
  }
  const result = (BigInt(cents) * BigInt(Math.round(percentage * 100)) + 5000n) / 10000n;
  return Number(result) / 100;
}
