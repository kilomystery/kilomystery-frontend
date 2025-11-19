"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../components/cart/CartProvider";
import { Lang, normalizeLang } from "@/i18n/lang";

type Kg = 1 | 2 | 3 | 5 | 10;

const stdV = (kg: Kg) => `/videos/packs/std-${kg}.mp4`;
const prmV = (kg: Kg) => `/videos/packs/prm-${kg}.mp4`;

function pricePerKg(kind: "Standard" | "Premium", kg: Kg) {
  if (kind === "Premium") return kg <= 3 ? 25.99 : 20.99;
  return kg <= 3 ? 19.9 : 17.99;
}

const euro = (n: number) =>
  n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

const co2ByKg: Record<Kg, string> = {
  1: "≈0,25 kg di CO₂ evitati",
  2: "≈0,5 kg di CO₂ evitati",
  3: "≈0,75 kg di CO₂ evitati",
  5: "≈1,25 kg di CO₂ evitati",
  10: "≈2,5 kg di CO₂ evitati",
};

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
  console.error(`${label}: ${msg}`);
}

const VARIANT_IDS: Record<"Standard" | "Premium", Record<Kg, string>> = {
  Standard: {
    1: "52045370360146",
    2: "52045370392914",
    3: "52045370425682",
    5: "52045370458450",
    10: "52045370491218",
  },
  Premium: {
    1: "52045402571090",
    2: "52045402603858",
    3: "52045402636626",
    5: "52045402669394",
    10: "52045402702162",
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
  const { addItem } = useCart();

  const ppk = pricePerKg(kind, kg);
  const total = +(ppk * kg).toFixed(2);
  const isStd = kind === "Standard";
  const anchorId = kg === 10 ? `buy-${kind.toLowerCase()}-10` : undefined;
  const variantId = VARIANT_IDS[kind][kg];

  function handleAddToCart() {
    addItem({
      id: `${kind}-${kg}`,
      shopifyId: variantId,
      title: `${kind} · ${kg} kg`,
      kg,
      kind,
      price: total,
      image: `/videos/packs/${isStd ? "std" : "prm"}-${kg}.mp4`,
      qty: 1,
    });
  }

  return (
    <article
      className={`card ${isStd ? "card--standard" : "card--premium"}`}
      id={anchorId}
    >
      <div
        className={`media-wrap ${isStd ? "media-wrap--std" : "media-wrap--prm"}`}
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
      </div>

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

      <ul className="bullets mt-3 space-y-1">
        <li>Contenuto misto – sorpresa</li>
        <li>Peso netto (toll. ±3%)</li>
        <li>Sigillo con ID lotto e data</li>
        <li>{co2ByKg[kg]}</li>
      </ul>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`btn w-full ${isStd ? "btn-silver" : "btn-gold"}`}
        >
          Aggiungi al carrello
        </button>
      </div>
    </article>
  );
}

export default function ProductsPage({ params }: { params: { lang: string } }) {
  const lang: Lang = normalizeLang(params?.lang);
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
      } catch {}
    };
  }, []);

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 mb-16 space-y-10">
        <div className="mx-auto w-[160px] md:w-[220px] relative aspect-[3/1]">
          <Image
            src="/logo.svg"
            alt="KiloMistery"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div
          ref={animRef}
          className="mx-auto w-[280px] md:w-[360px] h-[280px] md:h-[360px]"
        />

        <header className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="section-title text-3xl md:text-4xl">
            Pesa il mistero, <span className="brand-text">spacchetta la sorpresa!</span>
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

        {/* Sezione prodotti Standard */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-silver-soft">Standard</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 5, 10].map(kg => (
              <PackCard
                key={`std-${kg}`}
                kind="Standard"
                kg={kg as Kg}
                video={stdV(kg as Kg)}
              />
            ))}
          </div>
        </section>

        {/* Sezione prodotti Premium */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-gold-soft">Premium</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 5, 10].map(kg => (
              <PackCard
                key={`prm-${kg}`}
                kind="Premium"
                kg={kg as Kg}
                video={prmV(kg as Kg)}
              />
            ))}
          </div>
        </section>

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
