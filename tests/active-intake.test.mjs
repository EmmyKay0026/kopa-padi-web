import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activeCatalogIntake, intakeLabel } from '../lib/active-intake.ts';

const intake = { id: 'active', serviceYear: '2026', batch: 'Batch B', stream: 'Stream 2' };

test('catalog uses the explicit active intake rather than historical assignments', () => {
  assert.equal(activeCatalogIntake({ intakes: [intake], activeIntake: intake }), intake);
  assert.equal(activeCatalogIntake({ intakes: [intake], activeIntake: null }), null);
});

test('legacy catalog fallback accepts exactly one option and fails closed on ambiguity', () => {
  assert.equal(activeCatalogIntake({ intakes: [intake] }), intake);
  assert.equal(activeCatalogIntake({ intakes: [] }), null);
  assert.equal(activeCatalogIntake({ intakes: [intake, { ...intake, id: 'other' }] }), null);
});

test('intake labels consistently include service year, batch and stream', () => {
  assert.equal(intakeLabel(intake), '2026 · Batch B · Stream 2');
});
