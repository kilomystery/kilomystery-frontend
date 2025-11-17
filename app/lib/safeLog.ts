// app/lib/safeLog.ts
// NIENTE JSON.stringify. Convertiamo TUTTO a stringa PRIMA di toccare console.*

function asString(x: unknown): string {
  if (x == null) return "";
  if (typeof x === "string") return x;
  if (x instanceof Error) return x.message || String(x);

  // Evita DOM nodes / eventi sintetici
  // (Element potrebbe non esistere in Node, per questo il typeof)
  if (typeof Element !== "undefined" && x instanceof Element) {
    const t = x.tagName?.toLowerCase() || "element";
    return `[HTMLElement <${t}>]`;
  }
  // @ts-ignore
  if (x && (x as any).nativeEvent) return "[SyntheticEvent]";

  try {
    return String(x);
  } catch {
    return "[unserializable]";
  }
}

export function forwardLog(label: unknown, payload?: unknown) {
  const a = asString(label);
  const b = payload === undefined ? "" : " " + asString(payload);
  console.log(`${a}${b}`);           // <-- SOLO stringhe
}

export function safeWarn(label: unknown, payload?: unknown) {
  const a = asString(label);
  const b = payload === undefined ? "" : " " + asString(payload);
  console.warn(`${a}${b}`);          // <-- SOLO stringhe
}

export function safeError(label: unknown, payload?: unknown) {
  const a = asString(label);
  const b = payload === undefined ? "" : " " + asString(payload);
  console.error(`${a}${b}`);         // <-- SOLO stringhe
}