export function withResponsiveTables(html?: string | null) {
  if (!html) return "";
  return html
    .replace(/<table\b([^>]*)>/gi, '<div class="rt-table-scroll"><table$1>')
    .replace(/<\/table>/gi, '</table><p class="rt-table-hint">Swipe to see more -&gt;</p></div>');
}
