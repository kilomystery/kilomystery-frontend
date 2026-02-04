"use client";

import { useState } from "react";
import { useCart } from "@/app/components/cart/CartProvider";

// Se vuoi tracciare begin_checkout anche qui (opzionale):
import { gaBeginCheckout } from "@/app/lib/ga";

type Props = {
  lang?: string;
  wheelBonusKg?: number; // <-- passalo se hai la ruota in pagina cart
};

export default function CheckoutButton({ lang = "it", wheelBonusKg = 0 }: Props) {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);

  async function goCheckout() {
    if (!items?.length || loading) return;

    setLoading(true);

    try {
      // totale kg robusto
      const totalKg = items.reduce((s: number, i: any) => {
        const w = Number(i?.weightKg ?? 0) || 0;
        const q = Number(i?.qty ?? 0) || 0;
        return s + w * q;
      }, 0);

      // ✅ returnUrl nella lingua corretta
      const returnUrl = `${window.location.origin}/${lang}/reward`;

      // ✅ query string corrente (serve per passare _gl / utm / gclid al checkout)
      const originQuery = window.location.search || "";

      // ✅ nota ruota (finisce davvero nell'ordine perché la route la mette in checkoutUrl note=)
      const bonus = Number(wheelBonusKg || 0);
      const orderNote =
        bonus > 0 ? `🎁 Bonus ruota: ${bonus.toFixed(2)} kg` : "";

      // (OPZIONALE) GA4 begin_checkout prima del redirect
      // Se lo fai già nel cart (goToCheckout) puoi anche rimuoverlo qui.
      gaBeginCheckout(items as any, {
        checkout_flow: "storefront_api",
        locale: lang,
        wheel_bonus_kg: bonus > 0 ? Number(bonus.toFixed(2)) : 0,
      });

      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
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
      alert("Errore avvio checkout");
      setLoading(false);
    } catch (e) {
      console.error("Checkout error:", e);
      alert("Errore avvio checkout");
      setLoading(false);
    }
  }

  return (
    <button onClick={goCheckout} disabled={loading} className="btn-brand w-full">
      {loading ? "Redirect…" : "Procedi al Checkout"}
    </button>
  );
}
