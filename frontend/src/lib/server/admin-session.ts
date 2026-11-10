import { env } from '$env/dynamic/private';
import { error, type RequestEvent } from '@sveltejs/kit';

export const ADMIN_COOKIE = 'equora_admin_session';

/** Only the opaque, signed session is forwarded, never unrelated site cookies. */
export function adminCookieHeader(cookies: Pick<RequestEvent['cookies'], 'get'>): Record<string, string> {
  const session = cookies.get(ADMIN_COOKIE);
  return session ? { Cookie: `${ADMIN_COOKIE}=${encodeURIComponent(session)}` } : {};
}

export function adminApiUrl(path: 'session'): string {
  return new URL(`/api/v1/admin/${path}`, env.API_BASE_URL ?? 'http://127.0.0.1:18000').href;
}

export async function hasAdminSession(event: Pick<RequestEvent, 'cookies' | 'fetch'>): Promise<boolean> {
  if (!event.cookies.get(ADMIN_COOKIE)) return false;
  let response: Response;
  try {
    response = await event.fetch(adminApiUrl('session'), {
      headers: adminCookieHeader(event.cookies),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    error(503, 'Layanan autentikasi admin belum tersedia. Coba lagi nanti.');
  }
  if (response.status === 401) return false;
  if (!response.ok) error(503, 'Sesi admin belum dapat diperiksa. Coba lagi nanti.');
  try {
    const result = await response.json();
    if (result?.authenticated === true) return true;
  } catch {
    // A wrong API_BASE_URL must not turn a generic HTTP 200 into authentication.
  }
  error(503, 'Respons autentikasi admin tidak valid. Coba lagi nanti.');
}
