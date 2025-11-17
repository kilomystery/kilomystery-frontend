// app/[lang]/products/page.tsx
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

type Kg = 1 | 2 | 3 | 5 | 10;

const stdV = (kg: Kg) => `/videos/packs/std-${kg}.mp4`;
const prmV = (kg: Kg) => `/videos/packs/prm-${kg}.mp4`;

function pricePerKg(kind: "Standard" | "Premium", kg: Kg) {
  if (kind === "Premium") return kg <= 3 ? 25.99 : 20.99;
  return kg <= 3 ? 19.9 : 17.99;
}

const euro = (n: number) =>
  n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

/** CO₂ indicativa evitata per kg (stima) */
const co2ByKg: Record<Kg, string> = {
  1: "≈0,25 kg di CO₂ evitati",
  2: "≈0,5 kg di CO₂ evitati",
  3: "≈0,75 kg di CO₂ evitati",
  5: "≈1,25 kg di CO₂ evitati",
  10: "≈2,5 kg di CO₂ evitati",
};

/** Log “safe” (solo stringhe) per evitare errori del Dev Overlay */
function safeError(label: string, err: unknown) {
  const msg =
    err instanceof Error
      ? err.message
      : (() => {
          try {
            return typeof err === "string" ? err : JSON.stringify(err);
          } catch {
            return String(err);
          }
        })();
  // stampiamo solo stringhe
  console.error(`${label}: ${msg}`);
}

/**
 * Mappa link diretti al carrello Shopify per ogni combinazione
 * kind + kg. Se vuoi cambiare dominio o ID, è tutto qui.
 */
const shopifyCartUrlMap: Record<
  "Standard" | "Premium",
  Record<Kg, string | null>
> = {
  Standard: {
    1: "https://kilomystery.myshopify.com/cart/52045370360146:1",
    2: "https://kilomystery.myshopify.com/cart/52045370392914:1",
    3: "https://kilomystery.myshopify.com/cart/52045370425682:1",
    5: "https://kilomystery.myshopify.com/cart/52045370458450:1",
    10: "https://kilomystery.myshopify.com/cart/52045370491218:1",
  },
  Premium: {
    1: "https://kilomystery.myshopify.com/cart/52045402571090:1",
    2: "https://kilomystery.myshopify.com/cart/52045402603858:1",
    3: "https://kilomystery.myshopify.com/cart/52045402636626:1",
    5: "https://kilomystery.myshopify.com/cart/52045402669394:1",
    10:
      // ID variante 10 kg Premium
      "https://kilomystery.myshopify.com/cart/52045402702162:1",
  },
};

function PackCard({
  kind,
  kg,
  video,
}: {
  kind: "Standard" | "Premium";
  kg: Kg;
  video: string;
}) {
  const ppk = pricePerKg(kind, kg);
  const total = +(ppk * kg).toFixed(2);
  const isStd = kind === "Standard";

  const anchorId = kg === 10 ? `buy-${kind.toLowerCase()}-10` : undefined;
  const cartUrl = shopifyCartUrlMap[kind][kg];

  return (
    <article
      className={`card ${isStd ? "card--standard" : "card--premium"}`}
      id={anchorId}
    >
      {/* media con glow/ombre */}
      <div
        className={`media-wrap ${
          isStd ? "media-wrap--std" : "media-wrap--prm"
        }`}
      >
        <div className="ratio-16-9">
          <video
            className="media rounded-[12px] object-cover"
            src={video}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
          />
        </div>

        {/* badge 10kg */}
        {kg === 10 && <span className="badge-flag">1 giro incluso</span>}
      </div>

      {/* header prezzo/titolo */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <h4 className="product-title text-xl">
          {kind} <span className="dot" /> {kg} kg
        </h4>

        <div className="text-right">
          <div
            className={`price-figure ${
              isStd ? "price-figure--std" : "price-figure--prm"
            } text-3xl`}
          >
            {euro(total)}
          </div>
          <div className="price-perkg">({ppk.toFixed(2)} €/kg)</div>
        </div>
      </div>

      {/* features */}
      <ul className="bullets mt-3 space-y-1">
        <li>Contenuto misto – sorpresa</li>
        <li>Peso netto (toll. ±3%)</li>
        <li>Sigillo con ID lotto e data</li>
        <li>{co2ByKg[kg]}</li>
        {kg === 10 && (
          <li>
            Include <b>1 giro</b> alla Ruota (finestra <b>30 minuti</b>) • vinci
            fino a <b>+2 kg</b>.
          </li>
        )}
      </ul>

      {/* CTA */}
      <div className="mt-4">
        {cartUrl ? (
          <a href={cartUrl} rel="noreferrer">
            <button
              className={`btn w-full ${isStd ? "btn-silver" : "btn-gold"}`}
            >
              Aggiungi al carrello
            </button>
          </a>
        ) : (
          <button
            className={`btn w-full opacity-60 cursor-not-allowed ${
              isStd ? "btn-silver" : "btn-gold"
            }`}
            disabled
          >
            Presto disponibile
          </button>
        )}
      </div>
    </article>
  );
}

export default function ProductsPage({ params }: { params: { lang: string } }) {
  const lang = (params?.lang || "it") as any;
  const animRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroyed = false;
    let anim: import("lottie-web").AnimationItem | null = null;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    (async () => {
      try {
        // import dinamico (niente peso nel bundle iniziale)
        const { default: lottie } = await import("lottie-web");

        const res = await fetch("/lottie/products-animation.json", {
          cache: "no-store",
        });
        if (!res.ok) {
          safeError("Lottie load error", `HTTP ${res.status}`);
          return;
        }
        const data = await res.json();

        if (!destroyed && animRef.current) {
          anim = lottie.loadAnimation({
            container: animRef.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            animationData: data,
          });
          // piccolo hint al browser
          (animRef.current.style as any).willChange = "transform";
        }
      } catch (e) {
        safeError("Lottie load error", e);
      }
    })();

    return () => {
      destroyed = true;
      try {
        anim?.destroy();
      } catch {
        /* no-op */
      }
    };
  }, []);

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 mb-16 space-y-10">
        {/* logo */}
        <div className="mx-auto w-[160px] md:w-[220px] relative aspect-[3/1]">
          <Image
            src="/logo.svg"
            alt="KiloMistery"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* animazione */}
        <div
          ref={animRef}
          className="mx-auto w-[280px] md:w-[360px] h-[280px] md:h-[360px]"
        />

        {/* intro */}
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="section-title text-3xl md:text-4xl">
            Pesa il mistero,{" "}
            <span className="brand-text">spacchetta la sorpresa!</span>
          </h1>
          <p className="text-white/70">
            Standard o Premium? 1 kg o 10 kg? Decidi quanto emozionante sarà il
            tuo unboxing: ogni box è selezionata, sigillata e tracciata.
          </p>
          <p className="text-white/70">
            Ogni box non è solo una sorpresa: è anche un modo concreto per
            ridurre sprechi e CO₂, dando nuova vita a pacchi che altrimenti
            finirebbero nello smaltimento.
          </p>
        </header>

        {/* promo ruota */}
        <section className="card flex flex-col md:flex-row items-center gap-5">
          <div className="shrink-0 rounded-xl overflow-hidden border border-white/15 bg-white/10">
            <img
              src="/wheel/wheel.svg"
              alt="Ruota della fortuna"
              width={500}
              height={250}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-extrabold">Ruota della fortuna</h3>
            <p className="text-white/70">
              Con un ordine da <b>10 kg</b> ottieni <b>1 giro immediato</b>{" "}
              nella pagina di conferma (finestra <b>30 minuti</b>). Premi fino a{" "}
              <b>+2 kg</b> sullo stesso pacco.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <a href="#buy-standard-10" className="btn btn-silver">
              10 kg Standard
            </a>
            <a href="#buy-premium-10" className="btn btn-gold">
              10 kg Premium
            </a>
          </div>
        </section>

        {/* standard */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-silver-soft">Standard</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 5, 10].map((kg) => (
              <PackCard
                key={`std-${kg}`}
                kind="Standard"
                kg={kg as Kg}
                video={stdV(kg as Kg)}
              />
            ))}
          </div>
        </section>

        {/* premium */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-gold-soft">Premium</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 5, 10].map((kg) => (
              <PackCard
                key={`prm-${kg}`}
                kind="Premium"
                kg={kg as Kg}
                video={prmV(kg as Kg)}
              />
            ))}
          </div>
        </section>

        {/* policy */}
        <section id="policy" className="card">
          <h3 className="text-xl font-extrabold mb-2">Politica Resi</h3>
          <p className="text-white/70">
            Le box sono vendute come <b>mystery</b> sigillate: il reso non è
            previsto. In etichetta trovi peso, lotto e tracciabilità per la
            massima trasparenza.
          </p>
          <a
            href={`/${lang}/policy/returns`}
            className="btn btn-ghost mt-3 inline-flex"
          >
            Leggi la policy completa
          </a>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
