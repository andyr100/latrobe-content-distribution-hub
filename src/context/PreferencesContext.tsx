"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";
const STORAGE_KEY = "lt-content-hub.preferences.v1";

type State = { theme: ThemePreference; subscriptions: string[] };
type Action =
  | { type: "hydrate"; state: State }
  | { type: "setTheme"; theme: ThemePreference }
  | { type: "toggleSubscription"; id: string };

const initialState: State = {
  theme: "system",
  subscriptions: ["microsoft-ai", "aws-news", "google-developers", "stack-overflow", "higher-education"],
};

function reducer(state: State, action: Action): State {
  if (action.type === "hydrate") return action.state;
  if (action.type === "setTheme") return { ...state, theme: action.theme };
  if (action.type === "toggleSubscription") {
    return {
      ...state,
      subscriptions: state.subscriptions.includes(action.id)
        ? state.subscriptions.filter((id) => id !== action.id)
        : [...state.subscriptions, action.id],
    };
  }
  return state;
}

type PreferencesValue = State & {
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemePreference) => void;
  toggleSubscription: (id: string) => void;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

function resolveTheme(theme: ThemePreference) {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (fallback) => {
    if (typeof window === "undefined") return fallback;
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "");
      const validTheme = ["light", "dark", "system"].includes(stored?.theme);
      return {
        theme: validTheme ? stored.theme : fallback.theme,
        subscriptions: Array.isArray(stored?.subscriptions) ? stored.subscriptions : fallback.subscriptions,
      };
    } catch {
      return fallback;
    }
  });
  const resolvedTheme = typeof window === "undefined" ? "light" : resolveTheme(state.theme);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => root.dataset.theme = resolveTheme(state.theme);
    apply();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [state]);

  return (
    <PreferencesContext.Provider
      value={{
        ...state,
        resolvedTheme,
        setTheme: (theme) => dispatch({ type: "setTheme", theme }),
        toggleSubscription: (id) => dispatch({ type: "toggleSubscription", id }),
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences must be used inside PreferencesProvider");
  return value;
}
