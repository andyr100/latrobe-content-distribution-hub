"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "@/lib/api";
import type { Channel, DashboardStats, InternalPost } from "@/types";

type PostInput = Omit<InternalPost, "id" | "authorName" | "publishedAt" | "status"> & {
  publishedAt?: string;
};

type Value = {
  channels: Channel[];
  posts: InternalPost[];
  stats: DashboardStats | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
  addPost: (post: PostInput) => Promise<InternalPost>;
  updatePost: (id: string, post: Partial<PostInput>) => Promise<InternalPost>;
  deletePost: (id: string) => Promise<void>;
  resetContent: () => void;
};

const ContentContext = createContext<Value | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [posts, setPosts] = useState<InternalPost[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextChannels, nextPosts, nextStats] = await Promise.all([
        api.getChannels(),
        api.getPosts(),
        api.getStats(),
      ]);
      setChannels(nextChannels);
      setPosts(nextPosts);
      setStats(nextStats);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The API is unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshContent(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshContent]);

  const addPost = async (input: PostInput) => {
    const post = await api.createPost(input);
    await refreshContent();
    return post;
  };

  const updatePost = async (id: string, input: Partial<PostInput>) => {
    const post = await api.updatePost(id, input);
    await refreshContent();
    return post;
  };

  const deletePost = async (id: string) => {
    await api.removePost(id);
    await refreshContent();
  };

  return (
    <ContentContext.Provider
      value={{
        channels,
        posts,
        stats,
        hydrated: !loading,
        loading,
        error,
        refreshContent,
        addPost,
        updatePost,
        deletePost,
        resetContent: () => void refreshContent(),
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const value = useContext(ContentContext);
  if (!value) throw new Error("useContent must be used inside ContentProvider");
  return value;
}
