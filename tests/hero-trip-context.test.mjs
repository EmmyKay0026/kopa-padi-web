import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NIGERIAN_STATES } from '../lib/nigerian-states.ts';
import { getStateGuide, stateSlugs } from '../lib/state-guides.ts';
import { DEPARTURE_WINDOWS, DEPARTURE_WINDOW_OPTIONS, TRANSPORT_MODES, TRANSPORT_MODE_OPTIONS } from '../lib/travel-plan-options.ts';
import { resolveDepartureContext, resolveDestinationCamp, resolveTravelSchedule } from '../lib/departure-context.ts';

const today = '2026-10-25';
const options = { departureWindows: DEPARTURE_WINDOWS, transportModes: TRANSPORT_MODES };
const schedule = (query) => resolveTravelSchedule(new URLSearchParams(query), today, options);
const camps = [
  { id: 'lagos-camp', stateName: 'Lagos' },
  { id: 'fct-camp', stateName: 'FCT Abuja' },
];

test('hero state options cover all 36 states and FCT exactly once', () => {
  assert.equal(NIGERIAN_STATES.length, 37);
  assert.equal(new Set(NIGERIAN_STATES).size, 37);
  assert.deepEqual([...NIGERIAN_STATES].sort(), stateSlugs.map((slug) => getStateGuide(slug).name).sort());
});

test('displayed departure and transport choices use the supported enum values', () => {
  assert.deepEqual(DEPARTURE_WINDOW_OPTIONS.map(([value]) => value), [...DEPARTURE_WINDOWS]);
  assert.deepEqual(TRANSPORT_MODE_OPTIONS.map(([value]) => value), [...TRANSPORT_MODES]);
  for (const value of DEPARTURE_WINDOWS) assert.equal(schedule(`departureWindow=${value}`).departureWindow, value);
  for (const value of TRANSPORT_MODES) assert.equal(schedule(`transportMode=${value}`).transportMode, value);
  assert.equal(schedule('departureWindow=EVENING').departureWindow, undefined);
  assert.equal(schedule('time=08:30').departureWindow, undefined);
});

test('schedule prefill accepts valid dates and ignores past, impossible, duplicated or unsupported values', () => {
  assert.deepEqual(schedule('intendedTravelDate=2026-10-25&departureWindow=AFTERNOON&transportMode=TRAIN'), {
    intendedTravelDate: today, departureWindow: 'AFTERNOON', transportMode: 'TRAIN',
  });
  for (const date of ['2026-10-24', '2027-02-30', '2026-13-01', 'not-a-date']) {
    assert.equal(schedule(`intendedTravelDate=${date}`).intendedTravelDate, undefined);
  }
  assert.deepEqual(schedule('intendedTravelDate=2027-01-01&intendedTravelDate=2027-02-01&departureWindow=MORNING&departureWindow=FLEXIBLE&transportMode=Bus'), {});
});

test('destination state resolves using current API camps, including FCT aliases', () => {
  for (const state of ['FCT', 'Federal Capital Territory', 'FCT Abuja']) {
    assert.equal(resolveDestinationCamp(new URLSearchParams({ destinationState: state }), camps, 'lagos-camp'), 'fct-camp');
  }
  assert.equal(resolveDestinationCamp(new URLSearchParams(), camps, 'lagos-camp'), 'lagos-camp');
  assert.equal(resolveDestinationCamp(new URLSearchParams(), camps, 'unavailable-camp'), '');
});

test('invalid and ambiguous destination states never select an unrelated camp', () => {
  for (const query of ['destinationState=unknown', 'destinationState=', 'destinationState=Lagos&destinationState=FCT', 'destinationState=%3CLagos%3E']) {
    assert.equal(resolveDestinationCamp(new URLSearchParams(query), camps, 'fct-camp'), '');
  }
  const multiple = [...camps, { id: 'second-lagos-camp', stateName: 'Lagos' }];
  const query = new URLSearchParams({ destinationState: 'Lagos' });
  assert.equal(resolveDestinationCamp(query, multiple, 'fct-camp'), '');
  assert.equal(resolveDestinationCamp(query, multiple, 'lagos-camp'), 'lagos-camp');
});

test('hero route and schedule round-trip without mixing departure and destination states', async () => {
  const query = new URLSearchParams({ state: 'Lagos', destinationState: 'Federal Capital Territory', intendedTravelDate: '2027-01-10', departureWindow: 'FLEXIBLE', transportMode: 'PRIVATE_VEHICLE' });
  const departure = await resolveDepartureContext(query, [{ id: 'lagos-state', name: 'Lagos' }],
    async () => { throw new Error('No LGA selected'); }, async () => { throw new Error('No town selected'); });
  assert.equal(departure.originStateId, 'lagos-state');
  assert.equal(resolveDestinationCamp(query, camps), 'fct-camp');
  assert.deepEqual(resolveTravelSchedule(query, today, options), {
    intendedTravelDate: '2027-01-10', departureWindow: 'FLEXIBLE', transportMode: 'PRIVATE_VEHICLE',
  });
});
