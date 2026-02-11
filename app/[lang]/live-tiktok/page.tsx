/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCallback, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

type CopyKey =
  | "title"
  | "subtitle"
  | "kickerHow"
  | "how1"
  | "how2"
  | "how3"
  | "how4"
  | "kickerPricing"
  | "pricingA"
  | "pricingB"
  | "pricingC"
  | "kickerShipping"
  | "shippingA"
  | "shippingB"
  | "kickerRules"
  | "rulesA"
  | "rulesB"
  | "rulesC"
  | "rulesD"
  | "rulesE"
  | "rulesF"
  | "kickerForm"
  | "formIntro"
  | "tiktokLabel"
  | "tiktokPlaceholder"
  | "nameLabel"
  | "namePlaceholder"
  | "surnameLabel"
  | "surnamePlaceholder"
  | "emailLabel"
  | "emailPlaceholder"
  | "phoneLabel"
  | "phonePlaceholder"
  | "address1Label"
  | "address1Placeholder"
  | "address2Label"
  | "address2Placeholder"
  | "zipLabel"
  | "zipPlaceholder"
  | "cityLabel"
  | "cityPlaceholder"
  | "provLabel"
  | "provPlaceholder"
  | "countryLabel"
  | "countryPlaceholder"
  | "accept"
  | "buttonIdle"
  | "buttonLoading"
  | "privacy"
  | "faqTitle"
  | "faq1q"
  | "faq1a"
  | "faq2q"
  | "faq2a"
  | "faq3q"
  | "faq3a"
  | "faq4q"
  | "faq4a"
  | "linksTitle"
  | "linksShipping"
  | "linksTerms"
  | "linksReturns";

type CopyPerLang = Record<CopyKey, string>;

const LIVE_TICKET_VARIANT_ID = 52681102393682;

// Regole business
const DEPOSIT_EUR = 20;
const BALANCE_DEADLINE_HOURS = 24;

// Prezzi al kg (Premium, scaglioni)
const PRICE_PER_KG_UNDER_5 = 26.9;
const PRICE_PER_KG_FROM_5 = 23.7;

// Spedizione
const SHIPPING_UP_TO_5KG_EUR = 6;
const SHIPPING_FREE_FROM_KG = 5;

const euro = (n: number) =>
  n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

const LIVE_COPY: Record<Lang, CopyPerLang> = {
  it: {
    title: "LIVE TikTok · Mystery Box al peso",
    subtitle:
      "Registrati con un acconto per entrare nella lista LIVE. In diretta pesiamo ogni pacco e comunichiamo il prezzo. Dopo la live ricevi il link per il saldo.",

    kickerHow: "Come funziona",
    how1: `Registrazione + acconto: versi ${euro(DEPOSIT_EUR)} per essere inserito in lista.`,
    how2: "In live scrivi: “IO + @tuousername”. Assegniamo solo se sei registrato.",
    how3:
      "Pesiamo la mystery in diretta e comunichiamo il totale in base al peso (Premium €/kg).",
    how4: `Dopo la live ti inviamo il link per il saldo (totale − acconto). Saldo entro ${BALANCE_DEADLINE_HOURS} ore.`,

    kickerPricing: "Prezzo Premium al kg",
    pricingA: `Sotto ${SHIPPING_FREE_FROM_KG} kg: ${PRICE_PER_KG_UNDER_5.toFixed(2)} €/kg`,
    pricingB: `Da ${SHIPPING_FREE_FROM_KG} kg in su: ${PRICE_PER_KG_FROM_5.toFixed(2)} €/kg`,
    pricingC:
      "Soglia: a 5,00 kg scatta la tariffa ridotta (e la spedizione gratuita).",

    kickerShipping: "Spedizione",
    shippingA: `Fino a ${SHIPPING_FREE_FROM_KG} kg: ${euro(SHIPPING_UP_TO_5KG_EUR)}`,
    shippingB: `Da ${SHIPPING_FREE_FROM_KG} kg in su: Gratis`,

    kickerRules: "Regolamento (chiaro e semplice)",
    rulesA:
      "La partecipazione è riservata agli utenti registrati con acconto (ticket).",
    rulesB:
      "Fa fede l’ordine della chat in diretta. Lo username in chat deve combaciare con quello registrato.",
    rulesC:
      "L’acconto è un anticipo per partecipare e viene scalato dal primo pagamento saldo che ti inviamo dopo la live.",
    rulesD: `Il saldo deve essere pagato entro ${BALANCE_DEADLINE_HOURS} ore dall’invio del link. In caso contrario il pacco può essere riassegnato.`,
    rulesE:
      "Puoi aggiudicarti più pacchi nella stessa live (assegnazioni multiple).",
    rulesF:
      "I prezzi sono calcolati in base al peso e alle soglie indicate sopra.",

    kickerForm: "Registrazione",
    formIntro:
      "Inserisci i tuoi dati: serviranno per verificare lo username in live e per la spedizione.",
    tiktokLabel: "Username TikTok",
    tiktokPlaceholder: "es. @nomeutente",
    nameLabel: "Nome",
    namePlaceholder: "Mario",
    surnameLabel: "Cognome",
    surnamePlaceholder: "Rossi",
    emailLabel: "Email",
    emailPlaceholder: "mario@email.com",
    phoneLabel: "Telefono",
    phonePlaceholder: "+39 …",
    address1Label: "Indirizzo (via e civico)",
    address1Placeholder: "Via Roma 10",
    address2Label: "Interno / scala / note (opzionale)",
    address2Placeholder: "Scala B, interno 4…",
    zipLabel: "CAP",
    zipPlaceholder: "00000",
    cityLabel: "Città",
    cityPlaceholder: "Milano",
    provLabel: "Provincia",
    provPlaceholder: "MI",
    countryLabel: "Paese",
    countryPlaceholder: "IT",
    accept: `Confermo: acconto ${euro(
      DEPOSIT_EUR
    )}, saldo entro ${BALANCE_DEADLINE_HOURS}h, prezzi al kg e spedizione come indicato.`,
    buttonIdle: `Registrati e versa ${euro(DEPOSIT_EUR)}`,
    buttonLoading: "Apro il checkout…",
    privacy:
      "I dati inseriti vengono usati solo per la gestione della LIVE e della spedizione. Niente spam.",

    faqTitle: "FAQ",
    faq1q: "Devo comprare un ticket ogni live?",
    faq1a:
      "Il ticket è l’acconto per entrare in lista. Le regole di validità sono quelle indicate nella pagina e comunicate in live.",
    faq2q: "Come viene calcolato il prezzo?",
    faq2a:
      "In base ai kg pesati in live e alla tariffa Premium: sotto 5kg 26,90 €/kg, da 5kg in su 23,70 €/kg. La spedizione è 6€ fino a 5kg e gratis da 5kg in su.",
    faq3q: "Posso prendere più pacchi in live?",
    faq3a:
      "Sì, puoi aggiudicarti più pacchi. Ogni pacco viene registrato e riceverai i link di saldo dopo la live.",
    faq4q: "Quando ricevo il link di pagamento del saldo?",
    faq4a:
      "Dopo la live ti inviamo un link Shopify per pagare il saldo. Il saldo va pagato entro 24 ore dall’invio del link.",

    linksTitle: "Link utili",
    linksReturns: "Politica Resi",
    linksShipping: "Spedizioni",
    linksTerms: "Termini e condizioni",
  },

  // Per ora: se non vuoi traduzioni, riusiamo IT (puoi tradurre dopo senza cambiare UI)
  en: undefined as any,
  es: undefined as any,
  fr: undefined as any,
  de: undefined as any,
};

// fallback: altre lingue = IT (per non bloccarti ora)
LIVE_COPY.en = LIVE_COPY.it as any;
LIVE_COPY.es = LIVE_COPY.it as any;
LIVE_COPY.fr = LIVE_COPY.it as any;
LIVE_COPY.de = LIVE_COPY.it as any;

type FormState = {
  tiktokUsername: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  zip: string;
  city: string;
  province: string;
  country: string;
  acceptRules: boolean;
};

const initial: FormState = {
  tiktokUsername: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  zip: "",
  city: "",
  province: "",
  country: "IT",
  acceptRules: false,
};

function isValidUsername(u: string) {
  const s = u.trim();
  return s.startsWith("@") && s.length >= 3;
}

function canSubmit(f: FormState) {
  return (
    f.acceptRules &&
    isValidUsername(f.tiktokUsername) &&
    f.firstName.trim() &&
    f.lastName.trim() &&
    f.email.trim() &&
    f.phone.trim() &&
    f.address1.trim() &&
    f.zip.trim() &&
    f.city.trim() &&
    f.province.trim() &&
    f.country.trim()
  );
}

export default function LiveTikTokPage({ params }: { params: { lang: string } }) {
  const lang: Lang = normalizeLang(params?.lang);
  const t = LIVE_COPY[lang] ?? LIVE_COPY.it;

  const [form, setForm] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const ok = useMemo(() => canSubmit(form), [form]);

  const shippingHref = `/${lang}/shipping`;
  const termsHref = `/${lang}/terms`;
  const returnsHref = `/${lang}/returns`;

  const onStartCheckout = useCallback(async () => {
    if (loading) return;
    if (!ok) return;

    setLoading(true);
    try {
      const originQuery =
        typeof window !== "undefined" ? window.location.search : "";

      const pricingRule = `kg<5:${PRICE_PER_KG_UNDER_5};kg>=5:${PRICE_PER_KG_FROM_5};ship<=5kg:${SHIPPING_UP_TO_5KG_EUR};ship>=${SHIPPING_FREE_FROM_KG}kg:0`;
      const rules = `deposit:${DEPOSIT_EUR};balance_deadline_hours:${BALANCE_DEADLINE_HOURS}`;

      const payload = {
        lang,
        items: [{ shopifyId: LIVE_TICKET_VARIANT_ID, qty: 1, tier: "LIVE_TICKET" }],
        originQuery,
        orderNote: `LIVE TikTok Registration - ${form.tiktokUsername} | rules(${rules}) | pricing(${pricingRule})`,
        liveRegistration: {
          tiktokUsername: form.tiktokUsername,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address1: form.address1,
          address2: form.address2,
          zip: form.zip,
          city: form.city,
          province: form.province,
          country: form.country,
        },
      };

      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.message || "Checkout error");

      window.location.href = data.url;
    } catch {
      alert("Errore durante l’apertura del checkout. Riprova o contattaci.");
    } finally {
      setLoading(false);
    }
  }, [lang, loading, ok, form]);

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-8">
        {/* HERO */}
        <header className="space-y-2 max-w-2xl">
          <p className="section-kicker">🎥 LIVE</p>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-[#7A20FF] via-emerald-300 to-[#20D27A] bg-clip-text text-transparent">
              {t.title}
            </span>
          </h1>
          <p className="text-white/75">{t.subtitle}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="pill pill--prm">
              Acconto {euro(DEPOSIT_EUR)}
            </span>
            <span className="pill pill--std">
              Saldo entro {BALANCE_DEADLINE_HOURS}h
            </span>
            <span className="pill pill--std">
              {PRICE_PER_KG_UNDER_5.toFixed(2)} €/kg{" "}
              {"<"}5kg
            </span>
            <span className="pill pill--prm">
              {PRICE_PER_KG_FROM_5.toFixed(2)} €/kg ≥5kg
            </span>
          </div>
        </header>

        {/* HOW / PRICING / SHIPPING */}
        <section className="grid gap-5 lg:grid-cols-3">
          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">{t.kickerHow}</h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>{t.how1}</li>
              <li>{t.how2}</li>
              <li>{t.how3}</li>
              <li>{t.how4}</li>
            </ul>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">{t.kickerPricing}</h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>{t.pricingA}</li>
              <li>{t.pricingB}</li>
              <li className="text-white/55">{t.pricingC}</li>
            </ul>
          </article>

          <article className="card space-y-3">
            <h2 className="text-xl font-extrabold">{t.kickerShipping}</h2>
            <ul className="bullets space-y-1 text-sm text-white/70">
              <li>{t.shippingA}</li>
              <li>{t.shippingB}</li>
            </ul>
            <div className="pt-1 text-xs text-white/50">
              Nota: spedizione calcolata sul totale kg assegnati.
            </div>
          </article>
        </section>

        {/* RULES */}
        <section className="card space-y-3">
          <h2 className="text-xl font-extrabold">{t.kickerRules}</h2>
          <ul className="bullets space-y-1 text-sm text-white/70">
            <li>{t.rulesA}</li>
            <li>{t.rulesB}</li>
            <li>{t.rulesC}</li>
            <li>{t.rulesD}</li>
            <li>{t.rulesE}</li>
            <li>{t.rulesF}</li>
          </ul>
        </section>

        {/* FORM */}
        <section className="card space-y-4">
          <div className="space-y-1">
            <p className="section-kicker">{t.kickerForm}</p>
            <h2 className="text-xl font-extrabold">{t.kickerForm}</h2>
            <p className="text-white/70 text-sm">{t.formIntro}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="section-kicker mb-1" htmlFor="tiktokUsername">
                {t.tiktokLabel}
              </label>
              <input
                id="tiktokUsername"
                className="input"
                placeholder={t.tiktokPlaceholder}
                value={form.tiktokUsername}
                onChange={(e) => setForm({ ...form, tiktokUsername: e.target.value })}
              />
              <p className="text-xs text-white/45 mt-1">
                Importante: deve essere identico a quello che userai in chat durante la LIVE.
              </p>
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="phone">
                {t.phoneLabel}
              </label>
              <input
                id="phone"
                className="input"
                placeholder={t.phonePlaceholder}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="firstName">
                {t.nameLabel}
              </label>
              <input
                id="firstName"
                className="input"
                placeholder={t.namePlaceholder}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="lastName">
                {t.surnameLabel}
              </label>
              <input
                id="lastName"
                className="input"
                placeholder={t.surnamePlaceholder}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="section-kicker mb-1" htmlFor="email">
                {t.emailLabel}
              </label>
              <input
                id="email"
                className="input"
                type="email"
                inputMode="email"
                placeholder={t.emailPlaceholder}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="section-kicker mb-1" htmlFor="address1">
                {t.address1Label}
              </label>
              <input
                id="address1"
                className="input"
                placeholder={t.address1Placeholder}
                value={form.address1}
                onChange={(e) => setForm({ ...form, address1: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="section-kicker mb-1" htmlFor="address2">
                {t.address2Label}
              </label>
              <input
                id="address2"
                className="input"
                placeholder={t.address2Placeholder}
                value={form.address2}
                onChange={(e) => setForm({ ...form, address2: e.target.value })}
              />
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="zip">
                {t.zipLabel}
              </label>
              <input
                id="zip"
                className="input"
                placeholder={t.zipPlaceholder}
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
              />
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="city">
                {t.cityLabel}
              </label>
              <input
                id="city"
                className="input"
                placeholder={t.cityPlaceholder}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="province">
                {t.provLabel}
              </label>
              <input
                id="province"
                className="input"
                placeholder={t.provPlaceholder}
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
              />
            </div>

            <div>
              <label className="section-kicker mb-1" htmlFor="country">
                {t.countryLabel}
              </label>
              <input
                id="country"
                className="input"
                placeholder={t.countryPlaceholder}
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.acceptRules}
              onChange={(e) => setForm({ ...form, acceptRules: e.target.checked })}
            />
            <span>{t.accept}</span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={`btn btn-brand px-6 ${(!ok || loading) ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={!ok || loading}
              aria-busy={loading}
              onClick={onStartCheckout}
            >
              {loading ? t.buttonLoading : t.buttonIdle}
            </button>

            <span className="text-xs text-white/45">{t.privacy}</span>
          </div>
        </section>

        {/* FAQ */}
        <section className="card space-y-3">
          <h2 className="text-xl font-extrabold">{t.faqTitle}</h2>

          <div className="space-y-2 text-sm text-white/70">
            <div>
              <p className="font-semibold text-white/85">{t.faq1q}</p>
              <p className="text-white/70">{t.faq1a}</p>
            </div>
            <div>
              <p className="font-semibold text-white/85">{t.faq2q}</p>
              <p className="text-white/70">{t.faq2a}</p>
            </div>
            <div>
              <p className="font-semibold text-white/85">{t.faq3q}</p>
              <p className="text-white/70">{t.faq3a}</p>
            </div>
            <div>
              <p className="font-semibold text-white/85">{t.faq4q}</p>
              <p className="text-white/70">{t.faq4a}</p>
            </div>
          </div>
        </section>

        {/* LINKS UTILI */}
        <section className="card space-y-3">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <span>{t.linksTitle}</span>
            <span>🔗</span>
          </h2>
          <ul className="bullets space-y-1 text-sm text-white/70">
            <li>
              <a href={returnsHref} className="btn-link">
                {t.linksReturns}
              </a>
            </li>
            <li>
              <a href={shippingHref} className="btn-link">
                {t.linksShipping}
              </a>
            </li>
            <li>
              <a href={termsHref} className="btn-link">
                {t.linksTerms}
              </a>
            </li>
          </ul>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
