"use client";

import { cn } from "@/lib/utils";
import type { KpiMetricId } from "@/lib/kpi-details";
import { useKpiDetail } from "@/components/dashboard/kpi-dashboard-shell";

type TrendDirection = "up" | "down" | "flat";

type AccentColor = "emerald" | "sky" | "violet" | "orange" | "rose" | "amber";

const ACCENT_CLASSES: Record<AccentColor, { bar: string }> = {
  emerald: { bar: "bg-emerald-500" },
  sky: { bar: "bg-sky-500" },
  violet: { bar: "bg-violet-500" },
  orange: { bar: "bg-orange-500" },
  rose: { bar: "bg-rose-500" },
  amber: { bar: "bg-amber-500" },
};

export interface KpiCardProps {
  label: string;
  value: string | number | null;
  helper?: string;
  trendValue?: string | null;
  trendDirection?: TrendDirection | null;
  accent?: AccentColor;
  loading?: boolean;
  className?: string;
  /** When set, card opens a detail drawer for this metric. */
  metricId?: KpiMetricId;
}

function TrendPill({
  direction,
  value,
}: {
  direction: TrendDirection | null | undefined;
  value: string | null | undefined;
}) {
  if (!direction || !value) return null;

  const arrow =
    direction === "up" ? "\u2191" : direction === "down" ? "\u2193" : "\u2192";

  const color =
    direction === "up"
      ? "text-emerald-500"
      : direction === "down"
        ? "text-rose-500"
        : "text-[var(--text-tertiary)]";

  return (
    <span className={cn("text-[11px] font-semibold tabular-nums", color)}>
      {arrow} {value}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  helper,
  trendValue,
  trendDirection,
  accent = "emerald",
  loading,
  className,
  metricId,
}: KpiCardProps) {
  const colors = ACCENT_CLASSES[accent];
  const { openMetric } = useKpiDetail();
  const clickable = Boolean(metricId) && !loading;

  const inner = (
    <>
      <div className={cn("absolute left-0 top-0 h-full w-[3px]", colors.bar)} />

      <div className="py-5 pl-5 pr-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            {label}
          </span>
          <div className="flex items-center gap-2">
            <TrendPill direction={trendDirection} value={trendValue ?? undefined} />
            {clickable && (
              <span className="text-[10px] font-medium text-[var(--text-quaternary)] opacity-0 transition group-hover:opacity-100">
                View →
              </span>
            )}
          </div>
        </div>

        <div className="mt-3">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded bg-[var(--skeleton)]" />
          ) : (
            <span className="text-[32px] font-bold leading-none tracking-tight text-[var(--text-primary)]">
              {value ?? "\u2013"}
            </span>
          )}
        </div>

        {helper && (
          <p className="mt-2.5 text-[11px] leading-relaxed text-[var(--text-quaternary)]">
            {helper}
          </p>
        )}
      </div>
    </>
  );

  if (!clickable) {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]",
          "shadow-[var(--shadow-sm)]",
          className,
        )}
      >
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openMetric(metricId!)}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-left",
        "shadow-[var(--shadow-sm)] transition-all duration-200",
        "hover:border-[var(--card-border-hover)] hover:bg-[var(--card-hover)] hover:shadow-[var(--shadow-md)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
        "cursor-pointer",
        className,
      )}
    >
      {inner}
    </button>
  );
}
