"use client";

import ImageUploader from "@/components/admin/common/ImageUploader";
import type { AdminVariant } from "@/types/adminProduct";

function Btn({ children, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
    >
      {children}
    </button>
  );
}

export default function VariantBlock({
  variant,
  onChange,
  onRemove,
}: {
  variant: AdminVariant;
  onChange: (v: AdminVariant) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className="h-10 w-10 rounded-2xl border border-neutral-200 bg-white"
            style={{ backgroundColor: variant.colorCode }}
            title={variant.colorCode}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{variant.label || "Variant"}</p>
            <p className="text-xs text-neutral-500">{variant.isActive ? "Active" : "Disabled"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...variant, isActive: !variant.isActive })}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-medium border",
              variant.isActive
                ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
                : "border-neutral-200 bg-white hover:bg-neutral-50",
            ].join(" ")}
          >
            {variant.isActive ? "Active" : "Disabled"}
          </button>
          <Btn onClick={onRemove}>Remove</Btn>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-neutral-700">Variant name</label>
          <input
            value={variant.label}
            onChange={(e) => onChange({ ...variant, label: e.target.value })}
            className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
            placeholder="Silver Dial"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-700">Color</label>
          <div className="mt-1 flex gap-2">
            <input
              value={variant.colorCode}
              onChange={(e) => onChange({ ...variant, colorCode: e.target.value })}
              className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
              placeholder="#111827"
            />
            <input
              type="color"
              value={variant.colorCode}
              onChange={(e) => onChange({ ...variant, colorCode: e.target.value })}
              className="h-12 w-14 rounded-2xl border border-neutral-200 bg-white p-1"
              aria-label="Pick color"
            />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <ImageUploader
          title="Variant images"
          hint="Upload images for this color/variant. First image becomes default on product page."
          value={variant.images}
          onChange={(imgs) => onChange({ ...variant, images: imgs })}
          max={10}
        />
      </div>
    </div>
  );
}
