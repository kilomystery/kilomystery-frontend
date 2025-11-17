"use client";

import CookieBanner from "./CookieBanner";
import NewsletterModal from "./NewsletterModal";
import { CartProvider } from "./cart/CartProvider";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
      <CookieBanner />
      <NewsletterModal />
    </CartProvider>
  );
}

