"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/adminUpload";
import type { AdminImage } from "@/types/adminProduct";

export default function ImageUploader({
  title,
  value,
  onChange,
  max = 12,
  kind = "product",
  hint,
}: {
  title: string;
  value: AdminImage[];
  onChange: (next: AdminImage[]) => void;
  max?: number;
  kind?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingAltIndex, setEditingAltIndex] = useState<number | null>(null);

  const normalized = useMemo(() => {
    return value.map((img) => {
      let url = img.url || "";
      if (!url) return img;
      url = url.replace(/\\/g, "/");
      if (url.startsWith("data:")) return img;
      if (!url.startsWith("/") && !url.startsWith("http")) {
        url = `/${url}`;
      }
      return { ...img, url };
    });
  }, [value]);

  const buildSrc = (url: string) => {
    if (!url || url.startsWith("data:")) return url;
    return url;
  };

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = Math.max(0, max - value.length);
    const list = Array.from(files).slice(0, remaining);
    if (!list.length) return;

    setBusy(true);
    try {
      const uploaded: AdminImage[] = [];
      for (const f of list) {
        const { url } = await uploadImage(f, kind);
        uploaded.push({ url });
      }
      onChange([...value, ...uploaded]);
    } finally {
      setBusy(false);
    }
  };

  const removeAt = (idx: number) => {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  const setAlt = (idx: number, alt: string) => {
    const next = value.slice();
    next[idx] = { ...next[idx], alt };
    onChange(next);
  };

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-neutral-500">
            {value.length} / {max}
          </span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy || value.length >= max}
            className="rounded-2xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {busy ? "Uploading..." : "+ Upload"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      {value.length > 0 ? (
        <div className="mt-5 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          {normalized.map((img, idx) => (
            <div key={`${img.url}-${idx}`} className="relative group">
              {/* Image Preview */}
              <div 
                className="relative overflow-hidden rounded-2xl bg-neutral-100 aspect-square border border-neutral-200 cursor-pointer hover:border-neutral-400 transition-all"
                onClick={() => setEditingAltIndex(editingAltIndex === idx ? null : idx)}
              >
                <Image
                  src={buildSrc(img.url)}
                  alt={img.alt || `Image ${idx + 1}`}
                  width={400}
                  height={400}
                  unoptimized
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                
                {/* Image Number Badge */}
                <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  #{idx + 1}
                </div>

                {/* Delete Button - Shows on hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete image #${idx + 1}?`)) {
                      removeAt(idx);
                    }
                  }}
                  disabled={busy}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Delete image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Alt Text Popup - Shows when image is clicked */}
              {editingAltIndex === idx && (
                <div className="w-[250px] absolute inset-0 z-10 flex items-center justify-center p-3 bg-black/50 rounded-2xl backdrop-blur-sm">
                  <div className="w-[250px] bg-white rounded-xl p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <label className="block text-xs font-semibold text-neutral-900 mb-2">
                      Alt Text (for SEO)
                    </label>
                    <input
                      type="text"
                      value={img.alt ?? ""}
                      onChange={(e) => setAlt(idx, e.target.value)}
                      className="w-full rounded-lg border-2 border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
                      placeholder="Describe this image..."
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditingAltIndex(null);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setEditingAltIndex(null)}
                      className="mt-3 w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-neutral-700">No images uploaded yet</p>
          <p className="mt-1 text-xs text-neutral-500">Click the &quot;+ Upload&quot; button to add images</p>
        </div>
      )}
    </div>
  );
}
