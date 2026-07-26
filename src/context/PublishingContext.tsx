"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useContent } from "@/context/ContentContext";
import type { InternalPost, PublishRequest } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

type Toast = { id: number; heading: string; message: string; detail?: string };
type Value = { beginPublish: (request: PublishRequest) => void; notify: (heading: string, message: string, detail?: string) => void };
const PublishingContext = createContext<Value | null>(null);

export function PublishingProvider({ children }: { children: ReactNode }) {
  const { addPost, channels } = useContent();
  const [request, setRequest] = useState<PublishRequest | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((heading: string, message: string, detail?: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), heading, message, detail });
    timer.current = setTimeout(() => setToast(null), 5000);
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const confirm = () => {
    if (!request) return;
    setPublishing(true);
    window.setTimeout(() => {
      if (request.sourceType === "internal") {
        const post: InternalPost = {
          id: `post-${Date.now()}`, title: request.title, body: request.body,
          classification: request.classification, authorId: request.author.id,
          authorName: request.author.name, publishedAt: new Date().toISOString(),
          channelIds: request.channelIds, status: "Published",
        };
        addPost(post);
      }
      notify(request.sourceType === "internal" ? "Post published successfully" : "Article republished successfully", `“${request.title}”`, `Published to ${request.channelIds.length} ${request.channelIds.length === 1 ? "channel" : "channels"}`);
      setPublishing(false);
      setRequest(null);
      setShowChannels(false);
    }, 3000);
  };
  const selected = request?.channelIds.map((id) => channels.find((channel) => channel.id === id)).filter(Boolean) ?? [];

  return (
    <PublishingContext.Provider value={{ beginPublish: (next) => { setRequest(next); setShowChannels(false); }, notify }}>
      {children}
      <Modal open={Boolean(request)} title={publishing ? "Publishing content" : "Confirm publication"} description={publishing ? "Please keep this window open while the simulated distribution completes." : "Review the details before publishing to the selected subject channels."} onClose={() => setRequest(null)} locked={publishing} size="sm">
        {request && (publishing ? (
          <div className="py-8 text-center" aria-live="assertive" aria-busy="true">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]"><span className="animate-spin size-8 rounded-full border-[3px] border-current border-r-transparent" /></span>
            <p className="mt-5 font-bold">Publishing to selected channels…</p>
            <p className="muted mt-2 text-sm">Simulating RSS distribution for {request.channelIds.length} destinations.</p>
          </div>
        ) : (
          <>
            <dl className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm">
              <div><dt className="muted text-xs font-bold uppercase tracking-wider">Title</dt><dd className="mt-1 font-bold">{request.title}</dd></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><dt className="muted text-xs font-bold uppercase tracking-wider">Classification</dt><dd className="mt-1"><Badge>{request.classification}</Badge></dd></div><div><dt className="muted text-xs font-bold uppercase tracking-wider">Author</dt><dd className="mt-1 font-semibold">{request.author.name}</dd></div></div>
              <div><dt className="muted text-xs font-bold uppercase tracking-wider">Destinations</dt><dd className="mt-1 font-semibold">{selected.length} {selected.length === 1 ? "channel" : "channels"}</dd>
                {selected.length <= 4 || showChannels ? <div className="mt-2 flex flex-wrap gap-1.5">{selected.map((channel) => channel && <Badge key={channel.id} tone="neutral">{channel.code}</Badge>)}</div> : null}
                {selected.length > 4 && <button type="button" aria-expanded={showChannels} onClick={() => setShowChannels(!showChannels)} className="mt-2 min-h-10 text-xs font-bold text-[var(--primary)] hover:underline">{showChannels ? "Hide selected channels" : "View selected channels"}</button>}
              </div>
            </dl>
            <div className="mt-6 flex items-center justify-between gap-3"><Button variant="secondary" onClick={() => setRequest(null)}>Cancel</Button><Button onClick={confirm}>Confirm & publish <Icon name="arrow" className="size-4" /></Button></div>
          </>
        ))}
      </Modal>
      {toast && <div key={toast.id} role="status" aria-live="polite" className="toast-in fixed left-3 right-3 top-3 z-[100] overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] p-4 shadow-[var(--shadow)] backdrop-blur-xl sm:left-auto sm:right-5 sm:top-5 sm:w-[23rem]">
        <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]"><Icon name="check" className="size-5" /></span><div className="min-w-0"><p className="font-bold">{toast.heading}</p><p className="mt-1 truncate text-sm">{toast.message}</p>{toast.detail && <p className="muted mt-1 text-xs">{toast.detail}</p>}</div><button type="button" onClick={() => setToast(null)} aria-label="Close notification" className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"><Icon name="close" className="size-4" /></button></div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--border)]"><div className="h-full origin-left animate-[shrink_5s_linear_forwards] bg-[var(--success)]" /></div>
      </div>}
    </PublishingContext.Provider>
  );
}
export function usePublishing() { const value = useContext(PublishingContext); if (!value) throw new Error("usePublishing must be used inside PublishingProvider"); return value; }
