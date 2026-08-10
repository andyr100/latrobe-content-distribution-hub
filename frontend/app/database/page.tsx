"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";

type TableDefinition = { id: string; label: string; description: string };
type TableData = { tableName: string; columns: string[]; rows: Array<Record<string, unknown>>; count: number };

function displayValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function DatabasePage() {
  const [tables, setTables] = useState<TableDefinition[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [data, setData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTable = useCallback(async (tableId: string) => {
    if (!tableId) return;
    setLoading(true); setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/database/${tableId}`);
      const payload = await response.json() as { success: boolean; data?: TableData; error?: { message: string } };
      if (!response.ok || !payload.success || !payload.data) throw new Error(payload.error?.message ?? "The database table could not be loaded");
      setData(payload.data);
    } catch (caught) {
      setData(null); setError(caught instanceof Error ? caught.message : "The database table could not be loaded");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(async () => { try { const response = await fetch(`${API_BASE_URL}/api/database`); const payload = await response.json() as { success: boolean; data?: TableDefinition[] }; if (!response.ok || !payload.success || !payload.data) throw new Error(); setTables(payload.data); const first = payload.data[0]?.id ?? ""; setSelectedTable(first); if (first) await loadTable(first); } catch { setError("The database catalogue could not be loaded"); setLoading(false); } }, 0); return () => window.clearTimeout(timer); }, [loadTable]);

  const selectedDefinition = tables.find((table) => table.id === selectedTable);
  return <div className="mx-auto max-w-7xl"><PageHeader eyebrow="Read-only database view" title="SQLite data inspector" description="View the application tables to demonstrate that posts and channel relationships are being saved in the shared SQLite database." /><GlassCard className="p-5 sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><label className="block min-w-0 flex-1 sm:max-w-md"><span className="mb-2 block text-sm font-bold">SQLite table</span><select value={selectedTable} disabled={!tables.length} onChange={(event) => { const value = event.target.value; setSelectedTable(value); void loadTable(value); }} className="min-h-12 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm font-semibold"><option value="">Choose a table</option>{tables.map((table) => <option key={table.id} value={table.id}>{table.label}</option>)}</select></label><p className="muted max-w-xl text-sm leading-6">{selectedDefinition?.description ?? "Select an application table to view its saved records."}</p></div>{loading && <p className="muted mt-8 text-sm">Loading table data…</p>}{error && <div className="mt-8 rounded-xl border border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] p-4 text-sm text-[var(--danger)]">{error}</div>}{!loading && !error && data && <div className="mt-8"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">{selectedDefinition?.label ?? data.tableName}</h2><span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-bold text-[var(--primary)]">{data.count} records</span></div><div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)]"><table className="min-w-full divide-y divide-[var(--border)] text-left text-sm"><thead className="bg-[var(--surface-muted)]"><tr>{data.columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 font-bold">{column}</th>)}</tr></thead><tbody className="divide-y divide-[var(--border)]">{data.rows.map((row, index) => <tr key={index}>{data.columns.map((column) => <td key={column} className="max-w-sm px-4 py-3 align-top break-words text-[var(--text-muted)]">{displayValue(row[column])}</td>)}</tr>)}{!data.rows.length && <tr><td className="px-4 py-6 text-[var(--text-muted)]" colSpan={Math.max(data.columns.length, 1)}>This table has no records.</td></tr>}</tbody></table></div></div>}</GlassCard></div>;
}
