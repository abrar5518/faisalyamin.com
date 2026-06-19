"use client";

import { Plus, Trash2, Video } from "lucide-react";
import type { AdminImage } from "@/types/adminProduct";

type ProductVideosEditorProps = {
  value: AdminImage[];
  onChange: (value: AdminImage[]) => void;
};

const EMPTY_VIDEO: AdminImage = {
  url: "",
  alt: "",
  mediaType: "video",
  thumbnailUrl: "",
};

export default function ProductVideosEditor({ value, onChange }: ProductVideosEditorProps) {
  const videos = value.map((item) => ({ ...EMPTY_VIDEO, ...item, mediaType: "video" as const }));

  const update = (index: number, patch: Partial<AdminImage>) => {
    onChange(videos.map((item, idx) => (idx === index ? { ...item, ...patch, mediaType: "video" } : item)));
  };

  const remove = (index: number) => {
    onChange(videos.filter((_, idx) => idx !== index));
  };

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-neutral-700" />
            <p className="text-sm font-semibold">Product videos</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Add MP4/WebM video URLs. Optional thumbnail URL is used below the main product image.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...videos, { ...EMPTY_VIDEO }])}
          className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2 text-xs font-medium hover:bg-neutral-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add video
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {videos.length ? (
          videos.map((video, index) => (
            <div key={index} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold text-neutral-700">Video {index + 1}</p>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
                  aria-label={`Remove video ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700">Video URL</label>
                  <input
                    value={video.url}
                    onChange={(event) => update(index, { url: event.target.value })}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="https://cdn.example.com/product-video.mp4"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Thumbnail / poster URL</label>
                  <input
                    value={video.thumbnailUrl ?? ""}
                    onChange={(event) => update(index, { thumbnailUrl: event.target.value })}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="https://cdn.example.com/video-thumbnail.jpg"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Label / alt text</label>
                  <input
                    value={video.alt ?? ""}
                    onChange={(event) => update(index, { alt: event.target.value })}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="Product demo video"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-sm text-neutral-600">
            No product videos added yet.
          </div>
        )}
      </div>
    </div>
  );
}
