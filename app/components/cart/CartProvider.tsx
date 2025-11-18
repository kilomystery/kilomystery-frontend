"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Tier = "standard" | "premium";

export type CartItem = {
  id: string;          // ID variante Shopify
  title: string;       // es: "Standard · 3 kg"
  tier: Tier;          // "standard" | "premium"
  weightKg: number;    // es: 3
  pricePerKg: number;  // es: 19.9
  qty: number;         // quantità pezzi
};

type CartContextValue = {
  items: CartItem[];
  totalQty: number;
  totalKg: number;
  subtotal: number;
  addItem: (input: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "km-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Carica dal localStorage al primo render sul client
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch (e) {
      console.error("Cart load error", e);
    }
  }, []);

  // Salva ogni volta che cambia il carrello
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Cart save error", e);
    }
  }, [items]);

  function addItem(input: Omit<CartItem, "qty"> & { qty?: number }) {
    const qty = input.qty ?? 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === input.id);
      if (existing) {
        return prev.map((i) =>
          i.id === input.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      const newItem: CartItem = { ...input, qty };
      return [...prev, newItem];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function setQty(id: string, qty: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, qty) } : i
      )
    );
  }

  function clear() {
    setItems([]);
  }

  const { totalQty, totalKg, subtotal } = useMemo(() => {
    let q = 0;
    let kg = 0;
    let total = 0;
    for (const item of items) {
      q += item.qty;
      kg += item.weightKg * item.qty;
      total += item.pricePerKg * item.weightKg * item.qty;
    }
    return { totalQty: q, totalKg: kg, subtotal: total };
  }, [items]);

  const value: CartContextValue = {
    items,
    totalQty,
    totalKg,
    subtotal,
    addItem,
    removeItem,
    setQty,
    clear,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
