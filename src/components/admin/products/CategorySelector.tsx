"use client";

import { useEffect, useMemo, useState } from "react";
import { Fetch } from "@/lib/fetch";

export type CategoryOption = { id: string; name: string };
export type SubcategoryOption = { id: string; name: string; categoryId: string };

export default function CategorySelector({
  categoryIds,
  subcategoryIds,
  onChange,
}: {
  categoryIds: string[];
  subcategoryIds?: string[];
  onChange: (next: { categoryIds: string[]; subcategoryIds: string[] }) => void;
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

      const validCategoryIds = new Set(nextCats.map((c) => c.id));
      const defaultCategories = categoryIds.filter((id) => validCategoryIds.has(id));
      if (defaultCategories.length === 0 && nextCats[0]?.id) {
        defaultCategories.push(nextCats[0].id);
      }

      const allowedSubIds = new Set(
        nextSubs.filter((s) => defaultCategories.includes(s.categoryId)).map((s) => s.id)
      );
      const defaultSubcategories = (subcategoryIds ?? []).filter((id) => allowedSubIds.has(id));

      onChange({ categoryIds: defaultCategories, subcategoryIds: defaultSubcategories });

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSubs = useMemo(
    () => subs.filter((s) => categoryIds.includes(s.categoryId)),
    [subs, categoryIds]
  );

  function setCategory(id: string, checked: boolean) {
    const nextCategoryIds = checked
      ? Array.from(new Set([...categoryIds, id]))
      : categoryIds.filter((x) => x !== id);
    const allowedSubIds = new Set(
      subs.filter((s) => nextCategoryIds.includes(s.categoryId)).map((s) => s.id)
    );
    onChange({
      categoryIds: nextCategoryIds,
      subcategoryIds: (subcategoryIds ?? []).filter((x) => allowedSubIds.has(x)),
    });
  }

  function setSubcategory(id: string, checked: boolean) {
    onChange({
      categoryIds,
      subcategoryIds: checked
        ? Array.from(new Set([...(subcategoryIds ?? []), id]))
        : (subcategoryIds ?? []).filter((x) => x !== id),
    });
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold">Category</p>
      <p className="mt-1 text-xs text-neutral-500">Select one or more categories and subcategories.</p>

      <div className="mt-4 grid gap-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-medium text-neutral-700">Categories</label>
            <span className="text-xs text-neutral-500">{categoryIds.length} selected</span>
          </div>
          <div className="mt-2 max-h-48 space-y-2 overflow-auto rounded-2xl border border-neutral-200 bg-white p-3">
            {cats.map((c) => (
              <label key={c.id} className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-neutral-50">
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={categoryIds.includes(c.id)}
                  onChange={(e) => setCategory(c.id, e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-neutral-800">{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-medium text-neutral-700">Subcategories</label>
            <span className="text-xs text-neutral-500">{(subcategoryIds ?? []).length} selected</span>
          </div>
          <div className="mt-2 max-h-56 space-y-2 overflow-auto rounded-2xl border border-neutral-200 bg-white p-3">
            {filteredSubs.map((s) => {
              const categoryName = cats.find((c) => c.id === s.categoryId)?.name;
              return (
                <label key={s.id} className="flex items-start gap-3 rounded-xl px-2 py-2 text-sm hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    disabled={loading}
                    checked={(subcategoryIds ?? []).includes(s.id)}
                    onChange={(e) => setSubcategory(s.id, e.target.checked)}
                    className="mt-0.5 h-4 w-4"
                  />
                  <span>
                    <span className="block text-neutral-800">{s.name}</span>
                    {categoryName ? (
                      <span className="block text-xs text-neutral-500">{categoryName}</span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>

          {filteredSubs.length === 0 ? (
            <p className="mt-2 text-xs text-neutral-500">Select a category to see its subcategories.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
