"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import type { ApiEnvelope, FeedDto, RssUserDto } from "@latrobe/api-contract";

type Channel = Pick<FeedDto, "id" | "code" | "title">;
type FeedItem = {
  title: string;
  description: string;
  link: string;
  publishedAt: string;
  author: string;
};

const AUTO_REFRESH_INTERVAL_SECONDS = 15;
const AUTO_REFRESH_DEFAULT =
  process.env.NEXT_PUBLIC_RSS_AUTO_REFRESH_ENABLED?.toLowerCase() !== "false";
const CLIENT_ID_KEY = "latrobe-rss-client.id.v1";

function text(element: Element, selector: string) {
  return element.querySelector(selector)?.textContent?.trim() ?? "";
}

export default function RssClientPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<RssUserDto[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [requestCount, setRequestCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(AUTO_REFRESH_DEFAULT);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(AUTO_REFRESH_INTERVAL_SECONDS);
  const [clientId, setClientId] = useState("");
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const activeRssUserId = selectedUser?.id ?? "";
  const activeClientId = selectedUser ? `rss-client-${selectedUser.id}-${clientId}` : "";

  useEffect(() => {
    const existing = window.localStorage.getItem(CLIENT_ID_KEY);
    const next = existing || `rss-client-${crypto.randomUUID()}`;
    if (!existing) window.localStorage.setItem(CLIENT_ID_KEY, next);
    const timer = window.setTimeout(() => setClientId(next), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const refreshCount = useCallback(async () => {
    const response = await fetch("/api/count");
    if (response.ok) {
      const payload = (await response.json()) as ApiEnvelope<{ requestCount: number }>;
      if (payload.success) setRequestCount(payload.data.requestCount);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/rss-users");
      if (!response.ok) throw new Error("The API is unavailable");
      const payload = (await response.json()) as ApiEnvelope<RssUserDto[]>;
      if (!payload.success) throw new Error(payload.error.message);
      setUsers(payload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load mock users");
    }
  }, []);

  const loadChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/channels");
      if (!response.ok) throw new Error("The API is unavailable");
      const payload = (await response.json()) as ApiEnvelope<Channel[]>;
      if (!payload.success) throw new Error(payload.error.message);
      setChannels(payload.data);
      setSelectedCode((current) => current || payload.data[0]?.code || "");
      await refreshCount();
    } catch (caught) {
      setChannels([]);
      setError(caught instanceof Error ? caught.message : "Unable to load channels");
    } finally {
      setLoading(false);
    }
  }, [refreshCount]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadChannels(), 0);
    return () => window.clearTimeout(timer);
  }, [loadChannels]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUsers(), 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const loadFeed = useCallback(async () => {
    if (!selectedCode || !activeClientId) return;
    setFetching(true);
    setError(null);
    try {
      const response = await fetch(`/api/rss/${encodeURIComponent(selectedCode)}`, {
        headers: { "X-Client-Id": activeClientId, "X-Rss-User-Id": activeRssUserId },
      });
      if (!response.ok)
        throw new Error(
          response.status === 404
            ? "The selected channel no longer exists"
            : "The RSS Server returned an error",
        );
      const xml = await response.text();
      const document = new DOMParser().parseFromString(xml, "application/xml");
      if (document.querySelector("parsererror"))
        throw new Error("The RSS response could not be parsed");
      setTitle(text(document.documentElement, "channel > title"));
      setItems(
        [...document.querySelectorAll("item")].map((item) => ({
          title: text(item, "title"),
          description: text(item, "description"),
          link: text(item, "link"),
          publishedAt: text(item, "pubDate"),
          author: text(item, "author"),
        })),
      );
      await refreshCount();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The RSS feed is unavailable");
      setItems([]);
      setTitle("");
    } finally {
      setFetching(false);
    }
  }, [activeClientId, activeRssUserId, refreshCount, selectedCode]);

  useEffect(() => {
    if (!selectedCode || !activeClientId) return;
    const initial = window.setTimeout(() => void loadFeed(), 0);
    return () => window.clearTimeout(initial);
  }, [activeClientId, loadFeed, selectedCode]);

  useEffect(() => {
    if (!selectedCode || !activeClientId || !autoRefreshEnabled) return;
    const refresh = window.setInterval(() => {
      void loadFeed();
      setSecondsUntilRefresh(AUTO_REFRESH_INTERVAL_SECONDS);
    }, AUTO_REFRESH_INTERVAL_SECONDS * 1_000);
    const countdown = window.setInterval(
      () =>
        setSecondsUntilRefresh((seconds) =>
          seconds <= 1 ? AUTO_REFRESH_INTERVAL_SECONDS : seconds - 1,
        ),
      1_000,
    );
    return () => {
      window.clearInterval(refresh);
      window.clearInterval(countdown);
    };
  }, [activeClientId, autoRefreshEnabled, loadFeed, selectedCode]);

  const countdownStyle = {
    "--progress": `${(secondsUntilRefresh / AUTO_REFRESH_INTERVAL_SECONDS) * 360}deg`,
  } as CSSProperties & Record<"--progress", string>;
  const endpoint = selectedCode ? `/rss/${selectedCode}` : "/rss/:channelCode";

  return (
    <main className="shell">
      <header className="brand">
        <span className="mark">LT</span>
        <div>
          <p className="eyebrow">Standalone service · Port 5000</p>
          <h1>RSS Client — Mock LMS View</h1>
        </div>
      </header>
      <p className="muted">
        Select a mock LMS user and a Channel to load its first-party RSS 2.0 feed automatically.
      </p>
      <section className="card">
        <div className="controls">
          <label>
            <span className="channel-label">Mock user</span>
            <select
              aria-label="Mock user"
              value={selectedUserId}
              disabled={!users.length}
              onChange={(event) => {
                setSelectedUserId(event.target.value);
                setSecondsUntilRefresh(AUTO_REFRESH_INTERVAL_SECONDS);
              }}
            >
              <option value="">Select a user to continue</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} — {user.role}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="channel-label">
              Channel{" "}
              {fetching && (
                <span className="spinner" role="status" aria-label="Refreshing selected channel" />
              )}
            </span>
            <select
              value={selectedCode}
              disabled={loading || !selectedUser}
              onChange={(event) => {
                setSelectedCode(event.target.value);
                setSecondsUntilRefresh(AUTO_REFRESH_INTERVAL_SECONDS);
              }}
            >
              <option value="">Choose a channel</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.code}>
                  {channel.title} — {channel.code}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="meta muted">
          <span>Canonical RSS endpoint: {endpoint}</span>
          <span className="refresh-status">
            <label className="refresh-toggle">
              <input
                type="checkbox"
                role="switch"
                checked={autoRefreshEnabled}
                onChange={(event) => {
                  setAutoRefreshEnabled(event.target.checked);
                  setSecondsUntilRefresh(AUTO_REFRESH_INTERVAL_SECONDS);
                }}
              />
              <span className="toggle-track" aria-hidden="true">
                <span className="toggle-thumb" />
              </span>
              Auto refresh
            </label>
            {autoRefreshEnabled ? (
              <>
                <span>every {AUTO_REFRESH_INTERVAL_SECONDS} seconds</span>
                <span
                  className="countdown-clock"
                  style={countdownStyle}
                  aria-label={`${secondsUntilRefresh} seconds until the next refresh`}
                >
                  <span>{secondsUntilRefresh}</span>
                </span>
              </>
            ) : (
              <span className="paused-status">Paused</span>
            )}
          </span>
          <span>
            Successful RSS requests: <strong>{requestCount ?? "—"}</strong>
          </span>
          <span title={activeClientId}>
            Client ID:{" "}
            <strong>{activeClientId ? activeClientId.slice(-24) : "select a user"}</strong>
          </span>
        </div>
      </section>
      {error && (
        <section className="card error" role="alert">
          <strong>RSS feed unavailable</strong>
          <p>{error}</p>
          <button className="primary" disabled={loading} onClick={() => void loadChannels()}>
            {loading ? "Retrying…" : "Retry connection"}
          </button>
        </section>
      )}
      {!error && title && (
        <section className="card">
          <p className="eyebrow">Feed received from RSS Server</p>
          <h2>{title}</h2>
          {!items.length && (
            <p className="muted">No published items are available for this channel.</p>
          )}
          {items.map((item, index) => (
            <article className="item" key={`${item.link}-${index}`}>
              <span className="tag">From RSS Server</span>
              <h2>{item.title}</h2>
              <p className="muted">
                {item.author}{" "}
                {item.publishedAt && `· ${new Date(item.publishedAt).toLocaleString("en-AU")}`}
              </p>
              <p>{item.description}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
