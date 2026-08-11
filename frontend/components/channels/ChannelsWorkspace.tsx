"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/layout/PageHeader";
import { useContent } from "@/context/ContentContext";
import { usePreferences } from "@/context/PreferencesContext";

export function ChannelsWorkspace() {
  const { channels } = useContent();
  const { channelListLayout, setChannelListLayout } = usePreferences();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Publishing catalogue"
        title="Channels"
        description="The fixed CSIT feeds available for publishing and RSS distribution."
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="muted text-sm">{channels.length} publishing channels</p>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 self-start sm:self-auto">
          <span className="text-sm font-bold">One channel per row</span>
          <input
            type="checkbox"
            className="peer sr-only"
            checked={channelListLayout}
            onChange={(event) => setChannelListLayout(event.target.checked)}
          />
          <span className="relative block h-7 w-12 rounded-full bg-[var(--border-strong)] shadow-inner peer-checked:bg-[var(--primary)]">
            <span
              aria-hidden="true"
              className={`absolute left-1 top-1 size-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.28)] transition-transform duration-200 ${channelListLayout ? "translate-x-5" : "translate-x-0"}`}
            />
          </span>
        </label>
      </div>
      <div
        className={channelListLayout ? "grid gap-3" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"}
      >
        {channels.map((channel) => (
          <GlassCard
            key={channel.id}
            className={
              channelListLayout
                ? "flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                : "group flex min-h-56 flex-col p-5"
            }
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Icon name="channels" className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs font-bold tracking-[.08em] text-[var(--primary)]">
                {channel.code}
              </p>
              <h2 className="mt-1 text-lg font-bold">{channel.title}</h2>
              <p className="muted mt-2 text-sm">{channel.description}</p>
              <p className="muted mt-3 text-xs">{channel.postCount} posts</p>
            </div>
            <Link
              href={`/posts?channel=${channel.id}`}
              className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-3 text-sm font-bold hover:border-[var(--primary)] sm:mt-0"
            >
              View posts <Icon name="arrow" className="size-4" />
            </Link>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
