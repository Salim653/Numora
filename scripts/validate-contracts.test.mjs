import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { loadContractValidators } from './validate-contracts.mjs';

test('committed event contract rejects malformed UUIDs and timestamps', async () => {
  const validators = await loadContractValidators();
  const validate = validators.get(join('packages/contracts/events', 'analytics-event.schema.json'));
  const event = {
    eventId: '00000000-0000-4000-8000-000000000001', eventName: 'drill_completed', eventVersion: 1,
    occurredAt: '2026-10-01T00:00:00Z', entityType: 'assessmentAttempt',
    entityId: '00000000-0000-4000-8000-000000000002', payload: {},
  };
  assert.equal(validate(event), true);
  assert.equal(validate({ ...event, eventId: 'invalid', occurredAt: 'yesterday' }), false);
});

test('valid JSON with an invalid schema or unresolved reference fails the gate', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'numora-contract-check-'));
  try {
    const file = join(folder, 'bad.schema.json');
    await writeFile(file, JSON.stringify({ type: 'not-a-schema-type' }));
    await assert.rejects(loadContractValidators([folder]));
    await writeFile(file, JSON.stringify({ $ref: 'https://example.invalid/missing-schema' }));
    await assert.rejects(loadContractValidators([folder]));
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});
