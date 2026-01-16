"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Fetch } from "@/lib/fetch";
import { withImageParams } from "@/lib/image";

export type BlogProductPlacement = "top" | "middle" | "bottom";

export type BlogProductSelection = {
  productId: number;
  placement: BlogProductPlacement;
  sortOrder?: number;
};

type AdminProductRow = {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  compareAt?: number | string | null;
  isActive?: boolean;
  images?: { url: string; alt?: string | null }[];
};

function formatPKR(value: number) {
  return `PKR ${value.toLocaleString("en-PK")}`;
}

function priceLabel(value: number | string | null | undefined) {
  const num = Number(value ?? 0);
  return formatPKR(Number.isFinite(num) ? num : 0);
}

export default function BlogProductSelector({
  value,
  onChange,
}: {
  value: BlogProductSelection[];
  onChange: (next: BlogProductSelection[]) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AdminProductRow[]>([]);
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setMsg(null);
      try {
        const res = await Fetch("/api/admin/products", { auth: true, cache: "no-store" });
        if (!res.ok) throw new Error(res.error || `Failed (${res.status})`);
        if (!cancelled) setItems((res.data as AdminProductRow[]) ?? []);
      } catch (err: any) {
        if (!cancelled) setMsg(err?.message || "Failed to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedMap = useMemo(() => new Map(value.map((x) => [x.productId, x])), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
  }, [items, query]);

  const selectedRows = useMemo(
    () =>
      value.map((sel) => ({
        sel,
        product: items.find((p) => p.id === sel.productId),
      })),
    [value, items]
  );

  function toggleProduct(productId: number) {
    const existing = selectedMap.get(productId);
    if (existing) {
      onChange(value.filter((x) => x.productId !== productId));
    } else {
      onChange([...value, { productId, placement: "middle" }]);
    }
  }

  function updatePlacement(productId: number, placement: BlogProductPlacement) {
    onChange(value.map((x) => (x.productId === productId ? { ...x, placement } : x)));
  }

  function removeSelected(productId: number) {
    onChange(value.filter((x) => x.productId !== productId));
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold">Featured products (optional)</p>
      <p className="mt-1 text-xs text-neutral-500">
        Select products to show inside this blog post (top, middle, or bottom).
      </p>

      <div className="mt-4">
        <label className="text-xs font-medium text-neutral-700">Search products</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
          placeholder="Search by name or slug"
        />
      </div>

      {msg ? (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700">
          {msg}
        </div>
      ) : null}

      <div className="mt-4 max-h-72 space-y-2 overflow-auto rounded-2xl border border-neutral-200 p-3">
        {loading ? (
          <p className="text-xs text-neutral-600">Loading products...</p>
        ) : filtered.length ? (
          filtered.map((p) => {
            const isSelected = selectedMap.has(p.id);
            const img = p.images?.[0]?.url;
            return (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-xs hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleProduct(p.id)}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900"
                />
                <div className="h-12 w-12 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                  {img ? (
                    <Image
                      src={withImageParams(img, "auto=format&fit=crop&w=140&q=70")}
                      alt={p.name}
                      width={140}
                      height={140}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">{p.name}</p>
                  <p className="text-xs text-neutral-500">{priceLabel(p.price)}</p>
                </div>
                {!p.isActive ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-700">
                    Inactive
                  </span>
                ) : null}
              </label>
            );
          })
        ) : (
          <p className="text-xs text-neutral-600">No products found.</p>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-neutral-700">Selected products</p>
        {selectedRows.length ? (
          <div className="mt-3 space-y-2">
            {selectedRows.map(({ sel, product }) => (
              <div
                key={sel.productId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {product?.name ?? `Product #${sel.productId}`}
                  </p>
                  <p className="text-[11px] text-neutral-500">{product?.slug ?? "Missing product"}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sel.placement}
                    onChange={(e) => updatePlacement(sel.productId, e.target.value as BlogProductPlacement)}
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs outline-none"
                  >
                    <option value="top">Top</option>
                    <option value="middle">Middle</option>
                    <option value="bottom">Bottom</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSelected(sel.productId)}
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] text-neutral-700 hover:bg-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-neutral-500">No products selected yet.</p>
        )}
      </div>
    </div>
  );
}
