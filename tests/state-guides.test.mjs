import assert from 'node:assert/strict';
import { test } from 'node:test';
import nigeria from '@svg-maps/nigeria';
import directory from '../lib/data/state-directory.json' with { type: 'json' };
import fixture from './fixtures/state-guide.json' with { type: 'json' };
import { stateGuideHref } from '../lib/state-guide-links.ts';
import { formatGuideDate, getStateGuide, googleMapsHref, loadStateGuideContent, loadStateGuideGeography, stateGuidePayload, stateSlugs } from '../lib/state-guides.ts';
import { isProtectedRoute } from '../lib/protected-routes.ts';

test('every homepage map region resolves to a public state guide linked to a canonical state', () => {
  assert.equal(stateSlugs.length, 37);
  assert.equal(new Set(directory.states.map(state => state.stateId)).size, 37);
  for (const region of nigeria.locations) {
    const href = stateGuideHref(region.id);
    const guide = getStateGuide(href.split('/').at(-1));
    assert.ok(guide, `${region.name} has no guide`);
    assert.match(guide.stateId, /^NG\d{3}$/);
    assert.equal(isProtectedRoute(href), false);
  }
});

test('map aliases retain canonical FCT and Nasarawa URLs', () => {
  assert.equal(stateGuideHref('fct'), '/states/federal-capital-territory');
  assert.equal(stateGuideHref('nassarawa'), '/states/nasarawa');
  assert.equal(getStateGuide('nasarawa').name, 'Nasarawa');
  assert.equal(getStateGuide('federal-capital-territory').name, 'Federal Capital Territory');
});

test('routing index and editorial data do not store duplicate LGA lists or camp records', () => {
  for (const state of directory.states) {
    assert.deepEqual(Object.keys(state).sort(), ['name', 'slug', 'stateId']);
    const guide = getStateGuide(state.slug);
    assert.equal(guide.lgas, undefined);
    assert.equal(guide.camp, undefined);
  }
});

test('unknown state slugs do not silently show another state', () => {
  for (const slug of ['unknown', '', '__proto__', 'Lagos', '../lagos', 'lagos?state=bauchi']) {
    assert.equal(getStateGuide(slug), undefined);
  }
});

test('Borno reads state-specific editorial content from the API', async () => {
  const guide = await loadStateGuideContent('NG008', async () => Response.json(fixture));
  assert.equal(guide.secretariat.email, 'borno@nysc.gov.ng');
  assert.equal(guide.secretariat.phoneNumber, '07032147636');
  assert.match(guide.secretariat.address, /Kashim Ibrahim Road/);
  assert.equal(guide.information.capital, 'Maiduguri');
  assert.equal(guide.information.geopoliticalZone, 'North East');
  assert.match(guide.information.spokenLanguages, /Kanuri/);
  assert.match(guide.information.travelSafetyNotes, /against all travel/);
  assert.match(guide.information.costOfLiving, /May 2026/);
  assert.equal(guide.research.reviewedOn, '2026-10-25');
  assert.ok(guide.research.sources.travelSafetyNotes.includes('https://www.gov.uk/foreign-travel-advice/nigeria/regional-risks'));
  assert.equal(guide.expectations.length, 5);
});

test('saved content preserves review and illustration status without a local JSON fallback', async () => {
  const guide = await loadStateGuideContent('NG008', async (url, init) => {
    assert.ok(url.endsWith('/api/state-guides/NG008'));
    assert.equal(init.cache, 'no-store');
    return Response.json(fixture);
  });
  assert.equal(guide.isDraft, true);
  assert.ok(guide.photos.every(photo => photo.illustrative));
  const payload = stateGuidePayload(guide);
  assert.equal(payload.version, 1);
  assert.equal(payload.name, undefined);
  assert.equal(payload.stateId, undefined);
  assert.equal(payload.updatedAt, undefined);
  assert.equal(payload.isDraft, undefined);
  assert.equal(formatGuideDate('2026-10-25'), '25 Oct 2026');
  assert.equal(formatGuideDate(''), 'Not reviewed');
  await assert.rejects(loadStateGuideContent('NG008', async () => new Response('', { status: 503 })), /unavailable/);
  await assert.rejects(loadStateGuideContent('NG001', async () => Response.json(fixture)), /does not match/);
});

test('geography is loaded through the public state-ID endpoint without a cached snapshot', async () => {
  const payload = { state: { id: 'NG008', name: 'Borno' }, lgas: [{ id: 'lga-id', name: 'Maiduguri' }], camps: [] };
  const result = await loadStateGuideGeography('NG008', async (url, init) => {
    assert.ok(url.endsWith('/api/state-guides/NG008/geography'));
    assert.equal(init.cache, 'no-store');
    assert.equal(init.credentials, undefined);
    return Response.json(payload);
  });
  assert.deepEqual(result, payload);
});

test('API failures and mismatched state responses cannot silently substitute another state', async () => {
  await assert.rejects(loadStateGuideGeography('NG008', async () => new Response('', { status: 503 })), /unavailable/);
  await assert.rejects(loadStateGuideGeography('NG008', async () => Response.json({ state: { id: 'NG001' }, lgas: [], camps: [] })), /does not match/);
});

test('map URLs encode the complete query', () => {
  const query = 'NYSC Secretariat, Bauchi & nearby? Nigeria';
  const url = new URL(googleMapsHref(query));
  assert.equal(url.origin, 'https://www.google.com');
  assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('query'), query);
  assert.equal([...url.searchParams].length, 2);
});
