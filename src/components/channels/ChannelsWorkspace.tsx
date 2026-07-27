"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { useContent } from "@/context/ContentContext";
import { usePublishing } from "@/context/PublishingContext";
import { usePreferences } from "@/context/PreferencesContext";
import type { Channel } from "@/types";

export function ChannelsWorkspace() {
  const { channels, addChannel, deleteChannel } = useContent();
  const { notify } = usePublishing();
  const { channelListLayout, setChannelListLayout } = usePreferences();
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Channel | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("Semester 2, 2026");
  const [active, setActive] = useState(true);
  const normalized = code.trim().toUpperCase();
  const codeValid = /^LT[A-Z0-9]{4,10}$/.test(normalized) && !channels.some((channel) => channel.code === normalized);
  const valid = codeValid && name.trim().length >= 3 && semester.trim().length >= 3;
  const openAdd = () => { setCode(""); setName(""); setSemester("Semester 2, 2026"); setActive(true); setAdding(true); };
  const submit = () => {
    if (!valid) return;
    addChannel({ id: `${normalized.toLowerCase()}-${Date.now()}`, code: normalized, subjectName: name.trim(), semester: semester.trim(), active, postCount: 0 });
    setAdding(false); notify("Channel added", normalized, `${name.trim()} is ready for publishing`);
  };
  const confirmDelete = () => {
    if (!deleting) return;
    deleteChannel(deleting.id); notify("Channel deleted", deleting.code, `${deleting.subjectName} was removed`); setDeleting(null);
  };
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Destinations" title="Channels" description="Manage the subject feeds available for simulated content distribution." action={<Button onClick={openAdd}><Icon name="plus" className="size-4" /> Add channel</Button>} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center justify-between gap-5"><p className="muted text-sm">{channels.length} subject channels</p><p className="muted text-xs">{channels.filter((channel) => channel.active).length} active</p></div><label className="inline-flex min-h-11 cursor-pointer items-center gap-3 self-start sm:self-auto"><span className="text-sm font-bold">One channel per row</span><input type="checkbox" className="peer sr-only" checked={channelListLayout} onChange={(event) => setChannelListLayout(event.target.checked)} /><span className="relative block h-7 w-12 rounded-full bg-[var(--border-strong)] shadow-inner peer-checked:bg-[var(--primary)] peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-[var(--primary)]"><span aria-hidden="true" className={`absolute left-1 top-1 size-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.28)] transition-transform duration-200 ${channelListLayout ? "translate-x-5" : "translate-x-0"}`} /></span></label></div>
      <div className={channelListLayout ? "grid gap-3" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"}>
        {channels.map((channel) => channelListLayout ? <GlassCard key={channel.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon name="channels" className="size-5" /></span>
          <div className="min-w-0 flex-1"><p className="font-mono text-xs font-bold tracking-[.08em] text-[var(--primary)]">{channel.code}</p><h2 className="mt-1 text-lg font-bold">{channel.subjectName}</h2><p className="muted mt-1 text-xs">{channel.semester} <span aria-hidden="true">·</span> {channel.postCount} posts</p></div>
          <Badge tone={channel.active ? "green" : "neutral"}><span className="mr-1.5 size-1.5 rounded-full bg-current" />{channel.active ? "Active" : "Inactive"}</Badge>
          <div className="flex items-center gap-2 sm:ml-2"><Link href={`/posts?channel=${channel.id}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-3 text-sm font-bold hover:border-[var(--primary)] sm:flex-none">View posts <Icon name="arrow" className="size-4" /></Link><button type="button" onClick={() => setDeleting(channel)} aria-label={`Delete ${channel.code}`} className="grid size-11 place-items-center rounded-xl text-[var(--text-muted)] hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] hover:text-[var(--danger)]"><Icon name="trash" className="size-5" /></button></div>
        </GlassCard> : <GlassCard key={channel.id} className="group flex min-h-64 flex-col p-5">
          <div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon name="channels" className="size-5" /></span><Badge tone={channel.active ? "green" : "neutral"}><span className="mr-1.5 size-1.5 rounded-full bg-current" />{channel.active ? "Active" : "Inactive"}</Badge></div>
          <p className="mt-5 font-mono text-xs font-bold tracking-[.08em] text-[var(--primary)]">{channel.code}</p>
          <h2 className="mt-1 text-lg font-bold leading-6">{channel.subjectName}</h2>
          <div className="muted mt-4 flex items-center gap-3 text-xs"><span>{channel.semester}</span><span aria-hidden="true">·</span><span>{channel.postCount} posts</span></div>
          <div className="mt-auto flex items-center gap-2 pt-5"><Link href={`/posts?channel=${channel.id}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-3 text-sm font-bold hover:border-[var(--primary)]">View posts <Icon name="arrow" className="size-4" /></Link><button type="button" onClick={() => setDeleting(channel)} aria-label={`Delete ${channel.code}`} className="grid size-11 place-items-center rounded-xl text-[var(--text-muted)] hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] hover:text-[var(--danger)]"><Icon name="trash" className="size-5" /></button></div>
        </GlassCard>)}
      </div>
      <Modal open={adding} onClose={() => setAdding(false)} title="Add subject channel" description="Create a local mock destination for this prototype." size="sm">
        <div className="grid gap-4">
          <label><span className="mb-2 block text-sm font-bold">Subject code <span className="text-[var(--danger)]">*</span></span><input className="field uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. LTCSE4CBA" maxLength={12} aria-describedby="code-help" /><span id="code-help" className={`mt-1 block text-xs ${code && !codeValid ? "text-[var(--danger)]" : "muted"}`}>{code && !codeValid ? "Use a unique LT-prefixed code (6–12 characters)." : "All subject codes must begin with LT."}</span></label>
          <label><span className="mb-2 block text-sm font-bold">Subject name <span className="text-[var(--danger)]">*</span></span><input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mobile Application Development" /></label>
          <label><span className="mb-2 block text-sm font-bold">Semester <span className="text-[var(--danger)]">*</span></span><select className="field" value={semester} onChange={(e) => setSemester(e.target.value)}><option>Semester 2, 2026</option><option>Semester 1, 2027</option><option>Summer, 2027</option></select></label>
          <label className="flex min-h-12 items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3"><span><span className="block text-sm font-bold">Active channel</span><span className="muted block text-xs">Available as a publishing destination</span></span><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-5 accent-[var(--primary)]" /></label>
        </div>
        <div className="mt-6 flex justify-between gap-3"><Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button><Button disabled={!valid} onClick={submit}>Add channel</Button></div>
      </Modal>
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete channel?" description="This removes the mock channel from the local application. Existing post records are retained." size="sm">
        {deleting && <div className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_25%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_7%,var(--surface))] p-4"><p className="font-bold">{deleting.code}</p><p className="muted mt-1 text-sm">{deleting.subjectName}</p></div>}
        <div className="mt-6 flex justify-between gap-3"><Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" onClick={confirmDelete}>Delete channel</Button></div>
      </Modal>
    </div>
  );
}
