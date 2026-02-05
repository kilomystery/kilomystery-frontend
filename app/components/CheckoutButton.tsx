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

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : "";
}

function hasConsent(): boolean {
  // prima usa il flag runtime (se esiste)
  if (typeof window !== "undefined" && typeof window.__tiktokConsentGranted === "boolean") {
    return window.__tiktokConsentGranted;
  }

  // fallback cookie
  const c = readCookie("km_cookie_consent");
  if (c === "accept") return true;
  if (c === "reject") return false;

  // fallback localStorage
  try {
    const ls = localStorage.getItem("km-cookie-consent");
    if (ls === "accept") return true;
    if (ls === "reject") return false;
  } catch {}

  // default: niente consenso
  return false;
}

async function waitForTTQ(timeoutMs = 1500): Promise<any | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (typeof window !== "undefined" && window.ttq?.track) return window.ttq;
    await new Promise((r) => setTimeout(r, 50));
  }
  return null;
}

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

      // ✅ GA
      gaBeginCheckout(items as any, {
        checkout_flow: "storefront_api",
        locale: lang,
        wheel_bonus_kg: bonus > 0 ? Number(bonus.toFixed(2)) : 0,
      });

      // ✅ TikTok InitiateCheckout (robusto: consenso + attesa breve TTQ)
      if (hasConsent()) {
        const cartTotal = items.reduce((sum: number, i: any) => {
          const perKg = Number(i?.pricePerKg ?? 0) || 0;
          const w = Number(i?.weightKg ?? i?.kg ?? 0) || 0;
          const q = Number(i?.qty ?? 0) || 0;
          return sum + perKg * w * q;
        }, 0);

        const payload = {
          contents: items.map((i: any) => {
            const w = Number(i?.weightKg ?? i?.kg ?? 0) || 0;
            const q = Number(i?.qty ?? 0) || 0;
            const perKg = Number(i?.pricePerKg ?? 0) || 0;
            const price = perKg * w; // prezzo “unitario” per box (una riga)
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
        };

        // TTQ potrebbe arrivare dopo (tu lo carichi idle). Aspetta un attimo.
        const ttq = window.ttq?.track ? window.ttq : await waitForTTQ(1500);
        if (ttq?.track) {
          ttq.track("InitiateCheckout", payload);
        } else {
          // non bloccare il checkout: logga e basta
          console.warn("TikTok ttq not ready: skipped InitiateCheckout");
        }
      }

      // ✅ crea checkout
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
        console.error("❌ Checkout create failed", { status: res.status, data, items });

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
