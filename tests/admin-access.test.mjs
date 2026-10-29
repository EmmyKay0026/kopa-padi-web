import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apiAuthRedirect, isActiveAdminSession, isAdminRoute, routeAuthRedirect } from '../lib/protected-routes.ts';

const admin = { user: { role: 'ADMIN', accountStatus: 'ACTIVE' } };
const user = { user: { role: 'USER', accountStatus: 'ACTIVE' } };

test('admin route matching includes the root and future nested pages without matching public lookalikes', () => {
  for (const path of ['/admin', '/admin/intakes', '/admin/verifications/record']) assert.equal(isAdminRoute(path), true);
  for (const path of ['/', '/app', '/administrator', '/admin-guide']) assert.equal(isAdminRoute(path), false);
});

test('admin access fails closed for ordinary, inactive and incomplete session identities', () => {
  assert.equal(isActiveAdminSession(admin), true);
  for (const session of [null, undefined, {}, { user: null }, { user: {} }, user, { user: { role: 'ADMIN' } }, { user: { role: 'ADMIN', accountStatus: 'SUSPENDED' } }, { user: { role: 'ADMIN', accountStatus: 'RESTRICTED' } }, { user: { role: 'ADMIN', accountStatus: 'CLOSED' } }]) {
    assert.equal(isActiveAdminSession(session), false);
    if (session) assert.equal(routeAuthRedirect('/admin/intakes', '/admin/intakes', session), '/app');
  }
});

test('signed-out redirects preserve the requested admin URL and active administrators are allowed', () => {
  const destination = '/admin/verifications?status=SUBMITTED#queue';
  assert.equal(routeAuthRedirect('/admin/verifications', destination, null), `/login?next=${encodeURIComponent(destination)}`);
  assert.equal(routeAuthRedirect('/admin/verifications', destination, admin), null);
  assert.equal(routeAuthRedirect('/app', '/app', user), null);
  assert.equal(routeAuthRedirect('/', '/', null), null);
});

test('server access revocation or missing capability sends an admin page visitor out', () => {
  for (const message of ['Admin permission required', 'Moderator permission required', 'Required moderator capability is not granted', 'Account is not permitted to access this resource']) {
    assert.equal(apiAuthRedirect(403, message, '/admin/safety', '/admin/safety'), '/app');
  }
  assert.equal(apiAuthRedirect(401, 'Authentication required', '/admin/intakes', '/admin/intakes'), '/login?next=%2Fadmin%2Fintakes');
});

test('ordinary business-rule failures and user-facing 403s do not trigger admin redirects', () => {
  for (const message of ['Self-review is prohibited', 'PCM verification required', undefined, ['Admin permission required']]) {
    assert.equal(apiAuthRedirect(403, message, '/admin/verifications', '/admin/verifications'), null);
  }
  assert.equal(apiAuthRedirect(403, 'Admin permission required', '/verification', '/verification'), null);
  assert.equal(apiAuthRedirect(401, 'Authentication required', '/', '/'), null);
});
