"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  AlertDto,
  InsightFiltersDto,
  MetricRangeDto,
  RssClientTypeDto,
} from "@latrobe/api-contract";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  AnimatedAreaLineChart,
  AnimatedBarChart,
  AnimatedDonutChart,
  InsightPanel,
  KpiCard,
  RankedBars,
  type InsightPoint,
} from "@/components/insights/InsightsCharts";
import {
  getAlerts,
  getHubFilterOptions,
  getHubOverview,
  getHubRequestLogPage,
  refreshHubFeedHealth,
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
const clientLabels: Record<RssClientTypeDto, string> = {
  browser: "Browser",
  mobile_app: "Mobile app",
  rss_reader: "RSS reader",
  jmeter: "JMeter",
  direct: "Direct",
};
const panelKeys = [
  "performance",
  "growth",
  "distribution",
  "quality",
  "health",
  "alerts",
  "logs",
  "audience",
  "publishing",
  "output",
] as const;
type PanelKey = (typeof panelKeys)[number];

function number(value: unknown) {
  return Number(value ?? 0);
}
function displayNumber(value: unknown) {
  return number(value).toLocaleString("en-AU", { maximumFractionDigits: 1 });
}
function date(value: string) {
  return new Date(value).toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Melbourne",
  });
}
function melbourneDateParts(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return { year: part("year"), month: Number(part("month")), day: part("day") };
}
function melbourneDayLabel(value: Date) {
  const { day, month } = melbourneDateParts(value);
  return `${day} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]}`;
}
function bucketLabel(value: string, range: MetricRangeDto) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  if (range === "1h")
    return parsed.toLocaleTimeString("en-AU", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Australia/Melbourne",
    });
  if (range === "24h")
    return parsed.toLocaleTimeString("en-AU", { hour: "numeric", timeZone: "Australia/Melbourne" });
  return melbourneDayLabel(parsed);
}
function melbourneDateKey(value: Date) {
  const { year, month, day } = melbourneDateParts(value);
  return `${year}-${String(month).padStart(2, "0")}-${day}`;
}
function points<T extends { bucket: string }>(
  rows: T[],
  range: MetricRangeDto,
  generatedAt: string | undefined,
  read: (row: T) => number,
  allStart?: string,
): InsightPoint[] {
  const values = new Map(rows.map((row) => [bucketLabel(row.bucket, range), read(row)]));
  const count =
    range === "1h" ? 12 : range === "24h" ? 24 : range === "7d" ? 7 : range === "30d" ? 30 : 0;
  const step = range === "1h" ? 5 * 60_000 : range === "24h" ? 60 * 60_000 : 86_400_000;
  const end = new Date(generatedAt ?? Date.now());
  if (range === "1h") end.setUTCMinutes(Math.floor(end.getUTCMinutes() / 5) * 5, 0, 0);
  if (range === "24h") end.setUTCMinutes(0, 0, 0);
  const source =
    range === "all"
      ? (() => {
          const datedRows = rows
            .map((row) => ({ row, date: new Date(row.bucket) }))
            .filter((item) => !Number.isNaN(item.date.valueOf()))
            .sort((a, b) => a.date.valueOf() - b.date.valueOf());
          if (!datedRows.length) return [];
          const valuesByDay = new Map(
            datedRows.map(({ row, date }) => [melbourneDateKey(date), read(row)]),
          );
          const requestedStart = allStart ? new Date(allStart) : datedRows[0].date;
          const first = Number.isNaN(requestedStart.valueOf()) ? datedRows[0].date : requestedStart;
          const end = new Date(generatedAt ?? Date.now());
          const weeks = Math.max(
            1,
            Math.floor((end.valueOf() - first.valueOf()) / (7 * 86_400_000)) + 1,
          );
          return Array.from({ length: weeks }, (_, index) => {
            const bucket = new Date(first.valueOf() + index * 7 * 86_400_000);
            return {
              bucket: bucket.toISOString(),
              label: bucketLabel(bucket.toISOString(), range),
              value: valuesByDay.get(melbourneDateKey(bucket)) ?? 0,
            };
          });
        })()
      : count
        ? Array.from({ length: count }, (_, index) => {
            const bucket = new Date(end.getTime() - (count - index - 1) * step).toISOString();
            const label = bucketLabel(bucket, range);
            return { bucket, label, value: values.get(label) ?? 0 };
          })
        : rows.map((row) => ({
            bucket: row.bucket,
            label: bucketLabel(row.bucket, range),
            value: read(row),
          }));
  return source.map((row, index) => ({
    label: row.label,
    axisLabel:
      range === "1h"
        ? index % 3 === 0 || index === source.length - 1
          ? row.label
          : ""
        : range === "24h"
          ? index % 4 === 0 || index === source.length - 1
            ? row.label
            : ""
          : range === "30d"
            ? index % 5 === 0 || index === source.length - 1
              ? row.label
              : ""
            : range === "all"
              ? index % 2 === 0 || index === source.length - 1
                ? row.label
                : ""
              : row.label,
    value: row.value,
  }));
}
function cumulative(rows: InsightPoint[]) {
  let total = 0;
  return rows.map((row) => ({ ...row, value: (total += row.value) }));
}

function Select({
  label,
  value,
  children,
  onChange,
}: {
  label: string;
  value: string;
  children: ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <label className="filter">
      <span>{label}</span>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function IntelligenceSection({
  title,
  cards,
  open,
  onToggle,
  children,
}: {
  title: string;
  cards: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="panel group-panel">
      <button className="paneltoggle" onClick={onToggle} aria-expanded={open}>
        <h2>{title}</h2>
        <span className={`chevbox ${open ? "is-open" : ""}`}>
          <Icon name="chevron" />
        </span>
      </button>
      <div className="section-kpis kpis">{cards}</div>
      {open && <div className="panelbody section-details">{children}</div>}
    </section>
  );
}

function FeedHealth({ data }: { data: HubOverview }) {
  const total = Math.max(1, data.summary.totalFeeds);
  return (
    <>
      <div className="health-summary">
        <div className="health-head">
          <strong>RSS feed status</strong>
          <div className="health-counts">
            <span>
              <b className="text-[var(--text)]">{data.summary.healthyFeeds}</b> Healthy
            </span>
            <span>
              <b className="text-[var(--text)]">{data.summary.warningFeeds}</b> Warning
            </span>
            <span>
              <b className="text-[var(--text)]">{data.summary.errorFeeds}</b> Error
            </span>
          </div>
        </div>
        <div
          className="health-track"
          aria-label={`${data.summary.healthyFeeds} healthy, ${data.summary.warningFeeds} warning, ${data.summary.errorFeeds} error RSS feeds`}
        >
          <span
            className="healthy"
            style={{ width: `${(data.summary.healthyFeeds / total) * 100}%` }}
          />
          <span
            className="warning"
            style={{ width: `${(data.summary.warningFeeds / total) * 100}%` }}
          />
          <span
            className="error"
            style={{ width: `${(data.summary.errorFeeds / total) * 100}%` }}
          />
        </div>
      </div>
      <div className="health-list">
        {data.statuses.map((status) => {
          const normalised =
            status.status === "HEALTHY"
              ? "healthy"
              : status.status === "ERROR"
                ? "error"
                : "warning";
          return (
            <div key={status.feedId} className="health-row">
              <div>
                <strong>{status.title}</strong>
                <p className="muted">
                  {status.message ?? "No health diagnostic recorded."} ·{" "}
                  {status.checkedAt
                    ? `Last checked ${date(status.checkedAt)}`
                    : "No health check recorded"}
                  {status.latencyMs !== null ? ` · ${status.latencyMs} ms` : ""}
                </p>
              </div>
              <span className={`status-badge ${normalised}`}>{normalised}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function HubIntelligenceWorkspace() {
  const [filters, setFilters] = useState<InsightFiltersDto>({ range: "all" });
  const [options, setOptions] = useState<HubFilterOptions | null>(null);
  const [data, setData] = useState<HubOverview | null>(null);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof pageSizes)[number]>(20);
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof getHubRequestLogPage>> | null>(null);
  const [groups, setGroups] = useState({ operating: true, users: true });
  const [openPanels, setOpenPanels] = useState<Record<PanelKey, boolean>>(
    () => Object.fromEntries(panelKeys.map((key) => [key, true])) as Record<PanelKey, boolean>,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firstLoad = useRef(true);
  const update = (key: keyof InsightFiltersDto, value: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value || undefined }));
  };
  const refresh = useCallback(
    async (showLoading = true, sweepHealth = false) => {
      if (showLoading) setLoading(true);
      try {
        if (sweepHealth) await refreshHubFeedHealth();
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
        setError(
          caught instanceof Error ? caught.message : "Dashboard data could not be refreshed.",
        );
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [filters, page, pageSize],
  );
  useEffect(() => {
    void getHubFilterOptions()
      .then(setOptions)
      .catch(() => setError("Filter options are unavailable."));
  }, []);
  useEffect(() => {
    const sweep = firstLoad.current;
    firstLoad.current = false;
    const id = window.setTimeout(() => void refresh(true, sweep), 0);
    return () => window.clearTimeout(id);
  }, [refresh]);
  useEffect(() => {
    const id = window.setInterval(() => void refresh(false, false), 30_000);
    return () => window.clearInterval(id);
  }, [refresh]);
  const togglePanel = (key: PanelKey) =>
    setOpenPanels((current) => ({ ...current, [key]: !current[key] }));
  const allExpanded = groups.operating && groups.users && panelKeys.every((key) => openPanels[key]);
  const toggleAll = () => {
    const next = !allExpanded;
    setGroups({ operating: next, users: next });
    setOpenPanels(
      Object.fromEntries(panelKeys.map((key) => [key, next])) as Record<PanelKey, boolean>,
    );
  };
  const range = filters.range;
  const allStart = useMemo(() => {
    if (range !== "all" || !data) return undefined;
    return [...data.requestActivity, ...data.postActivity, ...data.rssUserActivity]
      .map((row) => row.bucket)
      .filter((bucket) => !Number.isNaN(new Date(bucket).valueOf()))
      .sort((left, right) => new Date(left).valueOf() - new Date(right).valueOf())[0];
  }, [data, range]);
  const requestPoints = points(
    data?.requestActivity ?? [],
    range,
    data?.generatedAt,
    (row) => number(row.totalRequests),
    allStart,
  );
  const latencyPoints = points(
    data?.requestActivity ?? [],
    range,
    data?.generatedAt,
    (row) => number(row.averageLatencyMs),
    allStart,
  );
  const postPoints = points(
    data?.postActivity ?? [],
    range,
    data?.generatedAt,
    (row) => number(row.totalPosts),
    allStart,
  );
  const userPoints = points(
    data?.rssUserActivity ?? [],
    range,
    data?.generatedAt,
    (row) => number(row.activeRssUsers),
    allStart,
  );
  const summary = data?.summary;
  const statusRows = useMemo(
    () => [
      { label: "Healthy", value: summary?.healthyFeeds ?? 0, color: "var(--success)" },
      { label: "Warning", value: summary?.warningFeeds ?? 0, color: "var(--warning)" },
      { label: "Error", value: summary?.errorFeeds ?? 0, color: "var(--danger)" },
    ],
    [summary],
  );
  const visibleAlerts = filters.feedId
    ? alerts.filter((alert) => alert.feedId === filters.feedId)
    : alerts;
  const service = data?.serviceStatus ?? "degraded";
  const serviceStyle =
    service === "online"
      ? "border-[color-mix(in_srgb,var(--success)_28%,var(--border))] bg-[color-mix(in_srgb,var(--success)_10%,var(--surface-strong))] text-[var(--success)]"
      : service === "offline"
        ? "border-[color-mix(in_srgb,var(--danger)_28%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_10%,var(--surface-strong))] text-[var(--danger)]"
        : "border-[color-mix(in_srgb,var(--warning)_28%,var(--border))] bg-[color-mix(in_srgb,var(--warning)_10%,var(--surface-strong))] text-[var(--warning)]";
  const opsCards = [
    <KpiCard
      key="feeds"
      label="RSS Feeds"
      value={summary?.totalFeeds ?? "—"}
      context={`${summary?.healthyFeeds ?? 0} healthy · ${summary?.warningFeeds ?? 0} warning · ${summary?.errorFeeds ?? 0} error`}
      icon="channels"
      color="var(--primary)"
      tip="Total RSS feeds configured in the Content Distribution Hub."
    />,
    <KpiCard
      key="success"
      label="Success Rate"
      value={summary?.successRate == null ? "—" : `${displayNumber(summary.successRate)}%`}
      context={
        summary?.successRate == null
          ? "No requests in period"
          : `${displayNumber(summary.successfulRequests)} successful requests`
      }
      icon="check"
      color="var(--success)"
      tip="Successful RSS requests divided by all RSS requests."
    />,
    <KpiCard
      key="error"
      label="Error Rate"
      value={summary?.errorRate == null ? "—" : `${displayNumber(summary.errorRate)}%`}
      context={
        summary?.errorRate == null
          ? "No requests in period"
          : `${displayNumber(summary.failedRequests)} failed requests`
      }
      icon="alert"
      color="var(--danger)"
      tip="Failed RSS requests as a percentage of all RSS requests."
    />,
    <KpiCard
      key="latency"
      label="Avg Latency"
      value={summary?.totalRequests ? `${Math.round(summary.averageLatencyMs)} ms` : "—"}
      context="Mean RSS response time"
      icon="pulse"
      color="var(--magenta)"
      tip="Average RSS response generation time in the selected period."
    />,
    <KpiCard
      key="alerts"
      label="Open Alerts"
      value={summary?.unresolvedAlerts ?? "—"}
      context="Requires operational attention"
      icon="alert"
      color="var(--danger)"
      tip="Unresolved operational alerts across the selected RSS feeds."
    />,
  ];
  const userCards = [
    <KpiCard
      key="requests"
      label="RSS Requests"
      value={summary?.totalRequests ?? "—"}
      context={`Across ${data?.feedDemand.length ?? 0} RSS feeds`}
      icon="rss"
      color="var(--cyan)"
      tip="All RSS feed requests made in the selected reporting period."
    />,
    <KpiCard
      key="users"
      label="Active RSS Users"
      value={summary?.activeRssUsers ?? "—"}
      context="Unique RSS users in this period"
      icon="user"
      color="var(--warning)"
      tip="Distinct logged-in users who viewed an RSS feed in the selected period."
    />,
    <KpiCard
      key="clients"
      label="Active RSS Clients"
      value={summary?.activeClients ?? "—"}
      context="Distinct access methods in this period"
      icon="rss"
      color="var(--cyan)"
      tip="Distinct methods used by logged-in users to access RSS feeds."
    />,
    <KpiCard
      key="peruser"
      label="Requests / RSS User"
      value={summary?.requestsPerRssUser == null ? "—" : displayNumber(summary.requestsPerRssUser)}
      context="Average requests per active RSS user"
      icon="rss"
      color="var(--primary)"
      tip="Total RSS requests divided by unique active RSS users."
    />,
    <KpiCard
      key="posts"
      label="Published Posts"
      value={summary?.publishedPosts ?? "—"}
      context={`By ${summary?.publishingAuthors ?? 0} publishing author${summary?.publishingAuthors === 1 ? "" : "s"}`}
      icon="posts"
      color="var(--primary)"
      tip="Published posts in the selected reporting period."
    />,
  ];
  return (
    <div id="hub-intelligence" className="hub-intelligence">
      <Breadcrumbs current="Hub Intelligence" />
      <div className="pagehead">
        <div>
          <div
            className={`mb-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${serviceStyle}`}
          >
            <span className="size-2 rounded-full bg-current shadow-[0_0_0_4px_color-mix(in_srgb,currentColor_14%,transparent)]" />
            Service {service}
          </div>
          <p className="eyebrow">Assessment 3 analytics cockpit</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.035em] sm:text-4xl">
            Hub Intelligence
          </h1>
          <p className="muted mt-3 text-base">Live publishing, RSS and Channel intelligence.</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" onClick={toggleAll}>
            <Icon name="chevron" className={`size-4 ${allExpanded ? "rotate-90" : ""}`} />
            {allExpanded ? "Collapse all" : "Expand all"}
          </Button>
          <Button variant="secondary" onClick={() => void refresh(true, true)} disabled={loading}>
            <Icon name="pulse" className={`size-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>
      <section className="filters">
        <div className="filterrow">
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
            label="RSS client"
            value={filters.clientType ?? ""}
            onChange={(value) => update("clientType", value)}
          >
            <option value="">All RSS clients</option>
            {options?.clientTypes.map((item) => (
              <option key={item} value={item}>
                {clientLabels[item]}
              </option>
            ))}
          </Select>
          <div className="time-filter">
            <span>Time</span>
            <div className="segments">
              {ranges.map((item) => (
                <button
                  key={item.value}
                  onClick={() => update("range", item.value)}
                  className={range === item.value ? "active" : ""}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
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
      {!data && loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-[var(--surface-muted)]" />
          ))}
        </div>
      ) : (
        data && (
          <div className="panels">
            <IntelligenceSection
              title="Operating resilience"
              cards={opsCards}
              open={groups.operating}
              onToggle={() =>
                setGroups((current) => ({ ...current, operating: !current.operating }))
              }
            >
              <InsightPanel
                title="RSS performance"
                open={openPanels.performance}
                onToggle={() => togglePanel("performance")}
              >
                <div className="grid2">
                  <AnimatedBarChart
                    title="RSS requests over time"
                    points={requestPoints}
                    valueLabel="Requests"
                  />
                  <AnimatedBarChart
                    title="Request latency over time"
                    points={latencyPoints}
                    valueLabel="Milliseconds"
                    maximumFractionDigits={0}
                  />
                </div>
              </InsightPanel>
              <InsightPanel
                title="Cumulative growth"
                open={openPanels.growth}
                onToggle={() => togglePanel("growth")}
              >
                <div className="grid2">
                  <AnimatedAreaLineChart
                    title="Cumulative RSS requests"
                    points={cumulative(requestPoints)}
                    valueLabel="Requests"
                  />
                  <AnimatedAreaLineChart
                    title="Cumulative published posts"
                    points={cumulative(postPoints)}
                    valueLabel="Posts"
                  />
                </div>
              </InsightPanel>
              <InsightPanel
                title="Distribution"
                open={openPanels.distribution}
                onToggle={() => togglePanel("distribution")}
              >
                <div className="grid2">
                  <AnimatedDonutChart
                    title="RSS success versus failure"
                    rows={[
                      {
                        label: "Successful",
                        value: summary?.successfulRequests ?? 0,
                        color: "var(--success)",
                      },
                      {
                        label: "Failed",
                        value: summary?.failedRequests ?? 0,
                        color: "var(--danger)",
                      },
                    ]}
                  />
                  <div className="split-col">
                    <AnimatedDonutChart title="Current feed health" rows={statusRows} />
                  </div>
                </div>
              </InsightPanel>
              <InsightPanel
                title="Operational quality"
                open={openPanels.quality}
                onToggle={() => togglePanel("quality")}
              >
                <div className="grid2 rank-grid">
                  <div>
                    <h3 className="font-bold">Request client distribution</h3>
                    <RankedBars
                      rows={data.clientDistribution.map((row) => ({
                        label: clientLabels[row.label],
                        value: number(row.value),
                      }))}
                    />
                  </div>
                  <div className="split-col">
                    <h3 className="font-bold">Failed requests by RSS Feed</h3>
                    <RankedBars
                      rows={data.failedByFeed.map((row) => ({ ...row, value: number(row.value) }))}
                    />
                  </div>
                </div>
              </InsightPanel>
              <InsightPanel
                title="RSS feed health"
                open={openPanels.health}
                onToggle={() => togglePanel("health")}
              >
                <FeedHealth data={data} />
              </InsightPanel>
              <InsightPanel
                title="Alerts"
                open={openPanels.alerts}
                onToggle={() => togglePanel("alerts")}
              >
                <div className="mt-4 space-y-3">
                  {visibleAlerts.length ? (
                    visibleAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex justify-between gap-3 rounded-xl border border-[var(--border)] p-3 ${alert.resolved ? "opacity-55" : ""}`}
                      >
                        <div>
                          <strong>{alert.feed?.title ?? alert.type}</strong>
                          <p className="muted mt-1 text-xs">{alert.message}</p>
                        </div>
                        {alert.resolved ? (
                          <span className="self-start rounded-full bg-[color-mix(in_srgb,var(--success)_13%,transparent)] px-2.5 py-1 text-xs font-bold text-[var(--success)]">
                            Resolved
                          </span>
                        ) : (
                          <Button
                            variant="secondary"
                            onClick={() =>
                              void setAlertResolved(alert.id, true).then(() =>
                                refresh(false, false),
                              )
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
              <InsightPanel
                title="Request log"
                open={openPanels.logs}
                onToggle={() => togglePanel("logs")}
              >
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
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
                  <p className="muted text-sm">
                    {logs
                      ? `${logs.meta.total} matching requests · page ${logs.meta.page} of ${logs.meta.totalPages}`
                      : "Loading…"}
                  </p>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full whitespace-nowrap text-left text-sm">
                    <thead className="border-b border-[var(--border)]">
                      <tr>
                        {["Time", "RSS user", "RSS client", "Channel", "Result", "Latency"].map(
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
                          <td className="p-3">{log.rssUserName ?? "Anonymous / unknown"}</td>
                          <td className="p-3">{clientLabels[log.clientType]}</td>
                          <td className="p-3">{log.feedCode}</td>
                          <td className="p-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-bold ${Boolean(log.success) ? "bg-[color-mix(in_srgb,var(--success)_13%,transparent)] text-[var(--success)]" : "bg-[color-mix(in_srgb,var(--danger)_13%,transparent)] text-[var(--danger)]"}`}
                            >
                              {log.statusCode}
                            </span>
                          </td>
                          <td className="p-3">{log.durationMs} ms</td>
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
            </IntelligenceSection>
            <IntelligenceSection
              title="User intelligence"
              cards={userCards}
              open={groups.users}
              onToggle={() => setGroups((current) => ({ ...current, users: !current.users }))}
            >
              <InsightPanel
                title="RSS audience"
                open={openPanels.audience}
                onToggle={() => togglePanel("audience")}
              >
                <div className="grid2 rank-grid">
                  <div>
                    <h3 className="font-bold">Requests by RSS Feed</h3>
                    <RankedBars
                      rows={data.feedDemand.map((row) => ({
                        label: `${row.title} · ${row.code}`,
                        value: number(row.value),
                      }))}
                    />
                  </div>
                  <div className="split-col">
                    <h3 className="font-bold">Requests by RSS user</h3>
                    <RankedBars
                      rows={data.rssUserDemand.map((row) => ({ ...row, value: number(row.value) }))}
                    />
                  </div>
                </div>
              </InsightPanel>
              <InsightPanel
                title="Publishing and audience"
                open={openPanels.publishing}
                onToggle={() => togglePanel("publishing")}
              >
                <div className="grid2">
                  <AnimatedBarChart
                    title="Published posts over time"
                    points={postPoints}
                    valueLabel="Posts"
                  />
                  <AnimatedBarChart
                    title="RSS users over time"
                    points={userPoints}
                    valueLabel="RSS users"
                  />
                </div>
              </InsightPanel>
              <InsightPanel
                title="Publishing output"
                open={openPanels.output}
                onToggle={() => togglePanel("output")}
              >
                <div className="grid2 rank-grid">
                  <div>
                    <h3 className="font-bold">Top publishing authors</h3>
                    <RankedBars
                      rows={data.topAuthors.map((row) => ({ ...row, value: number(row.value) }))}
                    />
                  </div>
                  <div className="split-col">
                    <h3 className="font-bold">Posts by RSS Feed</h3>
                    <RankedBars
                      rows={data.postChannels.map((row) => ({ ...row, value: number(row.value) }))}
                    />
                  </div>
                </div>
              </InsightPanel>
            </IntelligenceSection>
          </div>
        )
      )}
    </div>
  );
}
