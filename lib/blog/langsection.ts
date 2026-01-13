import type { Lang } from "@/i18n/lang";

export function pickByLang<T extends Record<Lang, string>>(
  obj: T,
  lang: Lang
): string {
  return obj?.[lang] ?? obj?.it ?? "";
}

export function assertLang(lang: string): Lang {
  if (lang === "it" || lang === "en" || lang === "es" || lang === "fr" || lang === "de")
    return lang;
  return "it";
}
