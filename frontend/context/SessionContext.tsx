"use client";

import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from "react";
import type { MockUser } from "@/types";
import { getUsers } from "@/lib/api";

type State = { selectedUser: MockUser | null; userSelectorOpen: boolean };
type Action =
  | { type: "selectUser"; user: MockUser }
  | { type: "openSelector" }
  | { type: "closeSelector" };
const initialState: State = { selectedUser: null, userSelectorOpen: true };

function reducer(state: State, action: Action): State {
  if (action.type === "selectUser") return { selectedUser: action.user, userSelectorOpen: false };
  if (action.type === "openSelector") return { ...state, userSelectorOpen: true };
  if (action.type === "closeSelector" && state.selectedUser)
    return { ...state, userSelectorOpen: false };
  return state;
}

type Value = State & {
  users: MockUser[];
  usersLoading: boolean;
  usersError: string | null;
  selectUser: (user: MockUser) => void;
  openUserSelector: () => void;
  closeUserSelector: () => void;
};
const SessionContext = createContext<Value | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((error: unknown) =>
        setUsersError(error instanceof Error ? error.message : "Unable to load users"),
      )
      .finally(() => setUsersLoading(false));
  }, []);
  return (
    <SessionContext.Provider
      value={{
        ...state,
        users,
        usersLoading,
        usersError,
        selectUser: (user) => dispatch({ type: "selectUser", user }),
        openUserSelector: () => dispatch({ type: "openSelector" }),
        closeUserSelector: () => dispatch({ type: "closeSelector" }),
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
