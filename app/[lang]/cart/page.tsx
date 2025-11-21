"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useCart } from "@/app/components/cart/CartProvider";
import { normalizeLang, Lang } from "@/i18n/lang";
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

// LOCK ruota – vale finché non passiamo dalla pagina di success
const WHEEL_LOCK_KEY = "km_wheel_can_play";

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
  | "upsellPrmCta"
  | "wheelBannerTitle"
  | "wheelBannerText"
  | "wheelPlayedText";

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

    wheelBannerTitle: "Ruota della fortuna",
    wheelBannerText:
      "🎡 Hai almeno 10 kg nel carrello: ottieni 1 giro alla ruota per vincere kg bonus 🎁 che aggiungiamo come nota al tuo ordine.",
    wheelPlayedText:
      "Hai già usato la ruota di recente da questo dispositivo. Il bonus 🎁 è già collegato al tuo ordine.",
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

    wheelBannerTitle: "Mystery Wheel",
    wheelBannerText:
      "🎡 You have at least 10 kg in your cart: you get 1 spin to win bonus kg 🎁 that we add as a note to your order.",
    wheelPlayedText:
      "You’ve already used the wheel recently on this device. The bonus 🎁 is already attached to your order.",
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

    wheelBannerTitle: "Ruleta de la suerte",
    wheelBannerText:
      "🎡 Tienes al menos 10 kg en el carrito: consigues 1 tirada para ganar kg extra 🎁 que añadimos como nota a tu pedido.",
    wheelPlayedText:
      "Ya has usado la ruleta recientemente desde este dispositivo. El bonus 🎁 ya está vinculado a tu pedido.",
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

    wheelBannerTitle: "Roue mystère",
    wheelBannerText:
      "🎡 Tu as au moins 10 kg dans ton panier : tu obtiens 1 tirage pour gagner des kg bonus 🎁 ajoutés en note à ta commande.",
    wheelPlayedText:
      "Tu as déjà utilisé la roue récemment sur cet appareil. Le bonus 🎁 est déjà lié à ta commande.",
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

    wheelBannerTitle: "Glücksrad",
    wheelBannerText:
      "🎡 Du hast mindestens 10 kg im Warenkorb: Du erhältst 1 Dreh, um Bonus-Kilos 🎁 zu gewinnen, die wir als Notiz zu deiner Bestellung hinzufügen.",
    wheelPlayedText:
      "Du hast das Rad kürzlich auf diesem Gerät schon benutzt. Der Bonus 🎁 ist bereits mit deiner Bestellung verknüpft.",
  },
};

export default function CartPage({ params }: { params: { lang: string } }) {
  const lang: Lang = normalizeLang(params?.lang);
  const { items, setQty, removeItem, subtotal, addItem } = useCart();
  const t = CART_COPY[lang] ?? CART_COPY.it;

  // Item principali: escludiamo gli upsell (id che iniziano con "upsell-")
  const mainItems = useMemo(
    () => items.filter((i) => !i.id.startsWith("upsell-")),
    [items]
  );

  const hasStdMain = mainItems.some((i) => i.tier === "Standard");
  const hasPrmMain = mainItems.some((i) => i.tier === "Premium");

  const hasStdUpsell = items.some((i) => i.id === "upsell-extra-std-1kg");
  const hasPrmUpsell = items.some((i) => i.id === "upsell-extra-prm-1kg");

  const showStdUpsell =
    hasStdMain && !hasStdUpsell && !!UPSELL_STD_1KG_SHOPIFY_ID;

  const showPrmUpsell =
    hasPrmMain && !hasPrmUpsell && !!UPSELL_PRM_1KG_SHOPIFY_ID;

  // === LOGICA RUOTA ===
  const [hasPlayedWheel, setHasPlayedWheel] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [wheelBonusKg, setWheelBonusKg] = useState(0);

  // kg totali eleggibili per la ruota (solo main items)
  const totalEligibleKg = useMemo(
    () =>
      mainItems.reduce(
        (sum, item) => sum + (item.weightKg || 0) * item.qty,
        0
      ),
    [mainItems]
  );

  // leggo il lock da localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(WHEEL_LOCK_KEY);
      if (raw === "played") {
        setHasPlayedWheel(true);
      }
    } catch (e) {
      console.error("wheel lock read error", e);
    }
  }, []);

  // apro automaticamente la ruota se:
  // - non ha già giocato (per questo ordine)
  // - ha almeno 10 kg nel carrello
  useEffect(() => {
    if (hasPlayedWheel) return;
    if (totalEligibleKg < 10) return;
    if (items.length === 0) return;

    setShowWheel(true);
  }, [hasPlayedWheel, totalEligibleKg, items.length]);

  const handleWheelFinish = (bonusKg: number) => {
    setWheelBonusKg(bonusKg);
    setHasPlayedWheel(true);
    setShowWheel(false);

    try {
      if (typeof window !== "undefined") {
        // da questo momento la ruota è "consumata" per questo device
        // fino a quando la pagina di success non resetta il flag
        window.localStorage.setItem(WHEEL_LOCK_KEY, "played");
      }
    } catch (e) {
      console.error("wheel lock write error", e);
    }
  };

  function goToCheckout() {
    if (items.length === 0) return;

    const base = "https://shop.kilomystery.com/cart/";
    const cartPart = items
      .map((i) => `${i.shopifyId}:${i.qty}`)
      .join(",");

    const url = new URL(base + cartPart);
    url.searchParams.set("locale", lang);

    // se c'è un bonus dalla ruota, lo passo come nota
    if (wheelBonusKg > 0) {
      url.searchParams.set(
        "note",
        `🎁 Bonus ruota: ${wheelBonusKg.toFixed(2)} kg`
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
            {/* Banner ruota sopra il carrello */}
            {totalEligibleKg >= 10 && (
              <section className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎡</span>
                    <h2 className="font-bold text-emerald-100">
                      {t.wheelBannerTitle}
                    </h2>
                  </div>
                  {wheelBonusKg > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/60 text-emerald-100">
                      🎁 Bonus: +{wheelBonusKg.toFixed(2)} kg
                    </span>
                  )}
                </div>

                <p className="text-white/80 text-xs md:text-sm">
                  {hasPlayedWheel ? t.wheelPlayedText : t.wheelBannerText}
                </p>
              </section>
            )}

            {/* Lista items */}
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
                          onClick={() =>
                            setQty(item.id, Math.max(1, item.qty - 1))
                          }
                        >
                          −
                        </button>
                        <span className="px-3 font-semibold">
                          {item.qty}
                        </span>
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

            <div className="border-t border-white/10 pt-4 flex justify-between items-center gap-3">
              <div className="flex flex-col text-xs text-white/60">
                <span>{t.total}</span>
                {wheelBonusKg > 0 && (
                  <span className="text-emerald-300">
                    🎁 Bonus ruota: +{wheelBonusKg.toFixed(2)} kg (in nota
                    ordine)
                  </span>
                )}
              </div>
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

      {/* MODALE RUOTA – solo se showWheel true */}
      {showWheel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-3 py-6">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#020617] shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-2 py-1 text-sm text-white/80 hover:bg-black"
              onClick={() => setShowWheel(false)}
            >
              ✕
            </button>
            <SpinWheel
              lang={lang}
              onFinish={handleWheelFinish}
              showBackToShopButton={false}
            />
          </div>
        </div>
      )}

      <Footer lang={lang} />
    </>
  );
}
