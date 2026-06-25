import Link from "next/link";

type AdminTabItem = {
  label: string;
  href: string;
  active?: boolean;
  count?: number;
};

type AdminTabsProps = {
  items: AdminTabItem[];
  ariaLabel?: string;
};

export function AdminTabs({ items, ariaLabel = "Admin sections" }: AdminTabsProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className="flex gap-1 overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-1"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
            item.active
              ? "bg-white text-neutral-950 shadow-sm"
              : "text-neutral-600 hover:bg-white hover:text-neutral-950"
          }`}
        >
          {item.label}
          {typeof item.count === "number" ? (
            <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-700">
              {item.count}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
