import { error, redirect } from '@sveltejs/kit';
import { clerkClient, readClerkSession } from '$lib/server/clerk';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  const session = await readClerkSession(cookies.get('__session'));
  if (!session) redirect(303, '/sign-in');
  try {
    const user = await clerkClient().users.getUser(session.userId);
    return { account: { name: user.fullName || user.username || 'Pengguna Equora', email: user.primaryEmailAddress?.emailAddress || '' } };
  } catch { error(503, 'Akun belum dapat dimuat. Coba lagi sebentar.'); }
};
