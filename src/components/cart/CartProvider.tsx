"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { CheckCircle2, ShoppingCart, X } from "lucide-react";
import { trackAddToCart } from "@/lib/metaPixel";

export type CartItem = {
  id: string;
  productId?: number;
  slug?: string;
  name: string;
  price: number;
  compareAt?: number;
  qty: number;
  image: string;
  href?: string;
  badge?: string;
  subtitle?: string;
  variantLabel?: string;
  sizeLabel?: string;
  currency?: string;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addItem: (item: CartItem, options?: { showToast?: boolean }) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

type CartToast = {
  id: number;
  item: CartItem;
};

const STORAGE_KEY = "luxstore:cart";

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((it) => it && typeof it.id === "string");
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<CartToast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readCart());
  }, []);

  useEffect(() => {
    writeCart(items);
  }, [items]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setItems(readCart());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const showCartToast = useCallback((item: CartItem) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), item });
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 4500);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast(null);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const addItem = useCallback((item: CartItem, options?: { showToast?: boolean }) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(99, next[idx].qty + item.qty) };
        return next;
      }
      return [...prev, item];
    });
    if (options?.showToast !== false) {
      showCartToast(item);
    }

    // Trigger Meta Pixel AddToCart
    trackAddToCart({
      id: item.productId ?? item.id,
      slug: item.slug,
      name: item.name,
      price: item.price,
    });
  }, [showCartToast]);

  const updateQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, Math.min(99, qty)) } : it
      )
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, it) => sum + it.qty, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, totalItems, addItem, updateQty, removeItem, clearCart }),
    [items, totalItems, addItem, updateQty, removeItem, clearCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          key={toast.id}
          className="fixed right-4 top-24 z-[90] w-[calc(100vw-2rem)] max-w-sm animate-[cart-toast-in_180ms_ease-out] rounded-3xl border border-emerald-200 bg-white p-4 shadow-2xl shadow-neutral-900/15"
          role="status"
          aria-live="polite"
        >
          <div className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
              {toast.item.image ? (
                <img
                  src={toast.item.image}
                  alt={toast.item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-500">
                  <ShoppingCart className="h-6 w-6" aria-hidden="true" />
                </div>
              )}
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900">Added to cart</p>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                    {toast.item.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismissToast}
                  className="ml-auto rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Close cart notification"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/cart"
                  onClick={dismissToast}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                >
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  View cart
                </Link>
                <button
                  type="button"
                  onClick={dismissToast}
                  className="rounded-2xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
