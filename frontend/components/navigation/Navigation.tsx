"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/posts", label: "Posts", icon: "posts" },
  { href: "/topics", label: "Channels", icon: "channels" },
  { href: "/workflow", label: "Workflow", icon: "workflow" },
  { href: "/database", label: "Database", icon: "database" },
  { href: "/about", label: "About", icon: "about" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

function NavLinks({ onSelect }: { onSelect?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1.5">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onSelect}
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold ${active ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"}`}
            >
              <Icon name={item.icon} className="size-5 shrink-0" />
              {item.label}
              {active && <span className="ml-auto size-1.5 rounded-full bg-white" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Navigation() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
      if (event.key === "Tab" && drawerRef.current) {
        const focusable = [...drawerRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], [tabindex='0']")];
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  const closeDrawer = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-3 z-40 grid size-12 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text)] shadow-lg lg:hidden"
      >
        <Icon name="menu" className="size-6" />
      </button>
      <aside className="sticky top-[4.5rem] hidden h-[calc(100vh-4.5rem)] w-64 shrink-0 border-r border-[var(--border)] px-4 py-7 lg:block">
        <nav aria-label="Primary navigation">
          <p className="mb-3 px-3 text-[.68rem] font-bold uppercase tracking-[.16em] text-[var(--text-muted)]">Workspace</p>
          <NavLinks />
        </nav>
        <div className="absolute bottom-7 left-4 right-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="text-xs font-bold">Assessment 2</p>
          <p className="mt-1 text-[.7rem] leading-5 text-[var(--text-muted)]">SQLite-backed publishing with real RSS output and a mock LMS client.</p>
        </div>
      </aside>
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
        <button aria-label="Close navigation backdrop" tabIndex={open ? 0 : -1} onClick={closeDrawer} className={`absolute inset-0 bg-[#070816]/55 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
        <aside ref={drawerRef} id="mobile-navigation" className={`glass absolute inset-y-0 left-0 w-[min(84vw,20rem)] rounded-r-[1.75rem] p-5 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-8 flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--primary)] text-sm font-black text-white">LT</div>
            <button ref={closeRef} type="button" onClick={closeDrawer} aria-label="Close navigation" tabIndex={open ? 0 : -1} className="grid size-11 place-items-center rounded-xl hover:bg-[var(--surface-muted)]">
              <Icon name="close" className="size-6" />
            </button>
          </div>
          <nav aria-label="Mobile navigation"><NavLinks onSelect={closeDrawer} /></nav>
        </aside>
      </div>
    </>
  );
}
