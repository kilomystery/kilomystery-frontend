"use client";

import { useState } from "react";
import { useCart } from "@/app/components/cart/CartProvider";
import { gaBeginCheckout } from "@/app/lib/ga";

type Props = {
  lang?: string;
  wheelBonusKg?: number;
};

export default function CheckoutButton({ lang = "it", wheelBonusKg = 0 }: Props) {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);

  async function goCheckout() {
    if (!items?.length || loading) return;

    setLoading(true);

    try {
      const totalKg = items.reduce((s: number, i: any) => {
        const w = Number(i?.weightKg ?? i?.kg ?? 0) || 0;
        const q = Number(i?.qty ?? 0) || 0;
        return s + w * q;
      }, 0);

      const returnUrl = `${window.location.origin}/${lang}/reward`;
      const originQuery = window.location.search || "";

      const bonus = Number(wheelBonusKg || 0);
      const orderNote = bonus > 0 ? `🎁 Bonus ruota: ${bonus.toFixed(2)} kg` : "";

      // GA (se già lo fai altrove puoi anche toglierlo)
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

      let data: any = null;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { rawText: text };
      }

      // ✅ DEBUG: qui vedi il vero motivo
      if (!res.ok || !data?.url) {
        console.error("❌ Checkout create failed", {
          status: res.status,
          data,
          items,
        });

        alert(
          `Checkout error\nHTTP: ${res.status}\n` +
            `${data?.code ? `code: ${data.code}\n` : ""}` +
            `${data?.message ? `message: ${data.message}\n` : ""}` +
            `${data?.error ? `error: ${data.error}\n` : ""}` +
            `\nGuarda Console (F12) per dettagli.`
        );

        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (e: any) {
      console.error("❌ Checkout exception", e);
      alert(`Errore avvio checkout (exception): ${e?.message || e}`);
      setLoading(false);
    }
  }

  return (
    <button onClick={goCheckout} disabled={loading} className="btn btn-brand w-full">
      {loading ? "Redirect…" : "Procedi al Checkout"}
    </button>
  );
}
