import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import postgres from 'postgres';
import { requireTlsDatabaseUrl } from './client.js';

const stagingRef = 'pkamenfnwmoeisccnrnk';
const stagingBaseHash = 'f483b0eea643ffa859f72d61ae03516e3419237421455cd9343ffd6b471e65d4';
const stagingBaseTime = 1790690135460;

async function run() {
  const mode = process.argv[2];
  if (mode !== 'check' && mode !== 'apply') throw new Error('Expected check or apply.');
  const rawUrl = process.env.DATABASE_MIGRATION_URL;
  if (!rawUrl) throw new Error('DATABASE_MIGRATION_URL is required.');
  const url = new URL(requireTlsDatabaseUrl(rawUrl));
  const localTest = process.env.NODE_ENV === 'test' && ['localhost', '127.0.0.1'].includes(url.hostname);
  if (!localTest) {
    const ref = process.env.SUPABASE_PROJECT_REF;
    if (!ref || !/^[a-z0-9]{20}$/.test(ref)) throw new Error('SUPABASE_PROJECT_REF is required.');
    if (ref === stagingRef) throw new Error('The live Staging project is blocked until backup and restored-copy checks are complete.');
    const direct = url.hostname === `db.${ref}.supabase.co` && url.username === 'postgres';
    const pooler = url.hostname.endsWith('.pooler.supabase.com') && decodeURIComponent(url.username) === `postgres.${ref}`;
    if ((!direct && !pooler) || (url.port || '5432') !== '5432' || url.pathname !== '/postgres') {
      throw new Error('Connection does not match the restored Supabase project.');
    }
    if (mode === 'apply' && process.env.STAGING_COPY_RESTORED !== 'true') {
      throw new Error('STAGING_COPY_RESTORED=true is required before applying to a cloud copy.');
    }
  }

  const client = postgres(url.toString(), { max: 1 });
  try {
    const [state] = await client<{ tables: number; withoutRls: number; drillTables: number; requiredColumns: number }[]>`
      SELECT
        (SELECT count(*)::int FROM pg_catalog.pg_tables WHERE schemaname = 'public') AS tables,
        (SELECT count(*)::int FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND NOT rowsecurity) AS "withoutRls",
        (SELECT count(*)::int FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename LIKE 'drill_%') AS "drillTables",
        (SELECT count(*)::int FROM information_schema.columns WHERE table_schema = 'public' AND
          (table_name, column_name) IN (('question_versions', 'variant_id'), ('questions', 'primary_competency_id'),
            ('question_variants', 'question_id'), ('level_progress', 'completion_attempt_id'))) AS "requiredColumns"`;
    const [last] = await client<{ hash: string; createdAt: string }[]>`
      SELECT hash, created_at::text AS "createdAt" FROM drizzle.__drizzle_migrations
      ORDER BY created_at DESC LIMIT 1`;
    if (state?.tables !== 46 || state.withoutRls !== 0 || state.drillTables !== 0 || state.requiredColumns !== 4 ||
      last?.hash !== stagingBaseHash || Number(last.createdAt) !== stagingBaseTime) {
      throw new Error('Target differs from the audited PR #10 Staging baseline; bridge not applied.');
    }
    console.log('Audited PR #10 Staging schema and migration baseline match.');
    if (mode === 'check') return;

    const bridge = await readFile(resolve(process.cwd(), 'staging', '0003_bridge.sql'), 'utf8');
    const mainMigration = await readFile(resolve(process.cwd(), 'drizzle', '0003_unusual_manta.sql'));
    const hash = createHash('sha256').update(mainMigration).digest('hex');
    const journal = JSON.parse(await readFile(resolve(process.cwd(), 'drizzle', 'meta', '_journal.json'), 'utf8')) as {
      entries: { tag: string; when: number }[];
    };
    const entry = journal.entries.find((item) => item.tag === '0003_unusual_manta');
    if (!entry) throw new Error('Main migration 0003 is missing from the journal.');

    await client.begin(async (tx) => {
      for (const statement of bridge.split('--> statement-breakpoint')) {
        if (statement.trim()) await tx.unsafe(statement);
      }
      const [verified] = await tx<{ tables: number; withoutRls: number }[]>`
        SELECT count(*)::int AS tables,
          count(*) FILTER (WHERE NOT rowsecurity)::int AS "withoutRls"
        FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
      if (verified?.tables !== 52 || verified.withoutRls !== 0) {
        throw new Error('Staging bridge postcondition failed; transaction rolled back.');
      }
      await tx`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${hash}, ${entry.when})`;
    });
    console.log('Staging copy bridged to the main 0003 schema and migration journal.');
  } finally {
    await client.end();
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Staging bridge failed.');
  process.exitCode = 1;
});
