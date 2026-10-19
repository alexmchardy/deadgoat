import { Pool } from "pg";
import { createApp } from "../src/core/app";
import { migrate } from "../src/core/migrate";

const url =
  process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:54329/deadgoat_test";

let pool: Pool | undefined;

/** Fresh app over a real PostGIS database, with a fixed clock and sequential ids. */
export async function freshApp(now = new Date("2026-07-01T12:00:00Z")) {
  await migrate(url);
  pool ??= new Pool({ connectionString: url });
  // TRUNCATE is not a row-level operation, so the append-only trigger doesn't block test cleanup.
  await pool.query("truncate events, reports, infestations");
  let n = 0;
  return createApp({
    pool,
    clock: () => now,
    newId: () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`,
  });
}

export async function closePool() {
  await pool?.end();
  pool = undefined;
}

/** A viewport covering central Denver. */
export const denver = { west: -105.1, south: 39.6, east: -104.8, north: 39.9 };
