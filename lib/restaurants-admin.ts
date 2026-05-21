import { adminQuery, isRestaurantDeleteEnabled } from "@/lib/db-admin";

export type DeleteRestaurantResult =
  | { ok: true; id: string; name: string }
  | { ok: false; error: string; status: number };

export async function deleteRestaurantById(
  restaurantId: string,
): Promise<DeleteRestaurantResult> {
  if (!isRestaurantDeleteEnabled()) {
    return {
      ok: false,
      error: "Restaurant deletion is disabled. Set DASHBOARD_DELETE_ENABLED=true.",
      status: 403,
    };
  }

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(restaurantId)) {
    return { ok: false, error: "Invalid restaurant id.", status: 400 };
  }

  try {
    const existing = await adminQuery<{ id: string; name: string }>(
      `select id::text, name from restaurants where id = $1::uuid`,
      [restaurantId],
    );

    if (existing.rows.length === 0) {
      return { ok: false, error: "Restaurant not found.", status: 404 };
    }

    const name = existing.rows[0].name;

    await adminQuery(`delete from restaurants where id = $1::uuid`, [restaurantId]);

    return { ok: true, id: restaurantId, name };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete restaurant.";
    return { ok: false, error: message, status: 500 };
  }
}

export function clearDashboardMetricsCache(): void {
  global.__dashboardMetricsCache__ = undefined;
}
