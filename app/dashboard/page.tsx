import { Suspense } from "react";
import { InvestorToggle } from "@/components/dashboard/investor-toggle";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ChecklistChart } from "@/components/dashboard/checklist-chart";
import { IncidentChart } from "@/components/dashboard/incident-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { getDashboardMetrics } from "@/lib/metrics";

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

  const { executive, revenue, operational, ai } = await getDashboardMetrics();

  const checklistPct = executive.checklist_completion_rate ?? 0;
  const escalationPct = executive.escalation_rate ?? 0;
  const incidentPct = executive.incident_rate ?? 0;
  const isInvestor = mode === "investor";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-[13px] text-[var(--text-quaternary)]">
            Real-time overview of restaurants, operations, and business health.
          </p>
        </div>
        <Suspense>
          <InvestorToggle mode={mode} />
        </Suspense>
      </div>

      {/* KPI Cards */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            label="Restaurants"
            value={executive.total_restaurants}
            helper="Total onboarded."
            accent="emerald"
          />
          <KpiCard
            label="Active (30d)"
            value={executive.active_restaurants_last_30d}
            helper={"\u2265 1 shift in 30 days."}
            accent="sky"
          />
          <KpiCard
            label="Staff"
            value={executive.total_staff}
            helper="Active non-admin users."
            accent="violet"
          />
          <KpiCard
            label="Shifts"
            value={executive.total_shifts_this_month}
            helper="This calendar month."
            accent="orange"
          />
          <KpiCard
            label="Checklist"
            value={`${(checklistPct * 100).toFixed(0)}%`}
            helper="Completion rate."
            accent="amber"
          />
          <KpiCard
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
              label="Escalation Rate"
              value={escalationPct != null ? `${(escalationPct * 100).toFixed(1)}%` : "\u2013"}
              helper="Alerts / total shifts."
              accent="orange"
            />
            <KpiCard
              label="Incident Rate"
              value={incidentPct != null ? `${(incidentPct * 100).toFixed(1)}%` : "\u2013"}
              helper="Incidents / total shifts."
              accent="rose"
            />
            <KpiCard
              label="AI Interactions"
              value={ai.available && ai.totalInteractions != null ? ai.totalInteractions : "N/A"}
              helper={ai.available ? "Total AI conversations." : "Pending integration."}
              accent="sky"
            />
            <KpiCard
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
  );
}
