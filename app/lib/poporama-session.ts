// Solo server: condiviso da middleware Edge, layout e API. Mai importare nei client.
export const POPORAMA_COOKIE = "poporama_session";
export const POPORAMA_SESSION_SECONDS = 12 * 60 * 60;
export const poporamaCookieOptions = (hostname: string) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  // Anche next start può essere eseguito in locale su HTTP.
  secure: process.env.NODE_ENV === "production" &&
    !["localhost", "127.0.0.1", "[::1]"].includes(hostname),
  path: "/", // Necessario sia per /[lang]/poporama-test sia per /api/poporama.
});

const encoder = new TextEncoder();
const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");

async function signingKey() {
  const secret = process.env.POPORAMA_SESSION_SECRET;
  const pin = process.env.POPORAMA_ACCESS_PIN;
  if (!pin || !secret || encoder.encode(secret).length < 32) {
    throw new Error("Accesso POPORAMA non configurato: contatta il responsabile.");
  }
  // La rotazione del PIN o del secret invalida tutte le sessioni precedenti.
  const material = await crypto.subtle.digest("SHA-256", encoder.encode(JSON.stringify([secret, pin])));
  return crypto.subtle.importKey("raw", material, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createPoporamaSession() {
  const key = await signingKey();
  const expiresAt = Date.now() + POPORAMA_SESSION_SECONDS * 1000;
  const nonce = hex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const payload = `v1.${expiresAt}.${nonce}`;
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return { value: `${payload}.${hex(signature)}`, expiresAt };
}

export async function verifyPoporamaSession(value?: string): Promise<number | null> {
  if (!value || value.length > 200) return null;
  const match = /^v1\.(\d{13})\.([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(value);
  if (!match) return null;
  const expiresAt = Number(match[1]);
  if (expiresAt <= Date.now() || expiresAt > Date.now() + POPORAMA_SESSION_SECONDS * 1000) return null;
  try {
    const signature = Uint8Array.from(match[3].match(/../g)!, part => parseInt(part, 16));
    const valid = await crypto.subtle.verify("HMAC", await signingKey(), signature,
      encoder.encode(`v1.${match[1]}.${match[2]}`));
    return valid ? expiresAt : null;
  } catch {
    return null;
  }
}
