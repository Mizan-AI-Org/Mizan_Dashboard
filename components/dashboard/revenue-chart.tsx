"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKpiDetail } from "@/components/dashboard/kpi-dashboard-shell";
import type { RevenueMetrics } from "@/lib/metrics";

interface RevenueChartProps {
  data: RevenueMetrics | null;
  loading?: boolean;
}

function fmt(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const { openMetric } = useKpiDetail();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Revenue</CardTitle>
        {data && !loading && (
          <button
            type="button"
            onClick={() => openMetric("revenue")}
            className="text-[11px] font-medium text-[var(--text-quaternary)] transition hover:text-[var(--text-secondary)]"
          >
            View subscriptions →
          </button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[88px] animate-pulse rounded-lg bg-[var(--skeleton)]" />
            ))}
          </div>
        ) : !data ? (
          <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-[var(--card-border)] text-[13px] text-[var(--text-quaternary)]">
            Subscription data unavailable.
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => openMetric("revenue")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openMetric("revenue");
              }
            }}
            className="grid w-full cursor-pointer gap-4 sm:grid-cols-3 text-left transition hover:opacity-90"
          >
            <Metric label="MRR" value={`$${fmt(data.mrr)}`} accent="emerald" />
            <Metric
              label="Active Subscriptions"
              value={data.active_subscriptions.toString()}
              accent="sky"
            />
            <Metric
              label="ARPU"
              value={data.arpu != null ? `$${fmt(data.arpu)}` : "\u2013"}
              accent="violet"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "emerald" | "sky" | "violet";
}) {
  const borderColors = {
    emerald: "border-l-emerald-500",
    sky: "border-l-sky-500",
    violet: "border-l-violet-500",
  };

  const valueColor = accent === "emerald" ? "text-emerald-600" : "text-[var(--text-primary)]";

  return (
    <div className={`rounded-lg border border-[var(--card-border)] border-l-[3px] ${borderColors[accent]} bg-[var(--surface)] px-5 py-4`}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        {label}
      </p>
      <p className={`mt-2 text-[26px] font-bold tabular-nums leading-none ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}
