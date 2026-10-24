import { clerkSettings, readClerkSession } from '$lib/server/clerk';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  const session = await readClerkSession(cookies.get('__session'));
  return { clerk: { enabled: clerkSettings().enabled, signedIn: Boolean(session) } };
};
