import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const dir = join(process.cwd(), "db", "migrations");

/** Applies every migration file in order. Files are idempotent-by-record. */
export async function migrate(connectionString: string): Promise<void> {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(
      "create table if not exists schema_migrations (name text primary key)",
    );
    const done = new Set(
      (await client.query("select name from schema_migrations")).rows.map((r) => r.name),
    );
    for (const name of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
      if (done.has(name)) continue;
      await client.query("begin");
      try {
        await client.query(readFileSync(join(dir, name), "utf8"));
        await client.query("insert into schema_migrations (name) values ($1)", [name]);
        await client.query("commit");
      } catch (err) {
        await client.query("rollback");
        throw err;
      }
    }
  } finally {
    await client.end();
  }
}
