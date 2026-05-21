const DEFAULT_TTL_SECONDS = 120;

/**
 * How long dashboard metrics stay cached before refreshing from Postgres.
 * In development, defaults to 0 (always fetch fresh) to avoid stale empty fallbacks.
 */
export function getDashboardCacheTtlSeconds(): number {
  if (process.env.NODE_ENV !== "production") {
    const devRaw = process.env.DASHBOARD_CACHE_TTL_SECONDS;
    if (!devRaw) return 0;
  }

  const raw = process.env.DASHBOARD_CACHE_TTL_SECONDS;
  if (!raw) return DEFAULT_TTL_SECONDS;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return process.env.NODE_ENV === "production" ? DEFAULT_TTL_SECONDS : 0;
  }

  return parsed;
}
