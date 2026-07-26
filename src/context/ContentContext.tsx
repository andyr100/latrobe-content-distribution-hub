"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { seedChannels, seedPosts } from "@/data/mockData";
import type { Channel, InternalPost } from "@/types";

const CHANNELS_KEY = "lt-content-hub.channels.v1";
const POSTS_KEY = "lt-content-hub.internal-posts.v1";
type State = { channels: Channel[]; posts: InternalPost[] };
type Action = { type: "addChannel"; channel: Channel } | { type: "deleteChannel"; id: string } | { type: "addPost"; post: InternalPost };
function reducer(state: State, action: Action): State {
  if (action.type === "addChannel") return { ...state, channels: [action.channel, ...state.channels] };
  if (action.type === "deleteChannel") return { ...state, channels: state.channels.filter((channel) => channel.id !== action.id) };
  if (action.type === "addPost") return { ...state, posts: [action.post, ...state.posts] };
  return state;
}
function readStored<T>(key: string, fallback: T): T {
  try { const value = JSON.parse(localStorage.getItem(key) ?? ""); return Array.isArray(value) ? value as T : fallback; } catch { return fallback; }
}
type Value = State & { addChannel: (channel: Channel) => void; deleteChannel: (id: string) => void; addPost: (post: InternalPost) => void };
const ContentContext = createContext<Value | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { channels: seedChannels, posts: seedPosts }, (fallback) => {
    if (typeof window === "undefined") return fallback;
    return { channels: readStored(CHANNELS_KEY, fallback.channels), posts: readStored(POSTS_KEY, fallback.posts) };
  });
  useEffect(() => {
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(state.channels));
    localStorage.setItem(POSTS_KEY, JSON.stringify(state.posts));
  }, [state]);
  return <ContentContext.Provider value={{ ...state, addChannel: (channel) => dispatch({ type: "addChannel", channel }), deleteChannel: (id) => dispatch({ type: "deleteChannel", id }), addPost: (post) => dispatch({ type: "addPost", post }) }}>{children}</ContentContext.Provider>;
}
export function useContent() { const value = useContext(ContentContext); if (!value) throw new Error("useContent must be used inside ContentProvider"); return value; }
