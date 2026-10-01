import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function run() {
  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) throw new Error('TEST_DATABASE_URL is required.');
  const name = `numora_staging_bridge_${randomBytes(4).toString('hex')}`;
  const url = new URL(testUrl);
  url.pathname = `/${name}`;
  const admin = postgres(testUrl, { max: 1 });
  const folder = await mkdtemp(join(tmpdir(), 'numora-staging-baseline-'));
  let client: ReturnType<typeof postgres> | undefined;
  try {
    for (const role of ['anon', 'authenticated', 'service_role']) {
      await admin.unsafe(
        `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${role}') THEN CREATE ROLE ${role} NOLOGIN; END IF; END $$`,
      );
    }
    await admin.unsafe(`CREATE DATABASE "${name}"`);
    client = postgres(url.toString(), { max: 1 });
    const databaseRoot = process.cwd();
    const fixture = resolve(databaseRoot, 'staging', 'fixtures');
    await mkdir(join(folder, 'meta'));
    await copyFile(
      resolve(databaseRoot, 'drizzle', '0000_outgoing_thunderbolts.sql'),
      join(folder, '0000_outgoing_thunderbolts.sql'),
    );
    for (const file of ['0001_lucky_triton.sql', '0002_lock_down_numora_data_api.sql']) {
      await copyFile(join(fixture, file), join(folder, file));
    }
    await copyFile(join(fixture, 'meta', '_journal.json'), join(folder, 'meta', '_journal.json'));
    await migrate(drizzle(client), { migrationsFolder: folder });

    const env = { ...process.env, NODE_ENV: 'test', DATABASE_MIGRATION_URL: url.toString() };
    for (const mode of ['check', 'apply']) {
      execFileSync(process.execPath, ['--import', 'tsx', 'src/staging-bridge.ts', mode], {
        cwd: databaseRoot,
        env,
        stdio: 'inherit',
      });
    }
    const journal = JSON.parse(
      await readFile(resolve(databaseRoot, 'drizzle', 'meta', '_journal.json'), 'utf8'),
    ) as {
      entries: { tag: string; when: number }[];
    };
    // Reproduce the retained development history whose cursor is newer than 0004.
    const retainedCursor = 1790862061674;
    assert.ok(
      journal.entries.find((entry) => entry.tag === '0004_flimsy_korg')!.when < retainedCursor,
    );
    assert.ok(
      journal.entries.find((entry) => entry.tag === '0005_irt_metadata_cursor_recovery')!.when >
        retainedCursor,
    );
    await client`INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES ('retained-legacy-cursor-fixture', ${retainedCursor})`;
    await migrate(drizzle(client), { migrationsFolder: resolve(databaseRoot, 'drizzle') });
    const [state] = await client<{ tables: number; migrations: number; withoutRls: number }[]>`
      SELECT
        (SELECT count(*)::int FROM pg_catalog.pg_tables WHERE schemaname = 'public') AS tables,
        (SELECT count(*)::int FROM drizzle.__drizzle_migrations) AS migrations,
        (SELECT count(*)::int FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND NOT rowsecurity) AS "withoutRls"`;
    const expectedMigrations =
      5 + journal.entries.filter((entry) => entry.when > retainedCursor).length;
    assert.deepEqual(state, { tables: 52, migrations: expectedMigrations, withoutRls: 0 });
    await migrate(drizzle(client), { migrationsFolder: resolve(databaseRoot, 'drizzle') });
    const [repeated] = await client<
      { count: number }[]
    >`SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations`;
    assert.equal(repeated?.count, expectedMigrations);
    const [retained] = await client<
      { count: number }[]
    >`SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations
      WHERE hash = 'retained-legacy-cursor-fixture' AND created_at = ${retainedCursor}`;
    assert.equal(retained?.count, 1);
    const columnsQuery = `SELECT table_name, column_name, udt_name, is_nullable
      FROM information_schema.columns WHERE table_schema = 'public'
      ORDER BY table_name, column_name`;
    const indexesQuery = `SELECT tablename, indexname FROM pg_catalog.pg_indexes
      WHERE schemaname = 'public' ORDER BY tablename, indexname`;
    assert.deepEqual(await client.unsafe(columnsQuery), await admin.unsafe(columnsQuery));
    assert.deepEqual(await client.unsafe(indexesQuery), await admin.unsafe(indexesQuery));
    console.log(
      'Audited baseline bridged; retained cursor recovered, history preserved, repeated migration idempotent.',
    );
  } finally {
    if (client) await client.end();
    await admin.unsafe(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await admin.end();
    await rm(folder, { recursive: true, force: true });
  }
}

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
