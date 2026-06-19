import type { ReactNode } from "react";

type AdminSaveBarProps = {
  message?: string;
  actions: ReactNode;
};

export function AdminSaveBar({ message, actions }: AdminSaveBarProps) {
  return (
    <div className="sticky bottom-4 z-20 rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-lg backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-600">{message || "Review your changes before saving."}</p>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>
    </div>
  );
}
