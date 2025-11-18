"use client";

import { useState } from "react";
import { useCart } from "@/app/components/cart/CartProvider"; // ✅ percorso corretto
import { useParams } from "next/navigation";

export default function CheckoutButton() {
  const { items } = useCart();
  const params = useParams();
  const lang = (params?.lang as string) || "it"; // lingua dinamica

  const [loading, setLoading] = useState(false);

  async function goCheckout() {
    if (!items.length) return;

    setLoading(true);

    // totale kg ordinati
    const kg = items.reduce((sum, item) => sum + item.weightKg * item.qty, 0);

    // URL di ritorno verso la ruota
    const returnUrl = `${window.location.origin}/${lang}/reward?kg=${kg}`;

    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, returnUrl }),
      });

      const data = await res.json();

      if (!data?.url) {
        alert("Errore durante la creazione del checkout.");
        setLoading(false);
        return;
      }

      // redirect al checkout Shopify
      window.location.href = data.url;

    } catch (err) {
      console.error("Checkout error:", err);
      alert("Errore di connessione al checkout");
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
