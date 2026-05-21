import { revalidatePath } from "next/cache";
import {
  clearDashboardMetricsCache,
  deleteRestaurantById,
} from "@/lib/restaurants-admin";
import { isRestaurantDeleteEnabled } from "@/lib/db-admin";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function assertDeleteAuthorized(request: Request): Response | null {
  if (!isRestaurantDeleteEnabled()) {
    return Response.json(
      { error: "Restaurant deletion is disabled on this dashboard." },
      { status: 403 },
    );
  }

  const secret = process.env.DASHBOARD_DELETE_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        { error: "Set DASHBOARD_DELETE_SECRET to enable deletes in production." },
        { status: 403 },
      );
    }
    return null;
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}

export async function DELETE(request: Request, context: RouteContext) {
  const denied = assertDeleteAuthorized(request);
  if (denied) return denied;

  const { id } = await context.params;
  const result = await deleteRestaurantById(id);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  clearDashboardMetricsCache();
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/investor");

  return Response.json({
    ok: true,
    id: result.id,
    name: result.name,
  });
}
