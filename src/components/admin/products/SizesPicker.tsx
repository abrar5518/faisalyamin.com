"use client";

import { useMemo, useState } from "react";

const COMMON_SIZES = ["28mm","31mm","34mm","36mm","38mm","39mm","40mm","41mm","42mm","44mm"];

function Chip({ active, children, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl px-4 py-2 text-sm transition",
        active
          ? "bg-neutral-900 text-white"
          : "border border-neutral-200 bg-white hover:bg-neutral-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function SizesPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [custom, setCustom] = useState("");

  const setToggle = (s: string) => {
    const exists = value.includes(s);
    onChange(exists ? value.filter((x) => x !== s) : [...value, s]);
  };

  const addCustom = () => {
    const v = custom.trim();
    if (!v) return;
    if (!value.includes(v)) onChange([...value, v]);
    setCustom("");
  };

  const sorted = useMemo(() => {
    // keep common sizes first, then others
    const common = COMMON_SIZES.filter((s) => value.includes(s));
    const other = value.filter((s) => !COMMON_SIZES.includes(s));
    return [...common, ...other];
  }, [value]);

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold">Sizes</p>
      <p className="mt-1 text-xs text-neutral-500">Tap to select. Add custom size if needed.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {COMMON_SIZES.map((s) => (
          <Chip key={s} active={value.includes(s)} onClick={() => setToggle(s)}>
            {s}
          </Chip>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
          placeholder="Custom size e.g. 43mm"
        />
        <button
          type="button"
          onClick={addCustom}
          className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Add
        </button>
      </div>

      {sorted.length ? (
        <div className="mt-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-semibold text-neutral-700">Selected sizes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sorted.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setToggle(s)}
                className="rounded-2xl border border-neutral-200 bg-white px-3 py-1.5 text-xs hover:bg-neutral-50"
                title="Remove"
              >
                {s} ✕
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
