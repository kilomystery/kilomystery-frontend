"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

export default function CheckoutButton() {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);

  async function goCheckout() {
    if (!items.length) return;

    setLoading(true);

    const totalKg = items.reduce((s, i) => s + i.weightKg * i.qty, 0);

    const returnUrl = `${window.location.origin}/it/reward?kg=${totalKg}&checkoutId=REPLACE_CHECKOUT_ID`;

    const res = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        totalKg,
        returnUrl,
      }),
    });

    const data = await res.json();

    if (data?.url) {
      window.location.href = data.url; // Shopify checkout
    } else {
      alert("Errore avvio checkout");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={goCheckout}
      disabled={loading}
      className="btn-brand w-full"
    >
      {loading ? "Redirect…" : "Procedi al Checkout"}
    </button>
  );
}
