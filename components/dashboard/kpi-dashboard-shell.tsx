"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { KpiMetricId } from "@/lib/kpi-details";
import { KpiDetailDrawer } from "@/components/dashboard/kpi-detail-drawer";

type KpiShellContextValue = {
  openMetric: (id: KpiMetricId) => void;
};

const KpiShellContext = createContext<KpiShellContextValue | null>(null);

export function useKpiDetail() {
  const ctx = useContext(KpiShellContext);
  if (!ctx) {
    throw new Error("useKpiDetail must be used within KpiDashboardShell");
  }
  return ctx;
}

export function KpiDashboardShell({ children }: { children: React.ReactNode }) {
  const [activeMetric, setActiveMetric] = useState<KpiMetricId | null>(null);

  const openMetric = useCallback((id: KpiMetricId) => {
    setActiveMetric(id);
  }, []);

  const close = useCallback(() => setActiveMetric(null), []);

  const value = useMemo(() => ({ openMetric }), [openMetric]);

  return (
    <KpiShellContext.Provider value={value}>
      {children}
      <KpiDetailDrawer metricId={activeMetric} onClose={close} />
    </KpiShellContext.Provider>
  );
}
