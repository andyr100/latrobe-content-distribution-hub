"use client";

import { useCallback, useEffect, useState } from "react";
import type { MetricRangeDto } from "@latrobe/api-contract";
import { ActivityChart } from "@/components/operations/ActivityChart";
import { MetricBars } from "@/components/operations/MetricBars";
import { StatusBadge } from "@/components/operations/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { getOperationsSnapshot, setAlertResolved, type OperationsSnapshot } from "@/lib/api";

const ranges: Array<{ value: MetricRangeDto; label: string }> = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All recorded" },
];
const clientLabels = {
  browser: "Browser",
  mobile_app: "Mobile app",
  rss_reader: "RSS reader",
  jmeter: "JMeter",
  direct: "Direct",
} as const;

function date(value: string | null) {
  return value ? new Date(value).toLocaleString("en-AU") : "Not checked";
}

export function ReportsWorkspace() {
  const [range, setRange] = useState<MetricRangeDto>("7d");
  const [data, setData] = useState<OperationsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getOperationsSnapshot(range, 50));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Reports are unavailable");
    } finally {
      setLoading(false);
    }
  }, [range]);
  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function resolveAlert(id: number) {
    try {
      await setAlertResolved(id, true);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The alert could not be resolved");
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Operational reporting"
        title="RSS reports"
        description="Explore persisted request activity, client usage, feed status and alerts over a selected reporting period."
        action={
          <div className="flex items-end gap-2">
            <label className="text-sm font-bold">
              <span className="mb-2 block">Reporting period</span>
              <select
                className="field min-w-44"
                value={range}
                onChange={(event) => setRange(event.target.value as MetricRangeDto)}
              >
                {ranges.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="secondary"
              onClick={() => void refresh()}
              disabled={loading}
              aria-label="Refresh reports for the selected reporting period"
              title="Refresh reports for the selected reporting period"
            >
              <Icon name="pulse" className="size-4" />
            </Button>
          </div>
        }
      />
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-[var(--danger)] p-4 text-sm text-[var(--danger)]"
        >
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Requests", data?.summary.totalRequests ?? 0, "Persisted RSS calls"],
          [
            "Success rate",
            `${data?.summary.successRate ?? 100}%`,
            `${data?.summary.failedRequests ?? 0} failed`,
          ],
          ["Active RSS clients", data?.summary.uniqueClients ?? 0, "Distinct RSS access methods"],
          [
            "Average latency",
            `${data?.summary.averageLatencyMs ?? 0} ms`,
            "RSS response generation",
          ],
        ].map(([label, value, note]) => (
          <GlassCard key={label} className="p-5">
            <p className="muted text-sm font-medium">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            <p className="muted mt-3 text-xs">{note}</p>
          </GlassCard>
        ))}
      </div>
      <GlassCard className="mt-6 p-5 sm:p-7">
        <p className="eyebrow">Timeline</p>
        <h2 className="mt-1 text-xl font-bold">Requests over time</h2>
        <ActivityChart data={data?.activity ?? []} />
      </GlassCard>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-5 sm:p-7">
          <p className="eyebrow">Feed demand</p>
          <h2 className="mt-1 text-xl font-bold">Requests per feed</h2>
          <MetricBars
            rows={(data?.byFeed ?? []).map((row) => ({
              label: `${row.title} · ${row.code}`,
              value: row.totalRequests,
              detail: `${row.successfulRequests} successful · ${row.failedRequests} failed · ${row.averageLatencyMs} ms average`,
            }))}
          />
        </GlassCard>
        <GlassCard className="p-5 sm:p-7">
          <p className="eyebrow">RSS client demand</p>
          <h2 className="mt-1 text-xl font-bold">Requests per RSS client</h2>
          <MetricBars
            rows={(data?.byClient ?? []).map((row) => ({
              label: clientLabels[row.clientType],
              value: row.totalRequests,
              detail: `Last seen ${date(row.lastRequestedAt)}`,
            }))}
          />
        </GlassCard>
      </div>
      <GlassCard id="feed-status" className="mt-6 scroll-mt-24 p-5 sm:p-7">
        <p className="eyebrow">Latest persisted check</p>
        <h2 className="mt-1 text-xl font-bold">Feed status</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Latest status for every RSS feed</caption>
            <thead className="border-b border-[var(--border)] text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-3">Feed</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Items</th>
                <th className="px-3 py-3">HTTP</th>
                <th className="px-3 py-3">Latency</th>
                <th className="px-3 py-3">Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {(data?.statuses ?? []).map((feed) => (
                <tr key={feed.feedId}>
                  <th className="px-3 py-4 font-bold">
                    <span className="block">{feed.title}</span>
                    <span className="muted text-xs">{feed.code}</span>
                  </th>
                  <td className="px-3 py-4">
                    <StatusBadge status={feed.status} />
                  </td>
                  <td className="px-3 py-4">{feed.itemCount ?? "—"}</td>
                  <td className="px-3 py-4">{feed.httpStatus ?? "—"}</td>
                  <td className="px-3 py-4">
                    {feed.latencyMs === null ? "—" : `${feed.latencyMs} ms`}
                  </td>
                  <td className="muted whitespace-nowrap px-3 py-4">{date(feed.checkedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      <GlassCard id="alerts" className="mt-6 scroll-mt-24 p-5 sm:p-7">
        <p className="eyebrow">Warnings and errors</p>
        <h2 className="mt-1 text-xl font-bold">Unresolved alerts</h2>
        {data?.alerts.length ? (
          <ul className="mt-5 grid gap-3">
            {data.alerts.map((alert) => (
              <li
                key={alert.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-bold">
                    {alert.severity} · {alert.feed?.title ?? alert.type}
                  </p>
                  <p className="muted mt-1 text-sm leading-6">{alert.message}</p>
                  <p className="muted mt-1 text-xs">Raised {date(alert.createdAt)}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => void resolveAlert(alert.id)}>
                  Mark resolved
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted mt-5">No unresolved alerts.</p>
        )}
      </GlassCard>
      <GlassCard className="mt-6 p-5 sm:p-7">
        <p className="eyebrow">Audit trail</p>
        <h2 className="mt-1 text-xl font-bold">Recent server activity</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Recent persisted RSS requests</caption>
            <thead className="border-b border-[var(--border)] text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-3">Time</th>
                <th className="px-3 py-3">RSS client</th>
                <th className="px-3 py-3">Feed</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {(data?.recent ?? []).map((request) => (
                <tr key={request.id}>
                  <td className="muted whitespace-nowrap px-3 py-3">{date(request.requestedAt)}</td>
                  <td className="max-w-64 truncate px-3 py-3 font-medium">
                    {clientLabels[request.clientType]}
                  </td>
                  <td className="px-3 py-3">{request.feedCode}</td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        Number(request.success) ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }
                    >
                      {request.statusCode}
                    </span>
                  </td>
                  <td className="px-3 py-3">{request.durationMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
