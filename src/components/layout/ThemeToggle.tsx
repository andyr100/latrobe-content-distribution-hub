"use client";

import { usePreferences } from "@/context/PreferencesContext";
import { Icon } from "@/components/ui/Icon";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = usePreferences();
  const dark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      <Icon name={dark ? "sun" : "moon"} className="size-5" />
    </button>
  );
}
