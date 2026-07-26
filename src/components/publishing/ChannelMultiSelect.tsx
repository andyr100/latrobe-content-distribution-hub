"use client";

import { useMemo, useState } from "react";
import { useContent } from "@/context/ContentContext";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

export function ChannelMultiSelect({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const { channels } = useContent();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const active = channels.filter((channel) => channel.active);
  const visible = useMemo(() => active.filter((channel) => `${channel.code} ${channel.subjectName}`.toLowerCase().includes(query.toLowerCase())), [active, query]);
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between"><label htmlFor="channel-search" className="text-sm font-bold">Channels <span className="text-[var(--danger)]">*</span></label><span className="muted text-xs">{selected.length} selected</span></div>
      <div className="relative">
        <Icon name="search" className="absolute left-3 top-3.5 size-4 text-[var(--text-muted)]" />
        <input id="channel-search" role="combobox" aria-autocomplete="list" className="field pl-10 pr-10" value={query} onFocus={() => setOpen(true)} onChange={(e) => { setQuery(e.target.value); setOpen(true); }} placeholder="Search channel code or subject…" aria-expanded={open} aria-controls="channel-options" />
        <button type="button" aria-label={open ? "Close channel options" : "Open channel options"} onClick={() => setOpen(!open)} className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-[var(--text-muted)]"><Icon name="chevron" className={`size-4 rotate-90 ${open ? "-rotate-90" : ""}`} /></button>
        {open && <div id="channel-options" role="listbox" aria-multiselectable="true" className="relative z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-[var(--border-strong)] bg-[var(--surface-strong)] p-1.5 shadow-[var(--shadow)] backdrop-blur-xl">
          <button type="button" role="option" aria-selected={selected.length === active.length} onClick={() => onChange(selected.length === active.length ? [] : active.map((channel) => channel.id))} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-bold hover:bg-[var(--primary-soft)]"><span className={`grid size-5 place-items-center rounded border ${selected.length === active.length ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border-strong)]"}`}>{selected.length === active.length && <Icon name="check" className="size-3.5" />}</span>All active channels<span className="muted ml-auto text-xs">{active.length}</span></button>
          {visible.map((channel) => <button key={channel.id} type="button" role="option" aria-selected={selected.includes(channel.id)} onClick={() => toggle(channel.id)} className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left hover:bg-[var(--surface-muted)]"><span className={`grid size-5 shrink-0 place-items-center rounded border ${selected.includes(channel.id) ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border-strong)]"}`}>{selected.includes(channel.id) && <Icon name="check" className="size-3.5" />}</span><span><span className="block text-sm font-bold">{channel.code}</span><span className="muted block text-xs">{channel.subjectName}</span></span></button>)}
          {!visible.length && <p className="muted p-4 text-center text-sm">No matching channels</p>}
        </div>}
      </div>
      {selected.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{selected.map((id) => { const channel = channels.find((item) => item.id === id); return channel ? <Badge key={id} tone="neutral">{channel.code}<button type="button" onClick={() => toggle(id)} aria-label={`Remove ${channel.code}`} className="ml-1.5 rounded-full p-0.5 hover:bg-[var(--border)]"><Icon name="close" className="size-3" /></button></Badge> : null; })}</div>}
    </div>
  );
}
