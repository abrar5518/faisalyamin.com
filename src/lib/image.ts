export function withImageParams(src: string, params: string) {
  if (!src) return src;
  if (src.startsWith("/") || src.startsWith("data:")) return src;
  if (!params) return src;
  const clean = params.startsWith("?") ? params.slice(1) : params;
  const joiner = src.includes("?") ? "&" : "?";
  return `${src}${joiner}${clean}`;
}
