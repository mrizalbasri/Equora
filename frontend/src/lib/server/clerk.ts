import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { createClerkClient } from '@clerk/backend';
import { verifyClerkSession } from './clerk-session';

export function clerkSettings() {
  const publishableKey = publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = env.CLERK_SECRET_KEY;
  const authorizedParties = (env.CLERK_AUTHORIZED_PARTIES ?? '')
    .split(',').map(value => value.trim()).filter(Boolean);
  return { publishableKey, secretKey, jwtKey: env.CLERK_JWT_KEY, authorizedParties,
    enabled: Boolean(publishableKey && secretKey && authorizedParties.length) };
}

export async function readClerkSession(token?: string) {
  const settings = clerkSettings();
  if (!settings.enabled) return null;
  return verifyClerkSession(token, settings);
}

export function clerkClient() {
  const { secretKey, publishableKey } = clerkSettings();
  return createClerkClient({ secretKey, publishableKey });
}
