"use client";

import { usePathname } from "next/navigation";

const WHATSAPP_LINK = "https://wa.me/923018980125";

export default function WhatsAppFloatButton() {
  const pathname = usePathname();
  const hiddenRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/checkout");
  const isProductPage = pathname?.startsWith("/product/");

  if (hiddenRoute) return null;

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={[
        "fixed right-3 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full",
        "bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105",
        "focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2",
        isProductPage ? "bottom-24 lg:bottom-5" : "bottom-4 lg:bottom-5",
      ].join(" ")}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M19.05 4.94A9.82 9.82 0 0 0 12.07 2C6.61 2 2.17 6.45 2.17 11.9c0 1.74.45 3.45 1.32 4.96L2 22l5.27-1.38a9.91 9.91 0 0 0 4.8 1.22h.01c5.46 0 9.9-4.45 9.9-9.9a9.82 9.82 0 0 0-2.93-7Zm-6.98 15.23h-.01a8.28 8.28 0 0 1-4.22-1.16l-.3-.18-3.13.82.84-3.05-.2-.32a8.24 8.24 0 0 1-1.27-4.38c0-4.55 3.72-8.27 8.3-8.27a8.2 8.2 0 0 1 5.87 2.43 8.2 8.2 0 0 1 2.43 5.86c0 4.55-3.72 8.27-8.31 8.27Zm4.53-6.19c-.25-.12-1.46-.72-1.69-.8-.23-.09-.4-.12-.56.12-.17.25-.65.8-.8.96-.15.17-.3.19-.55.07-.25-.12-1.06-.39-2.02-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.01-.38.11-.5.12-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.07-.12-.56-1.35-.77-1.85-.2-.48-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.86-.87 2.09s.89 2.43 1.01 2.6c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.21-.58.21-1.07.14-1.17-.06-.1-.23-.16-.48-.28Z" />
      </svg>
    </a>
  );
}
