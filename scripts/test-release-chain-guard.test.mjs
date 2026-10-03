import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireIsolatedServices } from '../apps/api/scripts/release-chain-guard.mjs';

const local = {
  TEST_DATABASE_URL: 'postgres://postgres:test@localhost:5432/numora_test_job06?sslmode=disable',
  TEST_REDIS_URL: 'redis://127.0.0.1:6379',
};
test('accepts only explicit isolated JOB-06 services', () =>
  assert.doesNotThrow(() => requireIsolatedServices(local)));
for (const [label, patch] of [
  ['missing database', { TEST_DATABASE_URL: undefined }],
  [
    'shared cloud database',
    {
      TEST_DATABASE_URL: 'postgres://user:secret@db.example.com/numora_test_job06?sslmode=disable',
    },
  ],
  [
    'ordinary local database',
    { TEST_DATABASE_URL: 'postgres://user:secret@localhost:5432/postgres?sslmode=disable' },
  ],
  [
    'shared integration database',
    { TEST_DATABASE_URL: 'postgres://user:secret@localhost:5432/numora_test?sslmode=disable' },
  ],
  ['cloud Redis', { TEST_REDIS_URL: 'rediss://example.upstash.io:6379' }],
  ['missing Redis', { TEST_REDIS_URL: undefined }],
]) {
  test(`rejects ${label}`, () =>
    assert.throws(() => requireIsolatedServices({ ...local, ...patch })));
}
