import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { POPORAMA_COOKIE, verifyPoporamaSession } from "./poporama-session";

// Ogni handler controlla la sessione prima di leggere body, credenziali o Shopify.
// Non dipende dall'esecuzione del middleware.
export async function requirePoporamaSession() {
  if (!await verifyPoporamaSession(cookies().get(POPORAMA_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, authenticated: false,
      error: "Sessione POPORAMA scaduta o assente. Accedi nuovamente." },
    { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (headers().get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ ok: false, error: "Richiesta da un sito esterno non consentita." }, { status: 403 });
  }
  return null;
}
