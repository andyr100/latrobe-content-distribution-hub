"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChannelMultiSelect } from "@/components/publishing/ChannelMultiSelect";
import { usePublishing } from "@/context/PublishingContext";
import { useSession } from "@/context/SessionContext";

export function PublishComposer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { selectedUser } = useSession();
  const { beginPublish } = usePublishing();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [feedIds, setFeedIds] = useState<string[]>([]);
  const valid = Boolean(selectedUser && title.trim() && body.trim() && feedIds.length);

  const submit = () => {
    if (!valid || !selectedUser) return;
    beginPublish({
      title: title.trim(),
      body: body.trim(),
      author: selectedUser,
      feedIds,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Create a new post"
      description="Prepare a concise update for one or more channels."
      onClose={onClose}
      size="lg"
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">
            Title <span className="text-[var(--danger)]">*</span>
          </span>
          <input
            className="field"
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-describedby="title-count"
          />
          <span id="title-count" className="muted mt-1 block text-right text-xs">
            {title.length}/100
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">
            Post body <span className="text-[var(--danger)]">*</span>
          </span>
          <textarea
            className="field min-h-28 resize-y"
            maxLength={600}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <span className="muted mt-1 block text-right text-xs">{body.length}/600</span>
        </label>
        <ChannelMultiSelect selected={feedIds} onChange={setFeedIds} />
      </div>
      <div className="mt-7 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!valid} onClick={submit}>
          Review publication
        </Button>
      </div>
    </Modal>
  );
}
