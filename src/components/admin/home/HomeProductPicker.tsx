"use client";

import { useEffect, useMemo, useState } from "react";
import { Fetch } from "@/lib/fetch";

type ProductRow = {
  id: number;
  name: string;
  slug: string;
  isActive?: boolean;
};

export default function HomeProductPicker({ value, onChange }: { value: number[]; onChange: (ids: number[]) => void }) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const response = await Fetch<ProductRow[]>("/api/admin/products", { auth: true, cache: "no-store" });
      if (active && response.ok) setProducts(response.data ?? []);
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) => `${product.name} ${product.slug}`.toLowerCase().includes(needle));
  }, [products, query]);

  function toggle(id: number) {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <p className="text-xs font-medium text-neutral-700">Manual products</p>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900" />
      <div className="mt-3 max-h-48 space-y-1 overflow-auto">
        {loading ? <p className="text-xs text-neutral-500">Loading products...</p> : null}
        {!loading && !filtered.length ? <p className="text-xs text-neutral-500">No products available.</p> : null}
        {filtered.map((product) => (
          <label key={product.id} className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-xs hover:bg-neutral-50">
            <input type="checkbox" checked={value.includes(product.id)} onChange={() => toggle(product.id)} />
            <span className="min-w-0 flex-1 truncate">{product.name}</span>
            {!product.isActive ? <span className="text-amber-600">Inactive</span> : null}
          </label>
        ))}
      </div>
      {value.length ? (
        <div className="mt-4 space-y-2 border-t border-neutral-200 pt-3">
          {value.map((id, index) => {
            const product = products.find((item) => item.id === id);
            return (
              <div key={id} className="flex items-center gap-2 rounded-xl bg-neutral-50 p-2 text-xs">
                <span className="min-w-0 flex-1 truncate">{index + 1}. {product?.name ?? `Product #${id}`}</span>
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="disabled:opacity-30">↑</button>
                <button type="button" disabled={index === value.length - 1} onClick={() => move(index, 1)} className="disabled:opacity-30">↓</button>
                <button type="button" onClick={() => toggle(id)} className="text-red-600">Remove</button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
