"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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

interface UsageChartProps {
  data: OperationalMetrics;
  loading?: boolean;
}

export function UsageChart({ data, loading }: UsageChartProps) {
  const tasks = data.tasksPerShift;
  const late = data.lateClockIns;

  const merged = tasks.map((t) => {
    const match = late.find((l) => l.bucket === t.bucket);
    const lateRate =
      match && match.total_clock_ins > 0
        ? match.late_clock_ins / match.total_clock_ins
        : 0;
    return {
      bucket: t.bucket,
      tasks: t.avg_tasks_per_shift,
      late: lateRate,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks per Shift & Late Clock-ins</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-[var(--skeleton)]" />
        ) : merged.length === 0 ? (
          <Empty>No shift activity yet.</Empty>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={merged} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.sky} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={CHART_COLORS.sky} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.violet} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={CHART_COLORS.violet} stopOpacity={0} />
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
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tick={AXIS_TICK}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tick={AXIS_TICK}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelFormatter={formatFullDate}
                formatter={(v, key) => {
                  const n = Number(v);
                  if (key === "late") return [`${(n * 100).toFixed(1)}%`, "Late clock-ins"];
                  return [n?.toFixed(1) ?? "\u2013", "Tasks / shift"];
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="tasks"
                stroke={CHART_COLORS.sky}
                strokeWidth={2}
                fill="url(#taskGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: CHART_COLORS.sky }}
                name="Tasks / shift"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="late"
                stroke={CHART_COLORS.violet}
                strokeWidth={2}
                fill="url(#lateGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: CHART_COLORS.violet }}
                name="Late clock-ins"
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "var(--legend-color)", paddingTop: 12 }}
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
