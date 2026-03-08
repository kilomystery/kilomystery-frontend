"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Lang = "it" | "en" | "es" | "fr" | "de";

type Step = {
  kicker: string;
  title: string;
  text: string;
  bullets: string[];
  visualTitle: string;
  visualText: string;
  badge: string;
};

const COPY: Record<
  Lang,
  {
    sectionTitle: string;
    sectionSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    steps: Step[];
  }
> = {
  it: {
    sectionTitle: "Come funziona KiloMystery",
    sectionSubtitle:
      "Scegli il tipo, seleziona i kg, completa il checkout e vivi l’unboxing. Tutto in modo chiaro, visivo e immediato.",
    ctaPrimary: "Vai ai prodotti",
    ctaSecondary: "Guarda gli unboxing",
    steps: [
      {
        kicker: "Step 1",
        title: "Scegli Standard o Premium",
        text: "Decidi il tipo di esperienza che vuoi vivere: Standard per iniziare, Premium per un mix più ricco.",
        bullets: ["Due livelli di esperienza", "Standard e Premium", "Scelta chiara da subito"],
        visualTitle: "Standard / Premium",
        visualText: "Due modi diversi di vivere la mystery box, sempre con lotti reali e sorpresa vera.",
        badge: "Tipologia",
      },
      {
        kicker: "Step 2",
        title: "Seleziona il peso",
        text: "Scegli quanti kg vuoi ricevere: da 1 a 10 kg. Più peso, più unboxing, più sorpresa.",
        bullets: ["Formati da 1 a 10 kg", "Più kg = più esperienza", "Prezzi chiari"],
        visualTitle: "1 · 2 · 3 · 5 · 10 kg",
        visualText: "Ogni formato cambia il volume del contenuto e l’intensità dell’unboxing.",
        badge: "Peso",
      },
      {
        kicker: "Step 3",
        title: "Completa il checkout in sicurezza",
        text: "Acquisti con checkout sicuro, tracking incluso e metodi disponibili come Klarna.",
        bullets: ["Checkout sicuro", "Klarna disponibile", "Riepilogo ordine immediato"],
        visualTitle: "Checkout sicuro",
        visualText: "Più fiducia, meno frizione: il cliente capisce subito come acquistare.",
        badge: "Pagamento",
      },
      {
        kicker: "Step 4",
        title: "Prepariamo e spediamo il tuo ordine",
        text: "La tua mystery box viene preparata, sigillata e spedita con tracciamento.",
        bullets: ["Preparazione e sigillo", "Tracking incluso", "Spedizione in Italia e in Europa"],
        visualTitle: "Preparazione e spedizione",
        visualText: "Ogni ordine parte con una logica chiara di gestione del lotto e massima tracciabilità.",
        badge: "Spedizione",
      },
      {
        kicker: "Step 5",
        title: "Apri la box e guarda gli unboxing",
        text: "Ricevi la mystery box, vivi l’apertura e guarda anche i video reali della community KiloMystery.",
        bullets: ["Esperienza di unboxing", "Video reali disponibili", "CTA verso prodotti e community"],
        visualTitle: "Unboxing reale",
        visualText: "L’esperienza continua anche dopo l’acquisto: scopri, condividi e guarda cosa trovano gli altri.",
        badge: "Esperienza",
      },
    ],
  },

  en: {
    sectionTitle: "How KiloMystery works",
    sectionSubtitle:
      "Choose the type, select the kilos, complete checkout and enjoy the unboxing. Clear, visual and immediate.",
    ctaPrimary: "Go to products",
    ctaSecondary: "Watch unboxings",
    steps: [
      {
        kicker: "Step 1",
        title: "Choose Standard or Premium",
        text: "Pick the experience you want: Standard to start, Premium for a richer mix.",
        bullets: ["Two experience levels", "Standard and Premium", "Clear choice from the start"],
        visualTitle: "Standard / Premium",
        visualText: "Two ways to experience the mystery box, always with real lots and real surprise.",
        badge: "Type",
      },
      {
        kicker: "Step 2",
        title: "Select the weight",
        text: "Choose how many kilos you want: from 1 to 10 kg. More kilos means more volume and more surprise.",
        bullets: ["Formats from 1 to 10 kg", "More kilos = stronger experience", "Clear pricing"],
        visualTitle: "1 · 2 · 3 · 5 · 10 kg",
        visualText: "Each format changes the amount of content and the unboxing intensity.",
        badge: "Weight",
      },
      {
        kicker: "Step 3",
        title: "Complete checkout securely",
        text: "You buy with secure checkout, included tracking and payment methods such as Klarna.",
        bullets: ["Secure checkout", "Klarna available", "Instant order summary"],
        visualTitle: "Secure checkout",
        visualText: "More trust, less friction: the customer instantly understands how to buy.",
        badge: "Payment",
      },
      {
        kicker: "Step 4",
        title: "We prepare and ship your order",
        text: "Your mystery box is prepared, sealed and shipped with tracking.",
        bullets: ["Prepared and sealed", "Tracking included", "Shipping in Italy and across Europe"],
        visualTitle: "Preparation and shipping",
        visualText: "Every order ships with traceability and a clear lot-based process.",
        badge: "Shipping",
      },
      {
        kicker: "Step 5",
        title: "Open the box and watch real unboxings",
        text: "Receive your mystery box, enjoy the opening and explore real videos from the KiloMystery community.",
        bullets: ["Unboxing experience", "Real videos available", "Direct CTA to products and community"],
        visualTitle: "Real unboxing",
        visualText: "The experience continues after purchase: discover, share and watch what others find.",
        badge: "Experience",
      },
    ],
  },

  es: {
    sectionTitle: "Cómo funciona KiloMystery",
    sectionSubtitle:
      "Elige el tipo, selecciona los kilos, completa el checkout y vive el unboxing.",
    ctaPrimary: "Ir a productos",
    ctaSecondary: "Ver unboxings",
    steps: [
      {
        kicker: "Paso 1",
        title: "Elige Standard o Premium",
        text: "Decide el tipo de experiencia: Standard para empezar, Premium para una mezcla más rica.",
        bullets: ["Dos niveles de experiencia", "Standard y Premium", "Elección clara desde el inicio"],
        visualTitle: "Standard / Premium",
        visualText: "Dos formas de vivir la mystery box, siempre con lotes reales y sorpresa real.",
        badge: "Tipo",
      },
      {
        kicker: "Paso 2",
        title: "Selecciona el peso",
        text: "Elige cuántos kilos quieres: de 1 a 10 kg.",
        bullets: ["Formatos de 1 a 10 kg", "Más kilos = experiencia más intensa", "Precios claros"],
        visualTitle: "1 · 2 · 3 · 5 · 10 kg",
        visualText: "Cada formato cambia el volumen del contenido y la intensidad del unboxing.",
        badge: "Peso",
      },
      {
        kicker: "Paso 3",
        title: "Completa el checkout con seguridad",
        text: "Compra con checkout seguro, seguimiento incluido y métodos de pago como Klarna.",
        bullets: ["Checkout seguro", "Klarna disponible", "Resumen inmediato"],
        visualTitle: "Checkout seguro",
        visualText: "Más confianza, menos fricción.",
        badge: "Pago",
      },
      {
        kicker: "Paso 4",
        title: "Preparamos y enviamos tu pedido",
        text: "Tu mystery box se prepara, se sella y se envía con seguimiento.",
        bullets: ["Preparación y sellado", "Seguimiento incluido", "Envíos en Italia y Europa"],
        visualTitle: "Preparación y envío",
        visualText: "Cada pedido sale con trazabilidad y lógica clara de lote.",
        badge: "Envío",
      },
      {
        kicker: "Paso 5",
        title: "Abre la box y mira los unboxings",
        text: "Recibe tu mystery box, vive la apertura y descubre los vídeos reales de la comunidad.",
        bullets: ["Experiencia de unboxing", "Vídeos reales", "CTA directa a productos y comunidad"],
        visualTitle: "Unboxing real",
        visualText: "La experiencia sigue también después de la compra.",
        badge: "Experiencia",
      },
    ],
  },

  fr: {
    sectionTitle: "Comment fonctionne KiloMystery",
    sectionSubtitle:
      "Choisis le type, sélectionne les kilos, termine le checkout et vis l’unboxing.",
    ctaPrimary: "Voir les produits",
    ctaSecondary: "Voir les unboxings",
    steps: [
      {
        kicker: "Étape 1",
        title: "Choisis Standard ou Premium",
        text: "Décide le type d’expérience : Standard pour commencer, Premium pour un mix plus riche.",
        bullets: ["Deux niveaux d’expérience", "Standard et Premium", "Choix clair dès le départ"],
        visualTitle: "Standard / Premium",
        visualText: "Deux façons de vivre la mystery box, toujours avec de vrais lots.",
        badge: "Type",
      },
      {
        kicker: "Étape 2",
        title: "Sélectionne le poids",
        text: "Choisis combien de kilos tu veux recevoir : de 1 à 10 kg.",
        bullets: ["Formats de 1 à 10 kg", "Plus de kilos = plus d’intensité", "Prix clairs"],
        visualTitle: "1 · 2 · 3 · 5 · 10 kg",
        visualText: "Chaque format change le volume du contenu et l’intensité de l’ouverture.",
        badge: "Poids",
      },
      {
        kicker: "Étape 3",
        title: "Finalise le checkout en sécurité",
        text: "Paiement avec checkout sécurisé, suivi inclus et méthodes comme Klarna.",
        bullets: ["Checkout sécurisé", "Klarna disponible", "Récapitulatif immédiat"],
        visualTitle: "Checkout sécurisé",
        visualText: "Plus de confiance, moins de friction.",
        badge: "Paiement",
      },
      {
        kicker: "Étape 4",
        title: "Nous préparons et expédions ta commande",
        text: "Ta mystery box est préparée, scellée et expédiée avec suivi.",
        bullets: ["Préparation et scellage", "Suivi inclus", "Livraison en Italie et en Europe"],
        visualTitle: "Préparation et livraison",
        visualText: "Chaque commande part avec traçabilité et logique de lot.",
        badge: "Livraison",
      },
      {
        kicker: "Étape 5",
        title: "Ouvre la box et regarde les unboxings",
        text: "Reçois ta mystery box, vis l’ouverture et explore les vidéos réelles de la communauté.",
        bullets: ["Expérience d’unboxing", "Vidéos réelles", "CTA directe vers produits et communauté"],
        visualTitle: "Unboxing réel",
        visualText: "L’expérience continue après l’achat.",
        badge: "Expérience",
      },
    ],
  },

  de: {
    sectionTitle: "So funktioniert KiloMystery",
    sectionSubtitle:
      "Wähle den Typ, bestimme die Kilos, schließe den Checkout ab und erlebe das Unboxing.",
    ctaPrimary: "Zu den Produkten",
    ctaSecondary: "Unboxings ansehen",
    steps: [
      {
        kicker: "Schritt 1",
        title: "Wähle Standard oder Premium",
        text: "Entscheide dich für das Erlebnis: Standard zum Einstieg, Premium für einen stärkeren Mix.",
        bullets: ["Zwei Erlebnisstufen", "Standard und Premium", "Klare Wahl von Anfang an"],
        visualTitle: "Standard / Premium",
        visualText: "Zwei Wege, die Mystery Box zu erleben – immer mit echten Posten.",
        badge: "Typ",
      },
      {
        kicker: "Schritt 2",
        title: "Wähle das Gewicht",
        text: "Bestimme, wie viele Kilo du erhalten möchtest: von 1 bis 10 kg.",
        bullets: ["Formate von 1 bis 10 kg", "Mehr Kilo = intensiveres Erlebnis", "Klare Preise"],
        visualTitle: "1 · 2 · 3 · 5 · 10 kg",
        visualText: "Jedes Format verändert Volumen und Intensität des Unboxings.",
        badge: "Gewicht",
      },
      {
        kicker: "Schritt 3",
        title: "Schließe den Checkout sicher ab",
        text: "Sicherer Checkout, Tracking inklusive und Zahlungsmethoden wie Klarna.",
        bullets: ["Sicherer Checkout", "Klarna verfügbar", "Sofortige Bestellübersicht"],
        visualTitle: "Sicherer Checkout",
        visualText: "Mehr Vertrauen, weniger Reibung.",
        badge: "Zahlung",
      },
      {
        kicker: "Schritt 4",
        title: "Wir bereiten und versenden deine Bestellung",
        text: "Deine Mystery Box wird vorbereitet, versiegelt und mit Tracking verschickt.",
        bullets: ["Vorbereitung und Versiegelung", "Tracking inklusive", "Versand in Italien und Europa"],
        visualTitle: "Vorbereitung und Versand",
        visualText: "Jede Bestellung verlässt das Lager mit klarer Nachverfolgbarkeit.",
        badge: "Versand",
      },
      {
        kicker: "Schritt 5",
        title: "Öffne die Box und sieh dir Unboxings an",
        text: "Erhalte deine Mystery Box, erlebe das Öffnen und schau echte Videos aus der Community.",
        bullets: ["Unboxing-Erlebnis", "Echte Videos", "Direkte CTA zu Produkten und Community"],
        visualTitle: "Echtes Unboxing",
        visualText: "Das Erlebnis geht auch nach dem Kauf weiter.",
        badge: "Erlebnis",
      },
    ],
  },
};

function useSectionProgress(sectionRef: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      const start = vh * 0.2;
      const end = vh * 0.75;
      const total = rect.height - end;

      const raw = (start - rect.top) / total;
      const next = Math.max(0, Math.min(1, raw));
      setProgress(next);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sectionRef]);

  return progress;
}

function AnimatedVisual({
  step,
  index,
}: {
  step: Step;
  index: number;
}) {
  const icons = ["◈", "◎", "◌", "✦", "◍"];
  const gradients = [
    "from-[#7A20FF]/35 via-white/5 to-[#20D27A]/20",
    "from-[#20D27A]/25 via-white/5 to-[#7A20FF]/20",
    "from-[#7A20FF]/25 via-white/5 to-cyan-300/20",
    "from-emerald-300/20 via-white/5 to-[#7A20FF]/20",
    "from-[#7A20FF]/30 via-white/5 to-amber-300/20",
  ];

  return (
    <div
      key={index}
      className={`card relative min-h-[420px] overflow-hidden bg-gradient-to-br ${gradients[index % gradients.length]} animate-[fadeSlideIn_.45s_ease]`}
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),transparent_55%)]" />

      <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-[0.7rem] uppercase tracking-[.18em] text-emerald-200">
            {step.badge}
          </span>
          <span className="text-4xl text-white/25">{icons[index % icons.length]}</span>
        </div>

        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[.2em] text-white/50">{step.kicker}</div>

          <h3 className="text-3xl md:text-4xl font-extrabold leading-tight">
            {step.visualTitle}
          </h3>

          <p className="text-white/75 max-w-lg">{step.visualText}</p>

          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-center">
              <div className="text-lg font-extrabold">
                {index === 0 ? "STD" : index === 1 ? "1–10" : index === 2 ? "Klarna" : index === 3 ? "24–72h" : "Video"}
              </div>
              <div className="text-[11px] text-white/55 mt-1">
                {index === 0 ? "o PRM" : index === 1 ? "kg" : index === 2 ? "checkout" : index === 3 ? "tracking" : "community"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-center">
              <div className="text-lg font-extrabold">
                {index === 0 ? "Mix" : index === 1 ? "Peso" : index === 2 ? "Safe" : index === 3 ? "Sigillo" : "Real"}
              </div>
              <div className="text-[11px] text-white/55 mt-1">
                {index === 0 ? "esperienza" : index === 1 ? "scelta" : index === 2 ? "payment" : index === 3 ? "ordine" : "unboxing"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-center">
              <div className="text-lg font-extrabold">
                {index === 0 ? "Start" : index === 1 ? "Più" : index === 2 ? "Fast" : index === 3 ? "EU" : "Shop"}
              </div>
              <div className="text-[11px] text-white/55 mt-1">
                {index === 0 ? "box" : index === 1 ? "sorpresa" : index === 2 ? "checkout" : index === 3 ? "shipping" : "ready"}
              </div>
            </div>
          </div>
        </div>

        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7A20FF] to-[#20D27A] transition-all duration-300"
            style={{ width: `${((index + 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function MobileStepCard({
  step,
  index,
  isPassed,
  isActive,
}: {
  step: Step;
  index: number;
  isPassed: boolean;
  isActive: boolean;
}) {
  return (
    <article
      className={`relative pl-10 transition-all duration-500 ${
        isActive ? "opacity-100 translate-y-0" : isPassed ? "opacity-90 translate-y-0" : "opacity-45 translate-y-3"
      }`}
    >
      <div
        className={`absolute left-0 top-6 h-4 w-4 rounded-full border transition-all duration-300 ${
          isPassed || isActive
            ? "border-emerald-300 bg-emerald-300 shadow-[0_0_16px_rgba(52,211,153,.45)]"
            : "border-white/20 bg-[#0f1216]"
        }`}
      />

      <div className={`card transition-all duration-500 ${
        isActive ? "border-emerald-300/20 bg-white/[0.06]" : "border-white/10 bg-white/[0.03]"
      }`}>
        <div className="text-[11px] uppercase tracking-[.18em] text-emerald-300/80">{step.kicker}</div>
        <h3 className="mt-2 text-xl font-extrabold">{step.title}</h3>
        <p className="mt-2 text-sm text-white/70">{step.text}</p>

        <ul className="mt-4 space-y-2 text-sm text-white/75">
          {step.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-[2px] text-emerald-300">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[.18em] text-emerald-200">
              {step.badge}
            </span>
            <span className="text-xs text-white/40">0{index + 1}</span>
          </div>
          <div className="mt-3 text-lg font-extrabold">{step.visualTitle}</div>
          <div className="mt-1 text-sm text-white/65">{step.visualText}</div>
        </div>
      </div>
    </article>
  );
}

function DesktopStepCard({
  step,
  isPassed,
  isActive,
}: {
  step: Step;
  isPassed: boolean;
  isActive: boolean;
}) {
  return (
    <div
      className={`card transition-all duration-500 ${
        isActive
          ? "border-emerald-300/25 bg-white/[0.06] shadow-[0_18px_40px_rgba(0,0,0,.22)] opacity-100 translate-x-0"
          : isPassed
          ? "border-white/10 bg-white/[0.04] opacity-85 translate-x-0"
          : "border-white/10 bg-white/[0.03] opacity-45 translate-x-2"
      }`}
    >
      <div className="text-xs uppercase tracking-[.18em] text-emerald-300/80">
        {step.kicker}
      </div>

      <h3 className="mt-2 text-xl md:text-2xl font-extrabold">
        {step.title}
      </h3>

      <p className="mt-2 text-white/70">{step.text}</p>

      <ul className="mt-4 space-y-2 text-sm text-white/75">
        {step.bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="mt-[2px] text-emerald-300">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HowItWorksScroll({ lang = "it" as Lang }: { lang?: Lang }) {
  const supported = ["it", "en", "es", "fr", "de"] as const;
  const normalized = String(lang).toLowerCase();
  const safeLang: Lang = (supported as readonly string[]).includes(normalized as any)
    ? (normalized as Lang)
    : "it";

  const t = COPY[safeLang] ?? COPY.it;
  const steps = useMemo(() => t.steps, [t.steps]);

  const mobileRef = useRef<HTMLDivElement | null>(null);
  const desktopRef = useRef<HTMLDivElement | null>(null);

  const mobileProgress = useSectionProgress(mobileRef);
  const desktopProgress = useSectionProgress(desktopRef);

  const mobileActive = Math.min(steps.length - 1, Math.floor(mobileProgress * steps.length));
  const desktopActive = Math.min(steps.length - 1, Math.floor(desktopProgress * steps.length));

  return (
    <section id="come-funziona" className="space-y-6">
      <div className="max-w-3xl">
        <h2 className="text-2xl md:text-4xl font-extrabold">{t.sectionTitle}</h2>
        <p className="mt-3 text-white/70 text-sm md:text-base">{t.sectionSubtitle}</p>
      </div>

      {/* MOBILE */}
      <div ref={mobileRef} className="lg:hidden relative">
        <div className="absolute left-[7px] top-6 bottom-6 w-px bg-white/10" />
        <div
          className="absolute left-[7px] top-6 w-px bg-gradient-to-b from-[#7A20FF] to-[#20D27A] transition-[height] duration-75 ease-linear"
          style={{ height: `calc((100% - 3rem) * ${mobileProgress})` }}
        />

        <div className="space-y-6">
          {steps.map((step, i) => {
            const stepPoint = i / (steps.length - 1 || 1);
            const isPassed = mobileProgress >= stepPoint - 0.02;
            const isActive = i === mobileActive;

            return (
              <MobileStepCard
                key={`${step.kicker}-${i}`}
                step={step}
                index={i}
                isPassed={isPassed}
                isActive={isActive}
              />
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <a href={`/${safeLang}/products`} className="btn btn-brand w-full py-3">
            {t.ctaPrimary}
          </a>
          <a href={`/${safeLang}/unboxing-experience`} className="btn btn-ghost w-full py-3">
            {t.ctaSecondary}
          </a>
        </div>
      </div>

      {/* DESKTOP */}
      <div ref={desktopRef} className="hidden lg:grid gap-8 lg:grid-cols-[1fr,0.95fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <AnimatedVisual step={steps[desktopActive]} index={desktopActive} />

          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`/${safeLang}/products`} className="btn btn-brand px-5 py-3">
              {t.ctaPrimary}
            </a>
            <a href={`/${safeLang}/unboxing-experience`} className="btn btn-ghost px-5 py-3">
              {t.ctaSecondary}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-[15px] top-6 bottom-6 w-px bg-white/10" />
          <div
            className="absolute left-[15px] top-6 w-px bg-gradient-to-b from-[#7A20FF] to-[#20D27A] transition-[height] duration-75 ease-linear"
            style={{ height: `calc((100% - 3rem) * ${desktopProgress})` }}
          />

          <div className="space-y-6">
            {steps.map((step, i) => {
              const stepPoint = i / (steps.length - 1 || 1);
              const isPassed = desktopProgress >= stepPoint - 0.02;
              const isActive = i === desktopActive;

              return (
                <article
                  key={`${step.kicker}-${i}`}
                  className="relative pl-12 transition-all duration-500"
                >
                  <div
                    className={`absolute left-[7px] top-6 h-4 w-4 rounded-full border transition-all duration-300 ${
                      isPassed || isActive
                        ? "border-emerald-300 bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,.45)]"
                        : "border-white/20 bg-[#0f1216]"
                    }`}
                  />

                  <DesktopStepCard step={step} isPassed={isPassed} isActive={isActive} />
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}