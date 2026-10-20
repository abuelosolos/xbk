import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  return drizzle({ client: neon(url), schema });
}

let instance: ReturnType<typeof create> | undefined;

/** Lazy so the app (and `next build`) can run without a database configured. */
export function getDb() {
  return (instance ??= create());
}

export const hasDb = () => Boolean(process.env.DATABASE_URL);
export { schema };
