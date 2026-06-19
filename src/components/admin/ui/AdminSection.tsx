import type { ReactNode } from "react";

type AdminSectionProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminSection({
  title,
  description,
  actions,
  children,
  className = "",
}: AdminSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
