/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

export const metadata = {
  title: "Privacy",
};

type Copy = {
  heroTitle: string;
  heroNote: string;
  lastUpdateLabel: string;
  intro: string;
  whoTitle: string;
  whoBody: string;
  categoriesTitle: string;
  categoriesItems: string[];
  purposesTitle: string;
  purposesItems: string[];
  retentionTitle: string;
  retentionText: string;
  rightsTitle: string;
  rightsIntro: string;
  rightsItems: string[];
  rightsOutro: string;
  cookiesTitle: string;
  cookiesP1: string;
  cookiesP2: string;
};

const PRIVACY_COPY: Record<Lang, Copy> = {
  it: {
    heroTitle: "Privacy Policy",
    heroNote:
      "Qui trovi in modo semplice come gestiamo i tuoi dati quando usi KiloMystery, acquisti una box o ci contatti. 🔒",
    lastUpdateLabel: "Ultimo aggiornamento",
    intro: "",
    whoTitle: "Chi tratta i dati",
    whoBody:
      "Il Titolare del trattamento è KiloMystery. Per qualsiasi richiesta sulla privacy puoi scriverci dalla pagina Contatti.",
    categoriesTitle: "Categorie di dati",
    categoriesItems: [
      "Dati identificativi (nome, email, indirizzo, telefono).",
      "Dati di acquisto (prodotti, importi, indirizzi di spedizione).",
      "Dati tecnici (IP, device, log di navigazione, cookie / analytics in forma aggregata o anonimizzata, dove possibile).",
    ],
    purposesTitle: "Finalità & basi giuridiche",
    purposesItems: [
      "Evasione ordini e assistenza clienti — esecuzione del contratto.",
      "Adempimenti fiscali / contabili — obbligo di legge.",
      "Newsletter e comunicazioni promozionali — consenso (sempre revocabile).",
      "Analytics e miglioramento del servizio — legittimo interesse e/o consenso, a seconda dello strumento usato.",
    ],
    retentionTitle: "Tempi di conservazione",
    retentionText:
      "Conserviamo i dati solo per il tempo necessario a raggiungere le finalità indicate e per rispettare gli obblighi di legge (es. fiscali e contabili).",
    rightsTitle: "Diritti dell'utente",
    rightsIntro: "Puoi chiederci in qualsiasi momento di:",
    rightsItems: [
      "accedere ai dati che ti riguardano;",
      "rettificare o aggiornare i dati;",
      "chiedere la cancellazione, quando possibile;",
      "limitare il trattamento o opporti a determinati utilizzi;",
      "richiedere la portabilità dei dati;",
      "revocare il consenso dato in precedenza.",
    ],
    rightsOutro:
      "Per esercitare questi diritti puoi contattarci dalla pagina Contatti.",
    cookiesTitle: "Cookie & tracking",
    cookiesP1:
      "Utilizziamo cookie tecnici per far funzionare il sito e, solo se acconsenti, cookie di analytics e marketing per capire come viene usata la piattaforma e migliorare l'esperienza.",
    cookiesP2:
      "Puoi gestire le preferenze dal banner cookie iniziale o dalle impostazioni del browser. Alcune funzionalità potrebbero limitarsi se disattivi totalmente i cookie.",
  },
  en: {
    heroTitle: "Privacy Policy",
    heroNote:
      "Here you can quickly see how we handle your data when you use KiloMystery, purchase a box or get in touch with us. 🔒",
    lastUpdateLabel: "Last update",
    intro: "",
    whoTitle: "Who processes your data",
    whoBody:
      "The data controller is KiloMystery. For any privacy-related request you can write to us via the Contact page.",
    categoriesTitle: "Categories of data",
    categoriesItems: [
      "Identification data (name, email, address, phone number).",
      "Purchase data (products, amounts, shipping addresses).",
      "Technical data (IP, device, navigation logs, cookies / analytics in aggregated or anonymised form where possible).",
    ],
    purposesTitle: "Purposes & legal basis",
    purposesItems: [
      "Order fulfilment and customer support — performance of a contract.",
      "Tax / accounting obligations — legal obligation.",
      "Newsletter and promotional communications — consent (can always be withdrawn).",
      "Analytics and service improvement — legitimate interest and/or consent, depending on the tool used.",
    ],
    retentionTitle: "Retention periods",
    retentionText:
      "We keep data only for as long as necessary to achieve the purposes described and to comply with legal obligations (e.g. tax and accounting).",
    rightsTitle: "Your rights",
    rightsIntro: "You can ask us at any time to:",
    rightsItems: [
      "access your personal data;",
      "rectify or update your data;",
      "request deletion where possible;",
      "restrict processing or object to certain uses;",
      "request data portability;",
      "withdraw any consent previously given.",
    ],
    rightsOutro:
      "To exercise these rights, you can contact us via the Contact page.",
    cookiesTitle: "Cookies & tracking",
    cookiesP1:
      "We use technical cookies to make the site work and, only if you agree, analytics and marketing cookies to understand how the platform is used and improve the experience.",
    cookiesP2:
      "You can manage your preferences from the initial cookie banner or from your browser settings. Some features may be limited if you disable cookies completely.",
  },
  es: {
    heroTitle: "Política de privacidad",
    heroNote:
      "Aquí te explicamos de forma sencilla cómo gestionamos tus datos cuando usas KiloMystery, compras una caja o nos contactas. 🔒",
    lastUpdateLabel: "Última actualización",
    intro: "",
    whoTitle: "Quién trata los datos",
    whoBody:
      "El responsable del tratamiento es KiloMystery. Para cualquier solicitud relacionada con la privacidad puedes escribirnos desde la página de Contacto.",
    categoriesTitle: "Categorías de datos",
    categoriesItems: [
      "Datos identificativos (nombre, email, dirección, teléfono).",
      "Datos de compra (productos, importes, direcciones de envío).",
      "Datos técnicos (IP, dispositivo, logs de navegación, cookies / analytics de forma agregada o anonimizada, cuando sea posible).",
    ],
    purposesTitle: "Finalidad y bases legales",
    purposesItems: [
      "Gestión de pedidos y atención al cliente — ejecución del contrato.",
      "Obligaciones fiscales / contables — obligación legal.",
      "Newsletter y comunicaciones comerciales — consentimiento (siempre revocable).",
      "Analytics y mejora del servicio — interés legítimo y/o consentimiento, según la herramienta utilizada.",
    ],
    retentionTitle: "Plazos de conservación",
    retentionText:
      "Conservamos los datos solo durante el tiempo necesario para cumplir las finalidades indicadas y las obligaciones legales (por ejemplo, fiscales y contables).",
    rightsTitle: "Derechos del usuario",
    rightsIntro: "Puedes solicitarnos en cualquier momento:",
    rightsItems: [
      "acceder a los datos que tenemos sobre ti;",
      "rectificar o actualizar tus datos;",
      "solicitar la supresión de datos, cuando sea posible;",
      "limitar el tratamiento u oponerte a determinados usos;",
      "solicitar la portabilidad de tus datos;",
      "revocar el consentimiento otorgado anteriormente.",
    ],
    rightsOutro:
      "Para ejercer estos derechos puedes contactarnos desde la página de Contacto.",
    cookiesTitle: "Cookies y tracking",
    cookiesP1:
      "Utilizamos cookies técnicas para que el sitio funcione y, solo si das tu consentimiento, cookies de analytics y marketing para entender cómo se utiliza la plataforma y mejorar la experiencia.",
    cookiesP2:
      "Puedes gestionar tus preferencias desde el banner inicial de cookies o desde la configuración del navegador. Algunas funciones pueden verse limitadas si desactivas completamente las cookies.",
  },
  fr: {
    heroTitle: "Politique de confidentialité",
    heroNote:
      "Tu trouveras ici, de façon claire, comment nous gérons tes données lorsque tu utilises KiloMystery, achètes une box ou nous contactes. 🔒",
    lastUpdateLabel: "Dernière mise à jour",
    intro: "",
    whoTitle: "Qui traite les données",
    whoBody:
      "Le responsable du traitement est KiloMystery. Pour toute demande liée à la confidentialité, tu peux nous écrire via la page Contact.",
    categoriesTitle: "Catégories de données",
    categoriesItems: [
      "Données d’identification (nom, email, adresse, téléphone).",
      "Données d’achat (produits, montants, adresses de livraison).",
      "Données techniques (IP, appareil, logs de navigation, cookies / analytics sous forme agrégée ou anonymisée lorsque c’est possible).",
    ],
    purposesTitle: "Finalités et bases légales",
    purposesItems: [
      "Traitement des commandes et support client — exécution du contrat.",
      "Obligations fiscales / comptables — obligation légale.",
      "Newsletter et communications promotionnelles — consentement (révocable à tout moment).",
      "Analytics et amélioration du service — intérêt légitime et/ou consentement, selon l’outil utilisé.",
    ],
    retentionTitle: "Durées de conservation",
    retentionText:
      "Nous conservons les données uniquement pendant la durée nécessaire à la réalisation des finalités indiquées et au respect des obligations légales (par exemple fiscales et comptables).",
    rightsTitle: "Droits de l’utilisateur",
    rightsIntro: "Tu peux nous demander à tout moment de :",
    rightsItems: [
      "accéder aux données qui te concernent ;",
      "rectifier ou mettre à jour tes données ;",
      "demander l’effacement de tes données, lorsque c’est possible ;",
      "limiter le traitement ou t’opposer à certains usages ;",
      "demander la portabilité de tes données ;",
      "retirer ton consentement donné auparavant.",
    ],
    rightsOutro:
      "Pour exercer ces droits, tu peux nous contacter via la page Contact.",
    cookiesTitle: "Cookies & tracking",
    cookiesP1:
      "Nous utilisons des cookies techniques pour faire fonctionner le site et, uniquement avec ton accord, des cookies d’analytics et de marketing pour comprendre comment la plateforme est utilisée et améliorer l’expérience.",
    cookiesP2:
      "Tu peux gérer tes préférences depuis le bandeau cookies initial ou depuis les paramètres de ton navigateur. Certaines fonctionnalités peuvent être limitées si tu désactives totalement les cookies.",
  },
  de: {
    heroTitle: "Datenschutzerklärung",
    heroNote:
      "Hier erfährst du in Kurzform, wie wir deine Daten verarbeiten, wenn du KiloMystery nutzt, eine Box bestellst oder uns kontaktierst. 🔒",
    lastUpdateLabel: "Letzte Aktualisierung",
    intro: "",
    whoTitle: "Wer deine Daten verarbeitet",
    whoBody:
      "Verantwortlicher für die Datenverarbeitung ist KiloMystery. Für alle Fragen zum Datenschutz kannst du uns über die Kontakt-Seite schreiben.",
    categoriesTitle: "Datenkategorien",
    categoriesItems: [
      "Identifikationsdaten (Name, E-Mail, Adresse, Telefonnummer).",
      "Bestelldaten (Produkte, Beträge, Lieferadressen).",
      "Technische Daten (IP, Gerät, Nutzungs-Logs, Cookies / Analytics in aggregierter oder anonymisierter Form, soweit möglich).",
    ],
    purposesTitle: "Zwecke & Rechtsgrundlagen",
    purposesItems: [
      "Abwicklung von Bestellungen und Kundensupport — Vertragserfüllung.",
      "Steuerliche / buchhalterische Pflichten — gesetzliche Verpflichtung.",
      "Newsletter und Werbe-Kommunikation — Einwilligung (jederzeit widerrufbar).",
      "Analytics und Verbesserung des Services — berechtigtes Interesse und/oder Einwilligung, je nach eingesetztem Tool.",
    ],
    retentionTitle: "Speicherdauer",
    retentionText:
      "Wir speichern Daten nur so lange, wie es zur Erreichung der genannten Zwecke und zur Erfüllung gesetzlicher Pflichten (z.B. steuerliche oder buchhalterische Vorgaben) erforderlich ist.",
    rightsTitle: "Rechte der Nutzer:innen",
    rightsIntro: "Du kannst uns jederzeit bitten, Folgendes zu tun:",
    rightsItems: [
      "Auskunft über die von uns gespeicherten Daten zu geben;",
      "Daten zu berichtigen oder zu aktualisieren;",
      "die Löschung von Daten zu veranlassen, soweit möglich;",
      "die Verarbeitung einzuschränken oder bestimmten Nutzungen zu widersprechen;",
      "die Übertragbarkeit deiner Daten zu ermöglichen;",
      "eine erteilte Einwilligung zu widerrufen.",
    ],
    rightsOutro:
      "Um deine Rechte auszuüben, kannst du uns über die Kontakt-Seite anschreiben.",
    cookiesTitle: "Cookies & Tracking",
    cookiesP1:
      "Wir verwenden technische Cookies, damit die Website funktioniert, und – nur mit deiner Einwilligung – Analytics- und Marketing-Cookies, um die Nutzung der Plattform zu verstehen und die Erfahrung zu verbessern.",
    cookiesP2:
      "Du kannst deine Präferenzen im Cookie-Banner oder in den Browser-Einstellungen anpassen. Einige Funktionen können eingeschränkt sein, wenn du Cookies vollständig deaktivierst.",
  },
};

const DATE_LOCALE: Record<Lang, string> = {
  it: "it-IT",
  en: "en-GB",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
};

export default function PrivacyPage({
  params,
}: {
  params: { lang: string };
}) {
  const lang: Lang = normalizeLang(params?.lang);
  const t = PRIVACY_COPY[lang] ?? PRIVACY_COPY.it;
  const today = new Date().toLocaleDateString(DATE_LOCALE[lang]);

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-10">
        {/* HERO */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
          <div className="mx-auto mb-6 grid place-items-center">
            <Image
              src="/hero/hero.svg"
              alt="KiloMystery"
              width={320}
              height={320}
              priority
              className="w-[240px] h-[240px] object-contain drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]"
            />
          </div>
          <h1 className="section-title text-center text-3xl md:text-4xl font-extrabold">
            <span className="brand-text">{t.heroTitle}</span>
          </h1>
          <p className="text-center text-white/70 mt-3 text-sm">
            {t.lastUpdateLabel}: <b>{today}</b>
          </p>
          <p className="text-center text-white/60 text-xs mt-1">
            {t.heroNote}
          </p>
        </section>

        {/* CONTENUTO */}
        <section className="grid gap-5 md:grid-cols-2">
          {/* TITOLARE & DATI */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.whoTitle}</span>
              <span>🧾</span>
            </h2>
            <p className="text-white/70 text-sm">
              {lang === "it" ? (
                <>
                  Il Titolare del trattamento è <b>KiloMystery</b>. Per
                  qualsiasi richiesta sulla privacy puoi scriverci dalla pagina{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Contatti
                  </a>
                  .
                </>
              ) : lang === "en" ? (
                <>
                  The data controller is <b>KiloMystery</b>. For any privacy
                  request you can reach us via the{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Contact
                  </a>{" "}
                  page.
                </>
              ) : lang === "es" ? (
                <>
                  El responsable del tratamiento es <b>KiloMystery</b>. Para
                  cualquier solicitud de privacidad puedes escribirnos desde la
                  página de{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Contacto
                  </a>
                  .
                </>
              ) : lang === "fr" ? (
                <>
                  Le responsable du traitement est <b>KiloMystery</b>. Pour
                  toute demande liée à la confidentialité, tu peux nous écrire
                  via la page{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Contact
                  </a>
                  .
                </>
              ) : (
                <>
                  Verantwortlicher für die Verarbeitung ist{" "}
                  <b>KiloMystery</b>. Für Datenschutzanfragen kannst du uns
                  über die Seite{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    Kontakt
                  </a>{" "}
                  erreichen.
                </>
              )}
            </p>

            <h3 className="font-bold mt-3 text-sm">
              {t.categoriesTitle}
            </h3>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.categoriesItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </article>

          {/* FINALITÀ */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.purposesTitle}</span>
              <span>⚖️</span>
            </h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.purposesItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <h3 className="font-bold mt-3 text-sm">
              {t.retentionTitle}
            </h3>
            <p className="text-white/70 text-sm">{t.retentionText}</p>
          </article>

          {/* DIRITTI */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.rightsTitle}</span>
              <span>🧑‍⚖️</span>
            </h2>
            <p className="text-white/70 text-sm">{t.rightsIntro}</p>
            <ul className="bullets space-y-1 text-sm text-white/70">
              {t.rightsItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <p className="text-white/70 text-sm">
              {lang === "it" ? (
                <>
                  Per esercitare questi diritti puoi contattarci da{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    qui
                  </a>
                  .
                </>
              ) : lang === "en" ? (
                <>
                  To exercise these rights you can contact us{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    here
                  </a>
                  .
                </>
              ) : lang === "es" ? (
                <>
                  Para ejercer estos derechos puedes contactarnos{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    aquí
                  </a>
                  .
                </>
              ) : lang === "fr" ? (
                <>
                  Pour exercer ces droits, tu peux nous contacter{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    ici
                  </a>
                  .
                </>
              ) : (
                <>
                  Um diese Rechte auszuüben, kannst du uns{" "}
                  <a href={`/${lang}/contact`} className="btn-link">
                    hier
                  </a>{" "}
                  kontaktieren.
                </>
              )}
            </p>
          </article>

          {/* COOKIE */}
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{t.cookiesTitle}</span>
              <span>🍪</span>
            </h2>
            <p className="text-white/70 text-sm">{t.cookiesP1}</p>
            <p className="text-white/70 text-sm">{t.cookiesP2}</p>
          </article>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
