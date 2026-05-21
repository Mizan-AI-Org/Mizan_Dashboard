"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { KpiDetailPayload, KpiMetricId } from "@/lib/kpi-details";
import {
  AXIS_TICK,
  CHART_COLORS,
  GRID_STROKE,
  TOOLTIP_STYLE,
  formatFullDate,
  formatWeekLabel,
} from "@/lib/chart-theme";

interface KpiDetailDrawerProps {
  metricId: KpiMetricId | null;
  onClose: () => void;
}

function formatCell(
  value: string | number | null,
  key: string,
): string {
  if (value == null || value === "") return "—";
  if (key === "price" && typeof value === "number") {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  return String(value);
}

function formatSeriesValue(value: number | null, format: "percent" | "number" | "count") {
  if (value == null) return "—";
  if (format === "percent") return `${(value * 100).toFixed(1)}%`;
  if (format === "count") return value.toLocaleString();
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function KpiDetailDrawer({ metricId, onClose }: KpiDetailDrawerProps) {
  const router = useRouter();
  const [detail, setDetail] = useState<KpiDetailPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async (id: KpiMetricId, signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/kpi/${id}`, {
        signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load details");
      const data = (await res.json()) as KpiDetailPayload;
      setDetail(data);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError("Could not load detail data. Try again.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!metricId) {
      setDetail(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    load(metricId, controller.signal);
    return () => controller.abort();
  }, [metricId, load]);

  useEffect(() => {
    if (!metricId) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [metricId, onClose]);

  const handleDeleteRestaurant = useCallback(
    async (row: Record<string, string | number | null>) => {
      const idKey = detail?.rowIdKey ?? "id";
      const id = String(row[idKey] ?? "");
      const name = String(row.name ?? "this restaurant");

      if (!id) return;

      const confirmed = window.confirm(
        `Delete "${name}" permanently?\n\nThis removes all staff, shifts, billing, and related data. This cannot be undone.`,
      );
      if (!confirmed) return;

      setDeletingId(id);
      setActionError(null);

      try {
        const res = await fetch(`/api/dashboard/restaurants/${id}`, {
          method: "DELETE",
        });
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };

        if (!res.ok) {
          throw new Error(body.error ?? "Delete failed");
        }

        if (metricId) {
          const controller = new AbortController();
          await load(metricId, controller.signal);
        }
        router.refresh();
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "Could not delete restaurant.",
        );
      } finally {
        setDeletingId(null);
      }
    },
    [detail?.rowIdKey, load, metricId, router],
  );

  if (!metricId) return null;

  const showDelete = detail?.allowRowDelete && detail.rowIdKey;
  const idKey = detail?.rowIdKey ?? "id";

  const chartData =
    detail?.series?.points.map((p) => ({
      bucket: p.bucket,
      value: p.value ?? 0,
    })) ?? [];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        aria-label="Close details"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="kpi-detail-title"
        className="relative flex h-full w-full max-w-lg flex-col border-l border-[var(--card-border)] bg-[var(--background)] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--divider)] px-6 py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-quaternary)]">
              Metric detail
            </p>
            <h2
              id="kpi-detail-title"
              className="mt-1 truncate text-lg font-semibold text-[var(--text-primary)]"
            >
              {loading ? "Loading…" : (detail?.title ?? "Details")}
            </h2>
            {detail?.description && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-tertiary)]">
                {detail.description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close details"
            onClick={onClose}
            className="rounded-lg border border-[var(--card-border)] p-2 text-[var(--text-tertiary)] transition hover:bg-[var(--card-hover)]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-[var(--skeleton)]" />
              ))}
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-600 dark:text-rose-300">
              {error}
            </p>
          )}

          {actionError && (
            <p className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-600 dark:text-rose-300">
              {actionError}
            </p>
          )}

          {!loading && detail?.note && (
            <p className="mb-4 rounded-lg border border-[var(--card-border)] bg-[var(--surface)] px-4 py-3 text-[13px] text-[var(--text-tertiary)]">
              {detail.note}
            </p>
          )}

          {!loading && detail?.series && chartData.length > 0 && (
            <div className="mb-6 h-52 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                {detail.series.name}
              </p>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.sky} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={CHART_COLORS.sky} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                  <XAxis
                    dataKey="bucket"
                    tickLine={false}
                    axisLine={false}
                    tick={AXIS_TICK}
                    tickFormatter={formatWeekLabel}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={AXIS_TICK}
                    tickFormatter={(v: number) =>
                      formatSeriesValue(v, detail.series!.format).replace(/\.0%$/, "%")
                    }
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={formatFullDate}
                    formatter={(v) => [
                      formatSeriesValue(Number(v), detail.series!.format),
                      detail.series!.name,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.sky}
                    strokeWidth={2}
                    fill="url(#detailGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {!loading && detail?.table && detail.table.rows.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-[var(--card-border)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-[var(--divider)] bg-[var(--surface)]">
                      {detail.table.columns.map((col) => (
                        <th
                          key={col.key}
                          className={`px-3 py-2.5 font-semibold uppercase tracking-wider text-[var(--text-quaternary)] ${
                            col.align === "right" ? "text-right" : "text-left"
                          }`}
                        >
                          {col.label}
                        </th>
                      ))}
                      {showDelete && (
                        <th className="px-3 py-2.5 text-right font-semibold uppercase tracking-wider text-[var(--text-quaternary)]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.table.rows.map((row, i) => {
                      const rowId = String(row[idKey] ?? i);
                      const isDeleting = deletingId === rowId;

                      return (
                      <tr
                        key={rowId}
                        className="border-b border-[var(--divider)] last:border-0 hover:bg-[var(--card-hover)]"
                      >
                        {detail.table!.columns.map((col) => (
                          <td
                            key={col.key}
                            className={`px-3 py-2.5 text-[var(--text-secondary)] ${
                              col.align === "right" ? "text-right tabular-nums" : ""
                            }`}
                          >
                            {formatCell(row[col.key], col.key)}
                          </td>
                        ))}
                        {showDelete && (
                          <td className="px-3 py-2.5 text-right">
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDeleteRestaurant(row)}
                              className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-600 transition hover:bg-rose-500/20 disabled:opacity-50 dark:text-rose-300"
                              aria-label={`Delete ${row.name ?? "restaurant"}`}
                            >
                              <Trash2 className="h-3 w-3" aria-hidden />
                              {isDeleting ? "Deleting…" : "Delete"}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading &&
            detail?.table &&
            detail.table.rows.length === 0 &&
            !detail.series?.points.length && (
              <p className="text-center text-[13px] text-[var(--text-quaternary)]">
                No records to display.
              </p>
            )}
        </div>
      </aside>
    </div>
  );
}
