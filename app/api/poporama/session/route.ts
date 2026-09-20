import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createPoporamaSession, POPORAMA_COOKIE, POPORAMA_SESSION_SECONDS,
  poporamaCookieOptions, verifyPoporamaSession } from "@/app/lib/poporama-session";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };
// Limite aggregato per istanza: non si fida di IP inoltrati dal client.
// Non distribuito: cold start e istanze serverless diverse hanno contatori distinti.
const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 20;
let windowStart = 0;
let attempts = 0;

function requestOrigin(request: NextRequest) {
  // NextURL normalizza 127.0.0.1 in localhost. Il browser invia invece
  // l'origine effettiva: confrontala con Host, mantenendo protocollo e porta.
  const expected = new URL(request.url);
  expected.host = request.headers.get("host") || expected.host;
  return expected;
}

function foreignOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return request.headers.get("sec-fetch-site") === "cross-site" ||
    (origin !== null && origin !== requestOrigin(request).origin);
}

function clearCookies(response: NextResponse, request: NextRequest) {
  const options = poporamaCookieOptions(requestOrigin(request).hostname);
  response.cookies.set(POPORAMA_COOKIE, "", { ...options, maxAge: 0 });
  response.cookies.set("poporama_cassa_session", "", { ...options, maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  const expiresAt = await verifyPoporamaSession(request.cookies.get(POPORAMA_COOKIE)?.value);
  return NextResponse.json({ ok: Boolean(expiresAt), authenticated: Boolean(expiresAt), expiresAt,
    ...(!expiresAt ? { error: "Sessione scaduta. Accedi nuovamente." } : {}) },
  { status: expiresAt ? 200 : 401, headers: NO_STORE });
}

export async function POST(request: NextRequest) {
  if (foreignOrigin(request)) return NextResponse.json({ ok: false, error: "Origine non consentita." }, { status: 403, headers: NO_STORE });
  const now = Date.now();
  if (now - windowStart >= LOGIN_WINDOW_MS) { windowStart = now; attempts = 0; }
  if (attempts >= LOGIN_MAX_ATTEMPTS) return NextResponse.json({ ok: false,
    error: "Troppi tentativi di accesso. Attendi qualche minuto e riprova." },
  { status: 429, headers: { ...NO_STORE, "Retry-After": String(Math.ceil((windowStart + LOGIN_WINDOW_MS - now) / 1000)) } });
  attempts++;
  const configuredPin = process.env.POPORAMA_ACCESS_PIN;
  if (!configuredPin) return NextResponse.json({ ok: false, error: "Accesso POPORAMA non configurato: contatta il responsabile." }, { status: 503, headers: NO_STORE });
  const body = await request.json().catch(() => null);
  const supplied = typeof body?.pin === "string" && body.pin.length <= 256 ? body.pin : "";
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (!supplied || !timingSafeEqual(digest(supplied), digest(configuredPin))) {
    return clearCookies(NextResponse.json({ ok: false, error: "PIN non corretto." }, { status: 401, headers: NO_STORE }), request);
  }
  try {
    const session = await createPoporamaSession();
    const response = clearCookies(NextResponse.json({ ok: true, authenticated: true, expiresAt: session.expiresAt }, { headers: NO_STORE }), request);
    response.cookies.set(POPORAMA_COOKIE, session.value, {
      ...poporamaCookieOptions(requestOrigin(request).hostname), maxAge: POPORAMA_SESSION_SECONDS, expires: new Date(session.expiresAt),
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Accesso POPORAMA non configurato: contatta il responsabile." }, { status: 503, headers: NO_STORE });
  }
}

export async function DELETE(request: NextRequest) {
  if (foreignOrigin(request)) return NextResponse.json({ ok: false, error: "Origine non consentita." }, { status: 403, headers: NO_STORE });
  // Logout idempotente anche dopo la scadenza, limitato al dispositivo corrente.
  return clearCookies(NextResponse.json({ ok: true, authenticated: false }, { headers: NO_STORE }), request);
}
