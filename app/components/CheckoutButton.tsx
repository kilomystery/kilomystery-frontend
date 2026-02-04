"use client";

import { useState } from "react";
import { useCart } from "@/app/components/cart/CartProvider";

export default function CheckoutButton({ lang = "it" }: { lang?: string }) {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);

  async function goCheckout() {
    if (!items.length) return;

    setLoading(true);

    const totalKg = items.reduce((s, i) => s + i.weightKg * i.qty, 0);

    // ✅ returnUrl nella lingua corretta
    const returnUrl = `${window.location.origin}/${lang}/reward`;

    // ✅ query string corrente (serve per passare _gl / utm / gclid al checkout)
    const originQuery = window.location.search || "";

    const res = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, totalKg, returnUrl, lang, originQuery }),
    });

    const data = await res.json();

    if (data?.url) {
      window.location.href = data.url;
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
