const DEFAULT_SITE_URL = "https://www.faisalyamin.com";
const CANONICAL_HOST = "www.faisalyamin.com";
const ROOT_HOST = "faisalyamin.com";

export function normalizeSiteUrl(value?: string | null) {
  const fallback = process.env.SITE_URL || DEFAULT_SITE_URL;
  const raw = (value || fallback).trim() || DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(raw)
    ? raw
    : `https://${raw.replace(/^\/+/, "")}`;

  try {
    const url = new URL(withProtocol);
    url.protocol = "https";
    if (url.hostname === ROOT_HOST) {
      url.hostname = CANONICAL_HOST;
    }

    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function canonicalUrl(path = "", baseUrl?: string | null) {
  const base = normalizeSiteUrl(baseUrl);
  if (!path) return base;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
}

export function normalizeCanonicalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return canonicalUrl();

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : canonicalUrl(trimmed);

  try {
    const url = new URL(withProtocol);
    if (url.hostname === ROOT_HOST || url.hostname === CANONICAL_HOST) {
      url.protocol = "https";
      url.hostname = CANONICAL_HOST;
    }

    url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString().replace(/\/$/, "");
  } catch {
    return canonicalUrl(trimmed);
  }
}
