"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, Upload, Video } from "lucide-react";
import { uploadVideo } from "@/lib/adminUpload";
import { getVideoRenderInfo } from "@/lib/videoUrl";
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

const MAX_VIDEO_SIZE_MB = 50;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

function VideoPreview({ video }: { video: AdminImage }) {
  const renderInfo = getVideoRenderInfo(video.url);

  if (renderInfo?.kind === "embed") {
    return (
      <iframe
        src={renderInfo.src}
        title={video.alt || "Product video preview"}
        className="aspect-video w-full bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <video
      src={renderInfo?.src || video.url}
      poster={video.thumbnailUrl || undefined}
      controls
      preload="metadata"
      className="aspect-video w-full bg-black object-contain"
    />
  );
}

export default function ProductVideosEditor({ value, onChange }: ProductVideosEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const videos = value.map((item) => ({ ...EMPTY_VIDEO, ...item, mediaType: "video" as const }));

  const update = (index: number, patch: Partial<AdminImage>) => {
    onChange(videos.map((item, idx) => (idx === index ? { ...item, ...patch, mediaType: "video" } : item)));
  };

  const remove = (index: number) => {
    onChange(videos.filter((_, idx) => idx !== index));
  };

  const buildAltFromFile = (file: File) => file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    setError("");
    setUploading(true);
    try {
      const uploaded: AdminImage[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("video/")) {
          throw new Error("Please upload only video files.");
        }
        if (file.size > MAX_VIDEO_SIZE_BYTES) {
          throw new Error(`Video file is too large. Please upload a video under ${MAX_VIDEO_SIZE_MB}MB.`);
        }
        const { url } = await uploadVideo(file, "product");
        uploaded.push({
          url,
          alt: buildAltFromFile(file),
          mediaType: "video",
          thumbnailUrl: "",
        });
      }
      onChange([...videos, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const replaceFile = async (index: number, files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setError("");
    setUploadingIndex(index);
    try {
      if (!file.type.startsWith("video/")) {
        throw new Error("Please upload only video files.");
      }
      if (file.size > MAX_VIDEO_SIZE_BYTES) {
        throw new Error(`Video file is too large. Please upload a video under ${MAX_VIDEO_SIZE_MB}MB.`);
      }
      const { url } = await uploadVideo(file, "product");
      update(index, {
        url,
        alt: videos[index]?.alt || buildAltFromFile(file),
        mediaType: "video",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed.");
    } finally {
      setUploadingIndex(null);
    }
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
            Upload MP4/WebM videos up to {MAX_VIDEO_SIZE_MB}MB, or paste a direct video, YouTube, TikTok, or Facebook video URL.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading..." : "Upload video"}
          </button>
          <button
            type="button"
            onClick={() => onChange([...videos, { ...EMPTY_VIDEO }])}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2 text-xs font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />
            Add URL
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            multiple
            className="hidden"
            onChange={(event) => {
              uploadFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

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
                {video.url ? (
                  <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-black">
                    <VideoPreview video={video} />
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => replaceInputRefs.current[index]?.click()}
                    disabled={uploading || uploadingIndex === index}
                    className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingIndex === index ? "Uploading..." : video.url ? "Replace video file" : "Upload video file"}
                  </button>
                  <input
                    ref={(node) => {
                      replaceInputRefs.current[index] = node;
                    }}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    className="hidden"
                    onChange={(event) => {
                      replaceFile(index, event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700">Video URL</label>
                  <input
                    value={video.url}
                    onChange={(event) => update(index, { url: event.target.value })}
                    className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    placeholder="https://youtu.be/... or /uploads/product/video.mp4"
                  />
                  <p className="mt-1 text-[11px] leading-4 text-neutral-500">
                    Direct MP4/WebM files play with the native player. YouTube, TikTok, and Facebook links are shown as embedded videos.
                  </p>
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
