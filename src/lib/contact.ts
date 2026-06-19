export type ContactSettings = {
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  hoursWeekdays?: string | null;
  hoursWeekend?: string | null;
  notes?: string | null;
};

export const DEFAULT_WHATSAPP_MESSAGE =
  "Assalam o Alaikum, I need help with my order.";

export function getWhatsAppDigits(value?: string | null) {
  return (value || "").replace(/[^\d+]/g, "").replace(/^\+/, "");
}

export function buildWhatsAppHref(
  whatsapp?: string | null,
  message = DEFAULT_WHATSAPP_MESSAGE
) {
  const digits = getWhatsAppDigits(whatsapp);
  if (!digits) return "/contact";

  const query = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
  return `https://wa.me/${digits}${query}`;
}

export async function fetchPublicContact(): Promise<ContactSettings | null> {
  try {
    const res = await fetch("/api/contact", { cache: "no-store" });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload?.ok) return null;
    return payload.data || null;
  } catch {
    return null;
  }
}
