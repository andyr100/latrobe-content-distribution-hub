"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChannelMultiSelect } from "@/components/publishing/ChannelMultiSelect";
import { classifications } from "@/data/mockData";
import { usePublishing } from "@/context/PublishingContext";
import { useSession } from "@/context/SessionContext";
import type { Classification, ExternalArticle } from "@/types";

export function PublishComposer({ open, article, onClose }: { open: boolean; article?: ExternalArticle | null; onClose: () => void }) {
  const { selectedUser } = useSession();
  const { beginPublish } = usePublishing();
  const [title, setTitle] = useState(article?.title ?? "");
  const [body, setBody] = useState(article?.summary ?? "");
  const [classification, setClassification] = useState<Classification | "">(article?.classification ?? "");
  const [channelIds, setChannelIds] = useState<string[]>([]);
  const valid = Boolean(selectedUser && title.trim() && body.trim() && classification && channelIds.length);
  const submit = () => {
    if (!valid || !selectedUser || !classification) return;
    beginPublish({ sourceType: article ? "external" : "internal", title: title.trim(), body: body.trim(), classification, author: selectedUser, channelIds, externalArticleId: article?.id });
    onClose();
  };
  return (
    <Modal open={open} title={article ? "Post article to channels" : "Create a new post"} description={article ? "Choose where this external article should be republished." : "Prepare a concise update for one or more subject feeds."} onClose={onClose} size="lg">
      <div className="grid gap-5">
        <label className="block"><span className="mb-2 block text-sm font-bold">Title <span className="text-[var(--danger)]">*</span></span><input className="field" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} readOnly={Boolean(article)} aria-describedby="title-count" /><span id="title-count" className="muted mt-1 block text-right text-xs">{title.length}/100</span></label>
        <label className="block"><span className="mb-2 block text-sm font-bold">Classification <span className="text-[var(--danger)]">*</span></span><select className="field" value={classification} onChange={(e) => setClassification(e.target.value as Classification)} disabled={Boolean(article)}><option value="">Choose a classification</option>{classifications.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block"><span className="mb-2 block text-sm font-bold">{article ? "Article summary" : "Post body"} <span className="text-[var(--danger)]">*</span></span><textarea className="field min-h-28 resize-y" maxLength={600} value={body} onChange={(e) => setBody(e.target.value)} readOnly={Boolean(article)} /><span className="muted mt-1 block text-right text-xs">{body.length}/600</span></label>
        <ChannelMultiSelect selected={channelIds} onChange={setChannelIds} />
      </div>
      <div className="mt-7 flex items-center justify-between gap-3"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!valid} onClick={submit}>Review publication</Button></div>
    </Modal>
  );
}
