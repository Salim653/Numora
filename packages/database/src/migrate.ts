import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { requireTlsDatabaseUrl } from './client.js';

async function run() {
  const url = process.env.DATABASE_MIGRATION_URL;
  if (!url) throw new Error('DATABASE_MIGRATION_URL is required for migrations.');
  const client = postgres(requireTlsDatabaseUrl(url), { max: 1 });
  const migrationsFolder = resolve(process.cwd(), 'drizzle');

  try {
    const [existing] = await client<{ tables: number; history: string | null }[]>`
      SELECT (SELECT count(*)::int FROM pg_catalog.pg_tables WHERE schemaname = 'public') AS tables,
        to_regclass('drizzle.__drizzle_migrations')::text AS history`;
    if (existing && existing.tables > 0 && !existing.history) {
      throw new Error('Existing public tables have no Drizzle history. Reconcile the schema before migrating.');
    }
    await migrate(drizzle(client), { migrationsFolder });
    console.log(`Applied migrations from ${migrationsFolder}`);
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Database migration failed.');
  process.exit(1);
});
