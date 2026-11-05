import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch }) => {
  try {
    const response = await fetch(new URL('/api/v1/health/ready', env.API_BASE_URL ?? 'http://127.0.0.1:18000'), {
      signal: AbortSignal.timeout(5000),
    });
    return Response.json({ status: response.ok ? 'ok' : 'unavailable' }, {
      status: response.ok ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ status: 'unavailable' }, {
      status: 503, headers: { 'Cache-Control': 'no-store' },
    });
  }
};
