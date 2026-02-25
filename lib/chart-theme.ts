export const CHART_COLORS = {
  emerald: "#10b981",
  sky: "#0ea5e9",
  violet: "#8b5cf6",
  orange: "#f97316",
  rose: "#f43f5e",
  amber: "#f59e0b",
  zinc: "#71717a",
} as const;

export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "var(--tooltip-bg)",
  borderRadius: 8,
  border: "1px solid var(--tooltip-border)",
  fontSize: 12,
  padding: "10px 14px",
  boxShadow: "var(--tooltip-shadow)",
  color: "var(--tooltip-text)",
};

export const GRID_STROKE = "var(--grid-stroke)";

export const AXIS_TICK = {
  fontSize: 11,
  fill: "var(--axis-fill)",
  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
};

export function formatWeekLabel(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatFullDate(value: unknown) {
  return new Date(String(value)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
