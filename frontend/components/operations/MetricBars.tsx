type Row = { label: string; value: number; detail?: string };

export function MetricBars({
  rows,
  empty = "No requests in this period.",
}: {
  rows: Row[];
  empty?: string;
}) {
  const maximum = Math.max(...rows.map((row) => row.value), 1);
  if (!rows.length) return <p className="muted py-8 text-sm">{empty}</p>;
  return (
    <div className="mt-5 space-y-4" role="list">
      {rows.map((row) => (
        <div key={row.label} role="listitem">
          <div className="mb-1.5 flex items-end justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-semibold" title={row.label}>
              {row.label}
            </span>
            <span className="shrink-0 font-bold">{row.value.toLocaleString()}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--cyan))]"
              style={{ width: `${Math.max((row.value / maximum) * 100, 2)}%` }}
              aria-hidden="true"
            />
          </div>
          {row.detail && <p className="muted mt-1 text-xs">{row.detail}</p>}
        </div>
      ))}
    </div>
  );
}
