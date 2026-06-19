import type { ReactNode } from "react";

type AdminStatusBadgeVariant =
  | "neutral"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "primary";

type AdminStatusBadgeProps = {
  children: ReactNode;
  variant?: AdminStatusBadgeVariant;
};

const VARIANT_CLASSES: Record<AdminStatusBadgeVariant, string> = {
  neutral: "bg-neutral-100 text-neutral-800",
  success: "bg-green-100 text-green-800",
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  primary: "bg-purple-100 text-purple-800",
};

export function AdminStatusBadge({ children, variant = "neutral" }: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}
