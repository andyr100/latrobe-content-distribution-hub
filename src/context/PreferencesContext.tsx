"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";
const STORAGE_KEY = "lt-content-hub.preferences.v1";

type PersistedState = { theme: ThemePreference; subscriptions: string[]; channelListLayout: boolean };
type State = PersistedState & { hydrated: boolean };
type Action =
  | { type: "hydrate"; state: PersistedState }
  | { type: "setTheme"; theme: ThemePreference }
  | { type: "toggleSubscription"; id: string }
  | { type: "setChannelListLayout"; enabled: boolean }
  | { type: "reset" };

const initialState: State = {
  theme: "system",
  subscriptions: ["microsoft-ai", "aws-news", "google-developers", "stack-overflow", "higher-education"],
  channelListLayout: false,
  hydrated: false,
};

function reducer(state: State, action: Action): State {
  if (action.type === "hydrate") return { ...action.state, hydrated: true };
  if (action.type === "reset") return { ...initialState, hydrated: true };
  if (action.type === "setTheme") return { ...state, theme: action.theme };
  if (action.type === "setChannelListLayout") return { ...state, channelListLayout: action.enabled };
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
  setChannelListLayout: (enabled: boolean) => void;
  resetPreferences: () => void;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

function resolveTheme(theme: ThemePreference) {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "");
      const validTheme = ["light", "dark", "system"].includes(stored?.theme);
      dispatch({ type: "hydrate", state: {
        theme: validTheme ? stored.theme : initialState.theme,
        subscriptions: Array.isArray(stored?.subscriptions) ? stored.subscriptions : initialState.subscriptions,
        channelListLayout: typeof stored?.channelListLayout === "boolean" ? stored.channelListLayout : initialState.channelListLayout,
      } });
    } catch {
      dispatch({ type: "hydrate", state: { theme: initialState.theme, subscriptions: initialState.subscriptions, channelListLayout: initialState.channelListLayout } });
    }
  }, []);

  const resolvedTheme = !state.hydrated || typeof window === "undefined" ? "light" : resolveTheme(state.theme);

  useEffect(() => {
    if (!state.hydrated) return;
    const root = document.documentElement;
    const apply = () => root.dataset.theme = resolveTheme(state.theme);
    apply();
    const frame = requestAnimationFrame(() => {
      root.dataset.themeReady = "true";
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: state.theme, subscriptions: state.subscriptions, channelListLayout: state.channelListLayout }));
    if (state.theme !== "system") return () => cancelAnimationFrame(frame);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", apply);
    };
  }, [state]);

  return (
    <PreferencesContext.Provider
      value={{
        ...state,
        resolvedTheme,
        setTheme: (theme) => dispatch({ type: "setTheme", theme }),
        toggleSubscription: (id) => dispatch({ type: "toggleSubscription", id }),
        setChannelListLayout: (enabled) => dispatch({ type: "setChannelListLayout", enabled }),
        resetPreferences: () => dispatch({ type: "reset" }),
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
