export function parseBlogTags(value?: string | null) {
  if (!value?.trim()) return [];
  return value
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, list) => list.findIndex((x) => x.toLowerCase() === tag.toLowerCase()) === index);
}

export function serializeBlogTags(tags: string[] | string | null | undefined) {
  if (Array.isArray(tags)) {
    return parseBlogTags(tags.join(", ")).join(", ");
  }
  return parseBlogTags(tags).join(", ");
}

export function readTimeMin(html: string) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}
