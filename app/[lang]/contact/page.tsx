// app/[lang]/contact/page.tsx
'use client';

import { useCallback, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

type FormState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok' }
  | { status: 'error'; message: string };

export default function ContactPage({ params }: { params: { lang: string } }) {
  const { lang } = params;
  const [state, setState] = useState<FormState>({ status: 'idle' });

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (state.status === 'loading') return;

      const form = e.currentTarget;

      // Honeypot antispam (campo nascosto: se pieno, abort)
      const honey = (
        form.querySelector('input[name="hp"]') as HTMLInputElement | null
      )?.value;
      if (honey) return;

      const fd = new FormData(form);
      const payload: Record<string, string> = {};
      fd.forEach((v, k) => (payload[k] = String(v)));

      if (!payload.name || !payload.email || !payload.message) {
        setState({
          status: 'error',
          message: 'Compila tutti i campi obbligatori.',
        });
        return;
      }

      setState({ status: 'loading' });

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          setState({
            status: 'error',
            message: 'Invio non riuscito. Riprova tra poco.',
          });
          return;
        }

        form.reset();
        setState({ status: 'ok' });
      } catch {
        setState({
          status: 'error',
          message: 'Connessione assente o server non raggiungibile.',
        });
      }
    },
    [state.status],
  );

  const disabled = state.status === 'loading';

  return (
    <>
      <Header lang={lang as any} />

      <main className="container py-10 space-y-8">
        <header className="space-y-2 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold">Contattaci</h1>
          <p className="text-white/75">
            Domande su ordini, spedizioni, pop-up o partnership? Scrivici, ti
            rispondiamo il prima possibile.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="card grid gap-4 md:grid-cols-2"
          noValidate
        >
          {/* Honeypot antispam (nascosto agli utenti) */}
          <input
            name="hp"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div>
            <label className="section-kicker mb-1" htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              className="input"
              name="name"
              placeholder="Mario Rossi"
              required
              disabled={disabled}
            />
          </div>

          <div>
            <label className="section-kicker mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              name="email"
              placeholder="mario@email.com"
              required
              inputMode="email"
              disabled={disabled}
            />
          </div>

          <div className="md:col-span-2">
            <label className="section-kicker mb-1" htmlFor="subject">
              Oggetto (opzionale)
            </label>
            <input
              id="subject"
              className="input"
              name="subject"
              placeholder="Ordine, spedizione, partnership…"
              disabled={disabled}
            />
          </div>

          <div className="md:col-span-2">
            <label className="section-kicker mb-1" htmlFor="message">
              Messaggio
            </label>
            <textarea
              id="message"
              className="input min-h-36"
              name="message"
              placeholder="Scrivici qui tutti i dettagli utili."
              required
              disabled={disabled}
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className={`btn btn-brand px-6 ${
                disabled ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={disabled}
              aria-busy={disabled}
            >
              {state.status === 'loading' ? 'Invio…' : 'Invia'}
            </button>

            <a
              href="mailto:info@kilomystery.com"
              className="btn btn-ghost text-sm"
            >
              Oppure scrivici direttamente a info@kilomystery.com
            </a>

            {state.status === 'ok' && (
              <span className="text-emerald-400 font-semibold">
                Messaggio inviato ✔️
              </span>
            )}
            {state.status === 'error' && (
              <span className="text-red-400 font-semibold">
                {state.message}
              </span>
            )}
          </div>

          <p className="md:col-span-2 text-xs text-white/40">
            I dati inseriti vengono usati solo per rispondere alla tua richiesta.
            Niente spam, niente condivisione con terzi.
          </p>
        </form>
      </main>

      <Footer lang={lang as any} />
    </>
  );
}
