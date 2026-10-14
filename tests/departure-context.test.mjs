import assert from 'node:assert/strict';
import { test } from 'node:test';
import { departurePlanHref, resolveDepartureContext, resolveDepartureState } from '../lib/departure-context.ts';

const states = [{ id: 'lagos-id', name: 'Lagos' }, { id: 'fct-id', name: 'Federal Capital Territory' }];
const lgas = [{ id: 'ikeja-id', name: 'Ikeja' }];
const towns = [{ id: 'town-id', name: 'Test town' }];
const resolve = (search) => resolveDepartureContext(new URLSearchParams(search), states,
  async (id) => { assert.equal(id, 'lagos-id'); return lgas; },
  async (id) => { assert.equal(id, 'ikeja-id'); return towns; });

test('map state names resolve against options, ignoring case and surrounding spaces', async () => {
  assert.deepEqual(await resolve('state=%20lAgOs%20'), { originStateId: 'lagos-id', originLgaId: '', originTownId: '' });
});
test('FCT aliases resolve to the actual API ID', () => {
  for (const name of ['FCT', 'fct', 'Abuja', 'FCT Abuja', 'Abuja (FCT)', 'Federal-Capital-Territory']) {
    assert.equal(resolveDepartureState(new URLSearchParams({ state: name }), states)?.id, 'fct-id');
  }
});
test('invalid, duplicated, oversized and markup state parameters are ignored', async () => {
  for (const search of ['state=unknown', 'state=Lagos&state=FCT', 'state=%3CLagos%3E', 'state=' + 'a'.repeat(101), 'state=']) {
    assert.equal((await resolve(search)).originStateId, '');
  }
});
test('explicit valid State/LGA/Town IDs are preserved after parent-scoped validation', async () => {
  assert.deepEqual(await resolve('originStateId=lagos-id&originLgaId=ikeja-id&originTownId=town-id'), {
    originStateId: 'lagos-id', originLgaId: 'ikeja-id', originTownId: 'town-id',
  });
});
test('invalid state ID does not fall back to a valid name or load children', async () => {
  assert.equal((await resolve('originStateId=invalid&state=Lagos&originLgaId=ikeja-id')).originStateId, '');
});
test('invalid or duplicate LGA clears both LGA and Town', async () => {
  for (const search of ['state=Lagos&originLgaId=other-state-lga&originTownId=town-id', 'state=Lagos&originLgaId=ikeja-id&originLgaId=ikeja-id']) {
    assert.deepEqual(await resolve(search), { originStateId: 'lagos-id', originLgaId: '', originTownId: '' });
  }
});
test('invalid Town is ignored while the valid State and LGA are retained', async () => {
  assert.deepEqual(await resolve('state=Lagos&originLgaId=ikeja-id&originTownId=other-lga-town'), {
    originStateId: 'lagos-id', originLgaId: 'ikeja-id', originTownId: '',
  });
});
test('unrelated destination and schedule parameters never become departure data', async () => {
  assert.deepEqual(await resolve('destinationCampId=camp&date=2099-01-01'), {
    originStateId: '', originLgaId: '', originTownId: '',
  });
});
test('Continue URL round-trips validated IDs without destination or empty Town', async () => {
  const selection = await resolve('state=Lagos&originLgaId=ikeja-id');
  assert.equal(departurePlanHref(selection), '/travel-plans?originStateId=lagos-id&originLgaId=ikeja-id');
});
