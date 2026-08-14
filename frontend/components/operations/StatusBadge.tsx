import type { FeedStatusDto } from "@latrobe/api-contract";

export function StatusBadge({ status }: { status: FeedStatusDto["status"] }) {
  const styles = {
    HEALTHY: "text-[var(--success)] bg-[color-mix(in_srgb,var(--success)_12%,transparent)]",
    EMPTY: "text-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_13%,transparent)]",
    WARNING: "text-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_13%,transparent)]",
    ERROR: "text-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)]",
    UNKNOWN: "text-[var(--text-muted)] bg-[var(--surface-muted)]",
  };
  const labels = {
    HEALTHY: "Healthy",
    EMPTY: "Empty",
    WARNING: "Warning",
    ERROR: "Error",
    UNKNOWN: "Not checked",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {labels[status]}
    </span>
  );
}
