'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartIcon({ lang = 'it' }: { lang?: string }) {
  const [qty, setQty] = useState(0);

  function update() {
    try {
      const raw = window.localStorage.getItem('km-cart');
      if (!raw) return setQty(0);
      const cart = JSON.parse(raw);
      if (!Array.isArray(cart)) return setQty(0);
      const total = cart.reduce(
        (sum: number, item: any) => sum + (Number(item.qty) || 0),
        0
      );
      setQty(total);
    } catch {
      setQty(0);
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    update();
    window.addEventListener('km-cart-update', update);
    return () => window.removeEventListener('km-cart-update', update);
  }, []);

  const safeLang = ['it', 'en', 'es', 'fr', 'de'].includes(lang) ? lang : 'it';

  return (
    <Link
      href={`/${safeLang}/cart`}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition"
      aria-label="Vai al carrello"
    >
      {/* Icona carrello stile Shopify */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l3.6 14.5a2 2 0 0 0 2 1.5h9.4a2 2 0 0 0 2-1.6L23 6H6" />
      </svg>

      {qty > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold h-5 min-w-5 flex items-center justify-center rounded-full px-1">
          {qty}
        </span>
      )}
    </Link>
  );
}
