"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ActivityChart } from "@/components/operations/ActivityChart";
import { MetricBars } from "@/components/operations/MetricBars";
import { StatusBadge } from "@/components/operations/StatusBadge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useSession } from "@/context/SessionContext";
import { getOperationsSnapshot, type OperationsSnapshot } from "@/lib/api";

function displayTime(value: string | null) {
  if (!value) return "No checks yet";
  return new Date(value).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });
}

export function Dashboard() {
  const { selectedUser } = useSession();
  const [data, setData] = useState<OperationsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getOperationsSnapshot("24h", 6));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Operational metrics are unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 30_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const summary = data?.summary;
  const cards: Array<{ label: string; value: string; note: string; icon: IconName; tone: string }> =
    [
      {
        label: "Server health",
        value: data?.health.status === "ok" ? "Online" : "Checking",
        note: data ? `${data.health.feedCount} feeds · DB connected` : "Contacting API",
        icon: "check",
        tone: "var(--success)",
      },
      {
        label: "RSS requests",
        value: (summary?.totalRequests ?? 0).toLocaleString(),
        note: "Last 24 hours",
        icon: "rss",
        tone: "var(--primary)",
      },
      {
        label: "Unique clients",
        value: (summary?.uniqueClients ?? 0).toLocaleString(),
        note: "Distinct client identifiers",
        icon: "user",
        tone: "var(--cyan)",
      },
      {
        label: "RSS feeds",
        value: String(summary?.totalFeeds ?? 0),
        note: `${summary?.healthyFeeds ?? 0} currently healthy`,
        icon: "channels",
        tone: "var(--magenta)",
      },
      {
        label: "Failed requests",
        value: (summary?.failedRequests ?? 0).toLocaleString(),
        note: `${summary?.successRate ?? 100}% success rate`,
        icon: "alert",
        tone: "var(--danger)",
      },
      {
        label: "Open alerts",
        value: (summary?.unresolvedAlerts ?? 0).toLocaleString(),
        note: summary?.mostRequestedFeed
          ? `Top feed: ${summary.mostRequestedFeed.code}`
          : "No traffic recorded",
        icon: "pulse",
        tone: "var(--warning)",
      },
    ];

  return (
    <div className="mx-auto max-w-7xl">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(130deg,color-mix(in_srgb,var(--primary)_16%,var(--surface)),var(--surface)_54%,color-mix(in_srgb,var(--cyan)_10%,var(--surface)))] px-6 py-8 shadow-[var(--shadow)] sm:px-9">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow">Assessment 3 operations</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-.045em] sm:text-5xl">
              Good afternoon
              {selectedUser
                ? `, ${selectedUser.name.replace(/^(Dr|Prof) /, "").split(" ")[0]}`
                : ""}
              .
            </h1>
            <p className="muted mt-4 max-w-2xl text-base leading-7 sm:text-lg">
              Monitor database-backed RSS traffic, clients, feed health and operational warnings in
              one view.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => void refresh()} disabled={loading}>
              <Icon name="pulse" className="size-4" />
              {loading ? "Refreshing…" : "Refresh metrics"}
            </Button>
            <Link
              href="/reports"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-bold text-white"
            >
              Open reports <Icon name="arrow" className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] bg-[var(--surface)] p-4 text-sm text-[var(--danger)]"
        >
          Metrics could not be refreshed: {error}
        </div>
      )}

      <section className="mt-7" aria-labelledby="summary-heading">
        <p className="eyebrow">Live overview</p>
        <h2 id="summary-heading" className="mt-1 text-2xl font-bold">
          Operational summary
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((item) => (
            <GlassCard key={item.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="muted text-sm font-medium">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold">{item.value}</p>
                </div>
                <span
                  className="grid size-11 place-items-center rounded-xl bg-[var(--surface-muted)]"
                  style={{ color: item.tone }}
                >
                  <Icon name={item.icon} className="size-5" />
                </span>
              </div>
              <p className="muted mt-4 text-xs">{item.note}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <GlassCard className="p-5 sm:p-6">
          <p className="eyebrow">Last 24 hours</p>
          <h2 className="mt-1 text-xl font-bold">Request activity</h2>
          <ActivityChart data={data?.activity ?? []} />
        </GlassCard>
        <GlassCard className="p-5 sm:p-6">
          <p className="eyebrow">Distribution</p>
          <h2 className="mt-1 text-xl font-bold">Requests by feed</h2>
          <MetricBars
            rows={(data?.byFeed ?? []).map((row) => ({
              label: `${row.title} · ${row.code}`,
              value: row.totalRequests,
              detail: `${row.failedRequests} failed · ${row.averageLatencyMs} ms average`,
            }))}
          />
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-5 sm:p-6">
          <p className="eyebrow">Consumers</p>
          <h2 className="mt-1 text-xl font-bold">Most active clients</h2>
          <MetricBars
            rows={(data?.byClient ?? []).map((row) => ({
              label: row.clientId,
              value: row.totalRequests,
              detail: `${row.source} · ${row.failedRequests} failed`,
            }))}
          />
        </GlassCard>
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Current state</p>
              <h2 className="mt-1 text-xl font-bold">Feed health</h2>
            </div>
            <Link href="/reports#feed-status" className="text-sm font-bold text-[var(--primary)]">
              View all
            </Link>
          </div>
          <div className="mt-5 divide-y divide-[var(--border)]">
            {(data?.statuses ?? []).slice(0, 6).map((feed) => (
              <div key={feed.feedId} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{feed.title}</p>
                  <p className="muted mt-1 text-xs">
                    {displayTime(feed.checkedAt)}
                    {feed.latencyMs !== null ? ` · ${feed.latencyMs} ms` : ""}
                  </p>
                </div>
                <StatusBadge status={feed.status} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Attention required</p>
            <h2 className="mt-1 text-xl font-bold">Unresolved alerts</h2>
          </div>
          <Link href="/reports#alerts" className="text-sm font-bold text-[var(--primary)]">
            Manage alerts
          </Link>
        </div>
        {data?.alerts.length ? (
          <ul className="mt-5 grid gap-3">
            {data.alerts.slice(0, 5).map((alert) => (
              <li
                key={alert.id}
                className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
              >
                <Icon
                  name="alert"
                  className={`mt-0.5 size-5 shrink-0 ${alert.severity === "ERROR" ? "text-[var(--danger)]" : "text-[var(--warning)]"}`}
                />
                <div>
                  <p className="text-sm font-bold">{alert.feed?.title ?? alert.type}</p>
                  <p className="muted mt-1 text-sm leading-6">{alert.message}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted mt-5 rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
            No unresolved warnings or errors.
          </p>
        )}
      </GlassCard>
    </div>
  );
}
