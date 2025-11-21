"use client";

import { useEffect } from "react";
import Link from "next/link";

const WHEEL_LOCK_KEY = "km_wheel_can_play";

export default function SuccessPage() {
  // Appena arrivo sulla pagina di successo, sblocco la ruota
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem(WHEEL_LOCK_KEY);
    } catch (e) {
      console.error("wheel lock reset error", e);
    }
  }, []);

  return (
    <main className="container py-16">
      <h1 className="text-3xl font-extrabold">Pagamento riuscito 🎉</h1>
      <p className="text-slate-300 mt-2">
        Grazie per l’ordine KiloMystery. Riceverai un’email di conferma.
      </p>

      <Link href="/" className="btn btn-primary mt-6">
        Torna alla home
      </Link>
    </main>
  );
}
