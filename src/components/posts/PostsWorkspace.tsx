"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { useContent } from "@/context/ContentContext";
import { usePreferences } from "@/context/PreferencesContext";
import { usePublishing } from "@/context/PublishingContext";
import { useSession } from "@/context/SessionContext";
import { classifications, externalArticles, feedSources } from "@/data/mockData";
import { users } from "@/data/users";
import { PublishComposer } from "@/components/publishing/PublishComposer";
import type { ExternalArticle, InternalPost } from "@/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function PostsWorkspace() {
  const params = useSearchParams();
  const [tab, setTab] = useState<"internal" | "external">(params.get("tab") === "external" ? "external" : "internal");
  const [search, setSearch] = useState("");
  const [classification, setClassification] = useState("");
  const [author, setAuthor] = useState("");
  const [channel, setChannel] = useState(params.get("channel") ?? "");
  const [source, setSource] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [composer, setComposer] = useState<ExternalArticle | "internal" | null>(params.get("create") === "1" ? "internal" : null);
  const [deleting, setDeleting] = useState<InternalPost | null>(null);
  const { posts, channels, deletePost } = useContent();
  const { selectedUser } = useSession();
  const { subscriptions } = usePreferences();
  const { notify } = usePublishing();

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
  const confirmDelete = () => {
    if (!deleting) return;
    deletePost(deleting.id);
    notify("Post deleted", `“${deleting.title}”`, "Removed from the local posts list");
    setDeleting(null);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Content library"
        title="Posts"
        description="Create internal updates or curate articles from subscribed RSS sources."
        action={tab === "internal" ? <Button onClick={() => setComposer("internal")}><Icon name="plus" className="size-4" /> Create post</Button> : undefined}
      />
      <div className="mb-5 flex w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1" role="tablist" aria-label="Post sources">
        <button role="tab" aria-selected={tab === "internal"} onClick={() => changeTab("internal")} className={`min-h-11 flex-1 rounded-lg px-4 text-sm font-bold ${tab === "internal" ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)]"}`}>Internal posts <span className="ml-1 opacity-75">{posts.length}</span></button>
        <button role="tab" aria-selected={tab === "external"} onClick={() => changeTab("external")} className={`min-h-11 flex-1 rounded-lg px-4 text-sm font-bold ${tab === "external" ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)]"}`}>External RSS <span className="ml-1 opacity-75">{external.length}</span></button>
      </div>
      <GlassCard className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative xl:col-span-1"><span className="sr-only">Search posts</span><Icon name="search" className="absolute left-3 top-3.5 size-4 text-[var(--text-muted)]" /><input className="field pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${tab === "internal" ? "posts" : "articles"}…`} /></label>
          <label><span className="sr-only">Classification</span><select className="field" value={classification} onChange={(event) => setClassification(event.target.value)}><option value="">All classifications</option>{classifications.map((item) => <option key={item}>{item}</option>)}</select></label>
          {tab === "internal" ? <><label><span className="sr-only">Author</span><select className="field" value={author} onChange={(event) => setAuthor(event.target.value)}><option value="">All authors</option>{users.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span className="sr-only">Channel</span><select className="field" value={channel} onChange={(event) => setChannel(event.target.value)}><option value="">All channels</option>{channels.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</select></label></> : <label className="xl:col-span-2"><span className="sr-only">RSS source</span><select className="field" value={source} onChange={(event) => setSource(event.target.value)}><option value="">All subscribed sources</option>{feedSources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
        </div>
        {(search || classification || author || channel || source) && <button onClick={clear} className="mt-3 text-xs font-bold text-[var(--primary)] hover:underline">Clear all filters</button>}
      </GlassCard>
      <div className="mb-4 flex items-center justify-between"><p className="muted text-sm">{tab === "internal" ? internal.length : external.length} results</p><p className="muted text-xs">Newest first</p></div>
      <div className="grid gap-4">
        {tab === "internal" ? internal.map((post) => (
          <GlassCard key={post.id} className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2"><Badge>{post.classification}</Badge><Badge tone="green"><span className="mr-1 size-1.5 rounded-full bg-current" />Published</Badge></div>
              <button type="button" onClick={() => setDeleting(post)} aria-label={`Delete ${post.title}`} className="grid size-11 shrink-0 place-items-center rounded-xl text-[var(--text-muted)] hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] hover:text-[var(--danger)]"><Icon name="trash" className="size-5" /></button>
            </div>
            <h2 className="mt-3 text-xl font-bold tracking-[-.02em]">{post.title}</h2>
            <p className="muted mt-2 text-sm">{post.authorName} · {formatDate(post.publishedAt)}</p>
            <p className="mt-4 max-w-4xl leading-7 text-[var(--text-muted)]">{post.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">{post.channelIds.map((id) => <Badge key={id} tone="neutral">{channels.find((item) => item.id === id)?.code ?? id}</Badge>)}</div>
          </GlassCard>
        )) : external.map((article) => {
          const feed = feedSources.find((item) => item.id === article.feedId)!;
          const open = expanded.includes(article.id);
          return <GlassCard key={article.id} className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2"><Badge tone="cyan">{feed.name}</Badge><Badge>{article.classification}</Badge></div>
            <h2 className="mt-3 text-xl font-bold tracking-[-.02em]">{article.title}</h2>
            <p className="muted mt-2 text-sm">{formatDate(article.publishedAt)}</p>
            <p id={`summary-${article.id}`} className={`mt-4 max-w-4xl leading-7 text-[var(--text-muted)] ${open ? "" : "line-clamp-2"}`}>{article.summary}{open && " This mock article is provided for demonstration only. It contains no copied source material and does not link to a live feed."}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3"><Button size="sm" onClick={() => setComposer(article)}>Post to channels <Icon name="arrow" className="size-4" /></Button><button aria-expanded={open} aria-controls={`summary-${article.id}`} onClick={() => setExpanded((current) => current.includes(article.id) ? current.filter((id) => id !== article.id) : [...current, article.id])} className="min-h-11 rounded-lg px-3 text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary-soft)]">{open ? "Show less" : "Read summary"}</button></div>
          </GlassCard>;
        })}
        {((tab === "internal" && !internal.length) || (tab === "external" && !external.length)) && <GlassCard className="p-10 text-center"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon name="search" className="size-6" /></span><h2 className="mt-4 text-xl font-bold">No matching content</h2><p className="muted mt-2 text-sm">Try clearing a filter or using a broader search.</p><Button variant="secondary" className="mt-5" onClick={clear}>Clear filters</Button></GlassCard>}
      </div>
      {composer !== null && selectedUser && <PublishComposer open article={composer === "internal" ? null : composer} onClose={() => setComposer(null)} />}
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete post?" description="This removes the post from the local application. You can restore original sample posts from Settings." size="sm">
        {deleting && <div className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_25%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_7%,var(--surface))] p-4"><p className="font-bold">{deleting.title}</p><p className="muted mt-1 text-sm">{deleting.authorName} · {formatDate(deleting.publishedAt)}</p></div>}
        <div className="mt-6 flex justify-between gap-3"><Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" onClick={confirmDelete}>Delete post</Button></div>
      </Modal>
    </div>
  );
}
