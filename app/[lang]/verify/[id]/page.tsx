import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";

type Lang = "it" | "en" | "es" | "fr" | "de";

type Copy = {
  title: string;
  subtitle: string;
  officialBadge: string;

  okTitle: string;
  okP1: string;
  okP2: string;

  badTitle: string;
  badP1: string;
  badP2: string;

  lotLabel: string;
  lineLabel: string;
  weightLabel: string;
  dateLabel: string;
  seqLabel: string;

  backHome: string;
  verifyAnother: string;

  footerNote: string;

  lineStd: string;
  linePrm: string;
  lineExp: string;

  unknown: string;

  co2Title: string;
  co2Desc: string;
  ctaTitle: string;
  ctaBuy: string;
  ctaSignup: string;
};

const VERIFY_COPY: Record<Lang, Copy> = {
  it: {
    title: "Verifica autenticità",
    subtitle: "Questa è la pagina ufficiale KiloMystery per la verifica del codice presente sull’etichetta.",
    officialBadge: "Pagina ufficiale",
    okTitle: "Autenticità verificata",
    okP1: "Prodotto originale KiloMystery verificato con successo.",
    okP2: "Ogni lotto è identificato e tracciato per garantire qualità, trasparenza e un’esperienza di unboxing affidabile.",
    badTitle: "Codice non riconosciuto",
    badP1: "Non riusciamo a confermare questo codice. Controlla che sia completo e riprova.",
    badP2: "Se l’etichetta risulta danneggiata o il problema persiste, contattaci: ti aiuteremo a verificare.",
    lotLabel: "Codice lotto",
    lineLabel: "Linea",
    weightLabel: "Peso",
    dateLabel: "Data lotto",
    seqLabel: "Progressivo",
    backHome: "Torna al sito",
    verifyAnother: "Verifica un altro codice",
    footerNote: "KiloMystery · Verifica autenticità tramite codice lotto su etichetta ufficiale.",
    lineStd: "Standard",
    linePrm: "Premium",
    lineExp: "Explorer",
    unknown: "—",
    co2Title: "CO₂ evitata",
    co2Desc: "Grazie a questo acquisto contribuisci a ridurre sprechi e emissioni.",
    ctaTitle: "Vuoi sbloccare offerte e drop?",
    ctaBuy: "Compra un altro pacco",
    ctaSignup: "Iscriviti e ricevi promo",
  },
  en: {
    title: "Authenticity check",
    subtitle: "This is the official KiloMystery page to verify the code printed on your label.",
    officialBadge: "Official page",
    okTitle: "Authenticity confirmed",
    okP1: "Original KiloMystery product successfully verified.",
    okP2: "Each batch is identified and tracked to ensure quality, transparency, and a reliable unboxing experience.",
    badTitle: "Code not recognized",
    badP1: "We can’t confirm this code. Please check that it’s complete and try again.",
    badP2: "If the label is damaged or the issue persists, contact us and we’ll help you verify it.",
    lotLabel: "Batch code",
    lineLabel: "Line",
    weightLabel: "Weight",
    dateLabel: "Batch date",
    seqLabel: "Sequence",
    backHome: "Back to site",
    verifyAnother: "Verify another code",
    footerNote: "KiloMystery · Authenticity check via batch code on the official label.",
    lineStd: "Standard",
    linePrm: "Premium",
    lineExp: "Explorer",
    unknown: "—",
    co2Title: "CO₂ avoided",
    co2Desc: "Thanks to your purchase you help reduce waste and emissions.",
    ctaTitle: "Want offers and new drops?",
    ctaBuy: "Buy another box",
    ctaSignup: "Sign up for promos",
  },
  es: {
    title: "Verificación de autenticidad",
    subtitle: "Esta es la página oficial de KiloMystery para verificar el código impreso en la etiqueta.",
    officialBadge: "Página oficial",
    okTitle: "Autenticidad verificada",
    okP1: "Producto original de KiloMystery verificado correctamente.",
    okP2: "Cada lote está identificado y trazado para garantizar calidad, transparencia y una experiencia de unboxing fiable.",
    badTitle: "Código no reconocido",
    badP1: "No podemos confirmar este código. Comprueba que esté completo y vuelve a intentarlo.",
    badP2: "Si la etiqueta está dañada o el problema persiste, contáctanos y te ayudaremos a verificarlo.",
    lotLabel: "Código de lote",
    lineLabel: "Línea",
    weightLabel: "Peso",
    dateLabel: "Fecha del lote",
    seqLabel: "Consecutivo",
    backHome: "Volver al sitio",
    verifyAnother: "Verificar otro código",
    footerNote: "KiloMystery · Verificación de autenticidad mediante código de lote en la etiqueta oficial.",
    lineStd: "Standard",
    linePrm: "Premium",
    lineExp: "Explorer",
    unknown: "—",
    co2Title: "CO₂ evitada",
    co2Desc: "Gracias a tu compra ayudas a reducir residuos y emisiones.",
    ctaTitle: "¿Quieres ofertas y nuevos drops?",
    ctaBuy: "Comprar otro pack",
    ctaSignup: "Suscríbete para promos",
  },
  fr: {
    title: "Vérification d’authenticité",
    subtitle: "Voici la page officielle KiloMystery pour vérifier le code présent sur l’étiquette.",
    officialBadge: "Page officielle",
    okTitle: "Authenticité confirmée",
    okP1: "Produit KiloMystery original vérifié avec succès.",
    okP2: "Chaque lot est identifié et suivi afin de garantir qualité, transparence et une expérience d’unboxing fiable.",
    badTitle: "Code non reconnu",
    badP1: "Nous ne parvenons pas à confirmer ce code. Vérifie qu’il est complet et réessaie.",
    badP2: "Si l’étiquette est abîmée ou si le problème persiste, contacte-nous : nous t’aiderons à vérifier.",
    lotLabel: "Code de lot",
    lineLabel: "Gamme",
    weightLabel: "Poids",
    dateLabel: "Date du lot",
    seqLabel: "Numéro",
    backHome: "Retour au site",
    verifyAnother: "Vérifier un autre code",
    footerNote: "KiloMystery · Vérification d’authenticité via code de lot sur l’étiquette officielle.",
    lineStd: "Standard",
    linePrm: "Premium",
    lineExp: "Explorer",
    unknown: "—",
    co2Title: "CO₂ évitée",
    co2Desc: "Grâce à votre achat, vous contribuez à réduire le gaspillage et les émissions.",
    ctaTitle: "Envie d’offres et de nouveaux drops ?",
    ctaBuy: "Acheter un autre pack",
    ctaSignup: "S’inscrire aux promos",
  },
  de: {
    title: "Echtheitsprüfung",
    subtitle: "Dies ist die offizielle KiloMystery-Seite zur Prüfung des Codes auf deinem Etikett.",
    officialBadge: "Offizielle Seite",
    okTitle: "Echtheit bestätigt",
    okP1: "Originales KiloMystery-Produkt erfolgreich verifiziert.",
    okP2: "Jede Charge ist eindeutig gekennzeichnet und nachvollziehbar – für Qualität, Transparenz und ein verlässliches Unboxing-Erlebnis.",
    badTitle: "Code nicht erkannt",
    badP1: "Wir können diesen Code nicht bestätigen. Bitte prüfe, ob er vollständig ist, und versuche es erneut.",
    badP2: "Wenn das Etikett beschädigt ist oder das Problem bleibt, kontaktiere uns – wir helfen dir gerne weiter.",
    lotLabel: "Chargencode",
    lineLabel: "Linie",
    weightLabel: "Gewicht",
    dateLabel: "Chargendatum",
    seqLabel: "Nummer",
    backHome: "Zur Website",
    verifyAnother: "Anderen Code prüfen",
    footerNote: "KiloMystery · Echtheitsprüfung per Chargencode auf dem offiziellen Etikett.",
    lineStd: "Standard",
    linePrm: "Premium",
    lineExp: "Explorer",
    unknown: "—",
    co2Title: "CO₂ eingespart",
    co2Desc: "Mit deinem Kauf hilfst du, Abfall und Emissionen zu reduzieren.",
    ctaTitle: "Willst du Angebote und neue Drops?",
    ctaBuy: "Noch ein Paket kaufen",
    ctaSignup: "Für Promos anmelden",
  },
};

type Parsed = {
  ok: boolean;
  code: string;
  date?: string; // YYYY-MM-DD
  type?: "STD" | "PRM" | "EXP" | string;
  weight?: string; // "5KG"
  seq?: string; // "0001"
  reason?: string;
};

function parseLot(codeRaw: string): Parsed {
  const code = (codeRaw || "").trim();
  const re = /^KM-(\d{8})-([A-Z]{3})-(\d+(?:\.\d+)?)KG-(\d{4})$/i;
  const m = code.match(re);

  if (!m) {
    return {
      ok: false,
      code,
      reason: "Formato non riconosciuto. Controlla che il codice sia completo e senza spazi.",
    };
  }

  const yyyymmdd = m[1];
  const type = m[2].toUpperCase();
  const weightNum = m[3];
  const seq = m[4];

  const yyyy = yyyymmdd.slice(0, 4);
  const mm = yyyymmdd.slice(4, 6);
  const dd = yyyymmdd.slice(6, 8);
  const date = `${yyyy}-${mm}-${dd}`;

  return { ok: true, code, date, type, weight: `${weightNum}KG`, seq };
}

function typeLabel(t: string | undefined, c: Copy) {
  if (!t) return c.unknown;
  if (t === "PRM") return c.linePrm;
  if (t === "STD") return c.lineStd;
  if (t === "EXP") return c.lineExp;
  return t;
}

function parseWeightNumber(weight: string | undefined) {
  const m = (weight || "").replace(",", ".").match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

export default function VerifyResultPage({ params }: { params: { lang: string; id: string } }) {
  const lang = (params?.lang || "it") as Lang;
  const t = VERIFY_COPY[lang] ?? VERIFY_COPY.it;

  const decoded = decodeURIComponent(params.id || "");
  const parsed = parseLot(decoded);

  const factor = Number(process.env.CO2_FACTOR_PER_KG || "0");
  const kg = parseWeightNumber(parsed.weight);
  const co2 = factor > 0 ? Math.round(kg * factor * 100) / 100 : 0;

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10">
        <div className="card border-white/15 bg-[#0b0f14]/60 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
              <p className="mt-2 text-white/70 max-w-2xl">{t.subtitle}</p>
            </div>

            <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-white/70">{t.officialBadge}</span>
            </div>
          </div>

          {/* ESITO */}
          {parsed.ok ? (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-200 text-lg">✓</span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-emerald-100">{t.okTitle}</div>
                  <div className="mt-1 text-sm text-white/70">{t.okP1}</div>
                  <div className="mt-2 text-sm text-white/70">{t.okP2}</div>
                  <div className="mt-3 font-mono text-sm text-white">{parsed.code}</div>
                </div>
              </div>

              <div className="mt-5 grid md:grid-cols-4 gap-3">
                <Fact label={t.lineLabel} value={typeLabel(parsed.type, t)} />
                <Fact label={t.weightLabel} value={parsed.weight || t.unknown} />
                <Fact label={t.dateLabel} value={parsed.date || t.unknown} />
                <Fact label={t.seqLabel} value={parsed.seq || t.unknown} />
              </div>

              {/* CO2 */}
              {co2 > 0 && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-white/60">{t.co2Title}</div>
                  <div className="mt-1 text-2xl font-bold text-white">{co2} kg</div>
                  <div className="mt-1 text-sm text-white/70">{t.co2Desc}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-9 w-9 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-200 text-lg">!</span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-100">{t.badTitle}</div>
                  <div className="mt-1 text-sm text-white/70">{t.badP1}</div>
                  <div className="mt-2 text-sm text-white/70">{t.badP2}</div>
                  <div className="mt-3 font-mono text-sm text-white">{parsed.code}</div>
                </div>
              </div>
            </div>
          )}

          {/* CTA marketing */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-lg font-semibold text-white">{t.ctaTitle}</div>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link href={`/${lang}`} className="btn btn-brand">
                {t.ctaBuy}
              </Link>
              <Link href={`/${lang}/signup`} className="btn btn-ghost">
                {t.ctaSignup}
              </Link>
              <Link href={`/${lang}/verify`} className="btn btn-ghost">
                {t.verifyAnother}
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${lang}`} className="btn btn-ghost">
              {t.backHome}
            </Link>
          </div>

          <div className="mt-6 text-xs text-white/50">{t.footerNote}</div>
        </div>
      </main>

      <Footer lang={lang} />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white/90">{value}</div>
    </div>
  );
}
