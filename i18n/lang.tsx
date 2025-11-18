export type Lang = "it" | "en" | "es" | "fr" | "de";

export const SUPPORTED_LANGS: Lang[] = ["it", "en", "es", "fr", "de"];

export function normalizeLang(input: string | undefined | null): Lang {
  const raw = (input || "").toLowerCase();
  return SUPPORTED_LANGS.includes(raw as Lang) ? (raw as Lang) : "it";
}
