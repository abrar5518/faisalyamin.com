export function normalizeRedirectSource(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  let path = trimmed;
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      path = url.pathname;
    }
  } catch {
    path = trimmed;
  }

  path = path.split("?")[0].split("#")[0].trim();
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  return path.length > 1 ? path.replace(/\/+$/, "") : "/";
}

export function normalizeRedirectDestination(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return path.replace(/\/{2,}/g, "/");
}
