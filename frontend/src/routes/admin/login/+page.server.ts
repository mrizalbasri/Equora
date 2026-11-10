import { fail, redirect } from '@sveltejs/kit';
import { ADMIN_COOKIE, adminApiUrl, hasAdminSession } from '$lib/server/admin-session';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if (await hasAdminSession(event)) redirect(303, '/admin');
  event.cookies.delete(ADMIN_COOKIE, { path: '/' });
};

export const actions: Actions = {
  default: async ({ request, fetch, cookies, url }) => {
    cookies.delete(ADMIN_COOKIE, { path: '/' });
    const form = await request.formData();
    const token = form.get('token');
    if (typeof token !== 'string' || !token || token.length > 4096 || /[\r\n]/.test(token)) {
      return fail(400, { message: 'Masukkan token admin yang valid.' });
    }
    let response: Response;
    try {
      response = await fetch(adminApiUrl('session'), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      return fail(503, { message: 'Layanan autentikasi belum tersedia. Coba lagi nanti.' });
    }
    if (response.status === 401) {
      return fail(401, { message: 'Token admin tidak valid atau belum dikonfigurasi.' });
    }
    if (response.status === 429) {
      return fail(429, { message: 'Terlalu banyak percobaan. Tunggu satu menit sebelum mencoba lagi.' });
    }
    if (!response.ok) {
      return fail(503, { message: 'Login admin belum dapat diproses. Coba lagi nanti.' });
    }
    const session = await response.json();
    if (typeof session.session_token !== 'string' || session.expires_in !== 3600) {
      return fail(503, { message: 'Respons autentikasi tidak valid. Coba lagi nanti.' });
    }
    cookies.set(ADMIN_COOKIE, session.session_token, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: url.protocol === 'https:',
      maxAge: session.expires_in,
    });
    redirect(303, '/admin');
  },
};
