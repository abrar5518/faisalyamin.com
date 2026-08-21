"use client";

import { useEffect, useMemo, useState } from "react";
import { Fetch } from "@/lib/fetch";

type CategoryRow = { id: number; name: string; slug: string; isFeatured?: boolean };

export default function HomeCategoryPicker({ value, onChange }: { value: number[]; onChange: (ids: number[]) => void }) {
  const [items, setItems] = useState<CategoryRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      const response = await Fetch<CategoryRow[]>("/api/admin/categories", { auth: true, cache: "no-store" });
      if (active && response.ok) setItems(response.data ?? []);
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? items.filter((item) => `${item.name} ${item.slug}`.toLowerCase().includes(needle)) : items;
  }, [items, query]);

  function toggle(id: number) { onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]); }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <p className="text-xs font-medium text-neutral-700">Manual category order</p>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900" />
      <div className="mt-3 max-h-40 space-y-1 overflow-auto">
        {!filtered.length ? <p className="text-xs text-neutral-500">No categories available.</p> : null}
        {filtered.map((item) => (
          <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-xs hover:bg-neutral-50">
            <input type="checkbox" checked={value.includes(item.id)} onChange={() => toggle(item.id)} />
            <span className="min-w-0 flex-1 truncate">{item.name}</span>
          </label>
        ))}
      </div>
      <div className="mt-3 space-y-2 border-t border-neutral-200 pt-3">
        {value.map((id, index) => (
          <div key={id} className="flex items-center gap-2 rounded-xl bg-neutral-50 p-2 text-xs">
            <span className="min-w-0 flex-1 truncate">{index + 1}. {items.find((item) => item.id === id)?.name ?? `Category #${id}`}</span>
            <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="disabled:opacity-30">↑</button>
            <button type="button" disabled={index === value.length - 1} onClick={() => move(index, 1)} className="disabled:opacity-30">↓</button>
            <button type="button" onClick={() => toggle(id)} className="text-red-600">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
