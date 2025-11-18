// app/components/cart/CartIcon.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/app/components/cart/CartProvider";

type Props = {
  lang: string;
  className?: string;
};

export default function CartIcon({ lang, className }: Props) {
  const { totalQty } = useCart();

  return (
    <Link
      href={`/${lang}/cart`}
      className={
        className ??
        "inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition"
      }
      aria-label="Carrello"
    >
      {/* icona stile Shopify, sottile */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5 text-white"
      >
        <path
          d="M6 6h14l-1.5 8.5H8L6 4H3"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="19" r="1.3" fill="currentColor" />
        <circle cx="17" cy="19" r="1.3" fill="currentColor" />
      </svg>

      <span className="text-sm font-semibold">
        {totalQty > 0 ? totalQty : 0}
      </span>
    </Link>
  );
}
