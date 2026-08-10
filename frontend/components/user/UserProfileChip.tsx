"use client";

import { useSession } from "@/context/SessionContext";
import { Icon } from "@/components/ui/Icon";

export function UserProfileChip() {
  const { selectedUser, openUserSelector } = useSession();
  return (
    <button type="button" onClick={openUserSelector} className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 text-left hover:border-[var(--primary)]" aria-label={selectedUser ? `Change user, currently ${selectedUser.name}` : "Select user"}>
      <span className="grid size-8 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]"><Icon name="user" className="size-4" /></span>
      <span className="hidden max-w-32 sm:block"><span className="block truncate text-xs font-bold">{selectedUser?.name ?? "Select user"}</span><span className="muted block text-[.65rem]">{selectedUser?.role ?? "Required"}</span></span>
    </button>
  );
}
