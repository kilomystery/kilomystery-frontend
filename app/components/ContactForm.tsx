'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      subject: String(formData.get('subject') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setError('Compila tutti i campi obbligatori.');
      setLoading(false);
      return;
    }

    try {
      // chiamata all'API interna (da implementare in /api/contact)
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setOk('Messaggio inviato, ti risponderemo il prima possibile.');
      form.reset();
    } catch (err) {
      console.error('Contact form error', err);
      setError('Si è verificato un errore. Puoi riprovare o scriverci via email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form space-y-4" onSubmit={onSubmit}>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="section-kicker" htmlFor="name">
            Il tuo nome
          </label>
          <input
            id="name"
            name="name"
            className="input"
            placeholder="Mario Rossi"
            required
          />
        </div>

        <div>
          <label className="section-kicker" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            className="input"
            placeholder="mario@email.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="section-kicker" htmlFor="subject">
          Oggetto (opzionale)
        </label>
        <input
          id="subject"
          name="subject"
          className="input"
          placeholder="Ordine, spedizione, partnership..."
        />
      </div>

      <div>
        <label className="section-kicker" htmlFor="msg">
          Messaggio
        </label>
        <textarea
          id="msg"
          name="message"
          className="textarea"
          placeholder="Scrivici qui..."
          required
        />
      </div>

      {/* messaggi stato */}
      {ok && <p className="text-sm text-emerald-300">{ok}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
        <button
          type="submit"
          className="btn btn-brand btn-lg"
          disabled={loading}
        >
          {loading ? 'Invio…' : 'Invia'}
        </button>
        <a
          href="mailto:info@kilomystery.com"
          className="btn btn-ghost"
        >
          Scrivi via email
        </a>
      </div>

      <p className="text-xs text-white/40 mt-2">
        Usiamo i tuoi dati solo per rispondere al messaggio. Niente spam, niente condivisione con terzi.
      </p>
    </form>
  );
}
