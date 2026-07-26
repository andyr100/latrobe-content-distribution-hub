"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useContent } from "@/context/ContentContext";
import { usePreferences } from "@/context/PreferencesContext";
import { classifications, externalArticles, feedSources } from "@/data/mockData";
import { users } from "@/data/users";

function formatDate(value: string) { return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }

export function PostsWorkspace() {
  const params = useSearchParams();
  const [tab, setTab] = useState<"internal" | "external">(params.get("tab") === "external" ? "external" : "internal");
  const [search, setSearch] = useState("");
  const [classification, setClassification] = useState("");
  const [author, setAuthor] = useState("");
  const [channel, setChannel] = useState(params.get("channel") ?? "");
  const [source, setSource] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const { posts, channels } = useContent();
  const { subscriptions } = usePreferences();

  const internal = useMemo(() => posts.filter((post) =>
    (!search || `${post.title} ${post.body}`.toLowerCase().includes(search.toLowerCase())) &&
    (!classification || post.classification === classification) &&
    (!author || post.authorId === author) &&
    (!channel || post.channelIds.includes(channel))
  ), [posts, search, classification, author, channel]);
  const external = useMemo(() => externalArticles.filter((article) =>
    subscriptions.includes(article.feedId) &&
    (!search || `${article.title} ${article.summary}`.toLowerCase().includes(search.toLowerCase())) &&
    (!classification || article.classification === classification) &&
    (!source || article.feedId === source)
  ), [subscriptions, search, classification, source]);
  const clear = () => { setSearch(""); setClassification(""); setAuthor(""); setChannel(""); setSource(""); };
  const changeTab = (next: "internal" | "external") => { setTab(next); clear(); };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Content library" title="Posts" description="Create internal updates or curate articles from subscribed RSS sources." action={tab === "internal" ? <Button><Icon name="plus" className="size-4" /> Create post</Button> : undefined} />
      <div className="mb-5 flex w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1" role="tablist" aria-label="Post sources">
        <button role="tab" aria-selected={tab === "internal"} onClick={() => changeTab("internal")} className={`min-h-11 flex-1 rounded-lg px-4 text-sm font-bold ${tab === "internal" ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)]"}`}>Internal posts <span className="ml-1 opacity-75">{posts.length}</span></button>
        <button role="tab" aria-selected={tab === "external"} onClick={() => changeTab("external")} className={`min-h-11 flex-1 rounded-lg px-4 text-sm font-bold ${tab === "external" ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)]"}`}>External RSS <span className="ml-1 opacity-75">{external.length}</span></button>
      </div>
      <GlassCard className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative xl:col-span-1"><span className="sr-only">Search posts</span><Icon name="search" className="absolute left-3 top-3.5 size-4 text-[var(--text-muted)]" /><input className="field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${tab === "internal" ? "posts" : "articles"}…`} /></label>
          <label><span className="sr-only">Classification</span><select className="field" value={classification} onChange={(e) => setClassification(e.target.value)}><option value="">All classifications</option>{classifications.map((item) => <option key={item}>{item}</option>)}</select></label>
          {tab === "internal" ? <><label><span className="sr-only">Author</span><select className="field" value={author} onChange={(e) => setAuthor(e.target.value)}><option value="">All authors</option>{users.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span className="sr-only">Channel</span><select className="field" value={channel} onChange={(e) => setChannel(e.target.value)}><option value="">All channels</option>{channels.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</select></label></> : <label className="xl:col-span-2"><span className="sr-only">RSS source</span><select className="field" value={source} onChange={(e) => setSource(e.target.value)}><option value="">All subscribed sources</option>{feedSources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
        </div>
        {(search || classification || author || channel || source) && <button onClick={clear} className="mt-3 text-xs font-bold text-[var(--primary)] hover:underline">Clear all filters</button>}
      </GlassCard>
      <div className="mb-4 flex items-center justify-between"><p className="muted text-sm">{tab === "internal" ? internal.length : external.length} results</p><p className="muted text-xs">Newest first</p></div>
      <div className="grid gap-4">
        {tab === "internal" ? internal.map((post) => <GlassCard key={post.id} className="p-5 sm:p-6"><div className="flex flex-wrap items-center gap-2"><Badge>{post.classification}</Badge><Badge tone="green"><span className="mr-1 size-1.5 rounded-full bg-current" />Published</Badge></div><h2 className="mt-3 text-xl font-bold tracking-[-.02em]">{post.title}</h2><p className="muted mt-2 text-sm">{post.authorName} · {formatDate(post.publishedAt)}</p><p className="mt-4 max-w-4xl leading-7 text-[var(--text-muted)]">{post.body}</p><div className="mt-4 flex flex-wrap gap-2">{post.channelIds.map((id) => <Badge key={id} tone="neutral">{channels.find((c) => c.id === id)?.code ?? id}</Badge>)}</div></GlassCard>) :
          external.map((article) => { const feed = feedSources.find((item) => item.id === article.feedId)!; const open = expanded.includes(article.id); return <GlassCard key={article.id} className="p-5 sm:p-6"><div className="flex flex-wrap items-center gap-2"><Badge tone="cyan">{feed.name}</Badge><Badge>{article.classification}</Badge></div><h2 className="mt-3 text-xl font-bold tracking-[-.02em]">{article.title}</h2><p className="muted mt-2 text-sm">{formatDate(article.publishedAt)}</p><p className={`mt-4 max-w-4xl leading-7 text-[var(--text-muted)] ${open ? "" : "line-clamp-2"}`}>{article.summary}{open && " This mock article is provided for demonstration only. It contains no copied source material and does not link to a live feed."}</p><div className="mt-5 flex flex-wrap items-center gap-3"><Button size="sm">Post to channels <Icon name="arrow" className="size-4" /></Button><button aria-expanded={open} aria-controls={`summary-${article.id}`} onClick={() => setExpanded((current) => current.includes(article.id) ? current.filter((id) => id !== article.id) : [...current, article.id])} className="min-h-11 rounded-lg px-3 text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary-soft)]">{open ? "Show less" : "Read summary"}</button></div></GlassCard>; })}
        {((tab === "internal" && !internal.length) || (tab === "external" && !external.length)) && <GlassCard className="p-10 text-center"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon name="search" className="size-6" /></span><h2 className="mt-4 text-xl font-bold">No matching content</h2><p className="muted mt-2 text-sm">Try clearing a filter or using a broader search.</p><Button variant="secondary" className="mt-5" onClick={clear}>Clear filters</Button></GlassCard>}
      </div>
    </div>
  );
}
