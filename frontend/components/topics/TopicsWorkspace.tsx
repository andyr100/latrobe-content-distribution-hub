"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { useContent } from "@/context/ContentContext";
import { usePreferences } from "@/context/PreferencesContext";

export function TopicsWorkspace() {
  const { topics } = useContent();
  const { topicListLayout, setTopicListLayout } = usePreferences();
  return <div className="mx-auto max-w-6xl">
    <PageHeader eyebrow="Content catalogue" title="Channels" description="Eight fixed CSIT channels organise posts and their first-party RSS feeds." />
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="muted text-sm">{topics.length} publishing channels</p><label className="inline-flex min-h-11 cursor-pointer items-center gap-3 self-start sm:self-auto"><span className="text-sm font-bold">One channel per row</span><input type="checkbox" className="peer sr-only" checked={topicListLayout} onChange={(event) => setTopicListLayout(event.target.checked)} /><span className="relative block h-7 w-12 rounded-full bg-[var(--border-strong)] shadow-inner peer-checked:bg-[var(--primary)]"><span aria-hidden="true" className={`absolute left-1 top-1 size-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.28)] transition-transform duration-200 ${topicListLayout ? "translate-x-5" : "translate-x-0"}`} /></span></label></div>
    <div className={topicListLayout ? "grid gap-3" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"}>{topics.map((topic) => <GlassCard key={topic.id} className={topicListLayout ? "flex flex-col gap-4 p-5 sm:flex-row sm:items-center" : "group flex min-h-56 flex-col p-5"}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon name="channels" className="size-5" /></span><div className="min-w-0 flex-1"><p className="font-mono text-xs font-bold tracking-[.08em] text-[var(--primary)]">{topic.code}</p><h2 className="mt-1 text-lg font-bold">{topic.name}</h2><p className="muted mt-2 text-sm">{topic.description}</p><p className="muted mt-3 text-xs">{topic.postCount} posts</p></div><Link href={`/posts?topic=${topic.id}`} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-3 text-sm font-bold hover:border-[var(--primary)] sm:mt-0">View posts <Icon name="arrow" className="size-4" /></Link></GlassCard>)}</div>
  </div>;
}
