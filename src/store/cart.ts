import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  key: string; // productId:size:color
  productId: string;
  slug: string;
  name: string;
  subtitle: string;
  unitPriceKobo: number;
  size: string;
  color: string;
  qty: number;
}

type NewItem = Omit<CartItem, "key" | "qty">;

interface CartState {
  items: CartItem[];
  add: (item: NewItem, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const MAX_QTY = 10;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((state) => {
          const key = `${item.productId}:${item.size}:${item.color}`;
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, qty: Math.min(i.qty + qty, MAX_QTY) } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, key, qty: Math.min(qty, MAX_QTY) }] };
        }),
      setQty: (key, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, MAX_QTY) } : i)),
        })),
      remove: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: "xbk-cart", version: 1 },
  ),
);

export const cartCount = (s: CartState) => s.items.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (s: CartState) => s.items.reduce((n, i) => n + i.qty * i.unitPriceKobo, 0);
