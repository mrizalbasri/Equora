import { generateKeyPairSync, sign } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyClerkSession } from './clerk-session';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const origin = 'http://localhost:5173';
const issuer = 'https://synthetic.clerk.accounts.dev';
const settings = {
  publishableKey: 'pk_test_' + Buffer.from('synthetic.clerk.accounts.dev$').toString('base64'),
  jwtKey: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  authorizedParties: [origin],
};
function token(overrides: Record<string, unknown> = {}) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'synthetic-key' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: 'user_synthetic', sid: 'sess_synthetic', iss: issuer, azp: origin, iat: now, nbf: now - 1, exp: now + 60, ...overrides })).toString('base64url');
  const message = `${header}.${payload}`;
  return `${message}.${sign('RSA-SHA256', Buffer.from(message), privateKey).toString('base64url')}`;
}

describe('server Clerk session verification', () => {
  it('accepts a signed session from the configured issuer and origin', async () => {
    expect(await verifyClerkSession(token(), settings)).toEqual({ userId: 'user_synthetic', sessionId: 'sess_synthetic' });
  });
  it.each([
    { exp: 1 }, { nbf: Math.floor(Date.now() / 1000) + 3600 },
    { iss: 'https://other.clerk.accounts.dev' }, { azp: 'https://untrusted.example' }, { sid: null },
  ])('rejects invalid session claims %j', async (claims) => {
    expect(await verifyClerkSession(token(claims), settings)).toBeNull();
  });
  it('rejects malformed or forged session cookies', async () => {
    expect(await verifyClerkSession('not-a-jwt', settings)).toBeNull();
    const parts = token().split('.');
    parts[1] = Buffer.from(JSON.stringify({ sub: 'user_forged' })).toString('base64url');
    expect(await verifyClerkSession(parts.join('.'), settings)).toBeNull();
  });
  it('fails closed without explicit origins or verification keys', async () => {
    expect(await verifyClerkSession(token(), { ...settings, authorizedParties: [] })).toBeNull();
    expect(await verifyClerkSession(token(), { authorizedParties: [origin], publishableKey: settings.publishableKey })).toBeNull();
    expect(await verifyClerkSession(undefined, settings)).toBeNull();
  });
});
