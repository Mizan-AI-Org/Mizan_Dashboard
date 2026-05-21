import { query, queryAll } from "@/lib/db";

export type ExecutiveOverviewRow = {
  total_restaurants: number;
  total_staff: number;
  total_shifts_this_month: number;
  checklist_completion_rate: number | null;
  total_incidents_this_month: number;
  escalation_rate: number | null;
  incident_rate: number | null;
};

export type RevenueSnapshotRow = {
  mrr: number;
  active_subscriptions: number;
  arpu: number | null;
};

export type ChecklistCompletionSeriesRow = {
  bucket: string;
  completion_rate: number | null;
};

export type LateClockInSeriesRow = {
  bucket: string;
  late_clock_ins: number;
  total_clock_ins: number;
};

export type IncidentSeriesRow = {
  bucket: string;
  incident_count: number;
};

export type EscalationSeriesRow = {
  bucket: string;
  escalation_rate: number | null;
};

export type TasksPerShiftSeriesRow = {
  bucket: string;
  avg_tasks_per_shift: number | null;
};

export type GlobalRatesRow = {
  escalation_rate: number | null;
  incident_rate: number | null;
};

function logQueryError(label: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[queries] ${label} failed:`, error);
  }
}

export const EMPTY_EXECUTIVE_OVERVIEW: ExecutiveOverviewRow = {
  total_restaurants: 0,
  total_staff: 0,
  total_shifts_this_month: 0,
  checklist_completion_rate: null,
  total_incidents_this_month: 0,
  escalation_rate: null,
  incident_rate: null,
};

const EXECUTIVE_OVERVIEW_SQL = `
      select
        (select count(*) from restaurants)::int as total_restaurants,

        (
          select count(*)::int
          from users
          where is_active = true
            and restaurant_id is not null
            and role not in ('SUPER_ADMIN')
        ) as total_staff,

        (
          select count(*)::int
          from assigned_shifts
          where date_trunc('month', shift_date) = date_trunc('month', current_date)
        ) as total_shifts_this_month,

        (
          select
            case
              when count(*) = 0 then null
              else
                sum(case when upper(status) = 'COMPLETED' then 1 else 0 end)::float
                / count(*)
            end
          from (
            select status, created_at from checklist_executions
            union all
            select status, created_at from shift_checklist_progress
          ) combined_checklists
          where created_at >= date_trunc('month', now())
        ) as checklist_completion_rate,

        (
          select count(*)::int from (
            select id from incidents where created_at >= date_trunc('month', now())
            union all
            select id from staff_safetyconcernreport where created_at >= date_trunc('month', now())
          ) combined
        ) as total_incidents_this_month,

        case
          when (select count(*) from assigned_shifts) = 0 then null
          else (select count(*) from alerts)::float
               / (select count(*) from assigned_shifts)
        end as escalation_rate,

        case
          when (select count(*) from assigned_shifts) = 0 then null
          else (
            (select count(*) from incidents) + (select count(*) from staff_safetyconcernreport)
          )::float / (select count(*) from assigned_shifts)
        end as incident_rate;
      `;

// ---------------------------------------------------------------------------
// Executive Overview
// ---------------------------------------------------------------------------

export async function fetchExecutiveOverview(): Promise<ExecutiveOverviewRow> {
  try {
    const { rows } = await query<ExecutiveOverviewRow>(EXECUTIVE_OVERVIEW_SQL);
    return rows[0] ?? EMPTY_EXECUTIVE_OVERVIEW;
  } catch (error) {
    logQueryError("fetchExecutiveOverview", error);
    return EMPTY_EXECUTIVE_OVERVIEW;
  }
}

// ---------------------------------------------------------------------------
// Revenue snapshot
// ---------------------------------------------------------------------------

export async function fetchRevenueSnapshot(): Promise<RevenueSnapshotRow | null> {
  try {
    const { rows } = await query<RevenueSnapshotRow>(
      `
      select
        coalesce(sum(p.price), 0)::float as mrr,
        count(*)::int as active_subscriptions,
        case
          when count(*) = 0 then null
          else (sum(p.price) / count(*))::float
        end as arpu
      from billing_subscription s
      join billing_subscriptionplan p on p.id = s.plan_id
      where s.status = 'active';
      `,
    );
    return rows[0] ?? null;
  } catch (error) {
    logQueryError("fetchRevenueSnapshot", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Operational time-series (each individually fault-tolerant)
// ---------------------------------------------------------------------------

export async function fetchChecklistCompletionSeries(): Promise<
  ChecklistCompletionSeriesRow[]
> {
  try {
    const { rows } = await query<ChecklistCompletionSeriesRow>(
      `
      select
        date_trunc('week', created_at)::date::text as bucket,
        case
          when count(*) = 0 then null
          else
            sum(case when upper(status) = 'COMPLETED' then 1 else 0 end)::float
            / count(*)
        end as completion_rate
      from (
        select status, created_at from checklist_executions
        union all
        select status, created_at from shift_checklist_progress
      ) combined_checklists
      group by 1
      order by bucket
      limit 26;
      `,
    );
    return rows;
  } catch (error) {
    logQueryError("fetchChecklistCompletionSeries", error);
    return [];
  }
}

export async function fetchLateClockInSeries(): Promise<
  LateClockInSeriesRow[]
> {
  try {
    const { rows } = await query<LateClockInSeriesRow>(
      `
      select
        date_trunc('week', c.timestamp)::date::text as bucket,
        count(*) filter (where c.timestamp > s.start_time)::int as late_clock_ins,
        count(*)::int as total_clock_ins
      from timeclock_clockevent c
      join assigned_shifts s
        on s.staff_id = c.staff_id
        and s.shift_date = c.timestamp::date
      where c.event_type = 'clock_in'
      group by 1
      order by bucket
      limit 26;
      `,
    );
    return rows;
  } catch (error) {
    logQueryError("fetchLateClockInSeries", error);
    return [];
  }
}

export async function fetchIncidentSeries(): Promise<IncidentSeriesRow[]> {
  try {
    const { rows } = await query<IncidentSeriesRow>(
      `
      select
        bucket,
        count(*)::int as incident_count
      from (
        select date_trunc('week', created_at)::date as bucket from incidents
        union all
        select date_trunc('week', created_at)::date as bucket from staff_safetyconcernreport
      ) combined
      group by 1
      order by bucket
      limit 26;
      `,
    );
    return rows;
  } catch (error) {
    logQueryError("fetchIncidentSeries", error);
    return [];
  }
}

export async function fetchEscalationSeries(): Promise<
  EscalationSeriesRow[]
> {
  try {
    const { rows } = await query<EscalationSeriesRow>(
      `
      with alerts_by_week as (
        select
          date_trunc('week', a.created_at)::date as bucket,
          count(*) as alert_count
        from alerts a
        group by 1
      ),
      shifts_by_week as (
        select
          date_trunc('week', s.shift_date)::date as bucket,
          count(*) as shifts
        from assigned_shifts s
        group by 1
      )
      select
        abw.bucket::text as bucket,
        case
          when sbw.shifts = 0 then null
          else abw.alert_count::float / sbw.shifts
        end as escalation_rate
      from alerts_by_week abw
      join shifts_by_week sbw
        on sbw.bucket = abw.bucket
      order by abw.bucket
      limit 26;
      `,
    );
    return rows;
  } catch (error) {
    logQueryError("fetchEscalationSeries", error);
    return [];
  }
}

export async function fetchTasksPerShiftSeries(): Promise<
  TasksPerShiftSeriesRow[]
> {
  try {
    const { rows } = await query<TasksPerShiftSeriesRow>(
      `
      select
        date_trunc('week', s.shift_date)::date::text as bucket,
        case
          when count(distinct s.id) = 0 then null
          else count(combined.id)::float / count(distinct s.id)
        end as avg_tasks_per_shift
      from assigned_shifts s
      left join (
        select id, assigned_shift_id from checklist_executions where upper(status) = 'COMPLETED'
        union all
        select id, shift_id as assigned_shift_id from shift_checklist_progress where upper(status) = 'COMPLETED'
      ) combined
        on combined.assigned_shift_id = s.id
      group by 1
      order by bucket
      limit 26;
      `,
    );
    return rows;
  } catch (error) {
    logQueryError("fetchTasksPerShiftSeries", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Global rates
// ---------------------------------------------------------------------------

/** @deprecated Rates are included in fetchExecutiveOverview; kept for direct callers. */
export async function fetchGlobalRates(): Promise<GlobalRatesRow> {
  const overview = await fetchExecutiveOverview();
  return {
    escalation_rate: overview.escalation_rate,
    incident_rate: overview.incident_rate,
  };
}

const REVENUE_SNAPSHOT_SQL = `
  select
    coalesce(sum(p.price), 0)::float as mrr,
    count(*)::int as active_subscriptions,
    case
      when count(*) = 0 then null
      else (sum(p.price) / count(*))::float
    end as arpu
  from billing_subscription s
  join billing_subscriptionplan p on p.id = s.plan_id
  where s.status = 'active';
`;

const CHECKLIST_SERIES_SQL = `
  select
    date_trunc('week', created_at)::date::text as bucket,
    case
      when count(*) = 0 then null
      else
        sum(case when upper(status) = 'COMPLETED' then 1 else 0 end)::float
        / count(*)
    end as completion_rate
  from (
    select status, created_at from checklist_executions
    union all
    select status, created_at from shift_checklist_progress
  ) combined_checklists
  group by 1
  order by bucket
  limit 26;
`;

const LATE_CLOCK_IN_SERIES_SQL = `
  select
    date_trunc('week', c.timestamp)::date::text as bucket,
    count(*) filter (where c.timestamp > s.start_time)::int as late_clock_ins,
    count(*)::int as total_clock_ins
  from timeclock_clockevent c
  join assigned_shifts s
    on s.staff_id = c.staff_id
    and s.shift_date = c.timestamp::date
  where c.event_type = 'clock_in'
  group by 1
  order by bucket
  limit 26;
`;

const INCIDENT_SERIES_SQL = `
  select
    bucket,
    count(*)::int as incident_count
  from (
    select date_trunc('week', created_at)::date as bucket from incidents
    union all
    select date_trunc('week', created_at)::date as bucket from staff_safetyconcernreport
  ) combined
  group by 1
  order by bucket
  limit 26;
`;

const ESCALATION_SERIES_SQL = `
  with alerts_by_week as (
    select
      date_trunc('week', a.created_at)::date as bucket,
      count(*) as alert_count
    from alerts a
    group by 1
  ),
  shifts_by_week as (
    select
      date_trunc('week', s.shift_date)::date as bucket,
      count(*) as shifts
    from assigned_shifts s
    group by 1
  )
  select
    abw.bucket::text as bucket,
    case
      when sbw.shifts = 0 then null
      else abw.alert_count::float / sbw.shifts
    end as escalation_rate
  from alerts_by_week abw
  join shifts_by_week sbw
    on sbw.bucket = abw.bucket
  order by abw.bucket
  limit 26;
`;

const TASKS_PER_SHIFT_SERIES_SQL = `
  select
    date_trunc('week', s.shift_date)::date::text as bucket,
    case
      when count(distinct s.id) = 0 then null
      else count(combined.id)::float / count(distinct s.id)
    end as avg_tasks_per_shift
  from assigned_shifts s
  left join (
    select id, assigned_shift_id from checklist_executions where upper(status) = 'COMPLETED'
    union all
    select id, shift_id as assigned_shift_id from shift_checklist_progress where upper(status) = 'COMPLETED'
  ) combined
    on combined.assigned_shift_id = s.id
  group by 1
  order by bucket
  limit 26;
`;

export type DashboardQueryBundle = {
  executive: ExecutiveOverviewRow;
  revenue: RevenueSnapshotRow | null;
  checklist: ChecklistCompletionSeriesRow[];
  lateClockIns: LateClockInSeriesRow[];
  incidents: IncidentSeriesRow[];
  escalations: EscalationSeriesRow[];
  tasksPerShift: TasksPerShiftSeriesRow[];
  /** False when Postgres could not be reached or every query failed. */
  dbConnected: boolean;
};

export function emptyDashboardQueryBundle(): DashboardQueryBundle {
  return {
    executive: EMPTY_EXECUTIVE_OVERVIEW,
    revenue: null,
    checklist: [],
    lateClockIns: [],
    incidents: [],
    escalations: [],
    tasksPerShift: [],
    dbConnected: false,
  };
}

function bundleFromResults(
  executiveResult: { rows: unknown[]; error?: unknown },
  revenueResult: { rows: unknown[]; error?: unknown },
  checklistResult: { rows: unknown[]; error?: unknown },
  lateClockInResult: { rows: unknown[]; error?: unknown },
  incidentResult: { rows: unknown[]; error?: unknown },
  escalationResult: { rows: unknown[]; error?: unknown },
  tasksResult: { rows: unknown[]; error?: unknown },
): DashboardQueryBundle {
  const executive =
    (executiveResult.rows[0] as ExecutiveOverviewRow | undefined) ??
    EMPTY_EXECUTIVE_OVERVIEW;

  const hasLiveData =
    !executiveResult.error ||
    !revenueResult.error ||
    !checklistResult.error ||
    !lateClockInResult.error ||
    !incidentResult.error ||
    !escalationResult.error ||
    !tasksResult.error;

  return {
    executive,
    revenue: revenueResult.error
      ? null
      : ((revenueResult.rows[0] as RevenueSnapshotRow | undefined) ?? {
          mrr: 0,
          active_subscriptions: 0,
          arpu: null,
        }),
    checklist: checklistResult.error
      ? []
      : (checklistResult.rows as ChecklistCompletionSeriesRow[]),
    lateClockIns: lateClockInResult.error
      ? []
      : (lateClockInResult.rows as LateClockInSeriesRow[]),
    incidents: incidentResult.error
      ? []
      : (incidentResult.rows as IncidentSeriesRow[]),
    escalations: escalationResult.error
      ? []
      : (escalationResult.rows as EscalationSeriesRow[]),
    tasksPerShift: tasksResult.error
      ? []
      : (tasksResult.rows as TasksPerShiftSeriesRow[]),
    dbConnected: hasLiveData,
  };
}

/**
 * Load all dashboard SQL in one pooled connection (7 statements, 1 connect).
 */
export async function fetchDashboardQueryBundle(): Promise<DashboardQueryBundle> {
  // One connection for all statements (~1s total vs multiple connect/timeouts).
  const [
    executiveResult,
    revenueResult,
    checklistResult,
    lateClockInResult,
    incidentResult,
    escalationResult,
    tasksResult,
  ] = await queryAll([
    { text: EXECUTIVE_OVERVIEW_SQL },
    { text: REVENUE_SNAPSHOT_SQL },
    { text: CHECKLIST_SERIES_SQL },
    { text: LATE_CLOCK_IN_SERIES_SQL },
    { text: INCIDENT_SERIES_SQL },
    { text: ESCALATION_SERIES_SQL },
    { text: TASKS_PER_SHIFT_SERIES_SQL },
  ]);

  if (executiveResult.error) logQueryError("fetchExecutiveOverview", executiveResult.error);
  if (revenueResult.error) logQueryError("fetchRevenueSnapshot", revenueResult.error);
  if (checklistResult.error) {
    logQueryError("fetchChecklistCompletionSeries", checklistResult.error);
  }
  if (lateClockInResult.error) logQueryError("fetchLateClockInSeries", lateClockInResult.error);
  if (incidentResult.error) logQueryError("fetchIncidentSeries", incidentResult.error);
  if (escalationResult.error) logQueryError("fetchEscalationSeries", escalationResult.error);
  if (tasksResult.error) logQueryError("fetchTasksPerShiftSeries", tasksResult.error);

  const bundle = bundleFromResults(
    executiveResult,
    revenueResult,
    checklistResult,
    lateClockInResult,
    incidentResult,
    escalationResult,
    tasksResult,
  );

  if (!bundle.dbConnected) {
    return emptyDashboardQueryBundle();
  }

  return bundle;
}
