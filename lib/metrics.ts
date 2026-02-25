import {
  type ChecklistCompletionSeriesRow,
  type EscalationSeriesRow,
  type ExecutiveOverviewRow,
  type GlobalRatesRow,
  type IncidentSeriesRow,
  type LateClockInSeriesRow,
  type RevenueSnapshotRow,
  type TasksPerShiftSeriesRow,
  fetchChecklistCompletionSeries,
  fetchEscalationSeries,
  fetchExecutiveOverview,
  fetchGlobalRates,
  fetchIncidentSeries,
  fetchLateClockInSeries,
  fetchRevenueSnapshot,
  fetchTasksPerShiftSeries,
} from "@/lib/queries";

export type ExecutiveOverviewMetrics = ExecutiveOverviewRow & GlobalRatesRow;

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
};

async function fetchExecutiveOverviewMetrics(): Promise<ExecutiveOverviewMetrics> {
  const [overview, rates] = await Promise.all([
    fetchExecutiveOverview(),
    fetchGlobalRates(),
  ]);

  return {
    ...overview,
    ...rates,
  };
}

async function fetchRevenueMetrics(): Promise<RevenueMetrics | null> {
  return fetchRevenueSnapshot();
}

async function fetchOperationalMetrics(): Promise<OperationalMetrics> {
  const [checklist, lateClockIns, incidents, escalations, tasksPerShift] =
    await Promise.all([
      fetchChecklistCompletionSeries(),
      fetchLateClockInSeries(),
      fetchIncidentSeries(),
      fetchEscalationSeries(),
      fetchTasksPerShiftSeries(),
    ]);

  return {
    checklist,
    lateClockIns,
    incidents,
    escalations,
    tasksPerShift,
  };
}

/**
 * AI usage metrics — architecture ready, wired to real tables once they exist.
 */
async function fetchAiUsageMetrics(): Promise<AiUsageMetrics> {
  return {
    available: false,
    totalInteractions: null,
    avgResponseTimeMs: null,
    aiSupervisedShiftPercentage: null,
    autoEscalations: null,
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [executive, revenue, operational, ai] = await Promise.all([
    fetchExecutiveOverviewMetrics(),
    fetchRevenueMetrics(),
    fetchOperationalMetrics(),
    fetchAiUsageMetrics(),
  ]);

  return {
    executive,
    revenue,
    operational,
    ai,
  };
}
