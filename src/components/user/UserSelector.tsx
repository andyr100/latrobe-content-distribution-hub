"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { users } from "@/data/users";
import { useSession } from "@/context/SessionContext";

export function UserSelector() {
  const { userSelectorOpen, selectedUser, selectUser, closeUserSelector } = useSession();
  const [pendingId, setPendingId] = useState("");
  const chosen = users.find((user) => user.id === pendingId);
  return (
    <Modal open={userSelectorOpen} title="Select your profile" description="Choose a mock user to continue. This selection is session-only and does not represent authentication." onClose={closeUserSelector} locked={!selectedUser} size="sm">
      <div className="space-y-2" role="radiogroup" aria-label="Available users">
        {users.map((user) => {
          const active = pendingId === user.id;
          return (
            <button key={user.id} type="button" role="radio" aria-checked={active} onClick={() => setPendingId(user.id)} className={`flex min-h-16 w-full items-center gap-3 rounded-xl border p-3 text-left ${active ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"}`}>
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${active ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-muted)] text-[var(--text-muted)]"}`}><Icon name="user" className="size-5" /></span>
              <span className="min-w-0"><span className="block truncate font-bold">{user.name}</span><span className="muted text-xs">{user.role}</span></span>
              {active && <Icon name="check" className="ml-auto size-5 text-[var(--primary)]" />}
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="muted text-xs">{selectedUser ? "Change current profile" : "Required to continue"}</p>
        <Button disabled={!chosen} onClick={() => chosen && selectUser(chosen)}>Continue <Icon name="arrow" className="size-4" /></Button>
      </div>
    </Modal>
  );
}
