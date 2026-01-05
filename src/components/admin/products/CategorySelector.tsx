"use client";

import { useEffect, useMemo, useState } from "react";
import { Fetch } from "@/lib/fetch";

export type CategoryOption = { id: string; name: string };
export type SubcategoryOption = { id: string; name: string; categoryId: string };

export default function CategorySelector({
  categoryId,
  subcategoryId,
  onChange,
}: {
  categoryId: string;
  subcategoryId?: string;
  onChange: (next: { categoryId: string; subcategoryId?: string }) => void;
}) {
  const [cats, setCats] = useState<CategoryOption[]>([]);
  const [subs, setSubs] = useState<SubcategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const [catsRes, subsRes] = await Promise.all([
        Fetch("/api/admin/categories", { auth: true, cache: "no-store" }),
        Fetch("/api/admin/subcategories", { auth: true, cache: "no-store" }),
      ]);

      const nextCats: CategoryOption[] = (catsRes.data ?? []).map((c: any) => ({
        id: c.slug,
        name: c.name,
      }));
      const nextSubs: SubcategoryOption[] = (subsRes.data ?? [])
        .map((s: any) => ({
          id: s.slug,
          name: s.name,
          categoryId: s.category?.slug ?? s.categorySlug ?? "",
        }))
        .filter((s: SubcategoryOption) => Boolean(s.categoryId));

      setCats(nextCats);
      setSubs(nextSubs);

      // Ensure default category
      const defaultCat = categoryId || nextCats[0]?.id || "";
      const allowedSubs = nextSubs.filter((x) => x.categoryId === defaultCat);
      const defaultSub = allowedSubs.find((x) => x.id === subcategoryId)?.id ?? allowedSubs[0]?.id;

      onChange({ categoryId: defaultCat, subcategoryId: defaultSub });

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSubs = useMemo(
    () => subs.filter((s) => s.categoryId === categoryId),
    [subs, categoryId]
  );

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold">Category</p>
      <p className="mt-1 text-xs text-neutral-500">Select category, then subcategory.</p>

      <div className="mt-4 grid gap-4">
        <div>
          <label className="text-xs font-medium text-neutral-700">Category</label>
          <select
            disabled={loading}
            value={categoryId}
            onChange={(e) => {
              const nextCat = e.target.value;
              const nextSubs = subs.filter((s) => s.categoryId === nextCat);
              onChange({ categoryId: nextCat, subcategoryId: nextSubs[0]?.id });
            }}
            className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900 disabled:opacity-60"
          >
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-700">Subcategory</label>
          <select
            disabled={loading || filteredSubs.length === 0}
            value={subcategoryId ?? ""}
            onChange={(e) => onChange({ categoryId, subcategoryId: e.target.value || undefined })}
            className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900 disabled:opacity-60"
          >
            {filteredSubs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {filteredSubs.length === 0 ? (
            <p className="mt-2 text-xs text-neutral-500">No subcategories found for this category.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
