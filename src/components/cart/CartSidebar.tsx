"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import type { CartItem } from "@/components/cart/CartProvider";
import { withImageParams } from "@/lib/image";

type CartSidebarProps = {
  items: CartItem[];
  totalItems: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
};

function formatMoney(value: number, currency = "PKR") {
  return `${currency || "PKR"} ${value.toLocaleString("en-PK")}`;
}

function getProductHref(item: CartItem) {
  return item.href ?? (item.slug ? `/product/${item.slug}` : `/product/${item.id}`);
}

export default function CartSidebar({
  items,
  totalItems,
  isOpen,
  onClose,
  onUpdateQty,
  onRemoveItem,
}: CartSidebarProps) {
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );
  const currency = items[0]?.currency || "PKR";
  const empty = items.length === 0;

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={[
        "fixed inset-0 z-[100] transition",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={[
          "absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-label="Close cart sidebar"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-sidebar-title"
        className={[
          "absolute right-0 top-0 flex h-full w-full flex-col bg-white text-neutral-900 shadow-2xl shadow-black/25 transition-transform duration-300 ease-out sm:w-[420px]",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <header className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-white">
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="cart-sidebar-title" className="text-base font-semibold">
                Your cart
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                {totalItems} {totalItems === 1 ? "item" : "items"} ready for checkout
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
              aria-label="Close cart sidebar"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
              <ShoppingBag className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="mt-5 text-lg font-semibold">Your cart is empty</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-600">
              Looks like you have not added anything yet. Find something useful
              and we will keep it here.
            </p>
            <Link
              href="/shop"
              onClick={onClose}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="space-y-4">
                {items.map((item) => {
                  const lineTotal = item.price * item.qty;

                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex gap-3">
                        <Link
                          href={getProductHref(item)}
                          onClick={onClose}
                          className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100"
                        >
                          {item.image ? (
                            <Image
                              src={withImageParams(
                                item.image,
                                "auto=format&fit=crop&w=240&q=80",
                              )}
                              alt={item.name}
                              width={240}
                              height={240}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-400">
                              <ShoppingCart className="h-6 w-6" aria-hidden="true" />
                            </div>
                          )}
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <Link
                                href={getProductHref(item)}
                                onClick={onClose}
                                className="line-clamp-2 text-sm font-semibold leading-5 text-neutral-900 hover:underline"
                              >
                                {item.name}
                              </Link>
                              {item.subtitle || item.variantLabel || item.sizeLabel ? (
                                <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
                                  {item.subtitle ||
                                    [item.variantLabel, item.sizeLabel]
                                      .filter(Boolean)
                                      .join(" - ")}
                                </p>
                              ) : null}
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>

                          <div className="mt-3 flex items-end justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">
                                {formatMoney(item.price, item.currency)}
                              </p>
                              {typeof item.compareAt === "number" &&
                              item.compareAt > item.price ? (
                                <p className="text-xs text-neutral-400 line-through">
                                  {formatMoney(item.compareAt, item.currency)}
                                </p>
                              ) : null}
                            </div>

                            <div className="inline-flex items-center rounded-2xl border border-neutral-200 bg-neutral-50 p-1">
                              <button
                                type="button"
                                onClick={() => onUpdateQty(item.id, item.qty - 1)}
                                disabled={item.qty <= 1}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label={`Decrease ${item.name} quantity`}
                              >
                                <Minus className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <span className="min-w-9 text-center text-sm font-semibold">
                                {item.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-100"
                                aria-label={`Increase ${item.name} quantity`}
                              >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>

                          <p className="mt-2 text-right text-xs text-neutral-500">
                            Line total{" "}
                            <span className="font-semibold text-neutral-900">
                              {formatMoney(lineTotal, item.currency)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <footer className="border-t border-neutral-200 bg-white px-5 py-5 sm:px-6">
              <div className="rounded-3xl bg-neutral-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-neutral-600">Subtotal</span>
                  <span className="text-lg font-semibold">
                    {formatMoney(subtotal, currency)}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-neutral-500">
                  Shipping and any discounts are calculated at checkout.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Checkout
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
