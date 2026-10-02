import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co',
  SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fake',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fake',
  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: '',
  DATABASE_URL: 'postgres://postgres.abcdefghijklmnopqrst:fake@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require',
  REDIS_URL: 'rediss://example.invalid:6379', BULLMQ_PREFIX: 'numora:dev:test',
  TEACHER_TOKEN_PEPPER: 'fixture-only-teacher-token-pepper',
  NEXT_PUBLIC_TEACHER_TOKEN_PEPPER: '',
};
test('development guard accepts consistent settings and rejects wrong projects/public secrets', () => {
  const run = (values) => spawnSync(process.execPath, ['scripts/check-dev-env.mjs'], { env: { ...env, ...values }, encoding: 'utf8' });
  assert.equal(run({}).status, 0);
  const mismatch = run({ DATABASE_URL: env.DATABASE_URL.replace('postgres.abcdefghijklmnopqrst', 'postgres.otherproject') });
  assert.equal(mismatch.status, 1);
  assert.match(mismatch.stderr, /Database and Supabase Auth projects differ/);
  assert.equal(run({ NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: 'fake-secret' }).status, 1);
  assert.equal(run({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_fake', SUPABASE_PUBLISHABLE_KEY: 'sb_secret_fake' }).status, 1);
  assert.equal(run({ REDIS_URL: 'redis://example.invalid:6379' }).status, 1);
  assert.equal(run({ TEACHER_TOKEN_PEPPER: '' }).status, 1);
  assert.equal(run({ NEXT_PUBLIC_TEACHER_TOKEN_PEPPER: 'never-public' }).status, 1);
  assert.equal(run({ DATABASE_URL: env.DATABASE_URL.replace('5432', '6543') }).status, 1);
});
