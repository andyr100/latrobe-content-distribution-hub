"use client";
import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
export type ThemePreference = "light" | "dark" | "system";
const STORAGE_KEY = "lt-content-hub.preferences.v1";
type PersistedState = { theme: ThemePreference; channelListLayout: boolean };
type State = PersistedState & { hydrated: boolean };
type Action =
  | { type: "hydrate"; state: PersistedState }
  | { type: "setTheme"; theme: ThemePreference }
  | { type: "setChannelListLayout"; enabled: boolean }
  | { type: "reset" };
const initialState: State = {
  theme: "system",
  channelListLayout: false,
  hydrated: false,
};
function reducer(state: State, action: Action): State {
  if (action.type === "hydrate") return { ...action.state, hydrated: true };
  if (action.type === "reset") return { ...initialState, hydrated: true };
  if (action.type === "setTheme") return { ...state, theme: action.theme };
  if (action.type === "setChannelListLayout")
    return { ...state, channelListLayout: action.enabled };
  return state;
}
type PreferencesValue = State & {
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemePreference) => void;
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
      dispatch({
        type: "hydrate",
        state: {
          theme: validTheme ? stored.theme : initialState.theme,
          channelListLayout:
            typeof stored?.channelListLayout === "boolean"
              ? stored.channelListLayout
              : typeof stored?.topicListLayout === "boolean"
                ? stored.topicListLayout
                : false,
        },
      });
    } catch {
      dispatch({
        type: "hydrate",
        state: {
          theme: initialState.theme,
          channelListLayout: initialState.channelListLayout,
        },
      });
    }
  }, []);
  const resolvedTheme =
    !state.hydrated || typeof window === "undefined" ? "light" : resolveTheme(state.theme);
  useEffect(() => {
    if (!state.hydrated) return;
    const root = document.documentElement;
    const apply = () => (root.dataset.theme = resolveTheme(state.theme));
    apply();
    const frame = requestAnimationFrame(() => {
      root.dataset.themeReady = "true";
    });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        theme: state.theme,
        channelListLayout: state.channelListLayout,
      }),
    );
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
