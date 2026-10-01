import postgres from 'postgres';
import { requireTlsDatabaseUrl } from './client.js';

async function run() {
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  const rawUrl = process.env.DATABASE_MIGRATION_URL;
  if (!projectRef || !/^[a-z0-9]{20}$/.test(projectRef) || !rawUrl) {
    throw new Error('SUPABASE_PROJECT_REF and DATABASE_MIGRATION_URL are required.');
  }
  const url = new URL(requireTlsDatabaseUrl(rawUrl));
  const direct = url.hostname === `db.${projectRef}.supabase.co` && url.username === 'postgres';
  const pooler = url.hostname.endsWith('.pooler.supabase.com') &&
    decodeURIComponent(url.username) === `postgres.${projectRef}`;
  if ((!direct && !pooler) || (url.port || '5432') !== '5432' || url.pathname !== '/postgres') {
    throw new Error('Database host, user, port, or database does not match the Supabase project ref.');
  }

  const client = postgres(url.toString(), { max: 1 });
  try {
    const [database] = await client<{ name: string }[]>`SELECT current_database() AS name`;
    if (database?.name !== 'postgres') throw new Error('Unexpected database target.');
    const tables = await client<{ tablename: string; rowsecurity: boolean }[]>`
      SELECT tablename, rowsecurity FROM pg_catalog.pg_tables
      WHERE schemaname = 'public' ORDER BY tablename`;
    const [history] = await client<{ name: string | null }[]>`
      SELECT to_regclass('drizzle.__drizzle_migrations')::text AS name`;
    console.log(`Project ${projectRef}: ${tables.length} public tables, ${tables.filter((table) => !table.rowsecurity).length} without RLS; migration history ${history?.name ? 'present' : 'absent'}.`);
  } finally {
    await client.end();
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Cloud check failed.');
  process.exitCode = 1;
});
