// Calcoli puri condivisi dalla Cassa e dall'API. Nessuna credenziale o chiamata Shopify.
export function parseCents(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = String(value).trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const cents = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
  return cents <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(cents) : null;
}

export function centsToDecimal(cents: number): string {
  const value = BigInt(cents);
  return `${value / BigInt(100)}.${String(value % BigInt(100)).padStart(2, "0")}`;
}

export function sumCents(values: number[]): number {
  const total = values.reduce((sum, value) => sum + BigInt(value), BigInt(0));
  if (total > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Totale troppo elevato.");
  return Number(total);
}

export function allocateCents(
  total: number,
  items: { code: string; weight: number }[]
): number[] {
  if (!items.length || !Number.isSafeInteger(total) || total < 0 ||
      items.some((item) => !Number.isSafeInteger(item.weight) || item.weight < 0)) {
    throw new Error("Importi non validi per la ripartizione.");
  }
  let weights = items.map((item) => BigInt(item.weight));
  let weightSum = weights.reduce((sum, weight) => sum + weight, BigInt(0));
  if (weightSum === BigInt(0)) {
    weights = items.map(() => BigInt(1));
    weightSum = BigInt(items.length);
  }
  // Metodo dei maggiori resti: quozienti interi, poi un centesimo ai resti
  // maggiori. A parità di resto prevale il codice PP, indipendentemente dall'ordine.
  const shares = weights.map((weight, index) => {
    const numerator = BigInt(total) * weight;
    return { index, cents: Number(numerator / weightSum), remainder: numerator % weightSum };
  });
  const remaining = total - sumCents(shares.map((share) => share.cents));
  const ranked = [...shares].sort((a, b) => a.remainder !== b.remainder
    ? (a.remainder > b.remainder ? -1 : 1)
    : items[a.index].code < items[b.index].code ? -1 : 1);
  for (let i = 0; i < remaining; i++) ranked[i].cents++;
  return shares.map((share) => share.cents);
}
