/** OAuth returns to the frontend, while Google's registered callback lives on the API. */
export function googleAuthRedirects(destination: string, frontendOrigin: string) {
  const origin = new URL(frontendOrigin).origin;
  let callback = new URL('/verification', origin);
  if (destination.startsWith('/') && !destination.startsWith('//')) {
    try { const target = new URL(destination, origin); if (target.origin === origin) callback = target; } catch { /* Keep the local verification fallback. */ }
  }
  const errorCallback = new URL('/login', origin);
  errorCallback.searchParams.set('googleAuthError', '1');
  errorCallback.searchParams.set('next', `${callback.pathname}${callback.search}${callback.hash}`);
  return { callbackURL: callback.href, newUserCallbackURL: callback.href, errorCallbackURL: errorCallback.href };
}
