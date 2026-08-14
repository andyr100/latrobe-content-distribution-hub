"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useContent } from "@/context/ContentContext";
import { useSession } from "@/context/SessionContext";

const actions: { label: string; note: string; href: string; icon: IconName }[] = [
  {
    label: "Create post",
    note: "Write a Channel update",
    href: "/posts?create=1",
    icon: "plus",
  },
  {
    label: "View Channels",
    note: "Explore the fixed catalogue",
    href: "/channels",
    icon: "channels",
  },
  {
    label: "Open RSS Client",
    note: "Preview a Channel RSS feed",
    href: "http://localhost:5000",
    icon: "rss",
  },
  {
    label: "Hub Intelligence",
    note: "Review RSS activity and feed health",
    href: "/hubintelligence",
    icon: "pulse",
  },
];

export function Dashboard() {
  const { selectedUser } = useSession();
  const { posts, channels, stats } = useContent();
  const summaries: Array<{
    label: string;
    value: string;
    note: string;
    icon: IconName;
    tone: string;
  }> = [
    {
      label: "Posts published",
      value: String(stats?.totalPosts ?? posts.length),
      note: "Channel-based content",
      icon: "posts",
      tone: "var(--primary)",
    },
    {
      label: "CSIT Channels",
      value: String(stats?.totalFeeds ?? channels.length),
      note: "Fixed publishing catalogue",
      icon: "channels",
      tone: "var(--cyan)",
    },
    {
      label: "Successful RSS requests",
      value: String(stats?.successfulRssRequests ?? 0),
      note: "All-time compatibility counter",
      icon: "rss",
      tone: "var(--magenta)",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(130deg,color-mix(in_srgb,var(--primary)_16%,var(--surface)),var(--surface)_54%,color-mix(in_srgb,var(--cyan)_10%,var(--surface)))] px-6 py-9 shadow-[var(--shadow)] sm:px-9 sm:py-11">
        <div className="relative max-w-3xl">
          <p className="eyebrow">Content distribution workspace</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-.045em] sm:text-5xl">
            Good afternoon
            {selectedUser ? `, ${selectedUser.name.replace(/^(Dr|Prof) /, "").split(" ")[0]}` : ""}.
          </h1>
          <p className="muted mt-4 max-w-2xl text-base leading-7 sm:text-lg">
            Create CSIT content and distribute it through fixed Channels and first-party RSS feeds.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/posts?create=1"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-lg"
            >
              <Icon name="plus" className="size-5" />
              Create post
            </Link>
            <Link
              href="/workflow"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-5 text-sm font-bold"
            >
              See how it works <Icon name="arrow" className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-7" aria-labelledby="overview-heading">
        <p className="eyebrow">At a glance</p>
        <h2 id="overview-heading" className="mt-1 text-2xl font-bold">
          Workspace overview
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaries.map((item) => (
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
          <GlassCard className="p-5">
            <p className="muted text-sm font-medium">Current user</p>
            <p className="mt-2 truncate text-lg font-bold">
              {selectedUser?.name ?? "Not selected"}
            </p>
            <p className="muted mt-4 text-xs">
              {selectedUser?.role ?? "Select a profile to begin"}
            </p>
          </GlassCard>
        </div>
      </section>

      <GlassCard className="mt-7 p-5 sm:p-6">
        <p className="eyebrow">Publishing shortcuts</p>
        <h2 className="mt-1 text-xl font-bold">What would you like to do?</h2>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex min-h-16 items-center gap-3 rounded-xl bg-[var(--surface-muted)] px-3.5"
            >
              <span className="grid size-10 place-items-center rounded-lg bg-[var(--surface-strong)] text-[var(--primary)]">
                <Icon name={action.icon} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-bold">{action.label}</span>
                <span className="muted text-xs">{action.note}</span>
              </span>
              <Icon name="chevron" className="ml-auto size-4" />
            </Link>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
