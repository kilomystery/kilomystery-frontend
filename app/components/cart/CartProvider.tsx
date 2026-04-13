"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

export type Tier = "Standard" | "Premium";

export type CartItem = {
  id: string;
  title: string;
  tier: Tier;
  weightKg: number;
  pricePerKg: number;
  qty: number;
  image?: string;
  shopifyId: string;
  isUpsell?: boolean;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (data: any) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  clearUpsellsIfNoMain: () => void;
  totalQty: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "km-cart-v1";

function hasMainProduct(items: CartItem[]) {
  return items.some((item) => item.isUpsell !== true);
}

function sanitizeCart(items: CartItem[]) {
  if (!items.length) return items;
  if (hasMainProduct(items)) return items;
  return [];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function normalize(data: any): CartItem {
    if (!data.shopifyId) {
      throw new Error("Missing Shopify ID in product");
    }

    const rawKg = data.weightKg ?? data.kg ?? 0;
    const weightKg = Number(rawKg) || 0;

    const tierRaw = data.tier ?? data.kind ?? "Standard";
    const tier: Tier =
      String(tierRaw).toLowerCase() === "premium" ? "Premium" : "Standard";

    let pricePerKg: number;
    if (typeof data.pricePerKg === "number") {
      pricePerKg = data.pricePerKg;
    } else if (data.price && weightKg) {
      pricePerKg = Number(data.price) / weightKg;
    } else {
      pricePerKg = 0;
    }

    const qty = Math.max(1, Number(data.qty ?? 1) || 1);
    const isUpsell =
      data.isUpsell === true || String(data.id ?? "").startsWith("upsell-");

    return {
      id: String(data.id ?? `${tier}-${weightKg || "unknown"}`),
      title: String(data.title ?? `${tier} · ${weightKg} kg`),
      tier,
      weightKg,
      pricePerKg,
      qty,
      image: typeof data.image === "string" ? data.image : undefined,
      shopifyId: String(data.shopifyId),
      isUpsell,
    };
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const fixed: CartItem[] = [];

        for (const it of parsed) {
          try {
            fixed.push(normalize(it));
          } catch (e) {
            console.warn("Skip invalid cart item", it);
          }
        }

        setItems(sanitizeCart(fixed));
      }
    } catch (e) {
      console.error("Cart load error", e);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Cart save error", e);
    }
  }, [items]);

  function addItem(data: any) {
    const norm = normalize(data);

    setItems((prev) => {
      const existing = prev.find((x) => x.id === norm.id);
      const next = existing
        ? prev.map((x) =>
            x.id === norm.id ? { ...x, qty: x.qty + norm.qty } : x
          )
        : [...prev, norm];

      return sanitizeCart(next);
    });
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      return sanitizeCart(next);
    });
  }

  function setQty(id: string, qty: number) {
    setItems((prev) => {
      const next = prev.map((x) =>
        x.id === id ? { ...x, qty: Math.max(1, qty) } : x
      );
      return sanitizeCart(next);
    });
  }

  const clearUpsellsIfNoMain = useCallback(() => {
    setItems((prev) => sanitizeCart(prev));
  }, []);

  const { subtotal, totalQty } = useMemo(() => {
    let total = 0;
    let qty = 0;

    for (const item of items) {
      qty += item.qty;
      total += item.pricePerKg * item.weightKg * item.qty;
    }

    return { subtotal: total, totalQty: qty };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        setQty,
        clear: () => setItems([]),
        clearUpsellsIfNoMain,
        subtotal,
        totalQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}