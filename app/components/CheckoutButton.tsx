"use client";

import { useState } from "react";
import { useCart } from "@/app/components/cart/CartProvider";

// (opzionale) GA4 begin_checkout
import { gaBeginCheckout } from "@/app/lib/ga";

type Props = {
  lang?: string;
  wheelBonusKg?: number; // <-- passalo se hai la ruota in pagina cart
};

export default function CheckoutButton({
  lang = "it",
  wheelBonusKg = 0,
}: Props) {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);

  async function goCheckout() {
    if (!items?.length || loading) return;

    // ✅ FIX: filtra item validi (shopifyId + qty >= 1)
    const validItems = (items as any[]).filter((i) => {
      const hasId = !!i?.shopifyId;
      const qty = Number(i?.qty ?? 0) || 0;
      return hasId && qty >= 1;
    });

    if (!validItems.length) {
      console.error("Checkout blocked: all items invalid", items);
      alert("Errore carrello: prodotti non validi (manca shopifyId).");
      return;
    }

    setLoading(true);

    try {
      // ✅ totale kg robusto
      const totalKg = validItems.reduce((s: number, i: any) => {
        const w = Number(i?.weightKg ?? i?.kg ?? 0) || 0;
        const q = Number(i?.qty ?? 1) || 1;
        return s + w * q;
      }, 0);

      // ✅ returnUrl nella lingua corretta
      const returnUrl = `${window.location.origin}/${lang}/reward`;

      // ✅ query string corrente (serve per passare _gl / utm / gclid al checkout)
      const originQuery = window.location.search || "";

      // ✅ nota ruota (la route la salva in cartAttributes e NON rompe nulla)
      const bonus = Number(wheelBonusKg || 0);
      const orderNote = bonus > 0 ? `🎁 Bonus ruota: ${bonus.toFixed(2)} kg` : "";

      // (OPZIONALE) GA4 begin_checkout prima del redirect
      // Se lo fai già altrove, puoi rimuovere questa chiamata.
      gaBeginCheckout(validItems as any, {
        checkout_flow: "storefront_api",
        locale: lang,
        wheel_bonus_kg: bonus > 0 ? Number(bonus.toFixed(2)) : 0,
      });

      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: validItems, // ✅ FIX: inviamo solo item validi
          totalKg,
          returnUrl,
          lang,
          originQuery,
          orderNote,
        }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      console.error("Checkout create error:", data);

      // ✅ messaggio più utile se la route ritorna error/code
      const msg =
        typeof data?.message === "string"
          ? data.message
          : typeof data?.error === "string"
          ? data.error
          : "Errore avvio checkout";

      alert(msg);
      setLoading(false);
    } catch (e) {
      console.error("Checkout error:", e);
      alert("Errore avvio checkout");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={goCheckout}
      disabled={loading}
      className="btn btn-brand w-full"
    >
      {loading ? "Redirect…" : "Procedi al Checkout"}
    </button>
  );
}
