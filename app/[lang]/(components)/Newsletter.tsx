// components/Newsletter.tsx
'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) throw new Error('fail');
      setState('ok');
      setEmail('');
    } catch {
      setState('err');
    }
  }

  return (
    <div className="card max-w-md">
      {/* LOGO NEWSLETTER */}
      <div className="flex justify-center mb-3">
        <img
          src="/hero/hero.svg"
          alt="KiloMystery"
          className="w-32 h-auto drop-shadow-[0_0_20px_rgba(124,58,237,0.3)]"
        />
      </div>

      <h3 className="text-lg font-bold mb-2">Iscriviti alla newsletter</h3>
      <p className="text-sm text-white/70 mb-3">
        Offerte, drop e consigli per massimizzare il valore dei lotti.
      </p>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="flex-1 bg-[#0f1216] border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-white/30"
          type="email"
          placeholder="la-tua@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* QUI USIAMO SIA .btn CHE .btn-brand */}
        <button className="btn btn-brand" type="submit">
          Iscriviti
        </button>
      </form>

      {state === 'ok' && (
        <p className="text-emerald-400 text-sm mt-2">
          Iscrizione completata ✔️
        </p>
      )}
      {state === 'err' && (
        <p className="text-rose-400 text-sm mt-2">Errore, riprova.</p>
      )}
    </div>
  );
}
