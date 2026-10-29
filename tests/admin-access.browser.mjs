// Run against a built frontend: ADMIN_TEST_URL=http://127.0.0.1:3107 node tests/admin-access.browser.mjs
// Browser API requests are intercepted; no real accounts or admin records are used.
import assert from 'node:assert/strict';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const playwright = process.env.PLAYWRIGHT_MODULE
  ? await import(pathToFileURL(resolve(process.env.PLAYWRIGHT_MODULE)))
  : await import('playwright');
const browser = await playwright.chromium.launch({ channel: 'msedge', headless: true });
const base = process.env.ADMIN_TEST_URL ?? 'http://127.0.0.1:3107';
const out = 'test-results/admin-access';
const checks = [];
mkdirSync(out, { recursive: true });
const adminPaths = readdirSync('app/admin', { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => `/admin/${entry.name}`);
const record = (message) => { checks.push(message); console.log(`PASS ${message}`); };

async function fixture(mode = 'admin', options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const requests = [], errors = [];
  const state = { mode, ...options };
  let release;
  const pending = options.delayed ? new Promise((done) => { release = done; }) : Promise.resolve();
  context.on('page', (page) => page.on('pageerror', (error) => errors.push(error.message)));
  await context.route('**/api/**', async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const headers = { 'access-control-allow-origin': base, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,OPTIONS', 'content-type': 'application/json' };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    requests.push(path);
    assert.equal(req.method(), 'GET', 'Access tests must never write to an admin API');
    let body = {}, status = 200;
    if (path === '/api/auth/get-session') {
      await pending;
      body = state.mode === 'signed-out' ? null : { user: { id: 'admin-access-fixture', name: 'Access Test', email: 'access@example.invalid', emailVerified: true, ...(state.mode === 'incomplete' ? {} : { role: state.mode === 'user' ? 'USER' : 'ADMIN', accountStatus: state.mode === 'inactive' ? 'SUSPENDED' : 'ACTIVE' }), createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }, session: { id: 'fixture-session', userId: 'admin-access-fixture', token: 'fixture-token', expiresAt: '2099-01-01T00:00:00Z', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' } };
    } else if (path === '/api/test-mode') body = { enabled: false };
    else if (path.startsWith('/api/admin/')) {
      assert.equal(state.mode, 'admin', `Unauthorized session mounted an admin component: ${path}`);
      if (state.denial) { status = state.denial.status; body = { message: state.denial.message }; }
      else body = [];
    } else if (path === '/api/verification/status') body = { verification: { status: 'UNVERIFIED' } };
    else if (path === '/api/matching/status') body = { circle: null, alternativeOfferAvailable: false };
    else if (path === '/api/travel-circles/current') body = null;
    else if (path === '/api/catalog') body = { activeIntake: null, intakes: [], camps: [] };
    await route.fulfill({ status, headers, body: JSON.stringify(body) });
  });
  return { context, state, requests, errors, release: () => release?.(), page: await context.newPage() };
}

try {
  for (const path of ['/admin', ...adminPaths, '/admin/future/nested-page']) {
    for (const method of ['GET', 'HEAD']) {
      const response = await fetch(`${base}${path}`, { method, headers: { 'user-agent': 'Googlebot' } });
      assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/, `${method} ${path} must declare noindex`);
      assert.match(response.headers.get('x-robots-tag'), /nofollow/);
      assert.match(response.headers.get('cache-control') ?? '', /(?:private|no-store)/);
      if (method === 'GET' && adminPaths.includes(path)) {
        const html = await response.text();
        assert.match(html, /<meta[^>]*name="robots"[^>]*content="[^"]*noindex[^"]*nofollow/);
      }
    }
  }
  const home = await fetch(base);
  assert.equal(home.headers.has('x-robots-tag'), false);
  assert.doesNotMatch(await home.text(), /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/);
  record(`All ${adminPaths.length} admin pages, the root and unknown nested routes have noindex HTTP headers; page metadata agrees and the homepage remains indexable`);

  {
    const { context, page, release, requests, errors } = await fixture('admin', { delayed: true });
    await page.goto(`${base}/admin/intakes`);
    await page.getByRole('status').filter({ hasText: 'Checking authentication' }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'NYSC intakes', exact: true }).count(), 0);
    assert.equal(requests.some((path) => path.startsWith('/api/admin/')), false);
    release();
    await page.getByRole('heading', { name: 'NYSC intakes', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Add intake', exact: true }).waitFor();
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `${out}/authorized-admin.png`, fullPage: true });
    record('An active admin can use the page; pending sessions cannot mount admin controls or start admin data requests');
    await context.close();
  }

  for (const mode of ['signed-out', 'user']) {
    for (const path of adminPaths) {
      const { context, page, requests, errors } = await fixture(mode);
      const requested = `${path}?source=access-check#details`;
      await page.goto(`${base}${requested}`);
      await page.waitForURL((url) => url.pathname === (mode === 'signed-out' ? '/login' : '/app'));
      if (mode === 'signed-out') assert.equal(new URL(page.url()).searchParams.get('next'), requested);
      assert.equal(requests.some((path) => path.startsWith('/api/admin/')), false);
      assert.deepEqual(errors, []);
      await context.close();
    }
    record(`${mode} sessions are redirected from all ${adminPaths.length} admin pages before any admin data is requested`);
  }

  for (const mode of ['inactive', 'incomplete']) {
    const { context, page, requests } = await fixture(mode);
    await page.goto(`${base}/admin/intakes`);
    await page.waitForURL((url) => url.pathname === '/app');
    assert.equal(requests.some((path) => path.startsWith('/api/admin/')), false);
    await context.close();
  }
  record('Inactive admin accounts and sessions missing their admin identity fail closed');

  for (const denial of [
    { status: 403, message: 'Admin permission required' },
    { status: 403, message: 'Required moderator capability is not granted' },
    { status: 401, message: 'Authentication required' },
  ]) {
    const { context, page } = await fixture('admin', { denial });
    await page.goto(`${base}/admin/intakes`);
    await page.waitForURL((url) => url.pathname === (denial.status === 401 ? '/login' : '/app'));
    await context.close();
  }
  record('Server-side session expiry, role revocation and missing capabilities redirect visitors out even with a previously cached admin session');

  {
    const { context, page } = await fixture('admin', { denial: { status: 403, message: 'Self-review is prohibited' } });
    await page.goto(`${base}/admin/intakes`);
    await page.getByRole('alert').filter({ hasText: 'Self-review is prohibited' }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/admin/intakes');
    await context.close();
    record('A business-rule denial does not incorrectly sign an authorized administrator out of the page');
  }

  {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${base}/admin/intakes`);
    assert.equal(await page.locator('form').count(), 0);
    assert.equal(await page.getByRole('heading', { name: 'NYSC intakes', exact: true }).count(), 0);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
    await context.close();
    record('Without JavaScript, the server HTML contains no rendered admin controls and still declares noindex');
  }
  writeFileSync(`${out}/browser-report.json`, JSON.stringify({ base, checks }, null, 2));
} finally { await browser.close(); }
