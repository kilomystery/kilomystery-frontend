"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SHOPIFY_DOMAIN } from "@/app/config/shopifyProducts";

export type Tier = "standard" | "premium";

export type CartItem = {
  id: string;          // Shopify variant ID
  title: string;
  tier: Tier;
  weightKg: number;
  quantity: number;
  pricePerKg: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  buildCheckoutUrl: () => string | null;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "km-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // load da localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // salva su localStorage ad ogni cambio
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const totalItems = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + it.quantity * it.pricePerKg * it.weightKg,
        0
      ),
    [items]
  );

  function addItem(
    item: Omit<CartItem, "quantity">,
    qty: number = 1
  ) {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + qty }
            : p
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: qty } : p))
    );
  }

  function clear() {
    setItems([]);
  }

  function buildCheckoutUrl(): string | null {
    if (!items.length) return null;
    const parts = items.map(
      (it) => `${it.id}:${it.quantity}`
    );
    const path = `/cart/${parts.join(",")}`;
    return `${SHOPIFY_DOMAIN}${path}`;
  }

  const value: CartContextValue = {
    items,
    totalItems,
    subtotal,
    addItem,
    removeItem,
    updateQty,
    clear,
    buildCheckoutUrl,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
