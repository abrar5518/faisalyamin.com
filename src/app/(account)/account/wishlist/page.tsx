// src/app/(account)/account/wishlist/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductCard, { Product } from "@/components/ProductCard";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      {children}
    </div>
  );
}

type WishlistItem = Product & { productId: number };

export default function AccountWishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/account/wishlist", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;
        if (active) {
          setItems(Array.isArray(payload?.data) ? payload.data : []);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((p) => p.name.toLowerCase().includes(query));
  }, [items, q]);

  const empty = filtered.length === 0;

  const removeItem = async (productId: number) => {
    const res = await fetch("/api/account/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
    }
  };

  const clearAll = async () => {
    const res = await fetch("/api/account/wishlist", { method: "DELETE" });
    if (res.ok) {
      setItems([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Wishlist</p>
            <p className="mt-1 text-sm text-neutral-600">
              Saved premium pieces for later. Quick access, quick decisions.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/shop"
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Shop more
            </Link>
            <button
              type="button"
              onClick={() => {
                if (confirm("Clear wishlist?")) clearAll();
              }}
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-neutral-900" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
              placeholder="Search saved items"
            />
            <button
              type="button"
              onClick={() => setQ("")}
              className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium hover:bg-neutral-50"
            >
              Clear
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Tip: Open a product to check availability and latest pricing before purchase.
        </p>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-10 text-center">
          <p className="text-lg font-semibold">Loading wishlist...</p>
          <p className="mt-2 text-sm text-neutral-600">
            Fetching your saved items.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-10 text-center">
          <p className="text-lg font-semibold">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-neutral-600">
            Start saving items you like. They&apos;ll appear here.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link
              href="/shop"
              className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Browse products
            </Link>
            <Link
              href="/deals"
              className="rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              View deals
            </Link>
          </div>
        </div>
      ) : empty ? (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-10 text-center">
          <p className="text-lg font-semibold">No matches</p>
          <p className="mt-2 text-sm text-neutral-600">
            Try a different search keyword.
          </p>
          <button
            type="button"
            onClick={() => setQ("")}
            className="mt-6 rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Showing <span className="font-medium text-neutral-900">{filtered.length}</span> item(s)
            </p>

            <Link
              href="/shop"
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Browse more
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <div key={p.id} className="relative">
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeItem(p.productId)}
                  className="absolute right-3 top-3 z-10 rounded-2xl border border-neutral-200 bg-white/90 px-3 py-2 text-xs font-medium backdrop-blur hover:bg-white"
                >
                  Remove
                </button>

                <ProductCard p={p} variant="compact" />
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
            <p className="text-sm font-semibold">Wishlist reminder</p>
            <p className="mt-2 text-sm text-neutral-600">
              Hot and rare pieces can sell fast. If you love it, lock it in early.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/deals"
                className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
              >
                View deals
              </Link>
              <Link
                href="/shop"
                className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
              >
                Browse products
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
