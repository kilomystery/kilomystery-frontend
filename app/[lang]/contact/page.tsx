/* eslint-disable react/no-unescaped-entities */
'use client';

import { useCallback, useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Lang, normalizeLang } from '@/i18n/lang';

type CopyKey =
  | 'title'
  | 'subtitle'
  | 'nameLabel'
  | 'namePlaceholder'
  | 'emailLabel'
  | 'emailPlaceholder'
  | 'subjectLabel'
  | 'subjectPlaceholder'
  | 'messageLabel'
  | 'messagePlaceholder'
  | 'buttonIdle'
  | 'buttonLoading'
  | 'mailAlt'
  | 'success'
  | 'errorRequired'
  | 'errorGeneric'
  | 'errorNetwork'
  | 'privacy';

type CopyPerLang = Record<CopyKey, string>;

const CONTACT_COPY: Record<Lang, CopyPerLang> = {
  it: {
    title: 'Contattaci',
    subtitle:
      'Domande su ordini, spedizioni, pop-up o partnership? Scrivici, ti rispondiamo il prima possibile.',

    nameLabel: 'Nome',
    namePlaceholder: 'Mario Rossi',

    emailLabel: 'Email',
    emailPlaceholder: 'mario@email.com',

    subjectLabel: 'Oggetto (opzionale)',
    subjectPlaceholder: 'Ordine, spedizione, partnership…',

    messageLabel: 'Messaggio',
    messagePlaceholder: 'Scrivici qui tutti i dettagli utili.',

    buttonIdle: 'Invia',
    buttonLoading: 'Invio…',

    mailAlt: 'Oppure scrivici direttamente a info@kilomystery.com',

    success: 'Messaggio inviato ✔️',
    errorRequired: 'Compila tutti i campi obbligatori.',
    errorGeneric: 'Invio non riuscito. Riprova tra poco.',
    errorNetwork: 'Connessione assente o server non raggiungibile.',

    privacy:
      'I dati inseriti vengono usati solo per rispondere alla tua richiesta. Niente spam, niente condivisione con terzi.',
  },

  en: {
    title: 'Contact us',
    subtitle:
      'Questions about orders, shipping, pop-ups or partnerships? Write to us and we’ll get back to you as soon as possible.',

    nameLabel: 'Name',
    namePlaceholder: 'John Smith',

    emailLabel: 'Email',
    emailPlaceholder: 'john@email.com',

    subjectLabel: 'Subject (optional)',
    subjectPlaceholder: 'Order, shipping, partnership…',

    messageLabel: 'Message',
    messagePlaceholder: 'Tell us all the useful details here.',

    buttonIdle: 'Send',
    buttonLoading: 'Sending…',

    mailAlt: 'Or write directly to info@kilomystery.com',

    success: 'Message sent ✔️',
    errorRequired: 'Please fill in all required fields.',
    errorGeneric: 'Sending failed. Please try again in a moment.',
    errorNetwork: 'No connection or server unreachable.',

    privacy:
      'The data you provide is used only to answer your request. No spam, no sharing with third parties.',
  },

  es: {
    title: 'Contáctanos',
    subtitle:
      '¿Dudas sobre pedidos, envíos, pop-ups o colaboraciones? Escríbenos y te responderemos lo antes posible.',

    nameLabel: 'Nombre',
    namePlaceholder: 'Juan Pérez',

    emailLabel: 'Email',
    emailPlaceholder: 'juan@email.com',

    subjectLabel: 'Asunto (opcional)',
    subjectPlaceholder: 'Pedido, envío, colaboración…',

    messageLabel: 'Mensaje',
    messagePlaceholder: 'Cuéntanos aquí todos los detalles útiles.',

    buttonIdle: 'Enviar',
    buttonLoading: 'Enviando…',

    mailAlt: 'O escríbenos directamente a info@kilomystery.com',

    success: 'Mensaje enviado ✔️',
    errorRequired: 'Rellena todos los campos obligatorios.',
    errorGeneric: 'No se pudo enviar. Inténtalo de nuevo en unos minutos.',
    errorNetwork: 'Sin conexión o servidor inaccesible.',

    privacy:
      'Los datos que introduces se utilizan solo para responder a tu solicitud. Nada de spam, ni compartirlos con terceros.',
  },

  fr: {
    title: 'Contactez-nous',
    subtitle:
      'Des questions sur les commandes, les livraisons, les pop-ups ou les partenariats ? Écrivez-nous, nous vous répondons dès que possible.',

    nameLabel: 'Nom',
    namePlaceholder: 'Jean Dupont',

    emailLabel: 'Email',
    emailPlaceholder: 'jean@email.com',

    subjectLabel: 'Objet (optionnel)',
    subjectPlaceholder: 'Commande, livraison, partenariat…',

    messageLabel: 'Message',
    messagePlaceholder: 'Indiquez ici tous les détails utiles.',

    buttonIdle: 'Envoyer',
    buttonLoading: 'Envoi…',

    mailAlt: 'Ou écrivez-nous directement à info@kilomystery.com',

    success: 'Message envoyé ✔️',
    errorRequired: 'Veuillez remplir tous les champs obligatoires.',
    errorGeneric: "L’envoi a échoué. Réessayez dans quelques instants.",
    errorNetwork: 'Connexion absente ou serveur inaccessible.',

    privacy:
      'Les données saisies sont utilisées uniquement pour répondre à votre demande. Pas de spam, aucune transmission à des tiers.',
  },

  de: {
    title: 'Kontaktiere uns',
    subtitle:
      'Fragen zu Bestellungen, Versand, Pop-ups oder Partnerschaften? Schreib uns, wir melden uns so schnell wie möglich.',

    nameLabel: 'Name',
    namePlaceholder: 'Max Mustermann',

    emailLabel: 'E-Mail',
    emailPlaceholder: 'max@email.com',

    subjectLabel: 'Betreff (optional)',
    subjectPlaceholder: 'Bestellung, Versand, Partnerschaft…',

    messageLabel: 'Nachricht',
    messagePlaceholder: 'Schreibe uns hier alle wichtigen Details.',

    buttonIdle: 'Senden',
    buttonLoading: 'Wird gesendet…',

    mailAlt: 'Oder schreibe direkt an info@kilomystery.com',

    success: 'Nachricht gesendet ✔️',
    errorRequired: 'Bitte fülle alle Pflichtfelder aus.',
    errorGeneric: 'Senden fehlgeschlagen. Versuche es in Kürze erneut.',
    errorNetwork: 'Keine Verbindung oder Server nicht erreichbar.',

    privacy:
      'Die eingegebenen Daten werden nur verwendet, um auf deine Anfrage zu antworten. Kein Spam, keine Weitergabe an Dritte.',
  },
};

type FormState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok' }
  | { status: 'error'; message: string };

export default function ContactPage({ params }: { params: { lang: string } }) {
  const lang: Lang = normalizeLang(params?.lang);
  const t = CONTACT_COPY[lang] ?? CONTACT_COPY.it;

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
          message: t.errorRequired,
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
            message: t.errorGeneric,
          });
          return;
        }

        form.reset();
        setState({ status: 'ok' });
      } catch {
        setState({
          status: 'error',
          message: t.errorNetwork,
        });
      }
    },
    [state.status, t.errorGeneric, t.errorNetwork, t.errorRequired],
  );

  const disabled = state.status === 'loading';

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-8">
        <header className="space-y-2 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold">{t.title}</h1>
          <p className="text-white/75">{t.subtitle}</p>
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
              {t.nameLabel}
            </label>
            <input
              id="name"
              className="input"
              name="name"
              placeholder={t.namePlaceholder}
              required
              disabled={disabled}
            />
          </div>

          <div>
            <label className="section-kicker mb-1" htmlFor="email">
              {t.emailLabel}
            </label>
            <input
              id="email"
              className="input"
              type="email"
              name="email"
              placeholder={t.emailPlaceholder}
              required
              inputMode="email"
              disabled={disabled}
            />
          </div>

          <div className="md:col-span-2">
            <label className="section-kicker mb-1" htmlFor="subject">
              {t.subjectLabel}
            </label>
            <input
              id="subject"
              className="input"
              name="subject"
              placeholder={t.subjectPlaceholder}
              disabled={disabled}
            />
          </div>

          <div className="md:col-span-2">
            <label className="section-kicker mb-1" htmlFor="message">
              {t.messageLabel}
            </label>
            <textarea
              id="message"
              className="input min-h-36"
              name="message"
              placeholder={t.messagePlaceholder}
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
              {state.status === 'loading' ? t.buttonLoading : t.buttonIdle}
            </button>

            <a
              href="mailto:info@kilomystery.com"
              className="btn btn-ghost text-sm"
            >
              {t.mailAlt}
            </a>

            {state.status === 'ok' && (
              <span className="text-emerald-400 font-semibold">
                {t.success}
              </span>
            )}
            {state.status === 'error' && (
              <span className="text-red-400 font-semibold">
                {state.message}
              </span>
            )}
          </div>

          <p className="md:col-span-2 text-xs text-white/40">{t.privacy}</p>
        </form>
      </main>

      <Footer lang={lang} />
    </>
  );
}
