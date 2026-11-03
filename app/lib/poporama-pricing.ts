import { calculateTestPrice, parseTestPercentage } from "./poporama-test-pricing";

export type PriceRule = { base: "COGS" | "RETAIL"; percentage: number };
export type PricingState = { version: 1; manual: number | null; rule: PriceRule | null; valid: boolean };
export function moneyOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    try { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object") value = parsed.amount; } catch { /* decimal */ }
  }
  if (typeof value !== "number" && typeof value !== "string") return null;
  const raw = String(value).trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) return null;
  const amount = Number(raw);
  return Number.isSafeInteger(Math.round(amount * 100)) ? amount : null;
}
// Importi CSV: gestisce sia 1.234,56 sia 1,234.56, senza trasformare vuoti/errori in zero.
export function parseManifestMoney(value: string): number | null {
  let normalized = value.trim().replace(/[€$£\s]/g, "");
  if (!normalized) return null;
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.lastIndexOf(",") > normalized.lastIndexOf(".")
      ? normalized.replace(/\./g, "").replace(",", ".") : normalized.replace(/,/g, "");
  } else normalized = normalized.replace(",", ".");
  return moneyOrNull(normalized);
}

export function testDocument(value: unknown): Record<string, unknown> {
  if (typeof value === "string") { try { value = JSON.parse(value); } catch { return { valore: value }; } }
  if (value == null || value === "") return {};
  return typeof value === "object" && !Array.isArray(value) ? { ...value as Record<string, unknown> } : { legacy: value };
}
export function readPricing(value: unknown): PricingState | null {
  const state = testDocument(value)._poporamaPricing as PricingState | undefined;
  return state?.version === 1 ? state : null;
}
export function resolvePrice(input: { manual: number | null; rule?: PriceRule | null; grade: string; percentage?: number | null; retail: unknown; cogs: unknown }) {
  if (input.manual !== null) return { price: input.manual, valid: true };
  const rule = input.rule ?? { base: input.grade === "N" ? "COGS" : "RETAIL", percentage: input.percentage ?? (input.grade === "N" ? 50 : NaN) };
  const base = moneyOrNull(rule.base === "COGS" ? input.cogs : input.retail);
  if (base === null || parseTestPercentage(rule.percentage) === null) return { price: null, valid: false };
  return { price: calculateTestPrice(base, rule.percentage), valid: true };
}
// Gli importi legacy non hanno provenienza: si proteggono fino a reset esplicito.
export function pricingInfo(fields: { key: string; value: string | null }[]) {
  const field = (key: string) => fields.find(f => f.key === key)?.value ?? "";
  const state = readPricing(field("risultati_test"));
  const stored = moneyOrNull(field("prezzo_poporama"));
  return { cogsDisponibile: moneyOrNull(field("costo_manifest")) !== null, prezzoManuale: state ? state.manual : stored,
    regolaPrezzo: state?.rule ?? null, prezzoValido: (state?.valid ?? true) && stored !== null,
    prezzoLegacy: !state };
}

export function simulateRevenue(prices: (number | null)[], vat: number, costs: number | null) {
  const valid = prices.filter((price): price is number => price !== null);
  const grossCents = valid.reduce((sum, price) => sum + Math.round(price * 100), 0);
  if (parseTestPercentage(vat) === null) throw new Error("IVA non valida.");
  const divisor = BigInt(10000 + Math.round(vat * 100));
  const netCents = Number((BigInt(grossCents) * 10000n + divisor / 2n) / divisor);
  return { quantity: prices.length, gross: grossCents / 100, net: netCents / 100,
    margin: costs === null ? null : (netCents - Math.round(costs * 100)) / 100,
    missing: prices.length - valid.length };
}
