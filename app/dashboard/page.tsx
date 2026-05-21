import { Suspense } from "react";
import { InvestorToggle } from "@/components/dashboard/investor-toggle";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { KpiDashboardShell } from "@/components/dashboard/kpi-dashboard-shell";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ChecklistChart } from "@/components/dashboard/checklist-chart";
import { IncidentChart } from "@/components/dashboard/incident-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { getDashboardMetrics } from "@/lib/metrics";

/** Metrics require live Postgres — skip static prerender at build time. */
export const dynamic = "force-dynamic";

type Mode = "default" | "investor";

interface DashboardPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({
  searchParams: searchParamsPromise,
}: DashboardPageProps) {
  const searchParams = await searchParamsPromise;
  const raw = searchParams?.mode;
  const mode: Mode =
    typeof raw === "string" && raw === "investor" ? "investor" : "default";

  const { executive, revenue, operational, ai, dbConnected } =
    await getDashboardMetrics();

  const checklistPct = executive.checklist_completion_rate ?? 0;
  const escalationPct = executive.escalation_rate ?? 0;
  const incidentPct = executive.incident_rate ?? 0;
  const isInvestor = mode === "investor";

  return (
    <KpiDashboardShell>
      <div className="space-y-8">
        {!dbConnected && (
          <div
            role="alert"
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-800 dark:text-amber-200"
          >
            Could not load live metrics from Postgres. Check{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 text-[12px] dark:bg-white/10">
              RDS_READONLY_URL
            </code>{" "}
            and network access to RDS, then refresh.
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-[13px] text-[var(--text-quaternary)]">
              Real-time overview of restaurants, operations, and business health.
              Click any metric card to explore the underlying data.
            </p>
          </div>
          <Suspense>
            <InvestorToggle mode={mode} />
          </Suspense>
        </div>

        {/* KPI Cards */}
        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <KpiCard
              metricId="restaurants"
              label="Restaurants"
              value={executive.total_restaurants}
              helper="Total onboarded. Click to view or delete."
              accent="emerald"
            />
            <KpiCard
              metricId="staff"
              label="Staff"
              value={executive.total_staff}
              helper="Active non-admin users."
              accent="violet"
            />
            <KpiCard
              metricId="shifts"
              label="Shifts"
              value={executive.total_shifts_this_month}
              helper="This calendar month."
              accent="orange"
            />
            <KpiCard
              metricId="checklist"
              label="Checklist"
              value={`${(checklistPct * 100).toFixed(0)}%`}
              helper="Completion rate."
              accent="amber"
            />
            <KpiCard
              metricId="incidents"
              label="Incidents"
              value={executive.total_incidents_this_month}
              helper="This month."
              accent="rose"
            />
          </div>
        </section>

        {/* Revenue & Subscriptions */}
        <section className="space-y-5">
          <SectionHeader
            title="Revenue & Subscriptions"
            subtitle="Current billing snapshot from active subscriptions."
          />
          <RevenueChart data={revenue} />
        </section>

        {/* Operational Charts */}
        <section className="space-y-5">
          <SectionHeader
            title="Operational Metrics"
            subtitle="Weekly trends across shifts, checklists, and incidents."
          />
          <div className={`grid gap-4 ${isInvestor ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
            <UsageChart data={operational} />
            <ChecklistChart data={operational} />
            {!isInvestor && <IncidentChart data={operational} />}
          </div>
        </section>

        {/* Risk & AI */}
        {!isInvestor && (
          <section className="space-y-5">
            <SectionHeader
              title="Risk & AI Readiness"
              subtitle="Escalation metrics and AI integration status."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                metricId="escalation-rate"
                label="Escalation Rate"
                value={
                  escalationPct != null ? `${(escalationPct * 100).toFixed(1)}%` : "\u2013"
                }
                helper="Alerts / total shifts."
                accent="orange"
              />
              <KpiCard
                metricId="incident-rate"
                label="Incident Rate"
                value={incidentPct != null ? `${(incidentPct * 100).toFixed(1)}%` : "\u2013"}
                helper="Incidents / total shifts."
                accent="rose"
              />
              <KpiCard
                metricId="ai-interactions"
                label="AI Interactions"
                value={
                  ai.available && ai.totalInteractions != null
                    ? ai.totalInteractions
                    : "N/A"
                }
                helper={ai.available ? "Total AI conversations." : "Pending integration."}
                accent="sky"
              />
              <KpiCard
                metricId="ai-supervised"
                label="AI-Supervised"
                value={
                  ai.available && ai.aiSupervisedShiftPercentage != null
                    ? `${(ai.aiSupervisedShiftPercentage * 100).toFixed(0)}%`
                    : "N/A"
                }
                helper={ai.available ? "Shifts with AI co-pilot." : "Pending integration."}
                accent="violet"
              />
            </div>
          </section>
        )}
      </div>
    </KpiDashboardShell>
  );
}
