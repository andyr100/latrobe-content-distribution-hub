import type { ReactNode } from "react";

export function Badge({ children, tone = "violet" }: { children: ReactNode; tone?: "violet" | "cyan" | "green" | "neutral" }) {
  const tones = {
    violet: "bg-[var(--primary-soft)] text-[var(--primary)]",
    cyan: "bg-[color-mix(in_srgb,var(--cyan)_13%,transparent)] text-[var(--cyan)]",
    green: "bg-[color-mix(in_srgb,var(--success)_13%,transparent)] text-[var(--success)]",
    neutral: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}
