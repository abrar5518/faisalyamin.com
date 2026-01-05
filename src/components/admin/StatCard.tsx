// src/components/admin/StatCard.tsx
export default function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-xs text-neutral-600">{hint}</p> : null}
    </div>
  );
}
