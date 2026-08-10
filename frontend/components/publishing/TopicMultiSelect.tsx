"use client";

import { useMemo, useState } from "react";
import { useContent } from "@/context/ContentContext";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

export function TopicMultiSelect({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const { topics } = useContent();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const visible = useMemo(() => topics.filter((topic) => `${topic.code} ${topic.name}`.toLowerCase().includes(query.toLowerCase())), [topics, query]);
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);

  return <div>
    <div className="mb-2 flex items-center justify-between"><label htmlFor="topic-search" className="text-sm font-bold">Add to Channel(s) <span className="text-[var(--danger)]">*</span></label><span className="muted text-xs">{selected.length} selected</span></div>
    <div className="relative">
      <Icon name="search" className="absolute left-3 top-3.5 size-4 text-[var(--text-muted)]" />
      <input id="topic-search" role="combobox" aria-autocomplete="list" className="field pl-10 pr-10" value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} placeholder="Search channels…" aria-expanded={open} aria-controls="channel-options" />
      <button type="button" aria-label={open ? "Close channel options" : "Open channel options"} onClick={() => setOpen(!open)} className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-[var(--text-muted)]"><Icon name="chevron" className={`size-4 rotate-90 ${open ? "-rotate-90" : ""}`} /></button>
      {open && <div id="channel-options" role="listbox" aria-multiselectable="true" className="relative z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-[var(--border-strong)] bg-[var(--surface-strong)] p-1.5 shadow-[var(--shadow)] backdrop-blur-xl">
        <button type="button" role="option" aria-selected={selected.length === topics.length} onClick={() => onChange(selected.length === topics.length ? [] : topics.map((topic) => topic.id))} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-bold hover:bg-[var(--primary-soft)]"><span className={`grid size-5 place-items-center rounded border ${selected.length === topics.length ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border-strong)]"}`}>{selected.length === topics.length && <Icon name="check" className="size-3.5" />}</span>All Channels<span className="muted ml-auto text-xs">{topics.length}</span></button>
        {visible.map((topic) => <button key={topic.id} type="button" role="option" aria-selected={selected.includes(topic.id)} onClick={() => toggle(topic.id)} className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left hover:bg-[var(--surface-muted)]"><span className={`grid size-5 shrink-0 place-items-center rounded border ${selected.includes(topic.id) ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border-strong)]"}`}>{selected.includes(topic.id) && <Icon name="check" className="size-3.5" />}</span><span><span className="block text-sm font-bold">{topic.name}</span><span className="muted block text-xs">{topic.code}</span></span></button>)}
        {!visible.length && <p className="muted p-4 text-center text-sm">No matching channels</p>}
      </div>}
    </div>
    {selected.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{selected.map((id) => { const topic = topics.find((item) => item.id === id); return topic ? <Badge key={id} tone="neutral">{topic.name}<button type="button" onClick={() => toggle(id)} aria-label={`Remove ${topic.name}`} className="ml-1.5 rounded-full p-0.5 hover:bg-[var(--border)]"><Icon name="close" className="size-3" /></button></Badge> : null; })}</div>}
  </div>;
}
