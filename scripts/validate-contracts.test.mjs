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

test('PvP contract validates commands, acknowledges errors, and rejects client scores', async () => {
  const validators = await loadContractValidators();
  const validate = validators.get(join('packages/contracts/websocket', 'pvp-events.schema.json'));
  const base = { event: 'answer:submit', eventVersion: '1', sentAt: '2026-10-01T00:00:00Z', requestId: '00000000-0000-4000-8000-000000000001', payload: { matchId: '00000000-0000-4000-8000-000000000002', questionId: '00000000-0000-4000-8000-000000000003', optionId: 'A' } };
  assert.equal(validate(base), true);
  assert.equal(validate({ ...base, payload: { ...base.payload, score: 150 } }), false);
  assert.equal(validate({ ...base, eventVersion: '2' }), false);
  assert.equal(validate({ ...base, requestId: null }), false);
  assert.equal(validate({ ...base, event: 'command:acknowledged', payload: { ok: false, error: { status: 409, code: 'PVP_POLICY_OPEN', detail: 'PvP belum tersedia.' } } }), true);
});
