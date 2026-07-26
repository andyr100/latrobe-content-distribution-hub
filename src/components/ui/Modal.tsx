"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

export function Modal({ open, title, description, children, onClose, locked = false, size = "md" }: {
  open: boolean; title: string; description?: string; children: ReactNode; onClose: () => void; locked?: boolean; size?: "sm" | "md" | "lg";
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector<HTMLElement>("button:not([disabled]), input, select, textarea, [tabindex='0']");
      target?.focus();
    });
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !locked) onClose();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex='0']")];
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      returnFocusRef.current?.focus();
    };
  }, [open, locked, onClose]);

  if (!open) return null;
  const widths = { sm: "max-w-lg", md: "max-w-2xl", lg: "max-w-3xl" };
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto p-3 sm:p-6" role="presentation">
      <button aria-label="Close modal" tabIndex={-1} onClick={() => !locked && onClose()} className="absolute inset-0 bg-[#060713]/60 backdrop-blur-md" />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} className={`glass modal-in relative my-auto max-h-[calc(100vh-1.5rem)] w-full overflow-y-auto rounded-[1.65rem] bg-[var(--surface-strong)] p-5 sm:p-7 ${widths[size]}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-2xl font-bold tracking-[-.025em]">{title}</h2>
            {description && <p id={descriptionId} className="muted mt-2 text-sm leading-6">{description}</p>}
          </div>
          {!locked && <button type="button" onClick={onClose} aria-label="Close" className="grid size-11 shrink-0 place-items-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"><Icon name="close" className="size-5" /></button>}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
