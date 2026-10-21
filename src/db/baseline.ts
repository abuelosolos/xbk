import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";

loadEnvConfig(process.cwd());

/**
 * One-off, for a database that was created with `db:push` before migrations existed.
 * Records drizzle/0000_baseline as already applied so `npm run db:migrate` only runs what comes after it.
 * Do NOT run this on a fresh database: let `db:migrate` build it from 0000 instead.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const sql = neon(url);

  const [{ has_products, old_shape }] = await sql.query(`
    select to_regclass('public.products') is not null as has_products,
           exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'category') as old_shape
  `);
  if (!has_products) throw new Error("No products table: this is a fresh database. Run `npm run db:migrate` instead.");
  if (!old_shape) throw new Error("products has no `category` column, so this database is not the pre-migration shape. Nothing to baseline.");

  await sql.query("create schema if not exists drizzle");
  await sql.query("create table if not exists drizzle.__drizzle_migrations (id serial primary key, hash text not null, created_at bigint)");
  const [{ n }] = await sql.query("select count(*)::int as n from drizzle.__drizzle_migrations");
  if (n > 0) {
    console.log("Migration history already exists; nothing to do.");
    return;
  }

  // same values drizzle's migrator computes: sha256 of the .sql file, and the journal timestamp
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: { tag: string; when: number }[] };
  const baseline = journal.entries.find((e) => e.tag === "0000_baseline");
  if (!baseline) throw new Error("0000_baseline missing from drizzle/meta/_journal.json");
  const hash = createHash("sha256").update(readFileSync(`drizzle/${baseline.tag}.sql`, "utf8")).digest("hex");

  await sql.query("insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)", [hash, baseline.when]);
  console.log("Marked 0000_baseline as applied. Now run: npm run db:migrate");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
