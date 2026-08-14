"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

type Point = { label: string; value: number; secondary?: number };

function format(value: number) {
  return value.toLocaleString("en-AU", { maximumFractionDigits: 1 });
}

export function InsightPanel({
  title,
  eyebrow,
  children,
  defaultOpen = true,
  note,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  defaultOpen?: boolean;
  note?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <button
        className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>
          <span className="eyebrow">{eyebrow}</span>
          <span className="mt-1 block text-xl font-bold">{title}</span>
          {note && <span className="muted mt-1 block text-sm font-normal">{note}</span>}
        </span>
        <span className="grid size-10 place-items-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
          <Icon
            name="chevron"
            className={`size-5 transition-transform ${open ? "rotate-90" : ""}`}
          />
        </span>
      </button>
      {open && (
        <div className="border-t border-[var(--border)] px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
          {children}
        </div>
      )}
    </section>
  );
}

export function TrendChart({
  title,
  points,
  secondaryLabel,
  valueLabel = "Value",
}: {
  title: string;
  points: Point[];
  secondaryLabel?: string;
  valueLabel?: string;
}) {
  const shown = points.slice(-60);
  const max = Math.max(...shown.flatMap((point) => [point.value, point.secondary ?? 0]), 1);
  const path = (key: "value" | "secondary") =>
    shown
      .map(
        (point, index) =>
          `${index ? "L" : "M"}${shown.length === 1 ? 50 : (index / (shown.length - 1)) * 100},${100 - ((point[key] ?? 0) / max) * 88 - 6}`,
      )
      .join(" ");
  return (
    <div className="mt-5">
      {!shown.length ? (
        <p className="muted py-8 text-sm">No data for the selected filters.</p>
      ) : (
        <>
          <div className="relative h-56 rounded-xl border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_8%,var(--surface)),var(--surface))] p-3">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-full w-full"
              role="img"
              aria-label={title}
            >
              <path
                d="M0,94 H100 M0,50 H100 M0,6 H100"
                stroke="var(--border)"
                strokeWidth=".5"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={path("value")}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.8"
                vectorEffect="non-scaling-stroke"
              />
              {secondaryLabel && (
                <path
                  d={path("secondary")}
                  fill="none"
                  stroke="var(--danger)"
                  strokeWidth="1.4"
                  strokeDasharray="3 2"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {shown.map((point, index) => (
                <circle
                  key={point.label}
                  cx={shown.length === 1 ? 50 : (index / (shown.length - 1)) * 100}
                  cy={100 - (point.value / max) * 88 - 6}
                  r="1.8"
                  fill="var(--primary)"
                >
                  <title>{`${point.label}: ${format(point.value)} ${valueLabel}${index ? ` (${point.value >= shown[index - 1].value ? "+" : ""}${format(point.value - shown[index - 1].value)} vs previous)` : ""}`}</title>
                </circle>
              ))}
            </svg>
            <div className="muted absolute bottom-2 left-3 right-3 flex justify-between text-xs">
              <span>{shown[0].label}</span>
              <span>
                {format(max)} {valueLabel}
              </span>
              <span>{shown.at(-1)?.label}</span>
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-xs">
            <span>
              <i className="mr-1 inline-block size-2 rounded-full bg-[var(--primary)]" />
              {valueLabel}
            </span>
            {secondaryLabel && (
              <span>
                <i className="mr-1 inline-block size-2 rounded-full bg-[var(--danger)]" />
                {secondaryLabel}
              </span>
            )}
          </div>
          <table className="sr-only">
            <caption>{title}</caption>
            <thead>
              <tr>
                <th>Period</th>
                <th>{valueLabel}</th>
                {secondaryLabel && <th>{secondaryLabel}</th>}
              </tr>
            </thead>
            <tbody>
              {shown.map((point) => (
                <tr key={point.label}>
                  <td>{point.label}</td>
                  <td>{point.value}</td>
                  {secondaryLabel && <td>{point.secondary}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export function DonutChart({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: number; color: string }>;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 42 42" className="size-40 -rotate-90" role="img" aria-label={title}>
        {rows.map((row, index) => {
          const dash = (row.value / total) * 100;
          const offset = rows
            .slice(0, index)
            .reduce((sum, item) => sum + (item.value / total) * 100, 0);
          const part = (
            <circle
              key={row.label}
              cx="21"
              cy="21"
              r="15.9155"
              fill="transparent"
              stroke={row.color}
              strokeWidth="6"
              strokeDasharray={`${dash} ${100 - dash}`}
              strokeDashoffset={-offset}
            >
              <title>{`${row.label}: ${format(row.value)} (${Math.round((row.value / total) * 100)}%)`}</title>
            </circle>
          );
          return part;
        })}
        <text
          x="21"
          y="21"
          textAnchor="middle"
          dominantBaseline="central"
          transform="rotate(90 21 21)"
          className="fill-[var(--text)] text-[6px] font-bold"
        >
          {format(total)}
        </text>
      </svg>
      <ul className="min-w-44 flex-1 space-y-2 text-sm">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-3">
            <span>
              <i
                className="mr-2 inline-block size-2.5 rounded-full"
                style={{ background: row.color }}
              />
              {row.label}
            </span>
            <strong>{format(row.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RankedBars({
  rows,
  empty = "No data for the selected filters.",
}: {
  rows: Array<{ label: string; value: number; detail?: string }>;
  empty?: string;
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  if (!rows.length) return <p className="muted py-8 text-sm">{empty}</p>;
  return (
    <div className="mt-5 space-y-4">
      {rows.slice(0, 10).map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate font-semibold" title={row.label}>
              {row.label}
            </span>
            <strong>{format(row.value)}</strong>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--cyan))]"
              style={{ width: `${Math.max((row.value / max) * 100, 2)}%` }}
            />
          </div>
          {row.detail && <p className="muted mt-1 text-xs">{row.detail}</p>}
        </div>
      ))}
    </div>
  );
}
