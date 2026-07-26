"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { MockUser } from "@/types";

type State = { selectedUser: MockUser | null; userSelectorOpen: boolean };
type Action = { type: "selectUser"; user: MockUser } | { type: "openSelector" } | { type: "closeSelector" };
const initialState: State = { selectedUser: null, userSelectorOpen: true };

function reducer(state: State, action: Action): State {
  if (action.type === "selectUser") return { selectedUser: action.user, userSelectorOpen: false };
  if (action.type === "openSelector") return { ...state, userSelectorOpen: true };
  if (action.type === "closeSelector" && state.selectedUser) return { ...state, userSelectorOpen: false };
  return state;
}

type Value = State & { selectUser: (user: MockUser) => void; openUserSelector: () => void; closeUserSelector: () => void };
const SessionContext = createContext<Value | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <SessionContext.Provider value={{
      ...state,
      selectUser: (user) => dispatch({ type: "selectUser", user }),
      openUserSelector: () => dispatch({ type: "openSelector" }),
      closeUserSelector: () => dispatch({ type: "closeSelector" }),
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
