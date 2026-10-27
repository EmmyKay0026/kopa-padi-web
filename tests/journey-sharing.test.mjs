import assert from 'node:assert/strict';
import test from 'node:test';
import { contactShareState, isShareActive, sharingDurationLabel } from '../lib/journey-sharing.ts';

const now = Date.parse('2026-10-26T12:00:00Z');
const link = (expiresAt, status = 'ACTIVE', trustedContactId = 'family') => ({ expiresAt, status, trustedContactId });

test('a link becomes renewable exactly at expiry without a status update from the server', () => {
  const share = link('2026-10-26T12:00:01Z');
  assert.equal(contactShareState([share], 'family', now).status, 'active');
  assert.equal(contactShareState([share], 'family', now + 1000).status, 'expired');
  assert.equal(isShareActive(share, now + 1000), false);
});

test('only an unexpired active link for this contact grants access', () => {
  const shares = [link('2026-10-25T12:00:00Z'), link('2026-10-27T12:00:00Z', 'REVOKED'), link('2026-10-27T12:00:00Z', 'ACTIVE', 'other')];
  assert.equal(contactShareState(shares, 'family', now).status, 'expired');
  const renewed = link('2026-10-27T12:00:00Z');
  assert.deepEqual(contactShareState([...shares, renewed], 'family', now), { status: 'active', share: renewed });
  assert.equal(contactShareState([], 'family', now).status, 'inactive');
  assert.equal(contactShareState([link('2026-10-27T12:00:00Z', 'EXPIRED')], 'family', now).status, 'expired');
});

test('revoked or malformed links never count as active', () => {
  assert.equal(isShareActive(link('2026-10-27T12:00:00Z', 'REVOKED'), now), false);
  assert.equal(isShareActive(link('invalid'), now), false);
});

test('duration options use explicit time units', () => {
  assert.equal(sharingDurationLabel(1), '1 minute');
  assert.equal(sharingDurationLabel(15), '15 minutes');
  assert.equal(sharingDurationLabel(60), '1 hour');
  assert.equal(sharingDurationLabel(120), '2 hours');
});
