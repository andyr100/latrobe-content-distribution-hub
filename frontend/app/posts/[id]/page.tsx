/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL, mapPost } from "@/lib/api";

type ApiPost = Parameters<typeof mapPost>[0] & {
  topics?: Array<{ id: string; name: string; code: string }>;
};
type ReaderPost = ReturnType<typeof mapPost> & { channelNames: string[] };
type LoadState = "loading" | "not-found" | "error" | "ready";

export default function PostReaderPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<ReaderPost | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    const loadTimer = window.setTimeout(async () => {
      const id = params.id;
      if (!/^\d+$/.test(id)) {
        if (!cancelled) setState("not-found");
        return;
      }

      setState("loading");
      try {
        const response = await fetch(`${API_BASE_URL}/api/posts/${id}`);
        if (response.status === 404) {
          if (!cancelled) setState("not-found");
          return;
        }
        if (!response.ok) throw new Error("Unable to load post");

        const payload = await response.json() as { data: ApiPost };
        if (!cancelled) {
          setPost({
            ...mapPost(payload.data),
            channelNames: payload.data.topics?.map((topic) => topic.name) ?? [],
          });
          setState("ready");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(loadTimer);
    };
  }, [params.id]);

  if (state === "loading") {
    return <main className="mx-auto max-w-3xl py-16 text-center text-[var(--text-muted)]">Loading post…</main>;
  }
  if (state === "not-found") {
    return <main className="mx-auto max-w-3xl py-16 text-center"><h1 className="text-3xl font-bold">Post not found</h1><Link className="mt-5 inline-block font-bold text-[var(--primary)]" href="/posts">Back to posts</Link></main>;
  }
  if (state === "error") {
    return <main className="mx-auto max-w-3xl py-16 text-center"><h1 className="text-3xl font-bold">Post unavailable</h1><p className="muted mt-3">The content API could not load this post.</p></main>;
  }
  if (!post) return null;

  return (
    <main className="mx-auto max-w-3xl">
      <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] sm:p-9">
        <p className="eyebrow">Published update</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <p className="muted mt-4 text-sm">{post.authorName} · {new Intl.DateTimeFormat("en-AU", { dateStyle: "long", timeStyle: "short" }).format(new Date(post.publishedAt))}</p>
        {post.channelNames.length > 0 && <div className="mt-5"><h2 className="text-sm font-bold">Channels</h2><div className="mt-2 flex flex-wrap gap-2">{post.channelNames.map((channel) => <span key={channel} className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary)]">{channel}</span>)}</div></div>}
        {post.imageUrl && <img className="mt-7 w-full rounded-2xl" src={post.imageUrl} alt="" />}
        {post.body.split("\n").map((paragraph, index) => <p key={index} className="mt-5 leading-8">{paragraph}</p>)}
        {post.externalLink && <a className="mt-7 inline-block font-bold text-[var(--primary)] hover:underline" href={post.externalLink} target="_blank" rel="noreferrer">Open related resource →</a>}
      </article>
      <Link className="mt-6 inline-block font-bold text-[var(--primary)] hover:underline" href="/posts">← Back to posts</Link>
    </main>
  );
}
