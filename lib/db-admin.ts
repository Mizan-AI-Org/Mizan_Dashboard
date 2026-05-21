import { Pool, type QueryResult, type QueryResultRow } from "pg";

declare global {
  var __mizanDbAdminPool__: Pool | undefined;
}

function getAdminConnectionString(): string {
  return (
    process.env.DATABASE_URL ??
    process.env.RDS_ADMIN_URL ??
    process.env.RDS_READONLY_URL ??
    process.env.RDS_READONLY_DATABASE_URL ??
    ""
  );
}

export function isRestaurantDeleteEnabled(): boolean {
  if (process.env.DASHBOARD_DELETE_ENABLED === "false") return false;
  if (process.env.DASHBOARD_DELETE_ENABLED === "true") return true;
  return Boolean(getAdminConnectionString());
}

function createAdminPool(): Pool {
  const connectionString = getAdminConnectionString();
  if (!connectionString) {
    throw new Error(
      "No database URL configured for admin writes. Set DATABASE_URL or RDS_ADMIN_URL.",
    );
  }

  return new Pool({
    connectionString,
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 30_000,
    ssl: { rejectUnauthorized: false },
  });
}

function getAdminPool(): Pool {
  if (!global.__mizanDbAdminPool__) {
    global.__mizanDbAdminPool__ = createAdminPool();
  }
  return global.__mizanDbAdminPool__;
}

export async function adminQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  const client = await getAdminPool().connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}
