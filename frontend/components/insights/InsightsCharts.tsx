"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";

export type InsightPoint = { label: string; axisLabel?: string; value: number };

function format(value: number, maximumFractionDigits = 1) {
  return value.toLocaleString("en-AU", { maximumFractionDigits });
}

function PointerTooltip({
  tooltip,
}: {
  tooltip: { x: number; y: number; content: ReactNode } | null;
}) {
  if (!tooltip || typeof document === "undefined") return null;
  return createPortal(
    <div
      className="hub-tooltip"
      role="tooltip"
      style={{
        left: Math.max(10, Math.min(tooltip.x + 14, window.innerWidth - 250)),
        top: Math.max(10, Math.min(tooltip.y + 14, window.innerHeight - 90)),
      }}
    >
      {tooltip.content}
    </div>,
    document.body,
  );
}

export function InsightPanel({
  title,
  children,
  open,
  onToggle,
}: {
  title: string;
  children: ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="panel">
      <button className="paneltoggle" onClick={onToggle} aria-expanded={open}>
        <h2>{title}</h2>
        <span className={`chevbox ${open ? "is-open" : ""}`}>
          <Icon name="chevron" />
        </span>
      </button>
      {open && <div className="panelbody">{children}</div>}
    </section>
  );
}

export function KpiCard({
  label,
  value,
  context,
  icon,
  color,
  tip,
}: {
  label: string;
  value: string | number;
  context: string;
  icon: "rss" | "posts" | "check" | "pulse" | "user" | "alert" | "channels";
  color: string;
  tip: string;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: ReactNode } | null>(null);
  const show = (x: number, y: number) =>
    setTooltip({
      x,
      y,
      content: (
        <>
          <strong>{label}</strong>
          <span className="muted">{tip}</span>
        </>
      ),
    });
  return (
    <article className="card primary-kpi">
      <div className="cardtop">
        <div>
          <p className="label">{label}</p>
          <p className="value">{value}</p>
          <p className="context">{context}</p>
        </div>
        <button
          type="button"
          className="kpi-info"
          aria-label={`About ${label}`}
          style={{ color }}
          onPointerEnter={(e) => show(e.clientX, e.clientY)}
          onPointerMove={(e) => show(e.clientX, e.clientY)}
          onPointerLeave={() => setTooltip(null)}
          onFocus={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            show(box.left, box.bottom);
          }}
          onBlur={() => setTooltip(null)}
        >
          <Icon name={icon} />
        </button>
      </div>
      <PointerTooltip tooltip={tooltip} />
    </article>
  );
}

export function AnimatedBarChart({
  title,
  points,
  valueLabel,
  maximumFractionDigits,
}: {
  title: string;
  points: InsightPoint[];
  valueLabel: string;
  maximumFractionDigits?: number;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: ReactNode } | null>(null);
  const values = points.map((point) => point.value);
  const rawMin = values.length ? Math.min(...values) : 0;
  const rawMax = values.length ? Math.max(...values) : 1;
  const spread = Math.max(1, rawMax - rawMin);
  const min = Math.max(0, rawMin - spread * 0.12);
  const max = rawMax + spread * 0.12;
  const height = (value: number) =>
    value <= 0 ? 0 : Math.max(4, ((value - min) / (max - min || 1)) * 92 + 4);
  return (
    <div className="chart">
      <h3>{title}</h3>
      {points.length ? (
        <>
          <div className="bars" role="img" aria-label={title}>
            {points.map((point, index) => {
              const h = height(point.value);
              return (
                <div
                  key={`${point.label}-${index}`}
                  className="barpair"
                  onPointerMove={(e) =>
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      content: (
                        <>
                          <strong>{point.label}</strong>
                          <span className="muted">
                            {format(point.value, maximumFractionDigits)} {valueLabel}
                          </span>
                        </>
                      ),
                    })
                  }
                  onPointerLeave={() => setTooltip(null)}
                >
                  <span className="barcol" style={{ "--h": `${h}%` } as CSSProperties}>
                    {point.value > 0 && (
                      <>
                        <span className="barlabel">
                          {format(point.value, maximumFractionDigits)}
                        </span>
                        <i
                          className="bar"
                          style={{
                            height: `${h}%`,
                            animationDelay: `${Math.min(index * 12, 180)}ms`,
                          }}
                        />
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <div
            className="xaxis"
            style={{ gridTemplateColumns: `repeat(${points.length},minmax(0,1fr))` }}
          >
            {points.map((point, i) => (
              <span className="xtick" key={i}>
                {point.axisLabel}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="chart-empty">No data for the selected filters.</div>
      )}
      <span className="sr-only">
        Scale {format(min)} to {format(max)} {valueLabel}.
      </span>
      <PointerTooltip tooltip={tooltip} />
    </div>
  );
}

export function AnimatedAreaLineChart({
  title,
  points,
  valueLabel,
}: {
  title: string;
  points: InsightPoint[];
  valueLabel: string;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: ReactNode } | null>(null);
  const gradientId = useId().replace(/:/g, "");
  const values = points.map((point) => point.value);
  const rawMin = values.length ? Math.min(...values) : 0,
    rawMax = values.length ? Math.max(...values) : 1,
    spread = Math.max(1, rawMax - rawMin),
    min = Math.max(0, rawMin - spread * 0.12),
    max = rawMax + spread * 0.12;
  const x = (i: number) => 18 + 892 * (i / Math.max(1, points.length - 1));
  const y = (value: number) => 18 + 184 * (1 - (value - min) / (max - min || 1));
  const coords = points.map((point, i) => [x(i), y(point.value)] as const);
  const line = coords.map(([cx, cy], i) => `${i ? "L" : "M"}${cx} ${cy}`).join(" ");
  const area = coords.length ? `${line} L${coords.at(-1)![0]} 202 L${coords[0][0]} 202 Z` : "";
  const end = coords.at(-1);
  return (
    <div className="chart linechart">
      <h3>{title}</h3>
      {points.length && end ? (
        <>
          <div
            className="lineplot"
            onPointerMove={(e) => {
              const box = e.currentTarget.getBoundingClientRect();
              const index = Math.round(
                Math.max(0, Math.min(1, (e.clientX - box.left) / box.width)) * (points.length - 1),
              );
              const point = points[index];
              setTooltip({
                x: e.clientX,
                y: e.clientY,
                content: (
                  <>
                    <strong>{point.label}</strong>
                    <span className="muted">
                      {format(point.value)} {valueLabel}
                    </span>
                  </>
                ),
              });
            }}
            onPointerLeave={() => setTooltip(null)}
          >
            <svg viewBox="0 0 1000 220" preserveAspectRatio="none" role="img" aria-label={title}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--primary)" stopOpacity=".58" />
                  <stop offset="1" stopColor="#000" stopOpacity=".08" />
                </linearGradient>
              </defs>
              <path d={area} fill={`url(#${gradientId})`} className="line-area" />
              <path d={line} pathLength="1000" className="line-stroke" />
              <circle cx={end[0]} cy={end[1]} r="5" fill="var(--primary)" />
            </svg>
            <span
              className="line-end-html"
              style={{ left: `${end[0] / 10}%`, top: `${end[1] / 2.2}%` }}
            >
              {format(points.at(-1)!.value)}
            </span>
          </div>
          <div
            className="xaxis"
            style={{ gridTemplateColumns: `repeat(${points.length},minmax(0,1fr))` }}
          >
            {points.map((point, i) => (
              <span className="xtick" key={i}>
                {point.axisLabel}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="chart-empty">No data for the selected filters.</div>
      )}
      <PointerTooltip tooltip={tooltip} />
    </div>
  );
}

export function AnimatedDonutChart({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: number; color: string }>;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const stops = rows
    .map((row, index) => {
      const start = total
        ? (rows.slice(0, index).reduce((sum, item) => sum + item.value, 0) / total) * 100
        : 0;
      const end = total ? start + (row.value / total) * 100 : 0;
      return `${row.color} ${start}% ${end}%`;
    })
    .join(",");
  return (
    <div className="chart">
      <h3>{title}</h3>
      {total ? (
        <div className="donutwrap">
          <div className="donut" style={{ background: `conic-gradient(${stops})` }}>
            <span>{format(total)}</span>
          </div>
          <ul className="legend">
            {rows.map((row) => (
              <li key={row.label}>
                <span>
                  <i style={{ background: row.color }} />
                  {row.label}
                </span>
                <b>{format(row.value)}</b>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="chart-empty compact">No data for the selected filters.</div>
      )}
    </div>
  );
}

export function RankedBars({ rows }: { rows: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  if (!rows.length)
    return <div className="chart-empty compact">No data for the selected filters.</div>;
  return (
    <div className="ranks">
      {rows.slice(0, 10).map((row) => (
        <div className="rank" key={row.label}>
          <div className="rankline">
            <span title={row.label}>{row.label}</span>
            <b>{format(row.value)}</b>
          </div>
          <div className="track">
            <i className="fill" style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
