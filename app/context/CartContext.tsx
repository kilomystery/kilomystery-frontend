'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: string;                   // es. "Standard-1"
  shopifyId: string;            // ID variante Shopify (numerico in stringa)
  title: string;                // es. "Standard 1 kg"
  kg: number;
  kind: 'Standard' | 'Premium';
  price: number;                // prezzo per 1 unità (box)
  image: string;                // path immagine
  qty: number;                  // quantità nel carrello
}

interface CartContextType {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // carica da localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem('km-cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch {
      // ignora
    }
  }, []);

  // salva su localStorage + evento per CartIcon
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('km-cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('km-cart-update'));
    } catch {
      // ignora
    }
  }, [cart]);

  function addItem(item: CartItem) {
    setCart(prev => {
      const found = prev.find(p => p.id === item.id);
      if (found) {
        return prev.map(p =>
          p.id === item.id ? { ...p, qty: p.qty + item.qty } : p
        );
      }
      return [...prev, item];
    });
  }

  function removeItem(id: string) {
    setCart(prev => prev.filter(p => p.id !== id));
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) {
      return removeItem(id);
    }
    setCart(prev => prev.map(p => (p.id === id ? { ...p, qty } : p)));
  }

  function clear() {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQty, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
