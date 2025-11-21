// i18n/lang.ts
export type Lang = "it" | "en" | "es" | "fr" | "de";

export const SUPPORTED_LANGS: Lang[] = ["it", "en", "es", "fr", "de"];

// Normalizza una singola stringa di lingua (es. "en", "en-US", "fr-FR", "pt-BR")
export function normalizeLangCode(input: string | undefined | null): Lang {
  if (!input) return "en";

  const raw = input.toLowerCase();

  // Se è già una lingua supportata (es. "en", "it", "es", "fr", "de")
  if (SUPPORTED_LANGS.includes(raw as Lang)) {
    return raw as Lang;
  }

  // Se è un locale tipo "en-us" → prendo la parte prima del "-"
  const base = raw.split("-")[0];
  if (SUPPORTED_LANGS.includes(base as Lang)) {
    return base as Lang;
  }

  // Qualsiasi altra lingua → fallback a EN
  return "en";
}

// Versione che usi già nelle pagine con params.lang
export function normalizeLang(input: string | undefined | null): Lang {
  return normalizeLangCode(input);
}

// Usa l'header Accept-Language per scegliere la lingua migliore
export function detectLangFromHeader(header: string | null): Lang {
  if (!header) return "en";

  // Esempio header: "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7"
  const parts = header.split(",").map((p) => p.split(";")[0].trim());

  for (const part of parts) {
    const lang = normalizeLangCode(part);
    if (lang) return lang;
  }

  return "en";
}
