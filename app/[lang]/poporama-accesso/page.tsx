"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";

export default function PoporamaAccessoPage() {
  const { lang } = useParams<{ lang: string }>();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function login(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/poporama/session", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin }),
      });
      setPin("");
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Accesso non riuscito.");
      // Navigazione completa: niente dati privati nella cache del router precedente.
      window.location.replace(`/${lang}/poporama-test`);
    } catch (err) {
      setPin("");
      setError(err instanceof Error ? err.message : "Accesso non riuscito. Riprova.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
    <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <p className="text-sm font-black tracking-[0.3em] text-yellow-400">POPORAMA</p>
      <h1 className="mt-4 text-2xl font-black">ACCESSO AREA RISERVATA</h1>
      <p className="mt-3 text-sm text-zinc-400">Inserisci il PIN per iniziare o riprendere il turno.</p>
      <form onSubmit={login} className="mt-7">
        <label htmlFor="poporama-pin" className="text-sm font-black">PIN</label>
        <input id="poporama-pin" type="password" required maxLength={256} autoComplete="current-password"
          autoFocus value={pin} disabled={busy} onChange={event => setPin(event.target.value)}
          className="mt-2 w-full rounded-xl border border-zinc-700 bg-black px-4 py-4 text-xl text-white outline-none focus:border-yellow-400" />
        {error ? <p role="alert" className="mt-4 text-sm text-red-300">{error}</p> : null}
        <button disabled={busy} className="mt-6 w-full rounded-xl bg-yellow-400 px-5 py-4 font-black text-black disabled:opacity-50">
          {busy ? "ACCESSO..." : "ACCEDI"}
        </button>
      </form>
    </section>
  </main>;
}
