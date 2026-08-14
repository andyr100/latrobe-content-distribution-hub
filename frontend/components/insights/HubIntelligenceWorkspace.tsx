"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AlertDto, InsightFiltersDto, MetricRangeDto } from "@latrobe/api-contract";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  BarChart,
  DonutChart,
  InsightPanel,
  RankedBars,
} from "@/components/insights/InsightsCharts";
import { StatusBadge } from "@/components/operations/StatusBadge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import {
  getAlerts,
  getHubFilterOptions,
  getHubOverview,
  getHubRequestLogPage,
  setAlertResolved,
  type HubFilterOptions,
  type HubOverview,
} from "@/lib/api";

const ranges: Array<{ value: MetricRangeDto; label: string }> = [
  { value: "1h", label: "1h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "all", label: "All" },
];
const pageSizes = [20, 100, 500, 1000] as const;
const colours = [
  "var(--primary)",
  "var(--cyan)",
  "var(--magenta)",
  "var(--success)",
  "var(--warning)",
];
function bucket(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? value
    : date.toLocaleString("en-AU", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });
}
function date(value: string) {
  return new Date(value).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });
}
function cumulative(rows: Array<{ bucket: string; value: number }>) {
  let total = 0;
  return rows.map((row) => ({ label: bucket(row.bucket), value: (total += Number(row.value)) }));
}
function Select({
  label,
  value,
  children,
  onChange,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <label className="min-w-36 text-xs font-bold text-[var(--text-muted)]">
      <span className="mb-1.5 block">{label}</span>
      <select
        className="field w-full text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
function Kpi({
  label,
  value,
  icon,
  color,
  tip,
}: {
  label: string;
  value: string | number;
  icon: "rss" | "posts" | "check" | "pulse" | "user" | "alert" | "channels";
  color: string;
  tip: string;
}) {
  return (
    <GlassCard tabIndex={0} className="group relative p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="muted text-xs font-bold">{label}</p>
          <p className="mt-2 text-2xl font-bold">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <Icon name={icon} className="size-5" style={{ color }} />
      </div>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-3 right-3 top-[calc(100%+0.45rem)] z-20 rounded-lg bg-[var(--text)] p-2 text-xs leading-5 text-[var(--bg)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {tip}
      </span>
    </GlassCard>
  );
}

export function HubIntelligenceWorkspace() {
  const [filters, setFilters] = useState<InsightFiltersDto>({ range: "7d" });
  const [options, setOptions] = useState<HubFilterOptions | null>(null);
  const [data, setData] = useState<HubOverview | null>(null);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof pageSizes)[number]>(20);
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof getHubRequestLogPage>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const update = (key: keyof InsightFiltersDto, value: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value || undefined }));
  };
  const refresh = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const [overview, alertRows, logPage] = await Promise.all([
          getHubOverview(filters),
          getAlerts("all"),
          getHubRequestLogPage(filters, page, pageSize),
        ]);
        setData(overview);
        setAlerts(alertRows);
        setLogs(logPage);
        setError(null);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Hub Intelligence is unavailable");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [filters, page, pageSize],
  );
  useEffect(() => {
    const id = window.setTimeout(
      () =>
        void getHubFilterOptions()
          .then(setOptions)
          .catch(() => setError("Filter options are unavailable")),
      0,
    );
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    const id = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(id);
  }, [refresh]);
  useEffect(() => {
    const id = window.setInterval(() => void refresh(false), 30_000);
    return () => window.clearInterval(id);
  }, [refresh]);
  const summary = data?.summary;
  const postPoints = (data?.postActivity ?? []).map((row) => ({
    label: bucket(row.bucket),
    value: Number(row.totalPosts),
    secondary: Number(row.activeAuthors),
  }));
  const requestPoints = (data?.requestActivity ?? []).map((row) => ({
    label: bucket(row.bucket),
    value: Number(row.totalRequests),
  }));
  const peoplePoints = (data?.postActivity ?? []).map((row) => ({
    label: bucket(row.bucket),
    value: Number(row.activeAuthors),
    secondary: Number(
      data?.rssUserActivity.find((item) => item.bucket === row.bucket)?.activeRssUsers ?? 0,
    ),
  }));
  const healthDonut = useMemo(
    () =>
      Object.entries(
        (data?.statuses ?? []).reduce<Record<string, number>>(
          (all, status) => ({ ...all, [status.status]: (all[status.status] ?? 0) + 1 }),
          {},
        ),
      ).map(([label, value], index) => ({ label, value, color: colours[index] })),
    [data],
  );
  const cards = [
    [
      "RSS Posts",
      summary?.publishedPosts ?? 0,
      "posts",
      colours[0],
      "Published posts in the selected reporting period.",
    ],
    [
      "RSS Requests",
      summary?.totalRequests ?? 0,
      "rss",
      colours[1],
      "All RSS feed requests made in the selected reporting period.",
    ],
    [
      "Success Rate",
      `${summary?.successRate ?? 100}%`,
      "check",
      "var(--success)",
      "Successful RSS requests divided by all RSS requests.",
    ],
    [
      "Latency",
      `${summary?.averageLatencyMs ?? 0} / ${summary?.p95LatencyMs ?? 0} ms`,
      "pulse",
      "var(--magenta)",
      "Average and 95th-percentile RSS response generation time.",
    ],
    [
      "Active RSS Users",
      summary?.activeRssUsers ?? 0,
      "user",
      "var(--warning)",
      "Distinct student RSS identities that requested a feed.",
    ],
    [
      "Failed RSS Requests",
      summary?.failedRequests ?? 0,
      "alert",
      "var(--danger)",
      "RSS requests that returned an unsuccessful response.",
    ],
    [
      "Publishing Authors",
      summary?.publishingAuthors ?? 0,
      "user",
      colours[0],
      "Distinct authors who published posts in the selected period.",
    ],
    [
      "Feed Health",
      `${summary?.healthyFeeds ?? 0}/${summary?.totalFeeds ?? 0}`,
      "channels",
      "var(--success)",
      "Channels currently reporting healthy feed observations.",
    ],
    [
      "Open Alerts",
      summary?.unresolvedAlerts ?? 0,
      "alert",
      "var(--danger)",
      "Unresolved operational alerts across all Channels.",
    ],
    [
      "Active Clients",
      summary?.activeClients ?? 0,
      "rss",
      colours[1],
      "Distinct browser or service client identities making RSS requests.",
    ],
  ] as const;
  const rank = (rows: Array<{ label: string; value: number }>) => (
    <RankedBars rows={rows.map((row) => ({ label: row.label, value: Number(row.value) }))} />
  );
  return (
    <div className="mx-auto max-w-[96rem]">
      <PageHeader
        eyebrow="Assessment 3 analytics cockpit"
        title="Hub Intelligence"
        description="Live publishing, RSS and Channel intelligence."
        action={
          <Button variant="secondary" onClick={() => void refresh()} disabled={loading}>
            <Icon name="pulse" className="size-4" />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        }
      />
      <section className="sticky top-[4.5rem] z-20 mb-6 rounded-2xl border border-[color-mix(in_srgb,var(--primary)_38%,var(--border))] bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface-strong))] p-4 shadow-[var(--shadow)] backdrop-blur-xl">
        <div className="flex flex-wrap items-end gap-3">
          <div className="text-xs font-bold text-[var(--text-muted)]">
            <span className="mb-1.5 block">Time</span>
            <div className="flex rounded-xl border border-[var(--border-strong)] bg-[var(--surface-strong)] p-1">
              {ranges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => update("range", range.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold ${filters.range === range.value ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)]"}`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          <Select
            label="Publishing author"
            value={filters.authorId ?? ""}
            onChange={(value) => update("authorId", value)}
          >
            <option value="">All authors</option>
            {options?.authors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          <Select
            label="RSS user"
            value={filters.rssUserId ?? ""}
            onChange={(value) => update("rssUserId", value)}
          >
            <option value="">All RSS users</option>
            {options?.rssUsers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          <Select
            label="Channel"
            value={filters.feedId ?? ""}
            onChange={(value) => update("feedId", value)}
          >
            <option value="">All Channels</option>
            {options?.feeds.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </Select>
          <Select
            label="Request result"
            value={filters.status ?? ""}
            onChange={(value) => update("status", value)}
          >
            <option value="">All results</option>
            <option value="success">Successful</option>
            <option value="failure">Failed</option>
          </Select>
          <Select
            label="Source"
            value={filters.source ?? ""}
            onChange={(value) => update("source", value)}
          >
            <option value="">All sources</option>
            {options?.sources.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </section>
      {error && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-[var(--danger)] p-4 text-[var(--danger)]"
        >
          {error}
        </p>
      )}
      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, icon, color, tip]) => (
          <Kpi
            key={label}
            label={label}
            value={value}
            icon={icon as "rss"}
            color={color}
            tip={tip}
          />
        ))}
      </section>
      <div className="space-y-6">
        <InsightPanel eyebrow="RSS performance" title="RSS performance">
          <div className="grid gap-6 xl:grid-cols-2">
            <BarChart title="RSS requests over time" points={requestPoints} valueLabel="Requests" />
            <BarChart
              title="Request latency over time"
              points={(data?.requestActivity ?? []).map((row) => ({
                label: bucket(row.bucket),
                value: Number(row.averageLatencyMs),
              }))}
              valueLabel="Milliseconds"
            />
          </div>
        </InsightPanel>
        <InsightPanel eyebrow="Publishing and audience" title="Publishing and audience">
          <div className="grid gap-6 xl:grid-cols-2">
            <BarChart title="Published posts over time" points={postPoints} valueLabel="Posts" />
            <BarChart
              title="Publishing authors and RSS users"
              points={peoplePoints}
              valueLabel="Publishing authors"
              secondaryLabel="RSS users"
            />
          </div>
        </InsightPanel>
        <InsightPanel eyebrow="Cumulative growth" title="Cumulative growth">
          <div className="grid gap-6 xl:grid-cols-2">
            <BarChart
              title="Cumulative RSS requests"
              points={cumulative(
                (data?.requestActivity ?? []).map((row) => ({
                  bucket: row.bucket,
                  value: Number(row.totalRequests),
                })),
              )}
              valueLabel="Requests"
            />
            <BarChart
              title="Cumulative published posts"
              points={cumulative(
                (data?.postActivity ?? []).map((row) => ({
                  bucket: row.bucket,
                  value: Number(row.totalPosts),
                })),
              )}
              valueLabel="Posts"
            />
          </div>
        </InsightPanel>
        <InsightPanel eyebrow="Distribution" title="Distribution">
          <div className="grid gap-6 xl:grid-cols-3">
            <DonutChart
              title="RSS success versus failure"
              rows={[
                {
                  label: "Successful",
                  value: Number(summary?.successfulRequests ?? 0),
                  color: "var(--success)",
                },
                {
                  label: "Failed",
                  value: Number(summary?.failedRequests ?? 0),
                  color: "var(--danger)",
                },
              ]}
            />
            <DonutChart
              title="Published posts by Channel"
              rows={(data?.postChannels ?? []).map((row, i) => ({
                label: row.label,
                value: Number(row.value),
                color: colours[i % colours.length],
              }))}
            />
            <DonutChart title="Current feed health" rows={healthDonut} />
          </div>
        </InsightPanel>
        <InsightPanel eyebrow="RSS audience" title="RSS audience">
          <div className="grid gap-6 xl:grid-cols-2">
            <div>
              {rank(
                (data?.feedDemand ?? []).map((row) => ({
                  label: `${row.title} · ${row.code}`,
                  value: Number(row.value),
                })),
              )}
            </div>
            <div>{rank(data?.rssUserDemand ?? [])}</div>
          </div>
        </InsightPanel>
        <InsightPanel eyebrow="Publishing output" title="Publishing output">
          <div className="grid gap-6 xl:grid-cols-2">
            <div>{rank(data?.topAuthors ?? [])}</div>
            <div>{rank(data?.postChannels ?? [])}</div>
          </div>
        </InsightPanel>
        <InsightPanel eyebrow="Operational quality" title="Operational quality">
          <div className="grid gap-6 xl:grid-cols-2">
            <div>{rank(data?.sourceDistribution ?? [])}</div>
            <div>{rank(data?.failedByFeed ?? [])}</div>
          </div>
        </InsightPanel>
        <InsightPanel eyebrow="Current health" title="Feed health grid">
          <div className="mt-4 divide-y divide-[var(--border)]">
            {data?.statuses.map((status) => (
              <div key={status.feedId} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <strong>{status.title}</strong>
                  <p className="muted mt-1 text-xs">
                    {status.checkedAt ? date(status.checkedAt) : "No observations"}
                    {status.latencyMs !== null ? ` · ${status.latencyMs} ms` : ""}
                  </p>
                </div>
                <StatusBadge status={status.status} />
              </div>
            ))}
          </div>
        </InsightPanel>
        <InsightPanel eyebrow="Attention" title="Alerts">
          <div className="mt-4 space-y-3">
            {alerts.length ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex justify-between gap-3 rounded-xl border border-[var(--border)] p-3"
                >
                  <div>
                    <strong>{alert.feed?.title ?? alert.type}</strong>
                    <p className="muted mt-1 text-xs">{alert.message}</p>
                  </div>
                  {!alert.resolved && (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        void setAlertResolved(alert.id, true).then(() => refresh(false))
                      }
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="muted py-6">No alerts recorded.</p>
            )}
          </div>
        </InsightPanel>
        <InsightPanel eyebrow="Detailed evidence" title="Filterable request log">
          <div className="mt-4 flex justify-between gap-3">
            <Select
              label="Rows per page"
              value={String(pageSize)}
              onChange={(value) => {
                setPage(1);
                setPageSize(Number(value) as typeof pageSize);
              }}
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </Select>
            <p className="muted self-end text-sm">
              {logs
                ? `${logs.meta.total} matching requests · page ${logs.meta.page} of ${logs.meta.totalPages}`
                : "Loading…"}
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  {["Time", "RSS user", "Client", "Channel", "Result", "Latency", "Source"].map(
                    (heading) => (
                      <th key={heading} className="p-3">
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {logs?.rows.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--border)]">
                    <td className="p-3 text-xs">{date(log.requestedAt)}</td>
                    <td className="p-3">{log.rssUserName ?? "Direct / unknown"}</td>
                    <td className="p-3">{log.clientId}</td>
                    <td className="p-3">{log.feedCode}</td>
                    <td className="p-3">{log.statusCode}</td>
                    <td className="p-3">{log.durationMs} ms</td>
                    <td className="p-3">{log.source ?? "direct"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={!logs || page >= logs.meta.totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </InsightPanel>
      </div>
    </div>
  );
}
