// app/components/cart/CartProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type Kg = 1 | 2 | 3 | 5 | 10;
export type Tier = "standard" | "premium";

export type CartItem = {
  id: string;          // Shopify variant ID
  title: string;       // es: "Standard · 3 kg"
  tier: Tier;
  weightKg: Kg;
  pricePerKg: number;  // €/kg
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  totalQty: number;
  subtotal: number;
  addItem: (input: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(input: Omit<CartItem, "qty"> & { qty?: number }) {
    const qty = input.qty ?? 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === input.id);
      if (!existing) {
        return [...prev, { ...input, qty }];
      }
      return prev.map((i) =>
        i.id === input.id ? { ...i, qty: i.qty + qty } : i
      );
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clear() {
    setItems([]);
  }

  const { totalQty, subtotal } = useMemo(() => {
    const totalQty = items.reduce((acc, i) => acc + i.qty, 0);
    const subtotal = items.reduce(
      (acc, i) => acc + i.qty * i.weightKg * i.pricePerKg,
      0
    );
    return { totalQty, subtotal };
  }, [items]);

  const value: CartContextValue = {
    items,
    totalQty,
    subtotal,
    addItem,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
