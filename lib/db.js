import { Pool } from 'pg';

// Cache the pool on globalThis so Next.js hot-reload in dev doesn't spin up a
// new pool on every file change.
const globalForPg = globalThis;

function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // No DB configured yet — routes will surface a clean error instead of crashing.
    return null;
  }
  return new Pool({
    connectionString: url,
    // Aurora (and most managed PG) require TLS. rejectUnauthorized:false keeps
    // setup simple for the hackathon; tighten with the RDS CA bundle for prod.
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

export const pool = globalForPg.__pgPool ?? makePool();
if (process.env.NODE_ENV !== 'production') globalForPg.__pgPool = pool;

// Small query helper. Throws a readable error if DATABASE_URL is missing.
export async function query(text, params) {
  if (!pool) {
    throw new Error('Database not configured. Set DATABASE_URL in .env.local');
  }
  const res = await pool.query(text, params);
  return res.rows;
}

// Convenience: run a query and return only the first row (or null).
export async function queryOne(text, params) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}