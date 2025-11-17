// app/lib/safeLog.ts
// ZERO JSON.STRINGIFY qui dentro: logghiamo SOLO stringhe.

function asString(x: unknown): string {
  if (x == null) return "";
  if (typeof x === "string") return x;
  if (x instanceof Error) return x.message || String(x);
  // Evita DOM nodes / eventi sintetici
  if (typeof Element !== "undefined" && x instanceof Element) {
    const t = x.tagName?.toLowerCase() || "element";
    return `[HTMLElement <${t}>]`;
  }
  // @ts-ignore
  if (x && (x as any).nativeEvent) return "[SyntheticEvent]";
  try {
    // Ultimo fallback: toString “sicuro”
    return String(x);
  } catch {
    return "[unserializable]";
  }
}

export function forwardLog(label: unknown, payload?: unknown) {
  const a = asString(label);
  const b = payload === undefined ? "" : " " + asString(payload);
  // Il Dev Overlay intercetta console.*: passiamo SOLO stringhe
  console.log(`${a}${b}`);
}

export function safeWarn(label: unknown, payload?: unknown) {
  const a = asString(label);
  const b = payload === undefined ? "" : " " + asString(payload);
  console.warn(`${a}${b}`);
}

export function safeError(label: unknown, payload?: unknown) {
  const a = asString(label);
  const b = payload === undefined ? "" : " " + asString(payload);
  console.error(`${a}${b}`);
}