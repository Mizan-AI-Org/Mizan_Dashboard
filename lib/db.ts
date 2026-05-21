import { Pool, type QueryResult, type QueryResultRow } from "pg";

declare global {
  var __mizanDbPool__: Pool | undefined;
}

function parsePositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getConnectionString(): string {
  return (
    process.env.RDS_READONLY_URL ??
    process.env.RDS_READONLY_DATABASE_URL ??
    process.env.DATABASE_URL_RO ??
    process.env.DATABASE_URL ??
    ""
  );
}

function getConnectTimeoutMs(): number {
  return parsePositiveIntEnv("DASHBOARD_DB_CONNECT_TIMEOUT_MS", 30_000);
}

function getStatementTimeoutMs(): number {
  return parsePositiveIntEnv("DASHBOARD_DB_STATEMENT_TIMEOUT_MS", 120_000);
}

function createPool(): Pool {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error(
      "Database connection string is not configured. Set RDS_READONLY_URL or DATABASE_URL_RO in the environment.",
    );
  }

  const statementTimeoutMs = getStatementTimeoutMs();
  return new Pool({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 10 : 4,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: getConnectTimeoutMs(),
    ssl: { rejectUnauthorized: false },
    options: `-c statement_timeout=${statementTimeoutMs}`,
  });
}

export async function resetDbPool(): Promise<void> {
  const existing = global.__mizanDbPool__;
  global.__mizanDbPool__ = undefined;
  if (existing) {
    await existing.end().catch(() => {});
  }
}

function getPool(): Pool {
  if (!global.__mizanDbPool__) {
    global.__mizanDbPool__ = createPool();
  }
  return global.__mizanDbPool__;
}

function assertReadOnlyQuery(text: string) {
  if (!/^\s*(select|with\s)/i.test(text)) {
    throw new Error(
      "Attempted non-SELECT query through read-only client. All operations must be read-only.",
    );
  }
}

export type QueryAllResult<T extends QueryResultRow = QueryResultRow> = {
  rows: T[];
  error?: unknown;
};

async function acquireClient() {
  try {
    return await getPool().connect();
  } catch (error) {
    await resetDbPool();
    throw error;
  }
}

/**
 * Read-only query helper.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  assertReadOnlyQuery(text);

  const client = await acquireClient();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

/**
 * Run multiple read-only queries on a single pooled connection.
 */
export async function queryAll<T extends QueryResultRow = QueryResultRow>(
  statements: { text: string; params?: unknown[] }[],
): Promise<QueryAllResult<T>[]> {
  if (statements.length === 0) return [];

  for (const { text } of statements) {
    assertReadOnlyQuery(text);
  }

  let client;
  try {
    client = await acquireClient();
  } catch (error) {
    return statements.map(() => ({ rows: [], error }));
  }

  try {
    const results: QueryAllResult<T>[] = [];
    for (const { text, params = [] } of statements) {
      try {
        const result = await client.query<T>(text, params);
        results.push({ rows: result.rows });
      } catch (error) {
        results.push({ rows: [], error });
      }
    }
    return results;
  } finally {
    client.release();
  }
}

/** Quick connectivity check (used to avoid serving stale empty cache). */
export async function pingDatabase(): Promise<boolean> {
  try {
    const { rows } = await query<{ ok: number }>("select 1 as ok");
    return rows[0]?.ok === 1;
  } catch {
    return false;
  }
}
