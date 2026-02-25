import { Pool, type QueryResult, type QueryResultRow } from "pg";

declare global {
  // Allow reusing the pool across hot reloads in development.
  // Using a var on the global object is the supported pattern in Next.js.
  var __mizanDbPool__: Pool | undefined;
}

const connectionString =
  process.env.RDS_READONLY_URL ??
  process.env.RDS_READONLY_DATABASE_URL ??
  process.env.DATABASE_URL_RO ??
  process.env.DATABASE_URL ??
  "";

if (!connectionString) {
  // Surface a clear error on the server, but never leak connection details.
  throw new Error(
    "Database connection string is not configured. Set RDS_READONLY_URL or DATABASE_URL_RO in the environment.",
  );
}

function createPool() {
  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: false },
  });
}

// Reuse pool across hot reloads in dev.
const pool = global.__mizanDbPool__ ?? createPool();
if (process.env.NODE_ENV !== "production") {
  global.__mizanDbPool__ = pool;
}

/**
 * Read-only query helper.
 * Enforces SELECT-only access at the application layer in addition to DB grants.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  if (!/^\s*(select|with\s)/i.test(text)) {
    throw new Error(
      "Attempted non-SELECT query through read-only client. All operations must be read-only.",
    );
  }

  const client = await pool.connect();
  try {
    const result = await client.query<T>(text, params);
    return result;
  } finally {
    client.release();
  }
}

