"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
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
  shopifyId: string; // obbligatorio
};

type CartContextValue = {
  items: CartItem[];
  addItem: (data: any) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  totalQty: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "km-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // LOAD
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // migrazione leggera: normalizziamo tutti
        const fixed: CartItem[] = [];
        for (const it of parsed) {
          try {
            fixed.push(normalize(it));
          } catch (e) {
            console.warn("Skip invalid cart item", it);
          }
        }
        setItems(fixed);
      }
    } catch (e) {
      console.error("Cart load error", e);
    }
  }, []);

  // SAVE
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Cart save error", e);
    }
  }, [items]);

  // NORMALIZZATORE ROBUSTO (gestisce vecchi dati con kind/kg)
  function normalize(data: any): CartItem {
    if (!data.shopifyId) {
      throw new Error("Missing Shopify ID in product");
    }

    const rawKg = data.weightKg ?? data.kg ?? 0;
    const weightKg = Number(rawKg) || 0;

    const tierRaw = data.tier ?? data.kind ?? "Standard";
    // Normalizziamo in "Standard" / "Premium"
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

    const qty = Number(data.qty ?? 1) || 1;

    return {
      id: String(data.id ?? `${tier}-${weightKg || "unknown"}`),
      title: String(data.title ?? `${tier} · ${weightKg} kg`),
      tier,
      weightKg,
      pricePerKg,
      qty,
      image: typeof data.image === "string" ? data.image : undefined,
      shopifyId: String(data.shopifyId),
    };
  }

  // ADD ITEM
  function addItem(data: any) {
    const norm = normalize(data);

    setItems((prev) => {
      const existing = prev.find((x) => x.id === norm.id);
      if (existing) {
        return prev.map((x) =>
          x.id === norm.id ? { ...x, qty: x.qty + norm.qty } : x
        );
      }
      return [...prev, norm];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function setQty(id: string, qty: number) {
    setItems((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, qty: Math.max(1, qty) } : x
      )
    );
  }

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
