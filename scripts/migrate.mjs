// Applies pending Drizzle migrations. Wired to `predev` (--soft) and `prebuild` (--build) in package.json.
//   (no flag) migrate or fail   --soft  warn and carry on if it fails   --build  only on production deploys
import { spawnSync } from "node:child_process";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const soft = process.argv.includes("--soft");
const build = process.argv.includes("--build");

if (!process.env.DATABASE_URL) {
  console.log("[migrate] DATABASE_URL is not set; skipping migrations (demo catalogue mode).");
  process.exit(0);
}

if (build && process.env.VERCEL_ENV !== "production" && process.env.MIGRATE_ON_BUILD !== "1") {
  console.log("[migrate] not a production build; skipping migrations (set MIGRATE_ON_BUILD=1 to force).");
  process.exit(0);
}

const result = spawnSync("npx", ["drizzle-kit", "migrate"], { encoding: "utf8", env: process.env });
const clean = (t = "") => t.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "").replace(/\[[⠁-⣿]\] applying migrations\.\.\./g, "").trim();
if (result.status === 0) {
  console.log("[migrate] database is up to date.");
  process.exit(0);
}

const details = clean(`${result.stdout}\n${result.stderr}`);
if (details) console.error(details);
const message = "[migrate] drizzle-kit migrate failed; the database may be behind the code.";
if (soft) {
  console.warn(`${message} Continuing; fix the problem and run \`npm run db:migrate\`.`);
  process.exit(0);
}
console.error(`${message} Stopping.`);
process.exit(result.status ?? 1);
