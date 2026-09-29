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
    await migrate(drizzle(client), { migrationsFolder });
    console.log(`Applied migrations from ${migrationsFolder}`);
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
