"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useSession } from "@/context/SessionContext";
import { useContent } from "@/context/ContentContext";
import { usePreferences } from "@/context/PreferencesContext";
const activity = [
  { actor: "Dr Sarah Williams", action: "published Assessment Preparation Guide", meta: "3 channels · 18 minutes ago", tone: "var(--primary)" },
  { actor: "Administrator", action: "added LTINF2HCI", meta: "Human–Computer Interaction · Yesterday", tone: "var(--cyan)" },
  { actor: "Prof Michael Chen", action: "republished an industry article", meta: "2 channels · Yesterday", tone: "var(--magenta)" },
  { actor: "Dr Emily Taylor", action: "published Timetable Update", meta: "1 channel · 2 days ago", tone: "var(--success)" },
  { actor: "Administrator", action: "updated RSS subscriptions", meta: "3 days ago", tone: "var(--cyan)" },
];
const actions: { label: string; note: string; href: string; icon: IconName }[] = [
  { label: "Create post", note: "Write an internal update", href: "/posts?create=1", icon: "plus" },
  { label: "View external RSS", note: "Review subscribed sources", href: "/posts?tab=external", icon: "rss" },
  { label: "Manage channels", note: "Edit subject destinations", href: "/channels", icon: "channels" },
  { label: "Open settings", note: "Themes and subscriptions", href: "/settings", icon: "settings" },
];

export function Dashboard() {
  const { selectedUser } = useSession();
  const { posts, channels } = useContent();
  const { subscriptions } = usePreferences();
  const summaries: { label: string; value: string; note: string; icon: IconName; tone: string }[] = [
    { label: "Posts published", value: String(posts.length), note: "Internal content", icon: "posts", tone: "var(--primary)" },
    { label: "Subject channels", value: String(channels.length), note: `${channels.filter((item) => item.active).length} active`, icon: "channels", tone: "var(--cyan)" },
    { label: "External RSS feeds", value: String(subscriptions.length), note: `${subscriptions.length === 5 ? "All" : "Some"} subscribed`, icon: "rss", tone: "var(--magenta)" },
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(130deg,color-mix(in_srgb,var(--primary)_16%,var(--surface)),var(--surface)_54%,color-mix(in_srgb,var(--cyan)_10%,var(--surface)))] px-6 py-9 shadow-[var(--shadow)] sm:px-9 sm:py-11">
        <div className="absolute -right-16 -top-24 size-72 rounded-full bg-[color-mix(in_srgb,var(--magenta)_14%,transparent)] blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="eyebrow">Content distribution workspace</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-.045em] sm:text-5xl">Good afternoon{selectedUser ? `, ${selectedUser.name.replace(/^(Dr|Prof) /, "").split(" ")[0]}` : ""}.</h1>
          <p className="muted mt-4 max-w-2xl text-base leading-7 sm:text-lg">Create university updates, curate trusted external content and distribute both through one clear publishing workflow.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/posts?create=1" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-lg hover:bg-[var(--primary-hover)]"><Icon name="plus" className="size-5" />Create post</Link>
            <Link href="/workflow" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-5 text-sm font-bold hover:border-[var(--primary)]">See how it works <Icon name="arrow" className="size-4" /></Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="overview-heading" className="mt-7">
        <div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">At a glance</p><h2 id="overview-heading" className="mt-1 text-2xl font-bold">Workspace overview</h2></div><p className="muted hidden text-sm sm:block">Updated just now</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaries.map((item) => <GlassCard key={item.label} className="p-5"><div className="flex items-start justify-between"><div><p className="muted text-sm font-medium">{item.label}</p><p className="mt-2 text-3xl font-bold tracking-[-.04em]">{item.value}</p></div><span className="grid size-11 place-items-center rounded-xl bg-[var(--surface-muted)]" style={{ color: item.tone }}><Icon name={item.icon} className="size-5" /></span></div><p className="muted mt-4 text-xs">{item.note}</p></GlassCard>)}
          <GlassCard className="p-5"><div className="flex items-start justify-between"><div><p className="muted text-sm font-medium">Current user</p><p className="mt-2 max-w-40 truncate text-lg font-bold">{selectedUser?.name ?? "Not selected"}</p></div><span className="grid size-11 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon name="user" className="size-5" /></span></div><p className="muted mt-4 text-xs">{selectedUser?.role ?? "Select a profile to begin"}</p></GlassCard>
        </div>
      </section>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-end justify-between"><div><p className="eyebrow">Latest changes</p><h2 className="mt-1 text-xl font-bold">Recent activity</h2></div><Link href="/posts" className="text-sm font-bold text-[var(--primary)] hover:underline">View posts</Link></div>
          <ul className="mt-5 divide-y divide-[var(--border)]">
            {activity.map((item, index) => <li key={index} className="flex gap-3 py-3.5 first:pt-0 last:pb-0"><span className="mt-2 size-2 shrink-0 rounded-full" style={{ background: item.tone }} /><div><p className="text-sm leading-6"><strong>{item.actor}</strong> {item.action}</p><p className="muted mt-0.5 text-xs">{item.meta}</p></div></li>)}
          </ul>
        </GlassCard>
        <GlassCard className="p-5 sm:p-6">
          <p className="eyebrow">Shortcuts</p><h2 className="mt-1 text-xl font-bold">Quick actions</h2>
          <div className="mt-5 grid gap-2">
            {actions.map((action) => <Link key={action.label} href={action.href} className="group flex min-h-16 items-center gap-3 rounded-xl border border-transparent bg-[var(--surface-muted)] px-3.5 hover:border-[var(--border-strong)]"><span className="grid size-10 place-items-center rounded-lg bg-[var(--surface-strong)] text-[var(--primary)]"><Icon name={action.icon} className="size-5" /></span><span><span className="block text-sm font-bold">{action.label}</span><span className="muted text-xs">{action.note}</span></span><Icon name="chevron" className="ml-auto size-4 text-[var(--text-muted)] group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" /></Link>)}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
