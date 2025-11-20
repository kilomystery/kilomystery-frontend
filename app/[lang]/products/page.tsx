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
      {/* badge piccolo sopra */}
      <div className="flex items-center justify-between mb-2 text-[0.7rem] uppercase tracking-[.15em] text-white/60">
        <span>
          {isStd ? "Perfetta per iniziare" : "Per chi vuole il massimo"}
        </span>
        <span className="pill pill--std">
          {kg} kg · {isStd ? "Standard" : "Premium"}
        </span>
      </div>

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
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h4 className="product-title text-xl">
          {kind} <span className="dot" /> {kg} kg
        </h4>

        <div className="text-right space-y-1">
          <div
            className={`price-figure ${
              isStd ? "price-figure--std" : "price-figure--prm"
            } text-3xl`}
          >
            {euro(total)}
          </div>
          <div className="price-perkg">({ppk.toFixed(2)} €/kg)</div>
          <div className="text-[0.7rem] text-emerald-200/90">
            ♻ {co2ByKg[kg]}
          </div>
        </div>
      </div>

      <ul className="bullets mt-3 space-y-1">
        <li>Contenuto misto e misterioso da lotti reali.</li>
        <li>Peso netto con tolleranza ±3% su ogni box.</li>
        <li>Sigillo con ID lotto e data di preparazione.</li>
        <li>Nessun prodotto illegale o vietato.</li>
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
        {/* LOGO + HERO */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="mx-auto w-[160px] md:w-[220px] relative aspect-[3/1]">
            <Image
              src="/logo.svg"
              alt="KiloMystery"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div
            ref={animRef}
            className="mx-auto w-[280px] md:w-[360px] h-[220px] md:h-[260px]"
          />

          <header className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
                Pesa il mistero
              </span>{" "}
              <span className="brand-text">e spacchetta la sorpresa</span>
            </h1>
            <p className="text-white/70">
              Standard o Premium, da 1 a 10 kg: decidi quanto intensa sarà la
              tua sessione di unboxing. Ogni box è selezionata, sigillata e
              collegata a un lotto reale.
            </p>
            <p className="text-white/70">
              Non vendiamo “valore garantito”, ma un&apos;esperienza di sorpresa
              che recupera pacchi esistenti e riduce sprechi e CO₂ lungo la
              filiera.
            </p>
          </header>
        </section>

        {/* STRIP TRUST (spedizione / pagamenti / assistenza) */}
        <section className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="card p-3 space-y-1">
            <p className="text-xs uppercase tracking-[.16em] text-emerald-300/80">
              🚚 Spedizione
            </p>
            <p className="text-white/80">
              Spediamo in tutta Italia con tracking attivo e tempi medi di 24–72h.
            </p>
          </div>
          <div className="card p-3 space-y-1">
            <p className="text-xs uppercase tracking-[.16em] text-emerald-300/80">
              💳 Pagamenti sicuri
            </p>
            <p className="text-white/80">
              Paghi tramite provider affidabili, con riepilogo completo via email.
            </p>
          </div>
          <div className="card p-3 space-y-1">
            <p className="text-xs uppercase tracking-[.16em] text-emerald-300/80">
              🤝 Assistenza
            </p>
            <p className="text-white/80">
              Supporto diretto via email: nessun call center impersonale.
            </p>
          </div>
        </section>

        {/* Sezione prodotti Standard */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-extrabold text-silver-soft">
              Standard
            </h2>
            <p className="text-xs text-white/60 max-w-md">
              Ideale per chi vuole provare l&apos;esperienza KiloMystery con un
              mix bilanciato di prodotti e prezzo.
            </p>
          </div>

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

        {/* Sezione prodotti Premium */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-extrabold text-gold-soft">
              Premium
            </h2>
            <p className="text-xs text-white/60 max-w-md">
              Per chi cerca un mix più spinto: lotti selezionati e maggiore
              probabilità di articoli di fascia medio–alta.
            </p>
          </div>

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

        {/* INFO EXTRA ISPIRATE ALLO STILE KING-COLIS (MA RISCRITTE) */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="card p-4 space-y-2">
            <h3 className="font-bold text-emerald-200 text-sm">
              🎁 Cosa puoi trovare nelle box
            </h3>
            <p className="text-white/70 text-sm">
              Mix di categorie: tech, casa, accessori, piccoli elettrodomestici,
              tempo libero, articoli per ufficio, gadget e altro ancora. La
              composizione varia in base ai lotti disponibili.
            </p>
          </div>

          <div className="card p-4 space-y-2">
            <h3 className="font-bold text-emerald-200 text-sm">
              🧩 Stato dei prodotti
            </h3>
            <p className="text-white/70 text-sm">
              I prodotti possono essere nuovi, usati o ricondizionati. Possono
              avere difetti estetici o packaging danneggiato. Lo stato non è
              garantito come “pari al nuovo”.
            </p>
          </div>

          <div className="card p-4 space-y-2">
            <h3 className="font-bold text-emerald-200 text-sm">
              🚫 Cosa non troverai
            </h3>
            <p className="text-white/70 text-sm">
              Non inseriamo prodotti illegali, pericolosi, alimenti aperti o
              articoli che non rispettano le normative vigenti.
            </p>
          </div>
        </section>

        {/* POLICY RESI */}
        <section id="policy" className="card">
          <h3 className="text-xl font-extrabold mb-2">Politica resi</h3>
          <p className="text-white/70 text-sm md:text-base">
            Le box sono vendute come mystery sigillate: il reso non è previsto,
            perché il contenuto è per definizione non conosciuto in anticipo.
            In etichetta trovi peso, lotto e tracciabilità per la massima
            trasparenza.
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
