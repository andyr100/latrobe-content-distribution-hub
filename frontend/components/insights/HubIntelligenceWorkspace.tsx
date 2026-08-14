"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AlertDto, InsightFiltersDto, MetricRangeDto } from "@latrobe/api-contract";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  InsightPanel,
  DonutChart,
  RankedBars,
  TrendChart,
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
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All recorded" },
];
const pageSizes = [20, 100, 500, 1000] as const;
const healthColours: Record<string, string> = {
  HEALTHY: "var(--success)",
  EMPTY: "var(--warning)",
  WARNING: "#e88a30",
  ERROR: "var(--danger)",
  UNKNOWN: "var(--text-muted)",
};

function date(value: string) {
  return new Date(value).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });
}
function bucket(value: string) {
  const valueDate = new Date(value);
  return Number.isNaN(valueDate.valueOf())
    ? value
    : valueDate.toLocaleString("en-AU", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
  title,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <label className="min-w-36 text-xs font-bold text-[var(--text-muted)]" title={title}>
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

export function HubIntelligenceWorkspace() {
  const [filters, setFilters] = useState<InsightFiltersDto>({ range: "7d" });
  const [options, setOptions] = useState<HubFilterOptions | null>(null);
  const [data, setData] = useState<HubOverview | null>(null);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof getHubRequestLogPage>> | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof pageSizes)[number]>(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateFilter = (key: keyof InsightFiltersDto, value: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value || undefined }));
  };
  const refresh = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const [nextData, nextAlerts, nextLogs] = await Promise.all([
          getHubOverview(filters),
          getAlerts("all"),
          getHubRequestLogPage(filters, page, pageSize),
        ]);
        setData(nextData);
        setAlerts(nextAlerts);
        setLogs(nextLogs);
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
    void getHubFilterOptions()
      .then(setOptions)
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : "Filter options are unavailable"),
      );
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);
  useEffect(() => {
    const interval = window.setInterval(() => void refresh(false), 30_000);
    return () => window.clearInterval(interval);
  }, [refresh]);
  const healthDonut = useMemo(
    () =>
      Object.entries(
        (data?.statuses ?? []).reduce<Record<string, number>>(
          (all, item) => ({ ...all, [item.status]: (all[item.status] ?? 0) + 1 }),
          {},
        ),
      ).map(([label, value]) => ({
        label,
        value,
        color: healthColours[label] ?? "var(--text-muted)",
      })),
    [data],
  );
  const healthTrend = useMemo(() => {
    const grouped = (data?.healthTimeline ?? []).reduce<
      Record<string, { healthy: number; nonHealthy: number }>
    >(
      (all, item) => ({
        ...all,
        [item.bucket]: {
          healthy:
            (all[item.bucket]?.healthy ?? 0) + (item.status === "HEALTHY" ? Number(item.value) : 0),
          nonHealthy:
            (all[item.bucket]?.nonHealthy ?? 0) +
            (item.status === "HEALTHY" ? 0 : Number(item.value)),
        },
      }),
      {},
    );
    return Object.entries(grouped).map(([label, value]) => ({
      label: bucket(label),
      value: value.healthy,
      secondary: value.nonHealthy,
    }));
  }, [data]);
  const summary = data?.summary;
  const cards = [
    ["RSS requests", summary?.totalRequests ?? 0, "Selected period", "rss"],
    [
      "Success rate",
      `${summary?.successRate ?? 100}%`,
      `${summary?.failedRequests ?? 0} failed`,
      "check",
    ],
    [
      "Average / p95 latency",
      `${summary?.averageLatencyMs ?? 0} / ${summary?.p95LatencyMs ?? 0} ms`,
      "Response generation",
      "pulse",
    ],
    ["Active clients", summary?.activeClients ?? 0, "Distinct installations", "user"],
    ["Active RSS users", summary?.activeRssUsers ?? 0, "Student viewers", "user"],
    [
      "Publishing authors",
      summary?.publishingAuthors ?? 0,
      "Authors with published posts",
      "posts",
    ],
    ["Published posts", summary?.publishedPosts ?? 0, "Selected period", "posts"],
    [
      "Feed health",
      `${summary?.healthyFeeds ?? 0}/${summary?.totalFeeds ?? 0}`,
      "Healthy Channels",
      "channels",
    ],
    ["Open alerts", summary?.unresolvedAlerts ?? 0, "Requires attention", "alert"],
  ] as const;

  async function resolveAlert(id: number) {
    await setAlertResolved(id, true);
    await refresh(false);
  }
  return (
    <div className="mx-auto max-w-[96rem]">
      <PageHeader
        eyebrow="Assessment 3 analytics cockpit"
        title="Hub Intelligence"
        description="A live, filterable view of publishing performance, RSS consumption, request reliability and Channel health."
        action={
          <Button
            variant="secondary"
            onClick={() => void refresh()}
            disabled={loading}
            title="Refresh all Hub Intelligence data"
          >
            <Icon name="pulse" className="size-4" />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        }
      />
      <div className="sticky top-3 z-20 mb-6 rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-4 shadow-[var(--shadow)] backdrop-blur-xl">
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect
            label="Time"
            value={filters.range}
            onChange={(value) => updateFilter("range", value)}
            title="All charts use this reporting period"
          >
            {ranges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Publishing author"
            value={filters.authorId ?? ""}
            onChange={(value) => updateFilter("authorId", value)}
            title="Applies to publishing charts and post distribution"
          >
            <option value="">All authors</option>
            {options?.authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="RSS user"
            value={filters.rssUserId ?? ""}
            onChange={(value) => updateFilter("rssUserId", value)}
            title="Applies to RSS request charts and logs"
          >
            <option value="">All student viewers</option>
            {options?.rssUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Channel"
            value={filters.feedId ?? ""}
            onChange={(value) => updateFilter("feedId", value)}
          >
            <option value="">All Channels</option>
            {options?.feeds.map((feed) => (
              <option key={feed.id} value={feed.id}>
                {feed.title}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Request result"
            value={filters.status ?? ""}
            onChange={(value) => updateFilter("status", value)}
            title="Applies to RSS request analytics only"
          >
            <option value="">Success + failure</option>
            <option value="success">Successful only</option>
            <option value="failure">Failed only</option>
          </FilterSelect>
          <FilterSelect
            label="Source"
            value={filters.source ?? ""}
            onChange={(value) => updateFilter("source", value)}
            title="Applies to RSS request analytics only"
          >
            <option value="">All sources</option>
            {options?.sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </FilterSelect>
          <span className="muted ml-auto text-xs">
            Auto-applies · live refresh every 30 seconds
          </span>
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-[var(--danger)] bg-[var(--surface)] p-4 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(([label, value, note, icon]) => (
          <GlassCard key={label} className="p-4" title={note}>
            <div className="flex justify-between gap-3">
              <div>
                <p className="muted text-xs font-bold">{label}</p>
                <p className="mt-2 text-2xl font-bold">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </p>
              </div>
              <Icon name={icon as "rss"} className="size-5 text-[var(--primary)]" />
            </div>
            <p className="muted mt-3 text-xs">{note}</p>
          </GlassCard>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <InsightPanel
          eyebrow="RSS reliability"
          title="Requests and failures over time"
          note="Time bucket automatically matches the selected period."
        >
          <TrendChart
            title="RSS request activity"
            points={(data?.requestActivity ?? []).map((item) => ({
              label: bucket(item.bucket),
              value: Number(item.totalRequests),
              secondary: Number(item.failedRequests),
            }))}
            valueLabel="Requests"
            secondaryLabel="Failures"
          />
        </InsightPanel>
        <InsightPanel
          eyebrow="Performance"
          title="Request latency over time"
          note="Average response generation latency; hover points for change versus previous bucket."
        >
          <TrendChart
            title="RSS request latency"
            points={(data?.requestActivity ?? []).map((item) => ({
              label: bucket(item.bucket),
              value: Number(item.averageLatencyMs),
            }))}
            valueLabel="Milliseconds"
          />
        </InsightPanel>
        <InsightPanel
          eyebrow="Publishing"
          title="Published posts over time"
          note="Uses published date. RSS-only filters are intentionally not applied."
        >
          <TrendChart
            title="Posts published over time"
            points={(data?.postActivity ?? []).map((item) => ({
              label: bucket(item.bucket),
              value: Number(item.totalPosts),
              secondary: Number(item.activeAuthors),
            }))}
            valueLabel="Posts"
            secondaryLabel="Active authors"
          />
        </InsightPanel>
        <InsightPanel
          eyebrow="People"
          title="Publishing authors and RSS users"
          note="Separate publishing and consumption identities."
        >
          <TrendChart
            title="Active RSS users over time"
            points={(data?.rssUserActivity ?? []).map((item) => ({
              label: bucket(item.bucket),
              value: Number(item.activeRssUsers),
              secondary: Number(
                data?.clientActivity.find((client) => client.bucket === item.bucket)
                  ?.activeClients ?? 0,
              ),
            }))}
            valueLabel="RSS users"
            secondaryLabel="Active clients"
          />
        </InsightPanel>
        <InsightPanel
          eyebrow="Publishing people"
          title="Total publishing authors over time"
          note="Cumulative registered publishing-author accounts. RSS filters are intentionally not applied."
        >
          <TrendChart
            title="Publishing authors over time"
            points={(data?.publishingUsers ?? []).map((item) => ({
              label: bucket(item.bucket),
              value: Number(item.totalUsers),
            }))}
            valueLabel="Authors"
          />
        </InsightPanel>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <InsightPanel eyebrow="Reliability" title="RSS success vs failure">
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
        </InsightPanel>
        <InsightPanel
          eyebrow="Publishing"
          title="Published posts by Channel"
          note="Post assignment distribution, not an invented delivery outcome."
        >
          <DonutChart
            title="Published posts by Channel"
            rows={(data?.postChannels ?? []).slice(0, 6).map((item, index) => ({
              label: item.label,
              value: Number(item.value),
              color: [
                "var(--primary)",
                "var(--cyan)",
                "var(--magenta)",
                "var(--success)",
                "var(--warning)",
                "#e88a30",
              ][index],
            }))}
          />
        </InsightPanel>
        <InsightPanel eyebrow="Feed health" title="Current Channel health">
          <DonutChart title="Current feed health" rows={healthDonut} />
        </InsightPanel>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <InsightPanel eyebrow="Channel demand" title="RSS requests by Channel">
          <RankedBars
            rows={(data?.feedDemand ?? []).map((item) => ({
              label: `${item.title} · ${item.code}`,
              value: Number(item.value),
            }))}
          />
        </InsightPanel>
        <InsightPanel eyebrow="Publishing performance" title="Top authors">
          <RankedBars
            rows={(data?.topAuthors ?? []).map((item) => ({
              label: item.label,
              value: Number(item.value),
            }))}
          />
        </InsightPanel>
        <InsightPanel eyebrow="Observability" title="Request source distribution">
          <RankedBars
            rows={(data?.sourceDistribution ?? []).map((item) => ({
              label: item.label,
              value: Number(item.value),
            }))}
          />
        </InsightPanel>
        <InsightPanel
          eyebrow="Health history"
          title="Feed status observations"
          note="Historical observations by status; use the current grid below for each Channel."
        >
          <TrendChart
            title="Feed health over time"
            points={healthTrend}
            valueLabel="Healthy checks"
            secondaryLabel="Non-healthy checks"
          />
        </InsightPanel>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <InsightPanel eyebrow="Current health" title="Feed health grid">
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data?.statuses.map((status) => (
              <div
                key={status.feedId}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3"
              >
                <div className="flex justify-between gap-2">
                  <strong className="text-sm">{status.title}</strong>
                  <StatusBadge status={status.status} />
                </div>
                <p className="muted mt-2 text-xs">
                  {status.checkedAt ? date(status.checkedAt) : "No observed request"}
                  {status.latencyMs !== null ? ` · ${status.latencyMs} ms` : ""}
                </p>
              </div>
            ))}
          </div>
        </InsightPanel>
        <InsightPanel eyebrow="Attention" title="Alerts" defaultOpen={false}>
          <div className="mt-4 space-y-3">
            {alerts.length ? (
              alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-[var(--border)] p-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <strong className="text-sm">{alert.feed?.title ?? alert.type}</strong>
                      <p className="muted mt-1 text-xs">{alert.message}</p>
                    </div>
                    {!alert.resolved && (
                      <Button variant="secondary" onClick={() => void resolveAlert(alert.id)}>
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="muted py-8 text-sm">No alerts recorded.</p>
            )}
          </div>
        </InsightPanel>
      </div>
      <div className="mt-6">
        <InsightPanel
          eyebrow="Detailed evidence"
          title="Filterable request log"
          note="Starts with a 20-row preview. Choose a larger server-side page when required."
        >
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <FilterSelect
              label="Rows per page"
              value={String(pageSize)}
              onChange={(value) => {
                setPage(1);
                setPageSize(Number(value) as typeof pageSize);
              }}
            >
              <>
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size} rows
                  </option>
                ))}
              </>
            </FilterSelect>
            <p className="muted text-sm">
              {logs
                ? `${logs.meta.total.toLocaleString()} matching requests · page ${logs.meta.page} of ${logs.meta.totalPages}`
                : "Loading request log…"}
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">RSS user</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">Latency</th>
                  <th className="p-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {logs?.rows.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap p-3 text-xs">{date(log.requestedAt)}</td>
                    <td className="p-3">{log.rssUserName ?? "Direct / unknown"}</td>
                    <td className="max-w-48 truncate p-3" title={log.clientId}>
                      {log.clientId}
                    </td>
                    <td className="p-3">{log.feedCode}</td>
                    <td
                      className={`p-3 font-bold ${Number(log.success) ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                    >
                      {log.statusCode}
                    </td>
                    <td className="p-3">{log.durationMs} ms</td>
                    <td className="p-3">{log.source ?? "direct"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              disabled={!logs || page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={!logs || page >= logs.meta.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </InsightPanel>
      </div>
    </div>
  );
}
