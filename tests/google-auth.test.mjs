import assert from 'node:assert/strict';
import { test } from 'node:test';
import { googleAuthRedirects } from '../lib/google-auth.ts';

test('OAuth returns to the frontend and preserves the requested route, query and anchor', () => {
  const destination = '/travel-plans?destinationState=Borno#details';
  const result = googleAuthRedirects(destination, 'http://localhost:3000');
  assert.equal(result.callbackURL, 'http://localhost:3000' + destination);
  assert.equal(result.newUserCallbackURL, result.callbackURL);
  const error = new URL(result.errorCallbackURL);
  assert.equal(error.origin, 'http://localhost:3000');
  assert.equal(error.pathname, '/login');
  assert.equal(error.searchParams.get('googleAuthError'), '1');
  assert.equal(error.searchParams.get('next'), destination);
});

test('external, protocol-relative and malformed destinations cannot redirect off-site', () => {
  for (const destination of ['https://hostile.invalid', '//hostile.invalid', '/\\hostile.invalid', 'javascript:alert(1)', '', 'profile']) {
    const result = googleAuthRedirects(destination, 'https://app.example.invalid');
    assert.equal(result.callbackURL, 'https://app.example.invalid/verification');
    assert.equal(new URL(result.errorCallbackURL).origin, 'https://app.example.invalid');
  }
});
