"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublishComposer } from "@/components/publishing/PublishComposer";
import { ChannelMultiSelect } from "@/components/publishing/ChannelMultiSelect";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { useContent } from "@/context/ContentContext";
import { usePublishing } from "@/context/PublishingContext";
import { useSession } from "@/context/SessionContext";
import type { InternalPost } from "@/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function PostsWorkspace() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [author, setAuthor] = useState("");
  const [channel, setChannel] = useState(params.get("channel") ?? "");
  const [composer, setComposer] = useState(params.get("create") === "1");
  const [deleting, setDeleting] = useState<InternalPost | null>(null);
  const [editing, setEditing] = useState<InternalPost | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editPublishedAt, setEditPublishedAt] = useState("");
  const [editFeeds, setEditFeeds] = useState<string[]>([]);
  const { posts, channels, deletePost, updatePost, loading, error } = useContent();
  const { selectedUser, users } = useSession();
  const { notify } = usePublishing();

  const visible = useMemo(
    () =>
      posts.filter(
        (post) =>
          (!search || `${post.title} ${post.body}`.toLowerCase().includes(search.toLowerCase())) &&
          (!author || post.authorId === author) &&
          (!channel || post.feedIds.includes(channel)),
      ),
    [posts, search, author, channel],
  );

  const clear = () => {
    setSearch("");
    setAuthor("");
    setChannel("");
  };
  const beginEdit = (post: InternalPost) => {
    setEditing(post);
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditPublishedAt(toDateTimeLocal(post.publishedAt));
    setEditFeeds(post.feedIds);
  };

  const saveEdit = async () => {
    if (!editing || !editTitle.trim() || !editBody.trim() || !editFeeds.length || !editPublishedAt)
      return;
    try {
      await updatePost(editing.id, {
        title: editTitle.trim(),
        body: editBody.trim(),
        publishedAt: new Date(editPublishedAt).toISOString(),
        feedIds: editFeeds,
      });
      notify(
        "Post updated",
        editTitle.trim(),
        "SQLite and channel RSS feeds now use the new content",
      );
      setEditing(null);
    } catch (caught) {
      notify(
        "Post could not be updated",
        editTitle,
        caught instanceof Error ? caught.message : "The API request failed",
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deletePost(deleting.id);
      notify("Post deleted", deleting.title, "Removed from SQLite and its channel RSS feeds");
      setDeleting(null);
    } catch (caught) {
      notify(
        "Post could not be deleted",
        deleting.title,
        caught instanceof Error ? caught.message : "The API request failed",
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Content library"
        title="Posts"
        description="Create and manage database-backed updates for the fixed CSIT channels."
        action={
          <Button onClick={() => setComposer(true)}>
            <Icon name="plus" className="size-4" /> Create post
          </Button>
        }
      />
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-[var(--danger)] bg-[var(--surface)] p-4 text-sm text-[var(--danger)]"
        >
          {error}. Confirm the API is running on port 4000.
        </div>
      )}
      <GlassCard className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="relative">
            <span className="sr-only">Search posts</span>
            <Icon
              name="search"
              className="absolute left-3 top-3.5 size-4 text-[var(--text-muted)]"
            />
            <input
              className="field pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search posts…"
            />
          </label>
          <label>
            <span className="sr-only">Author</span>
            <select
              className="field"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
            >
              <option value="">All authors</option>
              {users.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Channel</span>
            <select
              className="field"
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
            >
              <option value="">All channels</option>
              {channels.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        {(search || author || channel) && (
          <button
            onClick={clear}
            className="mt-3 text-xs font-bold text-[var(--primary)] hover:underline"
          >
            Clear all filters
          </button>
        )}
      </GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <p className="muted text-sm">{loading ? "Loading…" : `${visible.length} results`}</p>
        <p className="muted text-xs">Newest first</p>
      </div>
      <div className="grid gap-4">
        {visible.map((post) => (
          <GlassCard key={post.id} className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <Badge tone="green">Published</Badge>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => beginEdit(post)}
                  aria-label={`Edit ${post.title}`}
                  className="grid size-11 place-items-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                >
                  <Icon name="posts" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(post)}
                  aria-label={`Delete ${post.title}`}
                  className="grid size-11 place-items-center rounded-xl text-[var(--text-muted)] hover:text-[var(--danger)]"
                >
                  <Icon name="trash" className="size-5" />
                </button>
              </div>
            </div>
            <h2 className="mt-3 text-xl font-bold">{post.title}</h2>
            <p className="muted mt-2 text-sm">
              {post.authorName} · {formatDate(post.publishedAt)}
            </p>
            <p className="mt-4 max-w-4xl leading-7 text-[var(--text-muted)]">{post.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.feedIds.map((id) => (
                <Badge key={id} tone="neutral">
                  {channels.find((item) => item.id === id)?.title ?? id}
                </Badge>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
      {composer && selectedUser && <PublishComposer open onClose={() => setComposer(false)} />}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit post"
        description="Save changes to SQLite and every linked channel RSS feed."
        size="lg"
      >
        <div className="grid gap-4">
          <label>
            <span className="mb-2 block text-sm font-bold">Title</span>
            <input
              className="field"
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">Published date</span>
            <input
              type="datetime-local"
              className="field"
              value={editPublishedAt}
              onChange={(event) => setEditPublishedAt(event.target.value)}
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">Post body</span>
            <textarea
              className="field min-h-28"
              value={editBody}
              onChange={(event) => setEditBody(event.target.value)}
            />
          </label>
          <ChannelMultiSelect selected={editFeeds} onChange={setEditFeeds} />
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="secondary" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button
            disabled={
              !editTitle.trim() || !editBody.trim() || !editFeeds.length || !editPublishedAt
            }
            onClick={() => void saveEdit()}
          >
            Save changes
          </Button>
        </div>
      </Modal>
      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete post?"
        description="This permanently removes the post from SQLite and all channel RSS feeds."
        size="sm"
      >
        {deleting && (
          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="font-bold">{deleting.title}</p>
            <p className="muted mt-1 text-sm">
              {deleting.authorName} · {formatDate(deleting.publishedAt)}
            </p>
          </div>
        )}
        <div className="mt-6 flex justify-between">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => void confirmDelete()}>
            Delete post
          </Button>
        </div>
      </Modal>
    </div>
  );
}
