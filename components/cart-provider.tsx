"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartLine = {
  productId: string;
  name: string;
  brand: string;
  unit: string;
  pricePerUnit: number;
  stockAvailable: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQty: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "fmcg-wholesale-cart";

function readStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(readStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const addLine = useCallback((line: Omit<CartLine, "quantity"> & { quantity?: number }) => {
    const qty = Math.max(1, line.quantity ?? 1);
    setLines((prev) => {
      const i = prev.findIndex((p) => p.productId === line.productId);
      if (i === -1) {
        const capped = Math.min(qty, line.stockAvailable);
        return [...prev, { ...line, quantity: capped }];
      }
      const next = [...prev];
      const merged = next[i].quantity + qty;
      next[i] = {
        ...next[i],
        ...line,
        quantity: Math.min(merged, line.stockAvailable),
      };
      return next;
    });
  }, []);

  const setQty = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.productId === productId
            ? { ...l, quantity: Math.max(0, Math.min(quantity, l.stockAvailable)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({ lines, addLine, setQty, removeLine, clear }),
    [lines, addLine, setQty, removeLine, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
