"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";

type Channel = { id: string; code: string; title: string };
type FeedItem = {
  title: string;
  description: string;
  link: string;
  publishedAt: string;
  author: string;
};

function text(element: Element, selector: string) {
  return element.querySelector(selector)?.textContent?.trim() ?? "";
}

export default function RssClientPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [requestCount, setRequestCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(15);

  const refreshCount = useCallback(async () => {
    const response = await fetch("/api/count");
    if (response.ok)
      setRequestCount(
        ((await response.json()) as { data: { requestCount: number } }).data.requestCount,
      );
  }, []);

  const loadChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/channels");
      if (!response.ok) throw new Error("The API is unavailable");
      const payload = (await response.json()) as { data: Channel[] };
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

  const loadFeed = useCallback(async () => {
    if (!selectedCode) return;
    setFetching(true);
    setError(null);
    try {
      const response = await fetch(`/api/rss/${encodeURIComponent(selectedCode)}`);
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
  }, [refreshCount, selectedCode]);

  useEffect(() => {
    if (!selectedCode) return;
    const initial = window.setTimeout(() => void loadFeed(), 0);
    const refresh = window.setInterval(() => {
      void loadFeed();
      setSecondsUntilRefresh(15);
    }, 15_000);
    const countdown = window.setInterval(
      () => setSecondsUntilRefresh((seconds) => (seconds <= 1 ? 15 : seconds - 1)),
      1_000,
    );
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(refresh);
      window.clearInterval(countdown);
    };
  }, [loadFeed, selectedCode]);

  const countdownStyle = {
    "--progress": `${(secondsUntilRefresh / 15) * 360}deg`,
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
      <p className="muted">Select a channel to load its first-party RSS 2.0 feed automatically.</p>
      <section className="card">
        <div className="controls">
          <label>
            <span className="channel-label">
              Channel{" "}
              {fetching && (
                <span className="spinner" role="status" aria-label="Refreshing selected channel" />
              )}
            </span>
            <select
              value={selectedCode}
              disabled={loading}
              onChange={(event) => {
                setSelectedCode(event.target.value);
                setSecondsUntilRefresh(15);
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
            Refreshes every 15 seconds{" "}
            <span
              className="countdown-clock"
              style={countdownStyle}
              aria-label={`${secondsUntilRefresh} seconds until the next refresh`}
            >
              <span>{secondsUntilRefresh}</span>
            </span>
          </span>
          <span>
            Successful RSS requests: <strong>{requestCount ?? "—"}</strong>
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
