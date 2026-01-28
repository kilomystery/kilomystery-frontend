/* eslint-disable react/no-unescaped-entities */
'use client';

import { useCallback, useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Lang, normalizeLang } from '@/i18n/lang';

type CopyKey =
  | 'title'
  | 'subtitle'
  | 'responseTime'
  | 'officialChannels'
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
  | 'privacy'
  | 'legalTitle'
  | 'legalIntro'
  | 'legalName'
  | 'legalVat'
  | 'legalAddress'
  | 'legalEmail'
  | 'legalPhone'
  | 'legalHours'
  | 'linksTitle'
  | 'linksReturns'
  | 'linksShipping'
  | 'linksTerms';

type CopyPerLang = Record<CopyKey, string>;

const OFFICIAL_EMAIL = 'sales@kilomystery.com';
const OFFICIAL_PHONE = '+39 353 492 3350';
const OFFICIAL_PHONE_RAW = '+393534923350';

const CONTACT_COPY: Record<Lang, CopyPerLang> = {
  it: {
    title: 'Contattaci',
    subtitle:
      'Domande su ordini, spedizioni, pop-up o partnership? Scrivici: ti rispondiamo il prima possibile.',
    responseTime: 'Tempo medio di risposta: entro 24–48 ore lavorative.',
    officialChannels: 'Canali ufficiali: email e telefono qui sotto.',

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

    mailAlt: `Oppure scrivici direttamente a ${OFFICIAL_EMAIL}`,

    success: 'Messaggio inviato ✔️',
    errorRequired: 'Compila tutti i campi obbligatori.',
    errorGeneric: 'Invio non riuscito. Riprova tra poco.',
    errorNetwork: 'Connessione assente o server non raggiungibile.',

    privacy:
      'I dati inseriti vengono usati solo per rispondere alla tua richiesta. Niente spam, niente condivisione con terzi.',

    legalTitle: 'Dati aziendali',
    legalIntro:
      'Per trasparenza, qui trovi i dati ufficiali del venditore.',
    legalName: 'Ragione sociale: KILO MYSTERY SRLS',
    legalVat: 'Partita IVA: 02794550745',
    legalAddress:
      'Sede legale e operativa: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italia',
    legalEmail: `Email assistenza: ${OFFICIAL_EMAIL}`,
    legalPhone: `Telefono: ${OFFICIAL_PHONE}`,
    legalHours: 'Orari assistenza: Lunedì–Venerdì, 09:00–18:00',

    linksTitle: 'Link utili',
    linksReturns: 'Politica Resi',
    linksShipping: 'Spedizioni',
    linksTerms: 'Termini e condizioni',
  },

  en: {
    title: 'Contact us',
    subtitle:
      'Questions about orders, shipping, pop-ups or partnerships? Write to us and we’ll get back to you as soon as possible.',
    responseTime: 'Average response time: within 24–48 business hours.',
    officialChannels: 'Official channels: email and phone below.',

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

    mailAlt: `Or write directly to ${OFFICIAL_EMAIL}`,

    success: 'Message sent ✔️',
    errorRequired: 'Please fill in all required fields.',
    errorGeneric: 'Sending failed. Please try again in a moment.',
    errorNetwork: 'No connection or server unreachable.',

    privacy:
      'The data you provide is used only to answer your request. No spam, no sharing with third parties.',

    legalTitle: 'Company details',
    legalIntro: 'For transparency, here are the official seller details.',
    legalName: 'Legal name: KILO MYSTERY SRLS',
    legalVat: 'VAT number: 02794550745',
    legalAddress:
      'Registered and operational address: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italy',
    legalEmail: `Support email: ${OFFICIAL_EMAIL}`,
    legalPhone: `Phone: ${OFFICIAL_PHONE}`,
    legalHours: 'Support hours: Monday–Friday, 9:00 AM–6:00 PM',

    linksTitle: 'Useful links',
    linksReturns: 'Return Policy',
    linksShipping: 'Shipping',
    linksTerms: 'Terms & Conditions',
  },

  es: {
    title: 'Contáctanos',
    subtitle:
      '¿Dudas sobre pedidos, envíos, pop-ups o colaboraciones? Escríbenos y te responderemos lo antes posible.',
    responseTime: 'Tiempo medio de respuesta: 24–48 horas laborables.',
    officialChannels: 'Canales oficiales: email y teléfono abajo.',

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

    mailAlt: `O escríbenos directamente a ${OFFICIAL_EMAIL}`,

    success: 'Mensaje enviado ✔️',
    errorRequired: 'Rellena todos los campos obligatorios.',
    errorGeneric: 'No se pudo enviar. Inténtalo de nuevo en unos minutos.',
    errorNetwork: 'Sin conexión o servidor inaccesible.',

    privacy:
      'Los datos que introduces se utilizan solo para responder a tu solicitud. Nada de spam ni compartirlos con terceros.',

    legalTitle: 'Datos de la empresa',
    legalIntro: 'Por transparencia, aquí tienes los datos oficiales del vendedor.',
    legalName: 'Razón social: KILO MYSTERY SRLS',
    legalVat: 'Número de IVA: 02794550745',
    legalAddress:
      'Dirección legal y operativa: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italia',
    legalEmail: `Email de soporte: ${OFFICIAL_EMAIL}`,
    legalPhone: `Teléfono: ${OFFICIAL_PHONE}`,
    legalHours: 'Horario de atención: Lunes–Viernes, 09:00–18:00',

    linksTitle: 'Enlaces útiles',
    linksReturns: 'Política de devoluciones',
    linksShipping: 'Envíos',
    linksTerms: 'Términos y condiciones',
  },

  fr: {
    title: 'Contactez-nous',
    subtitle:
      'Des questions sur les commandes, les livraisons, les pop-ups ou les partenariats ? Écrivez-nous, nous répondrons dès que possible.',
    responseTime: 'Temps de réponse moyen : sous 24–48 h ouvrées.',
    officialChannels: 'Canaux officiels : email et téléphone ci-dessous.',

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

    mailAlt: `Ou écrivez-nous directement à ${OFFICIAL_EMAIL}`,

    success: 'Message envoyé ✔️',
    errorRequired: 'Veuillez remplir tous les champs obligatoires.',
    errorGeneric: "L’envoi a échoué. Réessayez dans quelques instants.",
    errorNetwork: 'Connexion absente ou serveur inaccessible.',

    privacy:
      'Les données saisies sont utilisées uniquement pour répondre à votre demande. Pas de spam, aucune transmission à des tiers.',

    legalTitle: 'Informations légales',
    legalIntro: 'Pour transparence, voici les informations officielles du vendeur.',
    legalName: 'Raison sociale : KILO MYSTERY SRLS',
    legalVat: 'Numéro de TVA : 02794550745',
    legalAddress:
      'Adresse légale et opérationnelle : P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italie',
    legalEmail: `Email du support : ${OFFICIAL_EMAIL}`,
    legalPhone: `Téléphone : ${OFFICIAL_PHONE}`,
    legalHours: 'Horaires : Lundi–Vendredi, 09h00–18h00',

    linksTitle: 'Liens utiles',
    linksReturns: 'Politique de retours',
    linksShipping: 'Livraisons',
    linksTerms: 'Termes et Conditions',
  },

  de: {
    title: 'Kontaktiere uns',
    subtitle:
      'Fragen zu Bestellungen, Versand, Pop-ups oder Partnerschaften? Schreib uns – wir melden uns so schnell wie möglich.',
    responseTime: 'Durchschnittliche Antwortzeit: innerhalb von 24–48 Werktagen.',
    officialChannels: 'Offizielle Kanäle: E-Mail und Telefon unten.',

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

    mailAlt: `Oder schreibe direkt an ${OFFICIAL_EMAIL}`,

    success: 'Nachricht gesendet ✔️',
    errorRequired: 'Bitte fülle alle Pflichtfelder aus.',
    errorGeneric: 'Senden fehlgeschlagen. Versuche es in Kürze erneut.',
    errorNetwork: 'Keine Verbindung oder Server nicht erreichbar.',

    privacy:
      'Die eingegebenen Daten werden nur verwendet, um auf deine Anfrage zu antworten. Kein Spam, keine Weitergabe an Dritte.',

    legalTitle: 'Unternehmensdaten',
    legalIntro: 'Zur Transparenz findest du hier die offiziellen Verkäuferdaten.',
    legalName: 'Firmenname: KILO MYSTERY SRLS',
    legalVat: 'USt-IdNr.: 02794550745',
    legalAddress:
      'Rechts- und Geschäftsadresse: P.zza Alessandro Romano 11, 72023 Mesagne (BR), Italien',
    legalEmail: `Support-E-Mail: ${OFFICIAL_EMAIL}`,
    legalPhone: `Telefon: ${OFFICIAL_PHONE}`,
    legalHours: 'Supportzeiten: Montag–Freitag, 09:00–18:00',

    linksTitle: 'Nützliche Links',
    linksReturns: 'Rückgaberichtlinie',
    linksShipping: 'Versand',
    linksTerms: 'AGB',
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
        setState({ status: 'error', message: t.errorRequired });
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
          setState({ status: 'error', message: t.errorGeneric });
          return;
        }

        form.reset();
        setState({ status: 'ok' });
      } catch {
        setState({ status: 'error', message: t.errorNetwork });
      }
    },
    [state.status, t.errorGeneric, t.errorNetwork, t.errorRequired]
  );

  const disabled = state.status === 'loading';

  const returnsHref = `/${lang}/returns`;
  const shippingHref = `/${lang}/shipping`;
  const termsHref = `/${lang}/terms`;

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-8">
        <header className="space-y-2 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold">{t.title}</h1>
          <p className="text-white/75">{t.subtitle}</p>
          <p className="text-white/60 text-sm">{t.responseTime}</p>
          <p className="text-white/60 text-sm">{t.officialChannels}</p>
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
              className={`btn btn-brand px-6 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={disabled}
              aria-busy={disabled}
            >
              {state.status === 'loading' ? t.buttonLoading : t.buttonIdle}
            </button>

            <a
              href={`mailto:${OFFICIAL_EMAIL}`}
              className="btn btn-ghost text-sm"
            >
              {t.mailAlt}
            </a>

            <a
              href={`tel:${OFFICIAL_PHONE_RAW}`}
              className="btn btn-ghost text-sm"
            >
              {OFFICIAL_PHONE}
            </a>

            <span
              aria-live="polite"
              className={
                state.status === 'ok'
                  ? 'text-emerald-400 font-semibold'
                  : state.status === 'error'
                  ? 'text-red-400 font-semibold'
                  : 'sr-only'
              }
            >
              {state.status === 'ok'
                ? t.success
                : state.status === 'error'
                ? state.message
                : ''}
            </span>
          </div>

          <p className="md:col-span-2 text-xs text-white/40">{t.privacy}</p>
        </form>

        {/* LINKS UTILI */}
        <section className="card space-y-3">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <span>{t.linksTitle}</span>
            <span>🔗</span>
          </h2>
          <ul className="bullets space-y-1 text-sm text-white/70">
            <li>
              <a href={returnsHref} className="btn-link">{t.linksReturns}</a>
            </li>
            <li>
              <a href={shippingHref} className="btn-link">{t.linksShipping}</a>
            </li>
            <li>
              <a href={termsHref} className="btn-link">{t.linksTerms}</a>
            </li>
          </ul>
        </section>

        {/* DATI AZIENDALI */}
        <section className="card space-y-2">
          <h2 className="text-xl font-extrabold">{t.legalTitle}</h2>
          <p className="text-white/70 text-sm">{t.legalIntro}</p>
          <ul className="text-sm space-y-1 text-white/70">
            <li>{t.legalName}</li>
            <li>{t.legalVat}</li>
            <li>{t.legalAddress}</li>
            <li>{t.legalEmail}</li>
            <li>{t.legalPhone}</li>
            <li>{t.legalHours}</li>
          </ul>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
