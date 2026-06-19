import type { ReactNode } from "react";

type AdminFieldProps = {
  label: string;
  htmlFor?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

export function AdminField({
  label,
  htmlFor,
  description,
  error,
  required,
  children,
}: AdminFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-neutral-900">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
      {description ? <p className="text-xs leading-5 text-neutral-500">{description}</p> : null}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
