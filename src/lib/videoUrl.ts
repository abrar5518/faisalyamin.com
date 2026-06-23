export type VideoRenderInfo =
  | { kind: "file"; src: string; provider: "file" }
  | { kind: "embed"; src: string; provider: "youtube" | "tiktok" | "facebook" };

function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getYouTubeId(url: URL) {
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] || "";
  }

  if (!host.endsWith("youtube.com")) return "";

  if (url.pathname.startsWith("/watch")) {
    return url.searchParams.get("v") || "";
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (["shorts", "embed", "live"].includes(parts[0] || "")) {
    return parts[1] || "";
  }

  return "";
}

function getTikTokId(url: URL) {
  const host = url.hostname.replace(/^www\./, "");
  if (!host.endsWith("tiktok.com")) return "";
  const match = url.pathname.match(/\/video\/(\d+)/);
  return match?.[1] || "";
}

function isFacebookVideo(url: URL) {
  const host = url.hostname.replace(/^www\./, "");
  return host.endsWith("facebook.com") || host === "fb.watch";
}

function isDirectVideoUrl(value: string) {
  const clean = value.split("?")[0]?.split("#")[0]?.toLowerCase() || "";
  return (
    clean.startsWith("/uploads/") ||
    /\.(mp4|webm|ogv|ogg|mov)$/.test(clean)
  );
}

export function getVideoRenderInfo(value?: string | null): VideoRenderInfo | null {
  const url = value?.trim();
  if (!url) return null;

  if (isDirectVideoUrl(url)) {
    return { kind: "file", src: url, provider: "file" };
  }

  const parsed = parseUrl(url);
  if (!parsed) return { kind: "file", src: url, provider: "file" };

  const youtubeId = getYouTubeId(parsed);
  if (youtubeId) {
    return {
      kind: "embed",
      provider: "youtube",
      src: `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}`,
    };
  }

  const tiktokId = getTikTokId(parsed);
  if (tiktokId) {
    return {
      kind: "embed",
      provider: "tiktok",
      src: `https://www.tiktok.com/embed/v2/${encodeURIComponent(tiktokId)}`,
    };
  }

  if (isFacebookVideo(parsed)) {
    return {
      kind: "embed",
      provider: "facebook",
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=734`,
    };
  }

  return { kind: "file", src: url, provider: "file" };
}
