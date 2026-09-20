"use client";

import { useEffect, useState, type ReactNode } from "react";

// Gestione 401 comune alle pagine esistenti, incluse importazioni e scanner.
// Il wrapper è attivo solo nell'area POPORAMA e solo per le sue API same-origin.
export default function PoporamaSessionBoundary({ lang, expiresAt, children }: {
  lang: string; expiresAt: number; children: ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const originalFetch = window.fetch;
    let active = true;
    let redirecting = false;
    function login() {
      if (!active || redirecting) return;
      redirecting = true;
      setExpired(true);
      window.location.replace(`/${lang}/poporama-accesso`);
    }
    const sessionFetch: typeof fetch = async (input, init) => {
      const response = await originalFetch.call(window, input, init);
      const url = new URL(input instanceof Request ? input.url : String(input), window.location.href);
      if (url.origin === window.location.origin && url.pathname.startsWith("/api/poporama/") && response.status === 401) login();
      // Lascia leggere la risposta: gli handler vendite distinguono il 401 da un esito incerto.
      return response;
    };
    window.fetch = sessionFetch;
    const timeout = window.setTimeout(login, Math.max(0, expiresAt - Date.now()));
    async function check() {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await sessionFetch("/api/poporama/session", { cache: "no-store" });
        if (response.ok && active) setReady(true);
      } catch { /* Rete assente: la scadenza locale resta attiva. */ }
    }
    // Il wrapper viene installato prima di montare figli con fetch nei loro effect.
    setReady(true);
    window.addEventListener("pageshow", check);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      active = false;
      if (window.fetch === sessionFetch) window.fetch = originalFetch;
      window.clearTimeout(timeout);
      window.removeEventListener("pageshow", check);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [lang, expiresAt]);

  if (!ready || expired) return <main className="min-h-screen bg-black p-8 font-bold text-yellow-400" role="status">
    {expired ? "Sessione scaduta. Ritorno all’accesso POPORAMA..." : "Apertura POPORAMA..."}
  </main>;
  return children;
}
