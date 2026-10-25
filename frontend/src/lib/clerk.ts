import { env } from '$env/dynamic/public';
import type { Clerk } from '@clerk/clerk-js';

let pending: Promise<Clerk> | undefined;

export function loadClerk() {
  if (!pending) {
    pending = (async () => {
      const key = env.PUBLIC_CLERK_PUBLISHABLE_KEY;
      if (!key) throw new Error('Login belum dikonfigurasi. Hubungi pengelola Equora.');
      const [{ Clerk }, { ui }] = await Promise.all([
        import('@clerk/clerk-js'), import('@clerk/ui'),
      ]);
      const clerk = new Clerk(key);
      await clerk.load({
        ui: { ClerkUI: ui.ClerkUI },
        signInUrl: '/sign-in', signUpUrl: '/sign-up',
        signInForceRedirectUrl: '/account', signUpForceRedirectUrl: '/account',
        afterSignOutUrl: '/',
        appearance: { variables: { colorPrimary: '#1264d8', fontFamily: 'Inter, system-ui, sans-serif', borderRadius: '8px' } },
      });
      return clerk;
    })().catch(cause => { pending = undefined; throw cause; });
  }
  return pending;
}
