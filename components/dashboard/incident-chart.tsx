"use client";

import {
  Bar,
  BarChart,
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

interface IncidentChartProps {
  data: OperationalMetrics;
  loading?: boolean;
}

export function IncidentChart({ data, loading }: IncidentChartProps) {
  const incidents = data.incidents;
  const escalations = data.escalations;

  const merged = incidents.map((i) => {
    const esc = escalations.find((e) => e.bucket === i.bucket);
    return {
      bucket: i.bucket,
      incidents: i.incident_count,
      escalation: esc?.escalation_rate ?? 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incidents & Escalation Rate</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-[var(--skeleton)]" />
        ) : merged.length === 0 ? (
          <Empty>No incidents recorded.</Empty>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={merged} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
                  if (key === "escalation")
                    return [`${(n * 100).toFixed(1)}%`, "Escalation rate"];
                  return [n, "Incidents"];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "var(--legend-color)", paddingTop: 12 }}
              />
              <Bar
                yAxisId="left"
                dataKey="incidents"
                fill={CHART_COLORS.orange}
                radius={[4, 4, 0, 0]}
                name="Incidents"
                maxBarSize={28}
              />
              <Bar
                yAxisId="right"
                dataKey="escalation"
                fill={CHART_COLORS.violet}
                radius={[4, 4, 0, 0]}
                name="Escalation rate"
                maxBarSize={28}
              />
            </BarChart>
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
