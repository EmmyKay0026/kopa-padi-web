import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appendCheckInHistory, checkInPresentation, emptyCheckInHistory, formatCheckInTime, refreshCheckInHistory } from '../lib/journey-check-in-history.ts';

const item = (id, type = 'SAFE') => ({ id, type, message: null, createdAt: '2026-10-25T08:00:00Z' });

test('history preserves repeated check-in types as separate timestamped records', () => {
  const page = appendCheckInHistory({ items: [item('a')], nextCursor: 'a' }, { items: [item('b'), item('c', 'STARTED')], nextCursor: null });
  assert.deepEqual(page.items.map((entry) => entry.id), ['a', 'b', 'c']);
  assert.equal(page.items.filter((entry) => entry.type === 'SAFE').length, 2);
  assert.equal(page.nextCursor, null);
});

test('older-page merging removes duplicate IDs and preserves server order for identical timestamps', () => {
  assert.deepEqual(appendCheckInHistory({ items: [item('c'), item('b')], nextCursor: 'b' }, {
    items: [item('b'), item('a')], nextCursor: 'a',
  }).items.map((entry) => entry.id), ['c', 'b', 'a']);
});

test('normal refresh adds newer updates without discarding loaded older history or its cursor', () => {
  const current = { items: [item('c'), item('b'), item('a')], nextCursor: 'a' };
  const refreshed = refreshCheckInHistory(current, { items: [item('d'), item('c')], nextCursor: 'c' });
  assert.deepEqual(refreshed.items.map((entry) => entry.id), ['d', 'c', 'b', 'a']);
  assert.equal(refreshed.nextCursor, 'a');
});

test('a refresh without overlap resets to a complete page rather than silently leaving a gap', () => {
  const latest = { items: [item('new')], nextCursor: 'new' };
  assert.deepEqual(refreshCheckInHistory({ items: [item('old')], nextCursor: null }, latest), latest);
  assert.deepEqual(refreshCheckInHistory(emptyCheckInHistory, latest), latest);
  assert.deepEqual(refreshCheckInHistory(latest, emptyCheckInHistory), emptyCheckInHistory);
});

test('history uses explicit Lagos time, including date rollover and seconds', () => {
  const value = formatCheckInTime('2026-10-25T23:30:45Z');
  assert.match(value, /26 Oct 2026/);
  assert.match(value, /00:30:45/);
  assert.equal(formatCheckInTime('invalid'), 'invalid');
});

test('all supported check-in types have clear labels', () => {
  for (const type of ['STARTED', 'SAFE', 'CONNECTION_REACHED', 'NEAR_DESTINATION', 'NEED_HELP', 'ARRIVED']) {
    assert.ok(checkInPresentation(type).label);
    assert.ok(checkInPresentation(type).icon);
  }
  assert.equal(checkInPresentation('FUTURE_UPDATE').label, 'FUTURE UPDATE');
});
