"use client";

import VariantBlock from "@/components/admin/products/VariantBlock";
import type { AdminVariant } from "@/types/adminProduct";

export default function VariantsEditor({
  value,
  onChange,
}: {
  value: AdminVariant[];
  onChange: (next: AdminVariant[]) => void;
}) {
  const addVariant = () => {
    const next: AdminVariant = {
      label: `Variant ${value.length + 1}`,
      colorCode: "#111827",
      images: [],
      isActive: true,
    };
    onChange([...value, next]);
  };

  const update = (idx: number, v: AdminVariant) => {
    const next = value.slice();
    next[idx] = v;
    onChange(next);
  };

  const remove = (idx: number) => {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Variants</p>
          <p className="mt-1 text-xs text-neutral-500">
            Simple: only color + images. Price stays on product (recommended).
          </p>
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Add variant
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {value.map((v, idx) => (
          <VariantBlock
            key={`variant-${idx}`}
            variant={v}
            onChange={(nv) => update(idx, nv)}
            onRemove={() => remove(idx)}
          />
        ))}
      </div>

      {value.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
          Add at least 1 variant (e.g. Silver Dial) so product page can show gallery properly.
        </div>
      ) : null}
    </div>
  );
}
