"use client";

import { useState } from "react";

type Lang = "it" | "en" | "es" | "fr" | "de";

const COPY = {
  it: {
    name: "Il tuo nome",
    email: "Email",
    subject: "Oggetto (opzionale)",
    message: "Messaggio",
    placeholderName: "Mario Rossi",
    placeholderEmail: "mario@email.com",
    placeholderSubject: "Ordine, spedizione, partnership...",
    placeholderMessage: "Scrivici qui...",
    btnSend: "Invia",
    btnSending: "Invio…",
    btnEmail: "Scrivi via email",
    errRequired: "Compila tutti i campi obbligatori.",
    errGeneric:
      "Si è verificato un errore. Puoi riprovare o scriverci via email.",
    ok: "Messaggio inviato, ti risponderemo il prima possibile.",
    privacy:
      "Usiamo i tuoi dati solo per rispondere al messaggio. Niente spam, nessuna condivisione con terzi.",
  },
  en: {
    name: "Your name",
    email: "Email",
    subject: "Subject (optional)",
    message: "Message",
    placeholderName: "John Doe",
    placeholderEmail: "john@email.com",
    placeholderSubject: "Order, shipping, partnership...",
    placeholderMessage: "Write your message here...",
    btnSend: "Send",
    btnSending: "Sending…",
    btnEmail: "Write via email",
    errRequired: "Please fill in all required fields.",
    errGeneric: "An error occurred. Try again or write us via email.",
    ok: "Message sent! We’ll reply as soon as possible.",
    privacy:
      "We use your data only to reply to your message. No spam, no sharing with third parties.",
  },
  es: {
    name: "Tu nombre",
    email: "Correo electrónico",
    subject: "Asunto (opcional)",
    message: "Mensaje",
    placeholderName: "Juan Pérez",
    placeholderEmail: "juan@email.com",
    placeholderSubject: "Pedido, envío, colaboración...",
    placeholderMessage: "Escríbenos aquí...",
    btnSend: "Enviar",
    btnSending: "Enviando…",
    btnEmail: "Escribir por correo",
    errRequired: "Completa todos los campos obligatorios.",
    errGeneric:
      "Ha ocurrido un error. Inténtalo de nuevo o escríbenos por correo.",
    ok: "Mensaje enviado. Te responderemos lo antes posible.",
    privacy:
      "Usamos tus datos solo para responder al mensaje. Nada de spam ni compartir con terceros.",
  },
  fr: {
    name: "Votre nom",
    email: "Email",
    subject: "Objet (optionnel)",
    message: "Message",
    placeholderName: "Jean Dupont",
    placeholderEmail: "jean@email.com",
    placeholderSubject: "Commande, livraison, partenariat...",
    placeholderMessage: "Écrivez votre message ici...",
    btnSend: "Envoyer",
    btnSending: "Envoi…",
    btnEmail: "Écrire par e-mail",
    errRequired: "Veuillez remplir tous les champs obligatoires.",
    errGeneric:
      "Une erreur s’est produite. Réessayez ou écrivez-nous par e-mail.",
    ok: "Message envoyé. Nous vous répondrons dès que possible.",
    privacy:
      "Nous utilisons vos données uniquement pour répondre au message. Pas de spam, aucune transmission à des tiers.",
  },
  de: {
    name: "Dein Name",
    email: "E-Mail",
    subject: "Betreff (optional)",
    message: "Nachricht",
    placeholderName: "Max Mustermann",
    placeholderEmail: "max@email.com",
    placeholderSubject: "Bestellung, Versand, Partnerschaft...",
    placeholderMessage: "Schreibe hier deine Nachricht...",
    btnSend: "Senden",
    btnSending: "Senden…",
    btnEmail: "Per E-Mail schreiben",
    errRequired: "Bitte fülle alle Pflichtfelder aus.",
    errGeneric:
      "Es ist ein Fehler aufgetreten. Versuche es erneut oder schreibe uns per E-Mail.",
    ok: "Nachricht gesendet! Wir melden uns so schnell wie möglich.",
    privacy:
      "Wir verwenden deine Daten nur, um auf die Nachricht zu antworten. Kein Spam, keine Weitergabe an Dritte.",
  },
} as const;

export default function ContactForm({ lang }: { lang: Lang }) {
  const t = COPY[lang] ?? COPY.it;

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      subject: String(fd.get("subject") || "").trim(),
      message: String(fd.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setError(t.errRequired);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setOk(t.ok);
      form.reset();
    } catch (err) {
      console.error("Contact form error", err);
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form space-y-4" onSubmit={onSubmit}>
      {/* NOME + EMAIL */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="section-kicker" htmlFor="name">
            {t.name}
          </label>
          <input
            id="name"
            name="name"
            className="input"
            placeholder={t.placeholderName}
            required
          />
        </div>

        <div>
          <label className="section-kicker" htmlFor="email">
            {t.email}
          </label>
          <input
            id="email"
            type="email"
            name="email"
            className="input"
            placeholder={t.placeholderEmail}
            required
          />
        </div>
      </div>

      {/* OGGETTO */}
      <div>
        <label className="section-kicker" htmlFor="subject">
          {t.subject}
        </label>
        <input
          id="subject"
          name="subject"
          className="input"
          placeholder={t.placeholderSubject}
        />
      </div>

      {/* MESSAGGIO */}
      <div>
        <label className="section-kicker" htmlFor="msg">
          {t.message}
        </label>
        <textarea
          id="msg"
          name="message"
          className="textarea"
          placeholder={t.placeholderMessage}
          required
        />
      </div>

      {/* MESSAGGI */}
      {ok && <p className="text-sm text-emerald-300">{ok}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* BOTTONI */}
      <div className="flex gap-2 items-center">
        <button
          type="submit"
          className="btn btn-brand btn-lg"
          disabled={loading}
        >
          {loading ? t.btnSending : t.btnSend}
        </button>
        <a href="mailto:info@kilomystery.com" className="btn btn-ghost">
          {t.btnEmail}
        </a>
      </div>

      {/* PRIVACY */}
      <p className="text-xs text-white/40 mt-2">{t.privacy}</p>
    </form>
  );
}
