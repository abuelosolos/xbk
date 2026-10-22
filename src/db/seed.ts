import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  // Imported after env is loaded so DATABASE_URL is available.
  const { seedCatalogue } = await import("./seed-catalogue");
  await seedCatalogue();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
