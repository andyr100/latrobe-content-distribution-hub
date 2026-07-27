"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { feedSources } from "@/data/mockData";
import { usePreferences, type ThemePreference } from "@/context/PreferencesContext";
import { usePublishing } from "@/context/PublishingContext";
import { appConfig } from "@/config/app";
import { useContent } from "@/context/ContentContext";

const themes: { id: ThemePreference; label: string; note: string }[] = [
  { id: "light", label: "Light", note: "Bright, calm surfaces" },
  { id: "dark", label: "Dark", note: "Reduced-light workspace" },
  { id: "system", label: "System", note: "Match this device" },
];

export function SettingsWorkspace() {
  const { theme, setTheme, subscriptions, toggleSubscription, resetPreferences } = usePreferences();
  const { resetContent } = useContent();
  const { notify } = usePublishing();
  const [resetOpen, setResetOpen] = useState(false);
  const [gitHistoryOpen, setGitHistoryOpen] = useState(false);
  const updateSubscription = (id: string, name: string) => {
    const subscribing = !subscriptions.includes(id);
    toggleSubscription(id);
    notify(subscribing ? "RSS source subscribed" : "RSS source unsubscribed", name, subscribing ? "Articles are now visible in External RSS" : "Articles are now hidden from External RSS");
  };
  const resetWorkspace = () => {
    resetContent();
    resetPreferences();
    setResetOpen(false);
    notify("Workspace reset", "Default content restored", "Created posts and channels were removed");
  };
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Preferences" title="Settings" description="Choose the appearance and external sources for your workspace." />
      <div className="grid gap-6">
        <GlassCard className="p-5 sm:p-7">
          <div className="flex items-start gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon name="sun" className="size-5" /></span><div><h2 className="text-xl font-bold">Appearance</h2><p className="muted mt-1 text-sm">Theme changes transition smoothly and are saved on this device.</p></div></div>
          <fieldset className="mt-6"><legend className="sr-only">Colour theme</legend><div className="grid gap-3 sm:grid-cols-3">{themes.map((item) => <label key={item.id} className={`flex min-h-24 cursor-pointer items-center gap-3 rounded-xl border p-4 ${theme === item.id ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--border-strong)]"}`}><input type="radio" name="theme" value={item.id} checked={theme === item.id} onChange={() => setTheme(item.id)} className="sr-only" /><span className={`grid size-9 place-items-center rounded-lg ${theme === item.id ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-strong)]"}`}><Icon name={item.id === "dark" ? "moon" : "sun"} className="size-4" /></span><span><span className="block text-sm font-bold">{item.label}</span><span className="muted block text-xs">{item.note}</span></span>{theme === item.id && <Icon name="check" className="ml-auto size-4 text-[var(--primary)]" />}</label>)}</div></fieldset>
        </GlassCard>
        <GlassCard className="p-5 sm:p-7">
          <div className="flex items-start gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--cyan)_12%,transparent)] text-[var(--cyan)]"><Icon name="rss" className="size-5" /></span><div><h2 className="text-xl font-bold">RSS subscriptions</h2><p className="muted mt-1 text-sm">Subscribed sources contribute articles to the External RSS tab.</p></div></div>
          <div className="mt-6 divide-y divide-[var(--border)]">
            {feedSources.map((feed) => { const checked = subscriptions.includes(feed.id); return <div key={feed.id} className="flex min-h-20 items-center gap-4 py-3"><span className="min-w-0 flex-1"><span className="block font-bold">{feed.name}</span><span className="muted mt-1 block text-sm">{feed.description}</span></span><label className="inline-flex h-11 w-14 shrink-0 cursor-pointer items-center justify-center"><input type="checkbox" className="peer sr-only" checked={checked} onChange={() => updateSubscription(feed.id, feed.name)} /><span className="relative block h-7 w-12 rounded-full bg-[var(--border-strong)] shadow-inner peer-checked:bg-[var(--primary)] peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-[var(--primary)]"><span aria-hidden="true" className={`absolute left-1 top-1 size-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.28)] transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} /></span><span className="sr-only">{checked ? `Unsubscribe from ${feed.name}` : `Subscribe to ${feed.name}`}</span></label></div>; })}
          </div>
        </GlassCard>
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="p-6"><p className="eyebrow">Destinations</p><h2 className="mt-2 text-xl font-bold">Subject channels</h2><p className="muted mt-2 text-sm leading-6">Add or remove the local subject feeds available when publishing.</p><Link href="/channels" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 text-sm font-bold hover:border-[var(--primary)]">Manage channels <Icon name="arrow" className="size-4" /></Link></GlassCard>
          <GlassCard className="p-6"><p className="eyebrow">About this version</p><h2 className="mt-2 text-xl font-bold">Version {appConfig.version}</h2><div className="mt-4 flex flex-wrap gap-2"><Badge>Assessment 1</Badge><Badge tone="cyan">Frontend only</Badge><Badge tone="neutral">Mock data</Badge></div><p className="muted mt-4 text-sm leading-6">No backend, live RSS processing or LMS connection is included.</p></GlassCard>
        </div>
        <GlassCard className="p-5 sm:p-7">
          <button type="button" onClick={() => setGitHistoryOpen((open) => !open)} aria-expanded={gitHistoryOpen} aria-controls="git-history-list" className="flex w-full items-start justify-between gap-4 rounded-xl text-left focus-visible:outline-offset-4">
            <span className="flex min-w-0 items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon name="workflow" className="size-5" /></span><span><span className="eyebrow">Development history</span><span className="mt-1 block text-xl font-bold">Git commits</span><span className="muted mt-1 block text-sm">A genuine chronological feature-branch history for this assessment.</span></span></span>
            <span className="flex shrink-0 items-center gap-3"><span className="hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-right sm:block"><span className="block text-2xl font-bold text-[var(--primary)]">{appConfig.git.commitCount}</span><span className="muted block text-xs font-semibold">commits on {appConfig.git.branch}</span></span><span className="grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--primary)]"><Icon name="more" className="size-5" /></span></span>
          </button>
          {gitHistoryOpen && <div id="git-history-list" className="mt-6 border-t border-[var(--border)] pt-5">
            <p className="muted mb-3 text-xs font-semibold">Oldest to newest · one record per commit</p>
            <ol className="grid gap-2">
              {appConfig.git.commits.map((commit, index) => <li key={commit.hash} className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 sm:flex-row sm:items-center"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--surface-strong)] text-xs font-black text-[var(--primary)]">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><p className="break-words text-sm font-bold">{commit.message}</p><div className="muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"><code className="rounded bg-[var(--surface-strong)] px-1.5 py-0.5 font-bold text-[var(--primary)]">{commit.hash}</code><span>{commit.date} at {appConfig.git.commitTimes[commit.hash]}</span><span aria-hidden="true">·</span><span>{commit.branch}</span></div></div></li>)}
            </ol>
          </div>}
        </GlassCard>
        <GlassCard className="border-[color-mix(in_srgb,var(--danger)_28%,var(--border))] p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--danger)_11%,transparent)] text-[var(--danger)]"><Icon name="trash" className="size-5" /></span>
              <div><h2 className="text-xl font-bold">Reset workspace</h2><p className="muted mt-1 max-w-2xl text-sm leading-6">Delete content created in this browser and restore the original posts, channels, subscriptions and system theme.</p></div>
            </div>
            <Button variant="danger" className="shrink-0" onClick={() => setResetOpen(true)}>Reset to defaults</Button>
          </div>
        </GlassCard>
      </div>
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset the workspace?" description="This action removes locally created content and restores every setting to its original value." size="sm">
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_25%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_7%,var(--surface))] p-4">
          <p className="font-bold">The following local changes will be removed:</p>
          <ul className="muted mt-2 list-disc space-y-1 pl-5 text-sm leading-6"><li>Created internal posts</li><li>Added or deleted subject channels</li><li>RSS subscription changes</li><li>Saved theme preference</li></ul>
        </div>
        <div className="mt-6 flex justify-between gap-3"><Button variant="secondary" onClick={() => setResetOpen(false)}>Cancel</Button><Button variant="danger" onClick={resetWorkspace}>Delete changes & reset</Button></div>
      </Modal>
    </div>
  );
}
