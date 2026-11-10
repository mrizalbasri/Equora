import { redirect, type RequestHandler } from '@sveltejs/kit';
import { ADMIN_COOKIE } from '$lib/server/admin-session';

export const POST: RequestHandler = ({ request, url, cookies }) => {
  if (request.headers.get('origin') !== url.origin) {
    return new Response(null, { status: 403 });
  }
  cookies.delete(ADMIN_COOKIE, { path: '/' });
  redirect(303, '/admin/login');
};
