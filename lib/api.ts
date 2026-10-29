import { apiAuthRedirect } from './protected-routes';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, { ...init, cache: 'no-store', credentials: 'include', headers: init?.body instanceof FormData ? init.headers : { 'content-type': 'application/json', ...init?.headers } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const next = `${currentPath}${window.location.search}${window.location.hash}`;
      const redirect = apiAuthRedirect(response.status, body.message, currentPath, next);
      if (redirect) window.location.replace(redirect);
    }
    throw new Error(body.message ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}
