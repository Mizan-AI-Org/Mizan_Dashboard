"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OperationalMetrics } from "@/lib/metrics";
import {
  AXIS_TICK,
  CHART_COLORS,
  GRID_STROKE,
  TOOLTIP_STYLE,
  formatFullDate,
  formatWeekLabel,
} from "@/lib/chart-theme";

interface ChecklistChartProps {
  data: OperationalMetrics;
  loading?: boolean;
}

export function ChecklistChart({ data, loading }: ChecklistChartProps) {
  const series = data.checklist;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist Completion Rate</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-[var(--skeleton)]" />
        ) : series.length === 0 ? (
          <Empty>No checklist data yet.</Empty>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="checklistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.emerald} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID_STROKE} vertical={false} />
              <XAxis
                dataKey="bucket"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={AXIS_TICK}
                tickFormatter={formatWeekLabel}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tick={AXIS_TICK}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelFormatter={formatFullDate}
                formatter={(v) => [`${(Number(v) * 100).toFixed(1)}%`, "Completion"]}
              />
              <Area
                type="monotone"
                dataKey="completion_rate"
                stroke={CHART_COLORS.emerald}
                strokeWidth={2}
                fill="url(#checklistGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: CHART_COLORS.emerald }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function Empty({ children }: { children: string }) {
  return (
    <div className="flex h-full items-center justify-center text-[13px] text-[var(--text-quaternary)]">
      {children}
    </div>
  );
}
