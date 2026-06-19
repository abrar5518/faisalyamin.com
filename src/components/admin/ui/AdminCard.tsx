import type { ReactNode } from "react";

type AdminCardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function AdminCard({
  title,
  description,
  actions,
  children,
  className = "",
  contentClassName = "",
}: AdminCardProps) {
  const hasHeader = title || description || actions;

  return (
    <section className={`rounded-3xl border border-neutral-200 bg-white shadow-sm ${className}`}>
      {hasHeader ? (
        <div className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? <h2 className="text-sm font-semibold text-neutral-950">{title}</h2> : null}
            {description ? (
              <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={contentClassName || "p-5"}>{children}</div>
    </section>
  );
}
