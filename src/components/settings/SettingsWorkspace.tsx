"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { feedSources } from "@/data/mockData";
import { usePreferences, type ThemePreference } from "@/context/PreferencesContext";
import { usePublishing } from "@/context/PublishingContext";
import { appConfig } from "@/config/app";

const themes: { id: ThemePreference; label: string; note: string }[] = [
  { id: "light", label: "Light", note: "Bright, calm surfaces" },
  { id: "dark", label: "Dark", note: "Reduced-light workspace" },
  { id: "system", label: "System", note: "Match this device" },
];

export function SettingsWorkspace() {
  const { theme, setTheme, subscriptions, toggleSubscription } = usePreferences();
  const { notify } = usePublishing();
  const updateSubscription = (id: string, name: string) => {
    const subscribing = !subscriptions.includes(id);
    toggleSubscription(id);
    notify(subscribing ? "RSS source subscribed" : "RSS source unsubscribed", name, subscribing ? "Articles are now visible in External RSS" : "Articles are now hidden from External RSS");
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
            {feedSources.map((feed) => { const checked = subscriptions.includes(feed.id); return <div key={feed.id} className="flex min-h-20 items-center gap-4 py-3"><span className="min-w-0 flex-1"><span className="block font-bold">{feed.name}</span><span className="muted mt-1 block text-sm">{feed.description}</span></span><label className="relative inline-flex min-h-11 min-w-14 cursor-pointer items-center"><input type="checkbox" className="peer sr-only" checked={checked} onChange={() => updateSubscription(feed.id, feed.name)} /><span className="h-7 w-12 rounded-full bg-[var(--border-strong)] peer-checked:bg-[var(--primary)] peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-[var(--primary)] after:absolute after:left-1 after:top-2 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-200 peer-checked:after:translate-x-5" /><span className="sr-only">{checked ? `Unsubscribe from ${feed.name}` : `Subscribe to ${feed.name}`}</span></label></div>; })}
          </div>
        </GlassCard>
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="p-6"><p className="eyebrow">Destinations</p><h2 className="mt-2 text-xl font-bold">Subject channels</h2><p className="muted mt-2 text-sm leading-6">Add or remove the local subject feeds available when publishing.</p><Link href="/channels" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 text-sm font-bold hover:border-[var(--primary)]">Manage channels <Icon name="arrow" className="size-4" /></Link></GlassCard>
          <GlassCard className="p-6"><p className="eyebrow">About this version</p><h2 className="mt-2 text-xl font-bold">Version {appConfig.version}</h2><div className="mt-4 flex flex-wrap gap-2"><Badge>Assessment 1</Badge><Badge tone="cyan">Frontend only</Badge><Badge tone="neutral">Mock data</Badge></div><p className="muted mt-4 text-sm leading-6">No backend, live RSS processing or LMS connection is included.</p></GlassCard>
        </div>
      </div>
    </div>
  );
}
