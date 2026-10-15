// Isolated frontend regression fixtures. No real accounts, database or mail.
// Start with: node tests/fixture-api.mjs
// Start the UI separately with NEXT_PUBLIC_API_URL=http://localhost:4081 on port 3100.
import { createServer } from 'node:http';

let mode = 'verified';
const campId = '11111111-1111-4111-8111-111111111111';
const otherCampId = '22222222-2222-4222-8222-222222222222';
const states = [{ id: 'NG-LAGOS', name: 'Lagos' }, { id: 'NG-FCT', name: 'Federal Capital Territory' }];
const camps = [
  { camp: { id: campId, campName: 'Fixture Active Camp', stateName: 'Federal Capital Territory', officialAddress: 'Fixture official address', status: 'ACTIVE' } },
  { camp: { id: otherCampId, campName: 'Fixture Temporary Camp', stateName: 'Lagos', officialAddress: null, status: 'TEMPORARY' } },
];
const plan = {
  plan: { id: 'fixture-plan', status: 'SEARCHING', destinationCampId: campId, originStateId: 'NG-FCT', originLgaId: 'FCT-LGA', originTownId: null,
    intendedTravelDate: '2099-01-01', dateFlexibilityDays: 0, departureWindow: 'MORNING', transportMode: 'COMMERCIAL_BUS', transportFlexible: false,
    nearbyMatchingEnabled: true, groupPreference: 'ANY_VERIFIED_PCM' },
  originState: states[1], originLga: { id: 'FCT-LGA', name: 'Fixture FCT LGA' }, originTown: null, destination: camps[0].camp,
};

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost:4081');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3100');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
  if (url.pathname === '/__fixtures') {
    if (['verified', 'active', 'unverified'].includes(url.searchParams.get('mode'))) mode = url.searchParams.get('mode');
    res.setHeader('Content-Type', 'text/html');
    res.end(`<h1>Frontend regression fixtures: ${mode}</h1><p>Synthetic API data only.</p><a href="http://localhost:3100/">Open homepage</a> <a href="http://localhost:3100/travel-plans?state=Lagos">Open Travel Plan</a> <a href="http://localhost:3100/locations?state=FCT">Open departure location</a>`);
    return;
  }
  if (req.method !== 'GET') { res.writeHead(405).end(); return; }
  let body;
  if (url.pathname === '/api/auth/get-session') body = { user: { id: 'fixture-user', name: 'Fixture Traveller', email: 'fixture@example.invalid', emailVerified: true, accountStatus: 'ACTIVE', role: 'USER', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, session: { id: 'fixture-session', userId: 'fixture-user', token: 'fixture-token', expiresAt: '2099-01-01T00:00:00Z', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
  else if (url.pathname === '/api/locations/states') body = states;
  else if (url.pathname === '/api/locations/states/NG-LAGOS/lgas') body = [{ id: 'LAGOS-LGA', name: 'Fixture Lagos LGA' }];
  else if (url.pathname === '/api/locations/states/NG-FCT/lgas') body = [{ id: 'FCT-LGA', name: 'Fixture FCT LGA' }];
  else if (url.pathname === '/api/locations/lgas/LAGOS-LGA/towns') body = [{ id: '33333333-3333-4333-8333-333333333333', name: 'Fixture Lagos Town' }];
  else if (url.pathname === '/api/locations/lgas/FCT-LGA/towns') body = [];
  else if (url.pathname === '/api/orientation-camps') body = camps;
  else if (url.pathname === '/api/verification/status') body = { verification: { status: mode === 'unverified' ? 'UNVERIFIED' : 'VERIFIED' }, camp: camps[0].camp };
  else if (url.pathname === '/api/travel-plans/active') body = mode === 'active' ? plan : null;
  else if (url.pathname === '/api/matching/status') body = { status: 'SEARCHING', circle: null, alternativeOfferAvailable: false };
  else if (url.pathname === '/api/travel-circles/current') body = null;
  else { res.writeHead(404).end(); return; }
  console.log(`${mode} ${url.pathname}`);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}).listen(4081, '127.0.0.1', () => console.log('Frontend fixture API: http://localhost:4081/__fixtures'));
