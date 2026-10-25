import { verifyToken } from '@clerk/backend';

export type ClerkSessionSettings = {
  publishableKey?: string;
  secretKey?: string;
  jwtKey?: string;
  authorizedParties: string[];
};

export async function verifyClerkSession(token: string | undefined, settings: ClerkSessionSettings) {
  if (!token || !settings.publishableKey || (!settings.secretKey && !settings.jwtKey) || !settings.authorizedParties.length) return null;
  try {
    const domain = Buffer.from(settings.publishableKey.split('_')[2], 'base64').toString().replace(/\$$/, '');
    const claims = await verifyToken(token, {
      secretKey: settings.secretKey,
      jwtKey: settings.jwtKey,
      authorizedParties: settings.authorizedParties,
      issuer: `https://${domain}`,
    });
    if (!claims.sub || !claims.sid) return null;
    return { userId: claims.sub, sessionId: claims.sid };
  } catch {
    return null;
  }
}
