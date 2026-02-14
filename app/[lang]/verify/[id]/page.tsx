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

  co2Label: string;
  co2Hint: string;

  ctaTitle: string;
  ctaP: string;
  ctaBtn: string;

  backHome: string;
  verifyAnother: string;

  footerNote: string;

  lineStd: string;
  linePrm: string;
  lineExp: string;

  unknown: string;
};

const VERIFY_COPY: Record<Lang, Copy> = {
  it: {
    title: "Verifica autenticità",
    subtitle:
      "Questa è la pagina ufficiale KiloMystery per la verifica del codice presente sull’etichetta.",
    officialBadge: "Pagina ufficiale",

    okTitle: "Autenticità verificata",
    okP1: "Prodotto originale KiloMystery verificato con successo.",
    okP2:
      "Ogni lotto è identificato per garantire qualità e un’esperienza di unboxing affidabile.",

    badTitle: "Codice non riconosciuto",
    badP1: "Controlla che il codice sia completo e riprova.",
    badP2: "Se il problema persiste, contattaci: ti aiuteremo a verificare.",

    lotLabel: "Codice lotto",
    lineLabel: "Linea",
    weightLabel: "Peso",
    dateLabel: "Data lotto",
    seqLabel: "Progressivo",

    co2Label: "CO₂ evitata",
    co2Hint: "Calcolo stimato: 0,25 kg CO₂ per 1 kg.",

    ctaTitle: "Vuoi un altro box?",
    ctaP: "Scopri i nuovi pacchi smarriti e continua a risparmiare CO₂ con il recupero.",
    ctaBtn: "Acquista ora",

    backHome: "Torna al sito",
    verifyAnother: "Verifica un altro codice",

    footerNote: "KiloMystery · Verifica autenticità tramite codice lotto su etichetta ufficiale.",

    lineStd: "Standard",
    linePrm: "Premium",
    lineExp: "Explorer",
    unknown: "—",
  },

  en: {
    title: "Authenticity check",
    subtitle: "This is the official KiloMystery page to verify the code on your label.",
    officialBadge: "Official page",

    okTitle: "Authenticity confirmed",
    okP1: "Original KiloMystery product successfully verified.",
    okP2: "Each batch is identified to ensure quality and a reliable unboxing experience.",

    badTitle: "Code not recognized",
    badP1: "Please check the code and try again.",
    badP2: "If the issue persists, contact us and we’ll help you verify it.",

    lotLabel: "Batch code",
    lineLabel: "Line",
    weightLabel: "Weight",
    dateLabel: "Batch date",
    seqLabel: "Sequence",

    co2Label: "CO₂ avoided",
    co2Hint: "Estimated: 0.25 kg CO₂ per 1 kg.",

    ctaTitle: "Want another box?",
    ctaP: "Explore new lost parcels and keep saving CO₂ through recovery.",
    ctaBtn: "Shop now",

    backHome: "Back to site",
    verifyAnother: "Verify another code",

    footerNote: "KiloMystery · Authenticity check via batch code on the official label.",

    lineStd: "Standard",
    linePrm: "Premium",
    lineExp: "Explorer",
    unknown: "—",
  },

  es: {
    title: "Verificación de autenticidad",
    subtitle: "Esta es la página oficial de KiloMystery para verificar el código de la etiqueta.",
    officialBadge: "Página oficial",

    okTitle: "Autenticidad verificada",
    okP1: "Producto original de KiloMystery verificado correctamente.",
    okP2: "Cada lote está identificado para asegurar calidad y una experiencia fiable.",

    badTitle: "Código no reconocido",
    badP1: "Comprueba el código y vuelve a intentarlo.",
    badP2: "Si el problema persiste, contáctanos.",

    lotLabel: "Código de lote",
    lineLabel: "Línea",
    weightLabel: "Peso",
    dateLabel: "Fecha",
    seqLabel: "Consecutivo",

    co2Label: "CO₂ evitada",
    co2Hint: "Estimado: 0,25 kg CO₂ por 1 kg.",

    ctaTitle: "¿Quieres otra caja?",
    ctaP: "Descubre nuevos paquetes perdidos y sigue ahorrando CO₂.",
    ctaBtn: "Comprar",

    backHome: "Volver al sitio",
    verifyAnother: "Verificar otro código",

    footerNote: "KiloMystery · Verificación de autenticidad mediante código de lote.",

    lineStd: "Standard",
    linePrm: "Premium",
    lineExp: "Explorer",
    unknown: "—",
  },

  fr: {
    title: "Vérification d’authenticité",
    subtitle: "Voici la page officielle KiloMystery pour vérifier le code de l’étiquette.",
    officialBadge: "Page officielle",

    okTitle: "Authenticité confirmée",
    okP1: "Produit KiloMystery original vérifié avec succès.",
    okP2: "Chaque lot est identifié pour garantir qualité et fiabilité.",

    badTitle: "Code non reconnu",
    badP1: "Vérifie le code et réessaie.",
    badP2: "Si le problème persiste, contacte-nous.",

    lotLabel: "Code de lot",
    lineLabel: "Gamme",
    weightLabel: "Poids",
    dateLabel: "Date",
    seqLabel: "Numéro",

    co2Label: "CO₂ évitée",
    co2Hint: "Estimation : 0,25 kg CO₂ par 1 kg.",

    ctaTitle: "Envie d’une autre box ?",
    ctaP: "Découvre de nouveaux colis perdus et continue d’économiser du CO₂.",
    ctaBtn: "Acheter",

    backHome: "Retour au site",
    verifyAnother: "Vérifier un autre code",

    footerNote: "KiloMystery · Vérification d’authenticité via code de lot.",

    lineStd: "Standard",
    linePrm: "Premium",
    lineExp: "Explorer",
    unknown: "—",
  },

  de: {
    title: "Echtheitsprüfung",
    subtitle: "Dies ist die offizielle KiloMystery-Seite zur Prüfung des Codes auf dem Etikett.",
    officialBadge: "Offizielle Seite",

    okTitle: "Echtheit bestätigt",
    okP1: "Originales KiloMystery-Produkt erfolgreich verifiziert.",
    okP2: "Jede Charge ist eindeutig gekennzeichnet – für Qualität und Transparenz.",

    badTitle: "Code nicht erkannt",
    badP1: "Bitte prüfe den Code und versuche es erneut.",
    badP2: "Wenn das Problem bleibt, kontaktiere uns.",

    lotLabel: "Chargencode",
    lineLabel: "Linie",
    weightLabel: "Gewicht",
    dateLabel: "Datum",
    seqLabel: "Nummer",

    co2Label: "Eingesparte CO₂",
    co2Hint: "Schätzung: 0,25 kg CO₂ pro 1 kg.",

    ctaTitle: "Noch eine Box?",
    ctaP: "Entdecke neue verlorene Pakete und spare weiter CO₂.",
    ctaBtn: "Jetzt kaufen",

    backHome: "Zur Website",
    verifyAnother: "Anderen Code prüfen",

    footerNote: "KiloMystery · Echtheitsprüfung per Chargencode.",

    lineStd: "Standard",
    linePrm: "Premium",
    lineExp: "Explorer",
    unknown: "—",
  },
};

type Parsed = {
  ok: boolean;
  code: string;
  date?: string; // YYYY-MM-DD
  type?: "STD" | "PRM" | "EXP" | string;
  weight?: string; // "5KG"
  weightNum?: number; // 5
  seq?: string; // "0001"
  reason?: string;
};

function parseLot(codeRaw: string): Parsed {
  const code = (codeRaw || "").trim();

  // Formato: KM-YYYYMMDD-TYPE-WEIGHTKG-SEQ
  // es: KM-20260128-PRM-5KG-0001
  const re = /^KM-(\d{8})-([A-Z]{3})-(\d+(?:\.\d+)?)KG-(\d{4})$/i;
  const m = code.match(re);

  if (!m) {
    return {
      ok: false,
      code,
      reason: "Formato non riconosciuto.",
    };
  }

  const yyyymmdd = m[1];
  const type = m[2].toUpperCase();
  const weightNum = Number(m[3]);
  const seq = m[4];

  const yyyy = yyyymmdd.slice(0, 4);
  const mm = yyyymmdd.slice(4, 6);
  const dd = yyyymmdd.slice(6, 8);
  const date = `${yyyy}-${mm}-${dd}`;

  return {
    ok: true,
    code,
    date,
    type,
    weight: `${weightNum}KG`,
    weightNum,
    seq,
  };
}

function typeLabel(t: string | undefined, c: Copy) {
  if (!t) return c.unknown;
  if (t === "PRM") return c.linePrm;
  if (t === "STD") return c.lineStd;
  if (t === "EXP") return c.lineExp;
  return t;
}

function formatCo2(kg: number) {
  const co2 = Math.round(kg * 0.25 * 100) / 100;
  // 1.5 -> "1.5", 1 -> "1"
  return String(co2).replace(".", ",");
}

export default function VerifyResultPage({ params }: { params: { lang: string; id: string } }) {
  const lang = (params?.lang || "it") as Lang;
  const t = VERIFY_COPY[lang] ?? VERIFY_COPY.it;

  const decoded = decodeURIComponent(params.id || "");
  const parsed = parseLot(decoded);

  const co2Text =
    parsed.ok && typeof parsed.weightNum === "number"
      ? `${formatCo2(parsed.weightNum)} kg`
      : t.unknown;

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

              <div className="mt-5 grid md:grid-cols-5 gap-3">
                <Fact label={t.lineLabel} value={typeLabel(parsed.type, t)} />
                <Fact label={t.weightLabel} value={parsed.weight || t.unknown} />
                <Fact label={t.co2Label} value={co2Text} hint={t.co2Hint} />
                <Fact label={t.dateLabel} value={parsed.date || t.unknown} />
                <Fact label={t.seqLabel} value={parsed.seq || t.unknown} />
              </div>

              {/* CTA */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 md:p-5">
                <div className="text-base font-semibold text-white/90">{t.ctaTitle}</div>
                <div className="mt-1 text-sm text-white/70">{t.ctaP}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/${lang}/products`} className="btn btn-brand">
                    {t.ctaBtn}
                  </Link>
                  <Link href={`/${lang}/verify`} className="btn btn-ghost">
                    {t.verifyAnother}
                  </Link>
                </div>
              </div>
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

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/${lang}`} className="btn btn-brand">
                  {t.backHome}
                </Link>
                <Link href={`/${lang}/verify`} className="btn btn-ghost">
                  {t.verifyAnother}
                </Link>
              </div>
            </div>
          )}

          {/* FOOT NOTE */}
          <div className="mt-6 text-xs text-white/50">{t.footerNote}</div>
        </div>
      </main>

      <Footer lang={lang} />
    </>
  );
}

function Fact({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white/90">{value}</div>
      {hint ? <div className="mt-1 text-[11px] text-white/50">{hint}</div> : null}
    </div>
  );
}
