// Formato condiviso. I vecchi codici PP-TEST-* non partecipano alla sequenza.
export function extractPPNumber(value: string): number | null {
  const match = /^PP-(\d{6,})$/i.exec(String(value).trim());
  if (!match) return null;
  const number = Number(match[1]);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export function formatPPCode(number: number): string {
  if (!Number.isSafeInteger(number) || number < 1) throw new Error("Numero PP fuori intervallo.");
  return `PP-${String(number).padStart(6, "0")}`;
}

export function maximumPPNumber(codes: string[]): number {
  return codes.reduce((max, code) => Math.max(max, extractPPNumber(code) ?? 0), 0);
}
