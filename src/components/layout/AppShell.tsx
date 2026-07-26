import type { ReactNode } from "react";
import { appConfig } from "@/config/app";
import { Navigation } from "@/components/navigation/Navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserSelector } from "@/components/user/UserSelector";
import { UserProfileChip } from "@/components/user/UserProfileChip";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_78%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--primary)] text-sm font-black text-white shadow-lg">LT</div>
            <div>
              <p className="text-sm font-bold leading-none">{appConfig.name}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{appConfig.assessment}</p>
            </div>
          </div>
          <div className="mr-14 flex items-center gap-2 lg:mr-0">
            <span className="hidden rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] sm:inline">Frontend prototype</span>
            <ThemeToggle />
            <UserProfileChip />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1600px]">
        <Navigation />
        <main id="main-content" className="min-h-[calc(100vh-8.5rem)] min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
      <footer className="border-t border-[var(--border)] px-5 py-6 text-center text-xs text-[var(--text-muted)]">
        <span className="font-semibold text-[var(--text)]">{appConfig.name}</span>
        {" · "}{appConfig.student.name} · {appConfig.student.number} · Assessment 1 frontend only
      </footer>
      <UserSelector />
    </div>
  );
}
