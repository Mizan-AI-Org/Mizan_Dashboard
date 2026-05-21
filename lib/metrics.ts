import { cache } from "react";
import { getDashboardCacheTtlSeconds } from "@/lib/cache-config";
import {
  type ChecklistCompletionSeriesRow,
  type EscalationSeriesRow,
  type ExecutiveOverviewRow,
  type IncidentSeriesRow,
  type LateClockInSeriesRow,
  type RevenueSnapshotRow,
  type TasksPerShiftSeriesRow,
  EMPTY_EXECUTIVE_OVERVIEW,
  fetchDashboardQueryBundle,
} from "@/lib/queries";

export type ExecutiveOverviewMetrics = ExecutiveOverviewRow;

export type RevenueMetrics = RevenueSnapshotRow;

export type OperationalMetrics = {
  checklist: ChecklistCompletionSeriesRow[];
  lateClockIns: LateClockInSeriesRow[];
  incidents: IncidentSeriesRow[];
  escalations: EscalationSeriesRow[];
  tasksPerShift: TasksPerShiftSeriesRow[];
};

export type AiUsageMetrics = {
  available: boolean;
  totalInteractions: number | null;
  avgResponseTimeMs: number | null;
  aiSupervisedShiftPercentage: number | null;
  autoEscalations: number | null;
};

export type DashboardMetrics = {
  executive: ExecutiveOverviewMetrics;
  revenue: RevenueMetrics | null;
  operational: OperationalMetrics;
  ai: AiUsageMetrics;
  dbConnected: boolean;
};

const AI_USAGE_PLACEHOLDER: AiUsageMetrics = {
  available: false,
  totalInteractions: null,
  avgResponseTimeMs: null,
  aiSupervisedShiftPercentage: null,
  autoEscalations: null,
};

const EMPTY_OPERATIONAL: OperationalMetrics = {
  checklist: [],
  lateClockIns: [],
  incidents: [],
  escalations: [],
  tasksPerShift: [],
};

function mapBundleToMetrics(
  bundle: Awaited<ReturnType<typeof fetchDashboardQueryBundle>>,
): DashboardMetrics {
  return {
    executive: bundle.executive,
    revenue: bundle.revenue,
    operational: {
      checklist: bundle.checklist,
      lateClockIns: bundle.lateClockIns,
      incidents: bundle.incidents,
      escalations: bundle.escalations,
      tasksPerShift: bundle.tasksPerShift,
    },
    ai: AI_USAGE_PLACEHOLDER,
    dbConnected: bundle.dbConnected,
  };
}

function emptyDashboardMetrics(): DashboardMetrics {
  return {
    executive: EMPTY_EXECUTIVE_OVERVIEW,
    revenue: null,
    operational: EMPTY_OPERATIONAL,
    ai: AI_USAGE_PLACEHOLDER,
    dbConnected: false,
  };
}

type MetricsCacheEntry = {
  data: DashboardMetrics;
  expiresAt: number;
};

declare global {
  var __dashboardMetricsCache__: MetricsCacheEntry | undefined;
}

function getMemoryCachedMetrics(): DashboardMetrics | null {
  const entry = global.__dashboardMetricsCache__;
  if (!entry || entry.expiresAt <= Date.now()) {
    return null;
  }
  return entry.data;
}

function setMemoryCachedMetrics(data: DashboardMetrics): void {
  const ttlSeconds = getDashboardCacheTtlSeconds();
  if (ttlSeconds <= 0 || !data.dbConnected) {
    return;
  }

  global.__dashboardMetricsCache__ = {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  };
}

async function loadDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const bundle = await fetchDashboardQueryBundle();
    if (!bundle.dbConnected) {
      return emptyDashboardMetrics();
    }
    return mapBundleToMetrics(bundle);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[metrics] loadDashboardMetrics failed:", error);
    }
    return emptyDashboardMetrics();
  }
}

async function loadDashboardMetricsCached(): Promise<DashboardMetrics> {
  const cached = getMemoryCachedMetrics();
  if (cached) {
    return cached;
  }

  const fresh = await loadDashboardMetrics();
  if (fresh.dbConnected) {
    setMemoryCachedMetrics(fresh);
  }
  return fresh;
}

/** Dashboard metrics — per-request dedupe; optional in-memory cache when DB is healthy. */
export const getDashboardMetrics = cache(loadDashboardMetricsCached);
