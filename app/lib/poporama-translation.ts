import { retryDelay } from "./poporama-retry";
import { createHash } from "crypto";
import { manyHandles } from "./poporama-shopify";
import { CACHE_TYPE, decode, put } from "./poporama-job-store";
export type Translation = { original: string; italian: string; error?: string; retryAt?: number; attempts: number; attemptedAt?: number };
export const titleKey = (original: string) => createHash("sha256").update(original.normalize("NFC").trim().replace(/\s+/g, " ")).digest("hex");
const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const unescapeXml = (s: string) => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
export function protectedTokens(title: string): string[] {
  const parts: string[] = title.match(/\b(?:\d+(?:[.,]\d+)?\s?(?:GB|TB|MB|MHz|GHz|mAh|Ah|mW|kW|W|V|mm|cm|kg|ml|mL|L|Hz|K|MP|Mbps|Gbit\/s)|(?=[\w./+-]*\d)[A-Za-z0-9][\w./+-]*|[A-Z][a-z]+[A-Z][\w-]*|[A-Z][A-Z0-9-]{1,})\b/g) || [];
  const first = title.match(/^[\s"']*([\p{Lu}][\p{L}\d'-]+)/u)?.[1];
  const generic = /^(Wireless|Wired|Smart|Electric|Portable|Digital|Stainless|Steel|Professional|Rechargeable|New|Mini|Large|Small|Black|White|Blue|Red|Green|Waterproof|Universal|Replacement|Pack|Set|The|For|With|High|Heavy|Premium|Original|Gaming|Bluetooth|Kitchen|Electric|Cordless|Automatic|LED)$/i;
  if (first && !generic.test(first)) parts.push(first);
  return [...new Set(parts)].sort((a, b) => b.length - a.length);
}
export function protectTitle(title: string) {
  const tokens = protectedTokens(title);
  if (!tokens.length) return `<t>${escapeXml(title)}</t>`;
  const pattern = new RegExp(tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
  let at = 0, xml = "";
  for (const match of title.matchAll(pattern)) {
    xml += escapeXml(title.slice(at, match.index)) + `<keep>${escapeXml(match[0])}</keep>`;
    at = match.index! + match[0].length;
  }
  return `<t>${xml}${escapeXml(title.slice(at))}</t>`;
}
export function validateTranslation(original: string, xml: string) {
  if (/<\/?(?!t\b|keep\b)[a-z][^>]*>/i.test(xml)) throw new Error("Markup inatteso nella traduzione");
  const italian = unescapeXml(xml.replace(/<\/?(?:t|keep)>/g, "")).trim();
  if (!italian || italian.length > 4000) throw new Error("Traduzione vuota o troppo lunga");
  for (const token of protectedTokens(original)) if (!italian.includes(token)) throw new Error("Marchio, modello o dato tecnico alterato");
  const numbers = (s: string) => (s.match(/\d+(?:[.,]\d+)?/g) || []).map(n => n.replace(",", ".")).sort().join("|");
  if (numbers(original) !== numbers(italian)) throw new Error("Dati numerici alterati");
  return italian;
}
export async function deeplTranslate(titles: string[], signal = AbortSignal.timeout(10000)): Promise<string[]> {
  if (!process.env.DEEPL_API_KEY) throw new Error("DEEPL_API_KEY non configurata");
  if (!titles.length || titles.length > 20) throw new Error("Blocco traduzioni non valido");
  const endpoint = process.env.DEEPL_API_FREE === "true" || process.env.DEEPL_API_KEY.endsWith(":fx") ? "https://api-free.deepl.com/v2/translate" : "https://api.deepl.com/v2/translate";
  const body = JSON.stringify({ text: titles.map(protectTitle), target_lang: "IT", tag_handling: "xml", ignore_tags: ["keep"], split_sentences: "nonewlines", preserve_formatting: true,
    context: "Product catalogue titles for an Italian retailer. Brand names, model identifiers, capacities and technical specifications refer to the original product." });
  if (Buffer.byteLength(body) > 120000) throw new Error("Blocco traduzioni troppo grande");
  for (let attempt = 0; attempt < 3; attempt++) {
    let response: Response;
    try { response = await fetch(endpoint, { method: "POST", cache: "no-store", signal, headers: { Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, "Content-Type": "application/json" }, body }); }
    catch { if (signal.aborted || attempt === 2) throw new Error("Traduzione temporaneamente non disponibile"); await new Promise(r => setTimeout(r, 200 * 2 ** attempt)); continue; }
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      const delay = Math.max(200 * 2 ** attempt, retryDelay(response.headers.get("Retry-After"), 0));
      if (delay > 2000) throw new Error(`DeepL temporaneamente limitato (${response.status})`);
      await new Promise(r => setTimeout(r, delay)); continue;
    }
    if (!response.ok) throw new Error(`DeepL: traduzione non disponibile (${response.status})`);
    const result = await response.json();
    if (!Array.isArray(result.translations) || result.translations.length !== titles.length) throw new Error("Risposta traduzioni incompleta");
    return result.translations.map((item: { text: string }) => item.text);
  }
  throw new Error("Traduzione non disponibile");
}
export async function translateCached(originals: string[], retryFailed = false, signal?: AbortSignal, retryBefore = Date.now()): Promise<Map<string, Translation>> {
  const unique = [...new Map(originals.map(t => [titleKey(t), t])).entries()];
  if (unique.length > 20) throw new Error("Blocco troppo grande");
  const nodes = await manyHandles(CACHE_TYPE, unique.map(([key]) => `it-${key}`));
  const results = new Map<string, Translation>();
  const missing: [string, string, number][] = [];
  unique.forEach(([key, original], i) => {
    const cached = nodes[i] ? decode<Translation>(nodes[i]!) : null;
    if (cached?.italian || (cached && ((!retryFailed && (cached.retryAt || 0) > Date.now()) || (retryFailed && (cached.attemptedAt || 0) >= retryBefore)))) results.set(key, { ...cached, original });
    else missing.push([key, original, cached?.attempts || 0]);
  });
  if (!missing.length) return results;
  // Keep each request below DeepL's byte limit, including XML protection tags.
  const groups: typeof missing[] = [];
  let group: typeof missing = [], bytes = 1000;
  for (const item of missing) {
    const size = Buffer.byteLength(JSON.stringify(protectTitle(item[1]))) + 1;
    if (group.length && (group.length >= 20 || bytes + size > 110000)) { groups.push(group); group = []; bytes = 1000; }
    group.push(item); bytes += size;
  }
  if (group.length) groups.push(group);
  for (const batch of groups) {
    let response: string[] = [], failure = "";
    try { response = await deeplTranslate(batch.map(([, original]) => original), signal); } catch (e) { failure = e instanceof Error ? e.message : "Traduzione non disponibile"; }
    for (let i = 0; i < batch.length; i++) {
      const [key, original, previousAttempts] = batch[i];
      let italian = "", error = failure;
      if (!failure) try { italian = validateTranslation(original, response[i]); } catch (e) { error = (e as Error).message; }
      const attempts = previousAttempts + 1;
      const result: Translation = { original, italian, ...(error ? { error, retryAt: Date.now() + Math.min(3600000, 60000 * 2 ** Math.min(attempts - 1, 6)) } : {}), attempts, attemptedAt: Date.now() };
      // Persist before using it so an interrupted request never repeats successful translations.
      await put(CACHE_TYPE, `it-${key}`, result);
      results.set(key, result);
    }
  }
  return results;
}
