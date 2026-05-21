import { fetchKpiDetail, isValidKpiMetricId } from "@/lib/kpi-details";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ metric: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { metric } = await context.params;

  if (!isValidKpiMetricId(metric)) {
    return Response.json({ error: "Unknown metric" }, { status: 404 });
  }

  const detail = await fetchKpiDetail(metric);

  return Response.json(detail, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
    },
  });
}
