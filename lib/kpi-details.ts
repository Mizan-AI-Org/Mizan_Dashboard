import { query } from "@/lib/db";

export const KPI_METRIC_IDS = [
  "restaurants",
  "staff",
  "shifts",
  "checklist",
  "incidents",
  "escalation-rate",
  "incident-rate",
  "revenue",
  "ai-interactions",
  "ai-supervised",
] as const;

export type KpiMetricId = (typeof KPI_METRIC_IDS)[number];

export function isValidKpiMetricId(value: string): value is KpiMetricId {
  return (KPI_METRIC_IDS as readonly string[]).includes(value);
}

export type KpiTableColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
};

export type KpiSeriesPoint = {
  bucket: string;
  value: number | null;
  label?: string;
};

export type KpiDetailPayload = {
  metricId: KpiMetricId;
  title: string;
  description: string;
  table?: {
    columns: KpiTableColumn[];
    rows: Record<string, string | number | null>[];
  };
  series?: {
    name: string;
    points: KpiSeriesPoint[];
    format: "percent" | "number" | "count";
  };
  note?: string;
  /** Row id key for actions (e.g. delete). */
  rowIdKey?: string;
  /** Enable per-row destructive actions in the detail drawer. */
  allowRowDelete?: boolean;
};

function logDetailError(label: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[kpi-details] ${label} failed:`, error);
  }
}

async function fetchRestaurantsDetail(): Promise<KpiDetailPayload> {
  const { rows } = await query<{
    id: string;
    name: string;
    restaurant_type: string;
    country_code: string;
    created_at: string;
    staff_count: number;
  }>(`
    select
      r.id::text as id,
      r.name,
      r.restaurant_type,
      r.country_code,
      r.created_at::text as created_at,
      (
        select count(*)::int
        from users u
        where u.restaurant_id = r.id
          and u.is_active = true
          and u.role not in ('SUPER_ADMIN')
      ) as staff_count
    from restaurants r
    order by r.name
    limit 100
  `);

  return {
    metricId: "restaurants",
    title: "All restaurants",
    description:
      "Every onboarded restaurant in Mizan. Deleting a restaurant removes all related data permanently.",
    rowIdKey: "id",
    allowRowDelete: true,
    table: {
      columns: [
        { key: "name", label: "Restaurant" },
        { key: "restaurant_type", label: "Type" },
        { key: "country_code", label: "Country" },
        { key: "staff_count", label: "Staff", align: "right" },
        { key: "created_at", label: "Created" },
      ],
      rows: rows.map((r) => ({
        id: r.id,
        name: r.name,
        restaurant_type: r.restaurant_type,
        country_code: r.country_code,
        staff_count: r.staff_count,
        created_at: r.created_at?.slice(0, 10) ?? "",
      })),
    },
  };
}

async function fetchStaffDetail(): Promise<KpiDetailPayload> {
  const { rows } = await query<{
    name: string;
    email: string;
    role: string;
    restaurant: string | null;
  }>(`
    select
      trim(coalesce(u.first_name, '') || ' ' || coalesce(u.last_name, '')) as name,
      u.email,
      u.role,
      r.name as restaurant
    from users u
    left join restaurants r on r.id = u.restaurant_id
    where u.is_active = true
      and u.restaurant_id is not null
      and u.role not in ('SUPER_ADMIN')
    order by r.name nulls last, u.role, u.email
    limit 200
  `);

  return {
    metricId: "staff",
    title: "Active staff",
    description: "Active non-admin users linked to a restaurant.",
    table: {
      columns: [
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "restaurant", label: "Restaurant" },
        { key: "email", label: "Email" },
      ],
      rows: rows.map((r) => ({
        name: r.name.trim() || r.email,
        email: r.email,
        role: r.role,
        restaurant: r.restaurant,
      })),
    },
  };
}

async function fetchShiftsDetail(): Promise<KpiDetailPayload> {
  const [weekly, recent] = await Promise.all([
    query<{ week: string; shifts: number }>(`
      select
        date_trunc('week', shift_date)::date::text as week,
        count(*)::int as shifts
      from assigned_shifts
      where date_trunc('month', shift_date) = date_trunc('month', current_date)
      group by 1
      order by week
    `),
    query<{
      shift_date: string;
      restaurant: string;
      staff: string | null;
      status: string;
    }>(`
      select
        s.shift_date::text as shift_date,
        r.name as restaurant,
        u.email as staff,
        s.status
      from assigned_shifts s
      join scheduling_weeklyschedule ws on ws.id = s.schedule_id
      join restaurants r on r.id = ws.restaurant_id
      left join users u on u.id = s.staff_id
      where date_trunc('month', s.shift_date) = date_trunc('month', current_date)
      order by s.shift_date desc, r.name
      limit 50
    `),
  ]);

  return {
    metricId: "shifts",
    title: "Shifts this month",
    description: "Scheduled shifts for the current calendar month.",
    series: {
      name: "Shifts per week",
      format: "count",
      points: weekly.rows.map((r) => ({
        bucket: r.week,
        value: r.shifts,
      })),
    },
    table: {
      columns: [
        { key: "shift_date", label: "Date" },
        { key: "restaurant", label: "Restaurant" },
        { key: "staff", label: "Staff" },
        { key: "status", label: "Status" },
      ],
      rows: recent.rows.map((r) => ({
        shift_date: r.shift_date?.slice(0, 10) ?? "",
        restaurant: r.restaurant,
        staff: r.staff ?? "Unassigned",
        status: r.status,
      })),
    },
    note: recent.rows.length === 0 ? "No shifts scheduled this month yet." : undefined,
  };
}

async function fetchChecklistDetail(): Promise<KpiDetailPayload> {
  const { rows } = await query<{ bucket: string; completion_rate: number | null }>(`
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
    limit 26
  `);

  return {
    metricId: "checklist",
    title: "Checklist completion",
    description: "Weekly completion rate across checklist executions.",
    series: {
      name: "Completion rate",
      format: "percent",
      points: rows.map((r) => ({
        bucket: r.bucket,
        value: r.completion_rate,
      })),
    },
    note: rows.length === 0 ? "No checklist activity recorded yet." : undefined,
  };
}

async function fetchIncidentsDetail(): Promise<KpiDetailPayload> {
  const [weekly, recent] = await Promise.all([
    query<{ bucket: string; incident_count: number }>(`
      select bucket, count(*)::int as incident_count
      from (
        select date_trunc('week', created_at)::date as bucket from incidents
        where created_at >= date_trunc('month', now())
        union all
        select date_trunc('week', created_at)::date as bucket
        from staff_safetyconcernreport
        where created_at >= date_trunc('month', now())
      ) combined
      group by 1
      order by bucket
    `),
    query<{
      source: string;
      title: string;
      restaurant: string | null;
      status: string;
      created_at: string;
    }>(`
      select source, title, restaurant, status, created_at
      from (
        select
          'Incident' as source,
          i.title,
          r.name as restaurant,
          i.status,
          i.created_at::text as created_at
        from incidents i
        left join restaurants r on r.id = i.restaurant_id
        where i.created_at >= date_trunc('month', now())
        union all
        select
          'Safety report' as source,
          s.title,
          r.name as restaurant,
          s.status,
          s.created_at::text as created_at
        from staff_safetyconcernreport s
        left join restaurants r on r.id = s.restaurant_id
        where s.created_at >= date_trunc('month', now())
      ) combined
      order by created_at desc
      limit 50
    `),
  ]);

  return {
    metricId: "incidents",
    title: "Incidents this month",
    description: "Formal incidents and staff safety reports created this month.",
    series: {
      name: "Incidents per week",
      format: "count",
      points: weekly.rows.map((r) => ({
        bucket: r.bucket,
        value: r.incident_count,
      })),
    },
    table: {
      columns: [
        { key: "created_at", label: "Date" },
        { key: "source", label: "Type" },
        { key: "title", label: "Title" },
        { key: "restaurant", label: "Restaurant" },
        { key: "status", label: "Status" },
      ],
      rows: recent.rows.map((r) => ({
        created_at: r.created_at?.slice(0, 10) ?? "",
        source: r.source,
        title: r.title,
        restaurant: r.restaurant,
        status: r.status,
      })),
    },
  };
}

async function fetchEscalationRateDetail(): Promise<KpiDetailPayload> {
  const { rows } = await query<{ bucket: string; escalation_rate: number | null }>(`
    with alerts_by_week as (
      select date_trunc('week', a.created_at)::date as bucket, count(*) as alert_count
      from alerts a
      group by 1
    ),
    shifts_by_week as (
      select date_trunc('week', s.shift_date)::date as bucket, count(*) as shifts
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
    join shifts_by_week sbw on sbw.bucket = abw.bucket
    order by abw.bucket
    limit 26
  `);

  return {
    metricId: "escalation-rate",
    title: "Escalation rate",
    description: "Alerts divided by scheduled shifts, by week.",
    series: {
      name: "Escalation rate",
      format: "percent",
      points: rows.map((r) => ({
        bucket: r.bucket,
        value: r.escalation_rate,
      })),
    },
  };
}

async function fetchIncidentRateDetail(): Promise<KpiDetailPayload> {
  const { rows } = await query<{ bucket: string; incident_rate: number | null }>(`
    with incidents_by_week as (
      select bucket, count(*)::float as incidents
      from (
        select date_trunc('week', created_at)::date as bucket from incidents
        union all
        select date_trunc('week', created_at)::date as bucket from staff_safetyconcernreport
      ) combined
      group by 1
    ),
    shifts_by_week as (
      select date_trunc('week', shift_date)::date as bucket, count(*)::float as shifts
      from assigned_shifts
      group by 1
    )
    select
      i.bucket::text as bucket,
      case when s.shifts = 0 then null else i.incidents / s.shifts end as incident_rate
    from incidents_by_week i
    join shifts_by_week s on s.bucket = i.bucket
    order by i.bucket
    limit 26
  `);

  return {
    metricId: "incident-rate",
    title: "Incident rate",
    description: "Incidents and safety reports divided by shifts, by week.",
    series: {
      name: "Incident rate",
      format: "percent",
      points: rows.map((r) => ({
        bucket: r.bucket,
        value: r.incident_rate,
      })),
    },
  };
}

async function fetchRevenueDetail(): Promise<KpiDetailPayload> {
  const { rows } = await query<{
    restaurant: string;
    plan: string | null;
    price: number | null;
    status: string;
    billing_interval: string;
  }>(`
    select
      r.name as restaurant,
      p.name as plan,
      p.price::float as price,
      s.status,
      coalesce(s.billing_interval, '') as billing_interval
    from billing_subscription s
    join restaurants r on r.id = s.restaurant_id
    left join billing_subscriptionplan p on p.id = s.plan_id
    order by s.status, r.name
    limit 100
  `);

  return {
    metricId: "revenue",
    title: "Subscriptions",
    description: "All subscription records and billing status.",
    table: {
      columns: [
        { key: "restaurant", label: "Restaurant" },
        { key: "plan", label: "Plan" },
        { key: "price", label: "Price", align: "right" },
        { key: "status", label: "Status" },
        { key: "billing_interval", label: "Interval" },
      ],
      rows: rows.map((r) => ({
        restaurant: r.restaurant,
        plan: r.plan ?? "—",
        price: r.price != null ? r.price : null,
        status: r.status,
        billing_interval: r.billing_interval || "—",
      })),
    },
    note:
      rows.filter((r) => r.status === "active").length === 0
        ? "No active subscriptions — MRR is $0 until a restaurant subscribes."
        : undefined,
  };
}

function staticDetail(
  metricId: "ai-interactions" | "ai-supervised",
  title: string,
  description: string,
): KpiDetailPayload {
  return {
    metricId,
    title,
    description,
    note: "AI usage metrics are not wired to production tables yet. This card will show conversation and co-pilot stats once integrated.",
  };
}

async function loadKpiDetail(metricId: KpiMetricId): Promise<KpiDetailPayload> {
  switch (metricId) {
    case "restaurants":
      return fetchRestaurantsDetail();
    case "staff":
      return fetchStaffDetail();
    case "shifts":
      return fetchShiftsDetail();
    case "checklist":
      return fetchChecklistDetail();
    case "incidents":
      return fetchIncidentsDetail();
    case "escalation-rate":
      return fetchEscalationRateDetail();
    case "incident-rate":
      return fetchIncidentRateDetail();
    case "revenue":
      return fetchRevenueDetail();
    case "ai-interactions":
      return staticDetail(
        "ai-interactions",
        "AI interactions",
        "Total AI conversations across supervised shifts.",
      );
    case "ai-supervised":
      return staticDetail(
        "ai-supervised",
        "AI-supervised shifts",
        "Percentage of shifts running with the AI co-pilot enabled.",
      );
    default:
      throw new Error(`Unknown metric: ${metricId}`);
  }
}

export async function fetchKpiDetail(
  metricId: KpiMetricId,
): Promise<KpiDetailPayload> {
  try {
    return await loadKpiDetail(metricId);
  } catch (error) {
    logDetailError(metricId, error);
    return {
      metricId,
      title: "Details unavailable",
      description: "Could not load breakdown data from the database.",
      note: "Check your database connection and try again.",
    };
  }
}
