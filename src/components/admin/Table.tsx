// src/components/admin/Table.tsx
export function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-600">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-5 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-neutral-200">
                {r.map((cell, j) => (
                  <td key={j} className="px-5 py-4 align-middle">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
