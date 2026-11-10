// Synthetic upstream for server-side auth E2E tests. Never connects to user data.
import { createServer } from 'node:http';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const secret = 'valid-secret';
const cookieName = 'equora_admin_session';
const sign = payload => createHmac('sha256', secret).update('equora-admin-v1:' + payload).digest('hex');
const validSession = req => {
  const cookie = req.headers.cookie?.split('; ').find(item => item.startsWith(cookieName + '='));
  const token = cookie?.slice(cookieName.length + 1) ?? '';
  if (!/^\d{1,12}\.[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expires, nonce, signature] = token.split('.');
  return Number(expires) > Date.now() / 1000 &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(sign(expires + '.' + nonce)));
};

createServer((req, res) => {
  const reply = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(data));
  };
  if (req.url === '/health') return reply(200, { ok: true });
  if (req.url === '/api/v1/admin/session' && req.method === 'POST') {
    if (req.headers.authorization !== 'Bearer ' + secret) {
      return reply(401, { detail: 'Token admin tidak valid' });
    }
    const payload = `${Math.floor(Date.now() / 1000) + 3600}.${randomBytes(32).toString('hex')}`;
    return reply(200, { session_token: payload + '.' + sign(payload), expires_in: 3600 });
  }
  if (req.url === '/api/v1/admin/session' && req.method === 'GET') {
    if (req.headers.cookie?.includes('backend-unavailable')) return reply(503, {});
    if (req.headers.cookie?.includes('invalid-response')) return reply(200, { authenticated: false });
    return validSession(req) ? reply(200, { authenticated: true }) : reply(401, {});
  }
  if (req.url === '/api/v1/admin/import' && req.method === 'POST') {
    if (!validSession(req)) return reply(401, { detail: 'Sesi admin tidak valid' });
    return reply(200, {
      release_id: 'synthetic-release', status: 'local_review', sources: 10, imports: 4,
    });
  }
  reply(404, { detail: 'Synthetic endpoint not configured' });
}).listen(18081, '127.0.0.1');
