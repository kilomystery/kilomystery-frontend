"use client";

import { CartProvider } from "./components/cart/CartProvider";

export default function CartProviderRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
