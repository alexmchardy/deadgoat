import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { createApp } from "./app";

const globalForPool = globalThis as unknown as { pool?: Pool };

/** One shared pool per server process (survives Next dev hot reloads). */
export function getApp() {
  globalForPool.pool ??= new Pool({
    connectionString:
      process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:54329/deadgoat",
  });
  return createApp({ pool: globalForPool.pool, clock: () => new Date(), newId: randomUUID });
}
