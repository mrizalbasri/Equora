import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const proxy: RequestHandler = async ({ params, request, url, fetch }) => {
  if (!/^[a-zA-Z0-9/_-]+$/.test(params.path) || params.path.includes('..'))
    return new Response(null, { status: 404 });
  if (request.method === 'POST' && request.headers.get('origin') !== url.origin)
    return Response.json(
      { detail: 'Origin permintaan tidak diizinkan' },
      { status: 403 },
    );
  if (Number(request.headers.get('content-length') ?? 0) > 65536)
    return Response.json({ detail: 'Input terlalu besar' }, { status: 413 });
  const body = request.method === 'POST' ? await request.text() : undefined;
  if (body && new TextEncoder().encode(body).length > 65536)
    return Response.json({ detail: 'Input terlalu besar' }, { status: 413 });
  try {
    const target = new URL(
      '/api/v1/' + params.path,
      env.API_BASE_URL ?? 'http://127.0.0.1:18000',
    );
    target.search = url.search;
    const response = await fetch(target, {
      method: request.method,
      body,
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('origin')
          ? { Origin: request.headers.get('origin')! }
          : {}),
        ...(request.headers.has('authorization')
          ? { Authorization: request.headers.get('authorization')! }
          : {}),
      },
      signal: AbortSignal.timeout(30000),
    });
    const headers = new Headers({ 'Cache-Control': 'no-store' });
    for (const key of ['content-type', 'content-disposition', 'retry-after']) {
      const value = response.headers.get(key);
      if (value) headers.set(key, value);
    }
    return new Response(response.body, { status: response.status, headers });
  } catch {
    return Response.json(
      {
        detail:
          'Layanan data belum tersedia. Coba lagi beberapa saat lagi.',
      },
      { status: 503 },
    );
  }
};
export const GET = proxy;
export const POST = proxy;
