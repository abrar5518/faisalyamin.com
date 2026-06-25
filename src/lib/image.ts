import { normalizeSiteUrl } from "@/lib/siteUrl";

const UPLOAD_BASE_URL = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL
  ? normalizeSiteUrl(process.env.NEXT_PUBLIC_UPLOAD_BASE_URL)
  : "";

export function toOptimizableImageSrc(src: string) {
  if (!src || src.startsWith("data:")) return src;
  if (src.startsWith("/uploads/")) {
    const baseUrl = UPLOAD_BASE_URL || normalizeSiteUrl();
    return `${baseUrl.replace(/\/$/, "")}${src}`;
  }
  return src;
}

export function withImageParams(src: string, params: string) {
  const normalizedSrc = toOptimizableImageSrc(src);
  if (!normalizedSrc) return normalizedSrc;
  if (normalizedSrc.startsWith("/") || normalizedSrc.startsWith("data:")) return normalizedSrc;
  if (!params) return normalizedSrc;
  const clean = params.startsWith("?") ? params.slice(1) : params;
  const joiner = normalizedSrc.includes("?") ? "&" : "?";
  return `${normalizedSrc}${joiner}${clean}`;
}
