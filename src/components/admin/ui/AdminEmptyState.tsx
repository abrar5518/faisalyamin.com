import type { ReactNode } from "react";

type AdminEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AdminEmptyState({ icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
      {icon ? <div className="mx-auto mb-4 flex justify-center text-neutral-500">{icon}</div> : null}
      <h3 className="text-sm font-semibold text-neutral-950">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
