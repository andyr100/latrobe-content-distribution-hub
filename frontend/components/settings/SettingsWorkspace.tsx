"use client";

import Link from "next/link";
import { useState } from "react";
import { appConfig, type GitCommit } from "@/config/app";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { usePreferences, type ThemePreference } from "@/context/PreferencesContext";
import { usePublishing } from "@/context/PublishingContext";

const themes: { id: ThemePreference; label: string; note: string }[] = [
  { id: "light", label: "Light", note: "Bright, calm surfaces" },
  { id: "dark", label: "Dark", note: "Reduced-light workspace" },
  { id: "system", label: "System", note: "Match this device" },
];

export function SettingsWorkspace() {
  const { theme, setTheme, channelListLayout, setChannelListLayout, resetPreferences } =
    usePreferences();
  const { notify } = usePublishing();
  const [resetOpen, setResetOpen] = useState(false);
  const [gitHistoryOpen, setGitHistoryOpen] = useState(false);
  const [gitCommits, setGitCommits] = useState<GitCommit[]>(appConfig.git.commits);
  const [gitHistoryLoading, setGitHistoryLoading] = useState(false);
  const [gitHistoryError, setGitHistoryError] = useState(false);
  const loadGitHistory = async () => {
    if (gitCommits.length || gitHistoryLoading) return;
    setGitHistoryLoading(true);
    setGitHistoryError(false);
    try {
      const response = await fetch(
        `https://api.github.com/repos/andyr100/latrobe-content-distribution-hub/commits?sha=${encodeURIComponent(appConfig.git.branch)}&per_page=12`,
        { headers: { Accept: "application/vnd.github+json" } },
      );
      if (!response.ok) throw new Error("GitHub history unavailable");
      const entries = (await response.json()) as Array<{
        sha: string;
        commit: { message: string; author: { date: string } | null };
      }>;
      setGitCommits(
        entries.map((entry) => ({
          hash: entry.sha.slice(0, 7),
          date: entry.commit.author?.date
            ? new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(
                new Date(entry.commit.author.date),
              )
            : "Unknown date",
          message: entry.commit.message.split("\n")[0],
        })),
      );
    } catch {
      setGitHistoryError(true);
    } finally {
      setGitHistoryLoading(false);
    }
  };
  const resetWorkspace = () => {
    resetPreferences();
    setResetOpen(false);
    notify(
      "Preferences reset",
      "Interface defaults restored",
      "Database-backed posts and channels were left intact",
    );
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Choose the appearance and channel display for your workspace."
      />
      <div className="grid gap-6">
        <GlassCard className="p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Icon name="sun" className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold">Appearance</h2>
              <p className="muted mt-1 text-sm">Theme changes are saved on this device.</p>
            </div>
          </div>
          <fieldset className="mt-6">
            <legend className="sr-only">Colour theme</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {themes.map((item) => (
                <label
                  key={item.id}
                  className={`flex min-h-24 cursor-pointer items-center gap-3 rounded-xl border p-4 ${theme === item.id ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--border-strong)]"}`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={item.id}
                    checked={theme === item.id}
                    onChange={() => setTheme(item.id)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-9 place-items-center rounded-lg ${theme === item.id ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-strong)]"}`}
                  >
                    <Icon name={item.id === "dark" ? "moon" : "sun"} className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{item.label}</span>
                    <span className="muted block text-xs">{item.note}</span>
                  </span>
                  {theme === item.id && (
                    <Icon name="check" className="ml-auto size-4 text-[var(--primary)]" />
                  )}
                </label>
              ))}
            </div>
          </fieldset>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="eyebrow">Content catalogue</p>
          <h2 className="mt-2 text-xl font-bold">Fixed CSIT channels</h2>
          <p className="muted mt-2 text-sm leading-6">
            Channels are the fixed destinations for posts and first-party RSS feeds.
          </p>
          <label className="mt-5 flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3">
            <span>
              <span className="block text-sm font-bold">One channel per row</span>
              <span className="muted block text-xs">Use full-width horizontal channel tiles</span>
            </span>
            <input
              type="checkbox"
              className="peer sr-only"
              checked={channelListLayout}
              onChange={(event) => setChannelListLayout(event.target.checked)}
            />
            <span className="relative block h-7 w-12 shrink-0 rounded-full bg-[var(--border-strong)] shadow-inner peer-checked:bg-[var(--primary)]">
              <span
                aria-hidden="true"
                className={`absolute left-1 top-1 size-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.28)] transition-transform duration-200 ${channelListLayout ? "translate-x-5" : "translate-x-0"}`}
              />
            </span>
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/channels"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 text-sm font-bold hover:border-[var(--primary)]"
            >
              View channels <Icon name="arrow" className="size-4" />
            </Link>
            <Link
              href="/database"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 text-sm font-bold hover:border-[var(--primary)]"
            >
              Inspect SQLite data <Icon name="database" className="size-4" />
            </Link>
          </div>
        </GlassCard>
        <GlassCard className="p-5 sm:p-7">
          <button
            type="button"
            onClick={() => {
              setGitHistoryOpen((open) => !open);
              void loadGitHistory();
            }}
            aria-expanded={gitHistoryOpen}
            aria-controls="git-history-list"
            className="flex w-full items-start justify-between gap-4 rounded-xl text-left focus-visible:outline-offset-4"
          >
            <span className="flex min-w-0 items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <Icon name="workflow" className="size-5" />
              </span>
              <span>
                <span className="eyebrow">Development history</span>
                <span className="mt-1 block text-xl font-bold">Git commits</span>
                <span className="muted mt-1 block text-sm">
                  Recent commits in this project repository.
                </span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-right sm:block">
                <span className="block text-2xl font-bold text-[var(--primary)]">
                  {gitCommits.length || "—"}
                </span>
                <span className="muted block text-xs font-semibold">
                  recent commits on {appConfig.git.branch}
                </span>
              </span>
              <span className="grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--primary)]">
                <Icon name="more" className="size-5" />
              </span>
            </span>
          </button>
          {gitHistoryOpen && (
            <div id="git-history-list" className="mt-6 border-t border-[var(--border)] pt-5">
              <p className="muted mb-3 text-xs font-semibold">Most recent commits first</p>
              <ol className="grid gap-2">
                {gitCommits.map((commit, index) => (
                  <li
                    key={commit.hash}
                    className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 sm:flex-row sm:items-center"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--surface-strong)] text-xs font-black text-[var(--primary)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-bold">{commit.message}</p>
                      <div className="muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <code className="rounded bg-[var(--surface-strong)] px-1.5 py-0.5 font-bold text-[var(--primary)]">
                          {commit.hash}
                        </code>
                        <span>{commit.date}</span>
                        <span>·</span>
                        <span>{appConfig.git.branch}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              {gitHistoryLoading && (
                <p className="muted rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm">
                  Loading current commit history from GitHub…
                </p>
              )}
              {!gitHistoryLoading && !gitCommits.length && (
                <p className="muted rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm">
                  {gitHistoryError
                    ? "GitHub history is temporarily unavailable. "
                    : "This build has no embedded history. "}
                  Build commit: <code>{appConfig.git.commit}</code>.
                </p>
              )}
              <a
                href={`${appConfig.git.repository}/commits/${appConfig.git.branch}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border-strong)] px-4 text-sm font-bold text-[var(--primary)]"
              >
                View complete history on GitHub <Icon name="external" className="size-4" />
              </a>
            </div>
          )}
        </GlassCard>
        <GlassCard className="border-[color-mix(in_srgb,var(--danger)_28%,var(--border))] p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--danger)_11%,transparent)] text-[var(--danger)]">
                <Icon name="trash" className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold">Reset interface preferences</h2>
                <p className="muted mt-1 max-w-2xl text-sm leading-6">
                  Restore local theme and layout preferences. Database content is not deleted.
                </p>
              </div>
            </div>
            <Button variant="danger" className="shrink-0" onClick={() => setResetOpen(true)}>
              Reset preferences
            </Button>
          </div>
        </GlassCard>
      </div>
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset interface preferences?"
        description="This restores local visual preferences without deleting SQLite records."
        size="sm"
      >
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_25%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_7%,var(--surface))] p-4">
          <p className="font-bold">The following local preferences will reset:</p>
          <ul className="muted mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
            <li>Channel card layout</li>
            <li>Saved theme preference</li>
          </ul>
        </div>
        <div className="mt-6 flex justify-between gap-3">
          <Button variant="secondary" onClick={() => setResetOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={resetWorkspace}>
            Reset preferences
          </Button>
        </div>
      </Modal>
    </div>
  );
}
