import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const env = {
  ...process.env,
  NODE_ENV: 'test',
  TEST_DATABASE_URL: 'postgres://postgres:test_only@localhost:5432/numora_test?sslmode=disable',
  TEST_REDIS_URL: 'redis://localhost:6379',
  BULLMQ_PREFIX: 'numora:test:local',
  DATABASE_URL: '',
  REDIS_URL: '',
  DATABASE_MIGRATION_URL: '',
};
test('local test guard rejects cloud targets and inherited runtime credentials without connecting', () => {
  const run = (values) =>
    spawnSync(process.execPath, ['scripts/check-test-env.mjs'], {
      env: { ...env, ...values },
      encoding: 'utf8',
    });
  assert.equal(run({}).status, 0);
  assert.equal(run({ DATABASE_MIGRATION_URL: env.TEST_DATABASE_URL }).status, 0);
  for (const values of [
    { NODE_ENV: 'development' },
    { TEST_DATABASE_URL: env.TEST_DATABASE_URL.replace('localhost', 'cloud.invalid') },
    { TEST_DATABASE_URL: env.TEST_DATABASE_URL.replace('numora_test', 'postgres') },
    { TEST_REDIS_URL: 'rediss://secret@cloud.invalid:6379' },
    { TEST_REDIS_URL: '' },
    { BULLMQ_PREFIX: 'numora:dev:aini' },
    { DATABASE_URL: 'postgres://secret@cloud.invalid/db' },
    { REDIS_URL: 'rediss://secret@cloud.invalid:6379' },
    { DATABASE_MIGRATION_URL: 'postgres://secret@cloud.invalid/db' },
  ]) {
    const result = run(values);
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stderr, /secret@|test_only@/);
  }
});

// A missing prepare alias breaks every documented development mode before startup.
test('documented dev and isolated test entrypoints resolve', async () => {
  const { readFile } = await import('node:fs/promises');
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  for (const name of ['dev', 'dev:worker', 'dev:full'])
    assert.ok(manifest.scripts[name].startsWith('pnpm dev:prepare &&'));
  assert.ok(manifest.scripts['dev:prepare'].includes('pnpm env:check'));
  for (const name of ['test:local', 'db:migrate:test'])
    assert.ok(manifest.scripts[name].includes('node scripts/check-test-env.mjs &&'));
});
