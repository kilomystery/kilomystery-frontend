"use client";

import { useState } from "react";
import { useCart } from "@/app/components/cart/CartProvider";
import { gaBeginCheckout } from "@/app/lib/ga";

declare global {
  interface Window {
    ttq?: any;
    __tiktokConsentGranted?: boolean;
  }
}

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

      // GA
      gaBeginCheckout(items as any, {
        checkout_flow: "storefront_api",
        locale: lang,
        wheel_bonus_kg: bonus > 0 ? Number(bonus.toFixed(2)) : 0,
      });

      // ✅ TikTok InitiateCheckout (prima del redirect)
      if (window.__tiktokConsentGranted && window.ttq) {
        const cartTotal = items.reduce((sum: number, i: any) => {
          const perKg = Number(i?.pricePerKg ?? 0) || 0;
          const w = Number(i?.weightKg ?? i?.kg ?? 0) || 0;
          const q = Number(i?.qty ?? 0) || 0;
          // valore stimato: prezzoPerKg * kg * qty
          return sum + perKg * w * q;
        }, 0);

        window.ttq.track("InitiateCheckout", {
          contents: items.map((i: any) => {
            const w = Number(i?.weightKg ?? i?.kg ?? 0) || 0;
            const q = Number(i?.qty ?? 0) || 0;
            const perKg = Number(i?.pricePerKg ?? 0) || 0;
            const price = perKg * w; // prezzo “unitario” della riga (1 box)
            return {
              content_id: String(i?.shopifyId ?? i?.id ?? ""),
              content_type: "product",
              content_name: String(i?.title ?? ""),
              price: Number(price.toFixed(2)),
              num_items: q,
            };
          }),
          value: Number(cartTotal.toFixed(2)),
          currency: "EUR",
        });
      }

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
