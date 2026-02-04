"use client";

import { useState } from "react";
import { useCart } from "@/app/components/cart/CartProvider";
import { gaBeginCheckout } from "@/app/lib/ga";

export default function CheckoutButton() {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);

  async function goCheckout() {
    if (!items.length) return;

    // GA: begin_checkout prima di qualsiasi redirect
    gaBeginCheckout(items, {
      checkout_flow: "api_checkout_create",
    });

    setLoading(true);

    const totalKg = items.reduce((s, i: any) => s + (Number(i.weightKg || 0) * Number(i.qty || 0)), 0);

    const returnUrl = `${window.location.origin}/it/reward`;

    const res = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, totalKg, returnUrl }),
    });

    const data = await res.json();

    if (data?.url) {
      window.location.href = data.url; // redirect Shopify
    } else {
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
