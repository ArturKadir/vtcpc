import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  label: string;
  detail?: string;
  quantity: number;
  price_eur: number;
  kind: "cart" | "config";
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "vtcpc-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      add: (item, quantity = 1) =>
        setItems((prev) => {
          const existing = prev.find((entry) => entry.id === item.id);
          if (existing) {
            return prev.map((entry) =>
              entry.id === item.id ? { ...entry, quantity: entry.quantity + quantity } : entry,
            );
          }
          return [...prev, { ...item, quantity }];
        }),
      remove: (id) => setItems((prev) => prev.filter((entry) => entry.id !== id)),
      setQuantity: (id, quantity) =>
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === id ? { ...entry, quantity: Math.max(1, Math.min(20, quantity)) } : entry,
          ),
        ),
      clear: () => setItems([]),
      total: items.reduce((sum, entry) => sum + entry.price_eur * entry.quantity, 0),
      count: items.reduce((sum, entry) => sum + entry.quantity, 0),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

export function formatEur(value: number) {
  return new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
