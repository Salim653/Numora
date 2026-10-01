import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import postgres from 'postgres';
import { requireTlsDatabaseUrl } from './client.js';
import { inspectSchema } from './schema-compatibility.js';

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
  let auditedSandbox = false;
  if (!localTest) {
    const ref = process.env.SUPABASE_PROJECT_REF;
    if (!ref || !/^[a-z0-9]{20}$/.test(ref)) throw new Error('SUPABASE_PROJECT_REF is required.');
    auditedSandbox = ref === stagingRef;
    const direct = url.hostname === `db.${ref}.supabase.co` && url.username === 'postgres';
    const pooler = url.hostname.endsWith('.pooler.supabase.com') && decodeURIComponent(url.username) === `postgres.${ref}`;
    if ((!direct && !pooler) || (url.port || '5432') !== '5432' || url.pathname !== '/postgres') {
      throw new Error('Connection does not match the restored Supabase project.');
    }
    if (mode === 'apply' && !auditedSandbox && process.env.STAGING_COPY_RESTORED !== 'true') {
      throw new Error('STAGING_COPY_RESTORED=true is required before applying to a cloud copy.');
    }
    if (mode === 'apply' && auditedSandbox && process.env.ALLOW_AUDITED_SANDBOX_BRIDGE !== 'true') {
      throw new Error('ALLOW_AUDITED_SANDBOX_BRIDGE=true and verified backup/rehearsal evidence are required for the audited development sandbox.');
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

    if (auditedSandbox) {
      const backupPath = process.env.STAGING_BACKUP_PATH;
      const backupHash = process.env.STAGING_BACKUP_SHA256;
      const rehearsalUrl = process.env.STAGING_REHEARSAL_DATABASE_URL;
      if (!backupPath || !backupHash || !/^[a-f0-9]{64}$/.test(backupHash) || !rehearsalUrl)
        throw new Error('Backup path/hash and restored rehearsal database URL are required.');
      const backup = await readFile(backupPath);
      if (backup.subarray(0, 5).toString('ascii') !== 'PGDMP' || createHash('sha256').update(backup).digest('hex') !== backupHash)
        throw new Error('PostgreSQL backup is missing or does not match the recorded SHA-256.');
      const rehearsalTarget = new URL(rehearsalUrl);
      if (!['localhost', '127.0.0.1'].includes(rehearsalTarget.hostname) || !rehearsalTarget.pathname.startsWith('/numora_restored'))
        throw new Error('Rehearsal must use the isolated local restored database.');
      const rehearsal = postgres(rehearsalUrl, { max: 1, connect_timeout: 5 });
      try {
        const checked = await inspectSchema(rehearsal);
        const [migration] = await rehearsal<{ hash: string }[]>`
          SELECT hash FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 1`;
        if (checked.actualTables !== 52 || checked.problems.length || migration?.hash !== hash)
          throw new Error('Restored-copy bridge rehearsal is incomplete or differs from this migration.');
      } finally {
        await rehearsal.end();
      }
    }

    await client.begin(async (tx) => {
      await tx.unsafe("SET LOCAL lock_timeout = '5s'");
      await tx.unsafe("SET LOCAL statement_timeout = '30s'");
      await tx.unsafe('LOCK TABLE drizzle.__drizzle_migrations IN EXCLUSIVE MODE');
      if (auditedSandbox) {
        const tables = await tx<{ tablename: string }[]>`
          SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
        if (tables.length !== 46) throw new Error('Sandbox schema changed after preflight; bridge cancelled.');
        for (const table of tables) {
          await tx`LOCK TABLE public.${tx(table.tablename)} IN SHARE ROW EXCLUSIVE MODE`;
          const [count] = await tx<{ rows: number }[]>`SELECT count(*)::int AS rows FROM public.${tx(table.tablename)}`;
          if (count?.rows !== 0) throw new Error('Audited sandbox now contains application data; empty-sandbox bridge cancelled.');
        }
        const [latest] = await tx<{ hash: string }[]>`
          SELECT hash FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 1`;
        if (latest?.hash !== stagingBaseHash) throw new Error('Sandbox migration history changed after preflight; bridge cancelled.');
      }
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
    console.log('Audited database bridged to the main 0003 schema and migration journal.');
  } finally {
    await client.end();
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Staging bridge failed.');
  process.exitCode = 1;
});
