"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useCart } from "@/app/components/cart/CartProvider";
import { normalizeLang, Lang } from "@/i18n/lang";
import { useEffect, useState } from "react";
import SpinWheel from "@/app/components/SpinWheel";

// === UPSSELL: COSTANTI CON ID REALI ===

// Variante Shopify per "Extra 1kg Standard (Upsell)"
const UPSELL_STD_1KG_SHOPIFY_ID = "52089042567506";
// Variante Shopify per "Extra 1kg Premium (Upsell)"
const UPSELL_PRM_1KG_SHOPIFY_ID = "52089042993490";

// Prezzi TOTALI (devono coincidere con Shopify)
const UPSELL_STD_1KG_TOTAL = 14.9; // 14,90 €
const UPSELL_PRM_1KG_TOTAL = 16.9; // 16,90 €

const UPSELL_STD_WEIGHT_KG = 1;
const UPSELL_PRM_WEIGHT_KG = 1;

// 🔸 lock ruota: quanto tempo deve passare prima di poter rigiocare
const WHEEL_LOCK_MS = 12 * 60 * 60 * 1000; // 12 ore

type CartCopyKey =
  | "title"
  | "empty"
  | "total"
  | "remove"
  | "goCheckout"
  | "qtyLabel"
  | "upsellSectionTitle"
  | "upsellSectionDesc"
  | "upsellStdTitle"
  | "upsellStdDesc"
  | "upsellStdCta"
  | "upsellPrmTitle"
  | "upsellPrmDesc"
  | "upsellPrmCta";

type CartCopyPerLang = Record<CartCopyKey, string>;

const CART_COPY: Record<Lang, CartCopyPerLang> = {
  it: {
    title: "Carrello",
    empty: "Il tuo carrello è vuoto.",
    total: "Totale",
    remove: "Rimuovi",
    goCheckout: "Vai al checkout",
    qtyLabel: "Quantità",

    upsellSectionTitle: "Aggiungi più mistero",
    upsellSectionDesc:
      "Puoi aggiungere 1 kg extra Standard o Premium in base alla box che hai scelto, a prezzo scontato.",
    upsellStdTitle: "+1 kg extra Standard",
    upsellStdDesc:
      "Aggiungi 1 kg extra Standard a prezzo speciale e aumenta il peso del tuo lotto.",
    upsellStdCta: "Aggiungi 1 kg Standard",
    upsellPrmTitle: "+1 kg extra Premium",
    upsellPrmDesc:
      "Aggiungi 1 kg extra Premium per una selezione ancora più spinta.",
    upsellPrmCta: "Aggiungi 1 kg Premium",
  },
  en: {
    title: "Cart",
    empty: "Your cart is empty.",
    total: "Total",
    remove: "Remove",
    goCheckout: "Go to checkout",
    qtyLabel: "Quantity",

    upsellSectionTitle: "Add more mystery",
    upsellSectionDesc:
      "You can add 1 extra kg (Standard or Premium) based on what you selected, at a discounted price.",
    upsellStdTitle: "+1 kg extra Standard",
    upsellStdDesc:
      "Add 1 extra Standard kg at a special price and increase your batch weight.",
    upsellStdCta: "Add 1 kg Standard",
    upsellPrmTitle: "+1 kg extra Premium",
    upsellPrmDesc:
      "Add 1 extra Premium kg for an even stronger selection.",
    upsellPrmCta: "Add 1 kg Premium",
  },
  es: {
    title: "Carrito",
    empty: "Tu carrito está vacío.",
    total: "Total",
    remove: "Eliminar",
    goCheckout: "Ir al checkout",
    qtyLabel: "Cantidad",

    upsellSectionTitle: "Añade más misterio",
    upsellSectionDesc:
      "Puedes añadir 1 kg extra Standard o Premium según la box que has elegido, con precio reducido.",
    upsellStdTitle: "+1 kg extra Standard",
    upsellStdDesc:
      "Añade 1 kg extra Standard a precio especial y aumenta el peso de tu lote.",
    upsellStdCta: "Añadir 1 kg Standard",
    upsellPrmTitle: "+1 kg extra Premium",
    upsellPrmDesc:
      "Añade 1 kg extra Premium para una selección aún más potente.",
    upsellPrmCta: "Añadir 1 kg Premium",
  },
  fr: {
    title: "Panier",
    empty: "Ton panier est vide.",
    total: "Total",
    remove: "Supprimer",
    goCheckout: "Aller au checkout",
    qtyLabel: "Quantité",

    upsellSectionTitle: "Ajoute plus de mystère",
    upsellSectionDesc:
      "Tu peux ajouter 1 kg supplémentaire Standard ou Premium selon la box choisie, à prix remisé.",
    upsellStdTitle: "+1 kg extra Standard",
    upsellStdDesc:
      "Ajoute 1 kg Standard supplémentaire à prix spécial et augmente le poids de ton lot.",
    upsellStdCta: "Ajouter 1 kg Standard",
    upsellPrmTitle: "+1 kg extra Premium",
    upsellPrmDesc:
      "Ajoute 1 kg Premium supplémentaire pour une sélection encore plus poussée.",
    upsellPrmCta: "Ajouter 1 kg Premium",
  },
  de: {
    title: "Warenkorb",
    empty: "Dein Warenkorb ist leer.",
    total: "Gesamt",
    remove: "Entfernen",
    goCheckout: "Zum Checkout",
    qtyLabel: "Menge",

    upsellSectionTitle: "Mehr Mystery hinzufügen",
    upsellSectionDesc:
      "Du kannst 1 kg extra Standard oder Premium hinzufügen – je nach gewählter Box, zum reduzierten Preis.",
    upsellStdTitle: "+1 kg extra Standard",
    upsellStdDesc:
      "Füge 1 kg Standard extra zum Spezialpreis hinzu und erhöhe das Gewicht deines Postens.",
    upsellStdCta: "1 kg Standard hinzufügen",
    upsellPrmTitle: "+1 kg extra Premium",
    upsellPrmDesc:
      "Füge 1 kg Premium extra hinzu für eine noch hochwertigere Auswahl.",
    upsellPrmCta: "1 kg Premium hinzufügen",
  },
};

export default function CartPage({ params }: { params: { lang: string } }) {
  const lang: Lang = normalizeLang(params?.lang);
  const { items, setQty, removeItem, subtotal, addItem } = useCart();
  const t = CART_COPY[lang] ?? CART_COPY.it;

  // peso totale in kg
  const totalKg = items.reduce(
    (sum, i) => sum + i.weightKg * i.qty,
    0
  );

  // ruota & bonus
  const [showWheel, setShowWheel] = useState(false);
  const [hasPlayedWheel, setHasPlayedWheel] = useState(false);
  const [bonusKg, setBonusKg] = useState(0);

  // Item principali: escludiamo gli upsell (id che iniziano con "upsell-")
  const mainItems = items.filter((i) => !i.id.startsWith("upsell-"));

  const hasStdMain = mainItems.some((i) => i.tier === "Standard");
  const hasPrmMain = mainItems.some((i) => i.tier === "Premium");

  const hasStdUpsell = items.some((i) => i.id === "upsell-extra-std-1kg");
  const hasPrmUpsell = items.some((i) => i.id === "upsell-extra-prm-1kg");

  const showStdUpsell =
    hasStdMain && !hasStdUpsell && !!UPSELL_STD_1KG_SHOPIFY_ID;

  const showPrmUpsell =
    hasPrmMain && !hasPrmUpsell && !!UPSELL_PRM_1KG_SHOPIFY_ID;

  // 🔸 NUOVO: leggi da localStorage se ha già giocato di recente
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("km_wheel_last_play");
      if (!raw) return;
      const ts = Number(raw);
      if (Number.isNaN(ts)) return;
      const diff = Date.now() - ts;
      if (diff < WHEEL_LOCK_MS) {
        setHasPlayedWheel(true);
      }
    } catch (e) {
      console.error("km wheel localStorage read error", e);
    }
  }, []);

  // apri ruota quando ci sono almeno 10kg e non hai ancora giocato
  useEffect(() => {
    if (items.length === 0) return;
    if (totalKg >= 10 && !hasPlayedWheel) {
      setShowWheel(true);
    }
  }, [totalKg, hasPlayedWheel, items.length]);

  function handleWheelFinish(bonus: number) {
    setHasPlayedWheel(true);
    setBonusKg(bonus || 0);
    setShowWheel(false);

    // 🔸 NUOVO: salva timestamp per bloccare reroll per un po'
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          "km_wheel_last_play",
          String(Date.now())
        );
      } catch (e) {
        console.error("km wheel localStorage write error", e);
      }
    }
  }

  function goToCheckout() {
    if (items.length === 0) return;

    const base = "https://shop.kilomystery.com/cart/";
    const cartPart = items
      .map((i) => `${i.shopifyId}:${i.qty}`)
      .join(",");

    const url = new URL(base + cartPart);
    url.searchParams.set("locale", lang);

    if (bonusKg > 0) {
      url.searchParams.set(
        "note",
        `Bonus ruota: ${bonusKg.toFixed(2)} kg`
      );
    }

    window.location.href = url.toString();
  }

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-8">
        <h1 className="text-3xl font-extrabold mb-4">{t.title}</h1>

        {items.length === 0 ? (
          <p className="text-white/70">{t.empty}</p>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl"
                >
                  <div className="w-24 h-24 bg-black/40 rounded-xl overflow-hidden border border-white/10">
                    {item.image ? (
                      <video
                        src={item.image}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white/40">
                        KM
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold">{item.title}</h2>
                        <p className="text-white/70 text-sm">
                          {item.tier} · {item.weightKg} kg
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {(
                            item.pricePerKg *
                            item.weightKg *
                            item.qty
                          ).toFixed(2)}{" "}
                          €
                        </div>
                        <div className="text-xs text-white/60">
                          {(item.pricePerKg * item.weightKg).toFixed(2)} € /
                          box
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex rounded-full border border-white/20 bg-white/10 overflow-hidden text-sm">
                        <span className="px-3 py-1 text-white/60">
                          {t.qtyLabel}
                        </span>
                        <button
                          className="px-3 py-1"
                          onClick={() => setQty(item.id, item.qty - 1)}
                        >
                          −
                        </button>
                        <span className="px-3 font-semibold">{item.qty}</span>
                        <button
                          className="px-3 py-1"
                          onClick={() => setQty(item.id, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="text-xs text-rose-400"
                        onClick={() => removeItem(item.id)}
                      >
                        {t.remove}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SEZIONE MINI UPSELL EXTRA KG STANDARD/PREMIUM */}
            {(showStdUpsell || showPrmUpsell) && (
              <section className="mt-4 space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <h2 className="text-xs font-bold uppercase tracking-[.15em] text-emerald-300">
                  {t.upsellSectionTitle}
                </h2>
                <p className="text-xs text-white/70 mb-1">
                  {t.upsellSectionDesc}
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  {showStdUpsell && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">
                            {t.upsellStdTitle}
                          </p>
                          <p className="text-white/60 text-[0.7rem]">
                            {UPSELL_STD_WEIGHT_KG} kg ·{" "}
                            {UPSELL_STD_1KG_TOTAL.toFixed(2)} € totali
                          </p>
                        </div>
                        <div className="text-right text-sm font-bold">
                          {UPSELL_STD_1KG_TOTAL.toFixed(2)} €
                        </div>
                      </div>
                      <p className="text-xs text-white/70">
                        {t.upsellStdDesc}
                      </p>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm self-start"
                        onClick={() =>
                          addItem({
                            id: "upsell-extra-std-1kg",
                            title: t.upsellStdTitle,
                            tier: "Standard",
                            weightKg: UPSELL_STD_WEIGHT_KG,
                            pricePerKg:
                              UPSELL_STD_1KG_TOTAL / UPSELL_STD_WEIGHT_KG,
                            shopifyId: UPSELL_STD_1KG_SHOPIFY_ID,
                            qty: 1,
                          })
                        }
                      >
                        {t.upsellStdCta}
                      </button>
                    </div>
                  )}

                  {showPrmUpsell && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">
                            {t.upsellPrmTitle}
                          </p>
                          <p className="text-white/60 text-[0.7rem]">
                            {UPSELL_PRM_WEIGHT_KG} kg ·{" "}
                            {UPSELL_PRM_1KG_TOTAL.toFixed(2)} € totali
                          </p>
                        </div>
                        <div className="text-right text-sm font-bold">
                          {UPSELL_PRM_1KG_TOTAL.toFixed(2)} €
                        </div>
                      </div>
                      <p className="text-xs text-white/70">
                        {t.upsellPrmDesc}
                      </p>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm self-start"
                        onClick={() =>
                          addItem({
                            id: "upsell-extra-prm-1kg",
                            title: t.upsellPrmTitle,
                            tier: "Premium",
                            weightKg: UPSELL_PRM_WEIGHT_KG,
                            pricePerKg:
                              UPSELL_PRM_1KG_TOTAL / UPSELL_PRM_WEIGHT_KG,
                            shopifyId: UPSELL_PRM_1KG_SHOPIFY_ID,
                            qty: 1,
                          })
                        }
                      >
                        {t.upsellPrmCta}
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* box con kg bonus se vinti */}
            {bonusKg > 0 && (
              <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
                🎁 Hai vinto <b>{bonusKg.toFixed(2)} kg</b> extra con la
                ruota della fortuna! Verranno aggiunti al tuo ordine
                come bonus (annotati nella nota dell&apos;ordine).
              </div>
            )}

            <div className="border-t border-white/10 pt-4 flex justify-between">
              <div className="text-white/60">{t.total}</div>
              <div className="text-2xl font-extrabold">
                {subtotal.toFixed(2)} €
              </div>
            </div>

            <button
              className="btn btn-brand px-6 py-3"
              onClick={goToCheckout}
            >
              {t.goCheckout}
            </button>
          </>
        )}
      </main>

      <Footer lang={lang} />

      {/* modale con la ruota */}
      {showWheel && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto border border-white/10">
            <SpinWheel
              lang={lang}
              showBackToShopButton={false}
              onFinish={handleWheelFinish}
            />
          </div>
        </div>
      )}
    </>
  );
}
