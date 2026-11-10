import type { Handle } from '@sveltejs/kit';
import { ADMIN_COOKIE, hasAdminSession } from '$lib/server/admin-session';

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname.replace(/\/+$/, '');
  const adminPage = path === '/admin' || path.startsWith('/admin/');
  if (adminPage) event.setHeaders({ 'Cache-Control': 'no-store' });
  if (adminPage && path !== '/admin/login' && path !== '/admin/logout') {
    if (!(await hasAdminSession(event))) {
      event.cookies.delete(ADMIN_COOKIE, { path: '/' });
      return new Response(null, {
        status: 303,
        headers: { Location: '/admin/login', 'Cache-Control': 'no-store' },
      });
    }
  }
  return resolve(event);
};
